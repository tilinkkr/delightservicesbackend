"""
Agent Metrics Tracking
Centralized performance and cost metrics
"""

from datetime import datetime

# Global metrics dictionary
# In production, this would be Redis/Prometheus
agent_metrics = {
    "triage_calls": 0,
    "compliance_calls": 0,
    "risk_calls": 0,
    "llm_calls": 0,
    "rule_only_calls": 0,
    "total_analysis_time": 0.0,
    "parallel_executions": 0,
    "last_reset": datetime.utcnow()
}

def reset_metrics():
    """Reset all metrics (for testing/demo)"""
    global agent_metrics
    agent_metrics = {
        "triage_calls": 0,
        "compliance_calls": 0,
        "risk_calls": 0,
        "llm_calls": 0,
        "rule_only_calls": 0,
        "total_analysis_time": 0.0,
        "parallel_executions": 0,
        "last_reset": datetime.utcnow()
    }
    print("📊 Metrics reset")
