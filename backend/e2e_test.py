"""
Complete end-to-end test mimicking the exact API flow
"""
import requests
import time

BASE = "http://127.0.0.1:8000"

print("="*70)
print("COMPLETE E2E DIAGNOSTIC")
print("="*70)

# Step 1: Create ticket
print("\n[1] Creating ticket...")
ticket_data = {
    "title": "DIAGNOSTIC: Server crash critical",
    "description": "Production server down affecting VIP customers. Urgent fix needed.",
    "priority": "High",
    "status": "New"
}

try:
    r = requests.post(f"{BASE}/tickets", json=ticket_data, timeout=5)
    ticket = r.json()
    ticket_id = ticket['id']
    print(f"✅ Created ticket #{ticket_id}")
    print(f"   Initial ai_priority: {ticket.get('ai_priority')}")
except Exception as e:
    print(f"❌ Failed: {e}")
    exit(1)

# Step 2: Trigger analysis
print(f"\n[2] Triggering analysis for #{ticket_id}...")
try:
    r = requests.post(f"{BASE}/tickets/{ticket_id}/analyze", timeout=5)
    result = r.json()
    print(f"✅ Response: {result}")
    
    if result.get('status') != 'queued':
        print(f"⚠️  Unexpected status: {result.get('status')}")
except Exception as e:
    print(f"❌ Failed: {e}")
    exit(1)

# Step 3: Wait and poll
print(f"\n[3] Waiting 5 seconds...")
time.sleep(5)

print(f"\n[4] Checking ticket state...")
for attempt in range(10):
    try:
        r = requests.get(f"{BASE}/tickets/{ticket_id}", timeout=2)
        ticket = r.json()
        
        ai_priority = ticket.get('ai_priority')
        ai_reasoning = ticket.get('ai_reasoning')
        category = ticket.get('category')
        
        print(f"   Attempt {attempt+1}:")
        print(f"     - ai_priority: {ai_priority}")
        print(f"     - category: {category}")
        print(f"     - ai_reasoning: {ai_reasoning[:50] if ai_reasoning else None}...")
        
        if ai_priority:
            print(f"\n✅ SUCCESS! Analysis completed.")
            print(f"\nFull ticket data:")
            print(f"  Category: {ticket.get('category')}")
            print(f"  AI Priority: {ticket.get('ai_priority')}")
            print(f"  Department: {ticket.get('department')}")
            print(f"  Reasoning: {ai_reasoning}")
            
            # Check ai_analysis JSON
            if ticket.get('ai_analysis'):
                import json
                analysis = json.loads(ticket['ai_analysis']) if isinstance(ticket['ai_analysis'], str) else ticket['ai_analysis']
                print(f"\n  Structured Analysis:")
                print(f"    Triage: {analysis.get('triage', {}).get('category')}")
                print(f"    Risk Score: {analysis.get('risk', {}).get('risk_score')}")
            
            exit(0)
        
        time.sleep(2)
    except Exception as e:
        print(f"   Error: {e}")
        time.sleep(2)

print(f"\n❌ TIMEOUT: Analysis did not complete in 20 seconds")
print(f"\nDEBUGGING HINTS:")
print(f"1. Check uvicorn terminal for errors")
print(f"2. Look for '🔄 BACKGROUND TASK STARTED' message")
print(f"3. Check if workflow_engine is being called")
print(f"4. Verify database.db is not locked")
