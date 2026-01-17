"""
Guardian Pattern Implementation
Validates and retries AI agent outputs
"""

from typing import Dict, Any, Callable, Type
from pydantic import BaseModel, ValidationError
from app.schemas import TriageOutput, ComplianceOutput, RiskOutput


def validate_with_guardian(
    agent_func: Callable,
    schema: Type[BaseModel],
    agent_name: str,
    max_retries: int = 2,
    *args,
    **kwargs
) -> Dict[str, Any]:
    """
    Guardian wrapper that validates agent output
    
    Args:
        agent_func: The agent function to call
        schema: Pydantic model to validate against
        agent_name: Name for logging
        max_retries: Number of retry attempts
        
    Returns:
        Validated dictionary or safe fallback
    """
    
    print(f"\n🛡️  Guardian protecting {agent_name}...")
    
    for attempt in range(max_retries + 1):
        try:
            # Call the agent
            print(f"   Attempt {attempt + 1}/{max_retries + 1}...")
            raw_output = agent_func(*args, **kwargs)
            
            # Validate with Pydantic
            validated = schema(**raw_output)
            
            print(f"   ✅ Output validated successfully")
            return validated.model_dump()
            
        except ValidationError as e:
            print(f"   ❌ Validation failed:")
            for error in e.errors():
                field = error['loc'] if error['loc'] else 'unknown'
                msg = error['msg']
                print(f"      -  {field}: {msg}")
            
            if attempt < max_retries:
                print(f"   🔄 Retrying...")
                continue
            else:
                print(f"   ⚠️  Max retries exhausted - using safe fallback")
                return get_safe_fallback(schema, agent_name)
                
        except Exception as e:
            print(f"   ❌ Agent crashed: {str(e)}")
            if attempt < max_retries:
                print(f"   🔄 Retrying...")
                continue
            else:
                return get_safe_fallback(schema, agent_name)
    
    return get_safe_fallback(schema, agent_name)


def get_safe_fallback(schema: Type[BaseModel], agent_name: str) -> Dict[str, Any]:
    """
    Return safe default values when validation fails
    """
    
    print(f"   🛡️  Guardian providing safe fallback for {agent_name}")
    
    if schema is TriageOutput or schema.__name__ == "TriageOutput":
        return {
            "category": "Technical",
            "priority": "Medium",
            "department": "IT",
            "reasoning": f"Guardian fallback: {agent_name} output validation failed after retries. Defaulted to safe values for manual review."
        }
    
    elif schema is ComplianceOutput or schema.__name__ == "ComplianceOutput":
        return {
            "status": "Needs_Info",
            "messages": [f"{agent_name} validation failed - manual review required"],
            "recommendation": "Review ticket manually due to AI validation failure"
        }
    
    elif schema is RiskOutput or schema.__name__ == "RiskOutput":
        return {
            "risk_score": 50,
            "risk_level": "Medium",
            "impact_areas": ["Unknown"],
            "explanation": f"{agent_name} failed validation. Defaulted to medium risk pending manual assessment."
        }
    
    return {}
