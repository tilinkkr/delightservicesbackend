import requests
import time

BASE_URL = "http://127.0.0.1:8000"

def test_rule_engine():
    # 1. Create High Priority Ticket (Should trigger rules)
    ticket_data = {
        "title": "Production Server Down",
        "description": "Critical outage. Server is down. Urgent assistance needed.",
        "status": "New"
    }
    
    print("Creating ticket...")
    res = requests.post(f"{BASE_URL}/tickets", json=ticket_data)
    ticket_id = res.json()["id"]
    print(f"Created Ticket #{ticket_id}")
    
    # 2. Trigger Analysis
    print("Triggering analysis...")
    requests.post(f"{BASE_URL}/tickets/{ticket_id}/analyze")
    
    # 3. Poll for results
    print("Waiting for results...")
    for _ in range(10):
        time.sleep(2)
        ticket = requests.get(f"{BASE_URL}/tickets/{ticket_id}").json()
        if ticket.get("ai_priority"):
            print("Analysis complete!")
            break
            
    # 4. Verify Reasoning
    reasoning = ticket.get("ai_reasoning", "")
    print(f"\nAI Reasoning: {reasoning}")
    
    if "Rule-based classification" in reasoning:
        print("\n✅ SUCCESS: logic skipped LLM and used rules!")
    else:
        print("\n❌ FAILURE: Logic used LLM (or unexpected output).")

if __name__ == "__main__":
    test_rule_engine()
