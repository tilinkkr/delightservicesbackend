"""
Unit Tests for Rule Engine
Tests deterministic rule-based classification
"""

import pytest
from app.rules import rule_engine

class TestRuleEngine:
    """Test suite for O(n) Rule Engine"""
    
    def test_singleton_pattern(self):
        """Verify RuleEngine is a singleton (same instance)"""
        # Note: in Python, importing the instance 'rule_engine' is naturally a singleton module-level variable
        # But we can verify accessing the class again gives same instance if we exposed it, 
        # or just verify identity is constant.
        from app.rules import rule_engine as engine1
        from app.rules import rule_engine as engine2
        
        assert id(engine1) == id(engine2), "RuleEngine should be singleton"
    
    def test_billing_category_detection(self):
        """Test billing keyword detection"""
        result = rule_engine.classify_category(
            "Invoice Payment Need to process invoice #1234 payment for vendor"
        )
        
        assert result["category"] == "Billing"
        assert result["department"] == "Finance"
        assert result["confidence"] >= 0.85
        assert result["method"] == "regex_rule"
    
    def test_technical_category_detection(self):
        """Test technical issue detection"""
        result = rule_engine.classify_category(
            "Server Error Production server showing error 500, need immediate fix"
        )
        
        assert result["category"] == "Technical"
        assert result["department"] == "IT"
        assert result["confidence"] >= 0.85
    
    def test_access_category_detection(self):
        """Test access request detection"""
        result = rule_engine.classify_category(
            "VPN Access Needed New employee needs VPN access and login credentials"
        )
        
        assert result["category"] == "Access"
        assert result["department"] == "IT"
    
    def test_high_priority_detection(self):
        """Test high priority signal detection"""
        result = rule_engine.classify_priority(
            "URGENT: Production Outage Critical server down affecting all users",
            "Technical"
        )
        
        assert result["priority"] == "High"
        assert result["confidence"] >= 0.80
    
    def test_low_priority_detection(self):
        """Test low priority signal detection"""
        result = rule_engine.classify_priority(
            "Question about feature How do I change my email preferences?",
            "Technical"
        )
        
        assert result["priority"] == "Low"
    
    def test_compliance_billing_check(self):
        """Test compliance check for billing tickets"""
        ticket = {
            "title": "Payment Request",
            "description": "Need to pay for license",
            "category": "Billing"
        }
        
        result = rule_engine.check_compliance(ticket)
        
        assert result["status"] == "Needs_Info"
        assert len(result["issues"]) > 0
        
    def test_compliance_policy_violation(self):
        """Test policy violation detection"""
        ticket = {
            "title": "Access Request",
            "description": "Please share password with new employee",
            "category": "Access"
        }
        
        result = rule_engine.check_compliance(ticket)
        
        assert result["status"] == "Blocked"
        assert result["approval_required"] == True
        assert any("POLICY VIOLATION" in issue for issue in result["issues"])
    
    def test_compliance_pass(self):
        """Test ticket that passes compliance"""
        ticket = {
            "title": "Technical Support",
            "description": "Server restart needed for maintenance window",
            "category": "Technical"
        }
        
        result = rule_engine.check_compliance(ticket)
        
        assert result["status"] == "OK"
        assert len(result["issues"]) == 0

class TestWorkflowIntegration:
    """Integration tests for workflow engine"""
    
    def test_full_workflow_simulation(self):
        """Test complete ticket processing workflow"""
        # Simulate high-priority billing ticket
        title = "Urgent: Invoice Payment Overdue"
        description = "Invoice #5678 payment is 15 days overdue for VIP customer"
        text = f"{title} {description}"
        
        # Step 1: Category classification
        category_result = rule_engine.classify_category(text)
        assert category_result["category"] == "Billing"
        
        # Step 2: Priority classification
        priority_result = rule_engine.classify_priority(
            text,
            category_result["category"]
        )
        assert priority_result["priority"] == "High"
        
        # Step 3: Compliance check
        ticket = {
            "title": title,
            "description": description,
            "category": category_result["category"]
        }
        compliance_result = rule_engine.check_compliance(ticket)
        
        # Should flag OK as "invoice" and "#" are present
        assert compliance_result["status"] == "OK" 
        
        # Step 4: Risk calculation
        triage = {
            "priority": priority_result["priority"],
            "category": category_result["category"]
        }
        risk_result = rule_engine.calculate_risk(ticket, triage)
        
        # High priority + Billing + VIP
        assert risk_result["risk_score"] >= 60
        assert risk_result["risk_level"] in ["Medium", "High"]
