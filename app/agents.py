"""
Refactored AI Agents - using Randomized Rule Engine & Guardian Pattern
"""

import requests
import json
from typing import Dict, Any, List
from app.rules import rule_engine
from app.guardian import validate_with_guardian
from app.schemas import TriageOutput, ComplianceOutput, RiskOutput

OLLAMA_API = "http://localhost:11434/api/generate"
MODEL_NAME = "mistral"

def call_ollama(prompt: str, system: str = "") -> str:
    """Ollama API call with error handling and speed optimizations"""
    try:
        payload = {
            "model": MODEL_NAME,
            "prompt": prompt,
            "system": system,
            "stream": False,
            "options": {
                "temperature": 0.1,  # Lower = faster & more deterministic
                "num_predict": 200,  # Limit output tokens for speed
                "num_ctx": 2048,     # Smaller context window
                "top_p": 0.9
            }
        }
        
        # 15s timeout to prevent hanging
        response = requests.post(OLLAMA_API, json=payload, timeout=15)
        response.raise_for_status()
        result = response.json()
        return result.get("response", "").strip()
        
    except requests.exceptions.Timeout:
        print(f"⚠️  LLM Timeout ({MODEL_NAME}) - using fallback")
        return "Error: Timeout"
    except Exception as e:
        return f"Error: {str(e)}"


# ---------------------------------------------------------
# TRIAGE AGENT
# ---------------------------------------------------------

def triage_agent_raw(title: str, description: str) -> Dict[str, Any]:
    """
    TRIAGE AGENT - Hybrid (Raw Function)
    """
    text = f"{title} {description}"
    
    # 1. Rules
    cat = rule_engine.classify_category(text)
    pri = rule_engine.classify_priority(text, cat["category"])
    
    if cat["confidence"] >= 0.8 and pri["confidence"] >= 0.8:
        # Map "General" to "Support" to match schema
        dept = cat.get("department", "Support")
        if dept == "General": dept = "Support"
        
        return {
            "category": cat["category"],
            "priority": pri["priority"],
            "department": dept,
            "reasoning": f"Rule match: {cat['method']} (Confidence: {cat['confidence']})"
        }

    # 2. LLM Fallback
    system_prompt = """You are a ticket classifier. Respond ONLY with JSON:
{"category": "Billing|Technical|Access|Logistics|HR|Other", "priority": "Low|Medium|High", "department": "Finance|IT|Operations|Sales|HR|Support", "reasoning": "brief explanation"}"""
    
    user_prompt = f"Classify:\nTitle: {title}\nDescription: {description}"
    
    response = call_ollama(user_prompt, system=system_prompt)
    
    try:
        if "```json" in response:
            json_str = response.split("```json")[1].split("```")[0].strip()
        elif "```" in response:
             json_str = response.split("```")[1].split("```")[0].strip()
        else:
            json_str = response.strip()
        
        data = json.loads(json_str)

        # SANITIZATION LAYER (Prevent Guardian Failures)
        allowed_cats = ["Billing", "Technical", "Access", "Logistics", "HR", "Other"]
        allowed_depts = ["Finance", "IT", "Operations", "Sales", "HR", "Support"]
        allowed_pris = ["Low", "Medium", "High"]

        # Ensure valid Category
        if data.get("category") not in allowed_cats:
            data["category"] = "Other"
            
        # Ensure valid Department
        if data.get("department") not in allowed_depts:
            data["department"] = "Support"

        # Ensure valid Priority
        if data.get("priority") not in allowed_pris:
            data["priority"] = "Medium"
            
        # Ensure Reasoning length constraint (10-500 chars)
        reasoning = str(data.get("reasoning", "AI analysis provided."))
        if len(reasoning) < 10:
            reasoning += " (Automated classification)"
        data["reasoning"] = reasoning[:500]
        
        return data

    except Exception as e:
        return {
            "category": "Technical",
            "priority": "Medium",
            "department": "Support",
            "reasoning": f"LLM parsing failed: {str(e)}"
        }

def triage_agent(title: str, description: str) -> Dict[str, Any]:
    """Triage Agent with Guardian validation"""
    return validate_with_guardian(
        triage_agent_raw,
        TriageOutput,
        "Triage Agent",
        max_retries=2,
        title=title,
        description=description
    )


# ---------------------------------------------------------
# COMPLIANCE AGENT
# ---------------------------------------------------------

def compliance_agent_raw(title: str, description: str, category: str = "General") -> Dict[str, Any]:
    """
    COMPLIANCE AGENT - Rule based
    """
    # Create ticket dict for rule engine
    ticket = {"title": title, "description": description, "category": category}
    result = rule_engine.check_compliance(ticket)
    
    # Add 'recommendation' field required by schema
    if result["status"] == "Blocked":
        result["recommendation"] = "Reject processing immediately and notify security."
    elif result["status"] == "Needs_Info":
        result["recommendation"] = "Request missing details from user."
    else:
        result["recommendation"] = "Proceed with standard workflow."
        
    return result

def compliance_agent(title: str, description: str, category: str = "General") -> Dict[str, Any]:
    """Compliance Agent with Guardian validation"""
    return validate_with_guardian(
        compliance_agent_raw,
        ComplianceOutput,
        "Compliance Agent",
        max_retries=1,
        title=title,
        description=description,
        category=category
    )


# ---------------------------------------------------------
# RISK AGENT
# ---------------------------------------------------------

def risk_agent_raw(title: str, description: str, priority: str) -> Dict[str, Any]:
    """
    RISK AGENT - Hybrid
    """
    ticket = {"title": title, "description": description}
    triage = {"priority": priority}
    
    # 1. Rule calculation
    risk = rule_engine.calculate_risk(ticket, triage)
    
    # 2. LLM if needed
    if risk["needs_llm_review"]:
        system_prompt = """Analyze business risk. Respond with JSON:
{"impact_areas": ["area1", "area2"], "explanation": "why this is high risk"}"""
        
        user_prompt = f"Analyze HIGH RISK ticket:\nTitle: {title}\nDescription: {description[:200]}\nScore: {risk['risk_score']}"
        
        response = call_ollama(user_prompt, system=system_prompt)
        try:
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0].strip()
            else:
                json_str = response.strip()
            
            llm_result = json.loads(json_str)
            risk["impact_areas"] = llm_result.get("impact_areas", [])
            risk["explanation"] = llm_result.get("explanation", "High risk detected")
        except:
             pass # Keep rule defaults
            
    # Flatten output to match schema
    result = {
        "risk_score": risk["risk_score"],
        "risk_level": risk["risk_level"],
        "impact_areas": risk.get("impact_areas", ["General"]),
        "explanation": risk.get("explanation", "Risk evaluated by rules")
    }
    
    # SANITIZATION
    if not result["impact_areas"]:
        result["impact_areas"] = ["General Business"]
    
    expl = str(result.get("explanation", ""))
    if len(expl) < 10:
        result["explanation"] = expl + " (Automated risk score)"
        
    return result

def risk_agent(title: str, description: str, priority: str) -> Dict[str, Any]:
    """Risk Agent with Guardian validation"""
    return validate_with_guardian(
        risk_agent_raw,
        RiskOutput,
        "Risk Agent",
        max_retries=2,
        title=title,
        description=description,
        priority=priority
    )
