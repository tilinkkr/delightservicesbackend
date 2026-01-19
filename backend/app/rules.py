"""
Optimized Rule Engine - O(n) Complexity with Regex Compilation
"""

import re
from typing import Dict, Any, List

class RuleEngine:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RuleEngine, cls).__new__(cls)
            cls._instance._compile_patterns()
        return cls._instance

    def _compile_patterns(self):
        """Pre-compile all regex patterns for O(n) performance"""
        print("⚡ RuleEngine: Pre-compiling regex patterns...")
        
        # Category Patterns
        self.cat_patterns = {
            "Billing": re.compile(r'\b(invoice|payment|billing|refund|charge|cost|price)\b', re.IGNORECASE),
            "Access": re.compile(r'\b(password|login|access|vpn|permission|account|auth)\b', re.IGNORECASE),
            "Technical": re.compile(r'\b(error|bug|crash|outage|down|server|failed|slow)\b', re.IGNORECASE),
            "Logistics": re.compile(r'\b(shipping|delivery|warehouse|shipment|track)\b', re.IGNORECASE)
        }

        # Priority Patterns
        self.high_priority = re.compile(r'\b(urgent|critical|emergency|production|down|outage|vip|blocked)\b', re.IGNORECASE)
        self.low_priority = re.compile(r'\b(question|how to|clarification|info|help)\b', re.IGNORECASE)
        
        # Compliance Patterns
        self.compliance_financial = re.compile(r'(invoice|#|po|amount|\$)', re.IGNORECASE)
        self.compliance_access = re.compile(r'(@|email|user|id|employee)', re.IGNORECASE)
        self.policy_violations = re.compile(r'(share password|bypass approval|override|skip review)', re.IGNORECASE)

        # Risk Patterns
        self.risk_vip = re.compile(r'\b(vip|enterprise|ceo|director)\b', re.IGNORECASE)

    def classify_category(self, text: str) -> Dict[str, Any]:
        """Classify category using pre-compiled regex"""
        for category, pattern in self.cat_patterns.items():
            if pattern.search(text):
                dept_map = {
                    "Billing": "Finance",
                    "Access": "IT",
                    "Technical": "IT",
                    "Logistics": "Operations"
                }
                return {
                    "category": category,
                    "department": dept_map.get(category, "General"),
                    "confidence": 0.95,
                    "method": "regex_rule"
                }
        
        return {"category": None, "confidence": 0.0, "method": "none"}

    def classify_priority(self, text: str, category: str) -> Dict[str, Any]:
        """Classify priority using pre-compiled regex"""
        if self.high_priority.search(text):
            return {"priority": "High", "confidence": 0.90, "method": "regex_rule"}
        
        if category == "Billing" and re.search(r'\b(overdue|late|penalty)\b', text, re.IGNORECASE):
            return {"priority": "High", "confidence": 0.85, "method": "billing_rule"}
            
        if self.low_priority.search(text):
            return {"priority": "Low", "confidence": 0.80, "method": "regex_rule"}
            
        return {"priority": "Medium", "confidence": 0.60, "method": "default"}

    def check_compliance(self, ticket: Dict[str, Any]) -> Dict[str, Any]:
        """Check compliance using pre-compiled regex"""
        description = ticket.get("description", "")
        category = ticket.get("category", "")
        
        issues = []
        status = "OK"

        if category == "Billing":
            if not self.compliance_financial.search(description):
                issues.append("Missing invoice/PO number or amount")
                status = "Needs_Info"
        
        if category == "Access":
            if not self.compliance_access.search(description):
                issues.append("Missing user email or ID")
                status = "Needs_Info"

        if self.policy_violations.search(description):
            issues.append("POLICY VIOLATION: Security breach attempt detected")
            status = "Blocked"
            
        return {
            "status": status,
            "issues": issues,
            "method": "regex_rule",
            "approval_required": status == "Blocked"
        }

    def calculate_risk(self, ticket: Dict[str, Any], triage: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate risk score"""
        priority = triage.get("priority", "Medium")
        description = ticket.get("description", "")
        
        base_score = 30
        
        if priority == "High": base_score += 40
        elif priority == "Medium": base_score += 20
        
        if self.risk_vip.search(description):
            base_score += 15
            
        if "production" in description.lower():
            base_score += 20

        risk_level = "High" if base_score >= 70 else "Medium" if base_score >= 40 else "Low"
        
        return {
            "risk_score": min(100, base_score),
            "risk_level": risk_level,
            "method": "heuristic_rule",
            "needs_llm_review": base_score > 80
        }

# Singleton Instance
rule_engine = RuleEngine()
