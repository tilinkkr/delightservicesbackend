import requests
import time
import json

BASE_URL = "http://127.0.0.1:8000"

print("="*70)
print("🚀 INTELLIFLOW FINAL END-TO-END TEST")
print("="*70)

# Test 1: Create ticket
print("\n[1] Creating ticket...")
ticket_data = {
    "title": "Final System Test",
    "description": "Critical server outage affecting production payments. Security violation suspected.",
    "priority": "High",
    "status": "New"
}
try:
    r = requests.post(f"{BASE_URL}/tickets", json=ticket_data)
    r.raise_for_status()
    ticket = r.json()
    ticket_id = ticket['id']
    print(f"✅ Ticket Created: ID #{ticket_id}")
except Exception as e:
    print(f"❌ Creation Failed: {e}")
    exit(1)

# Test 2: AI Analysis
print(f"\n[2] Triggering AI Analysis for #{ticket_id}...")
try:
    r = requests.post(f"{BASE_URL}/tickets/{ticket_id}/analyze")
    r.raise_for_status()
    print(f"✅ Analysis Queued: {r.json()['status']}")
except Exception as e:
    print(f"❌ Analysis Trigger Failed: {e}")
    exit(1)

# Wait
print("\n[3] Waiting 8 seconds for background agents...")
time.sleep(8)

# Test 3: Check Results
print(f"\n[4] verifying AI Results...")
try:
    r = requests.get(f"{BASE_URL}/tickets/{ticket_id}")
    t = r.json()
    
    print(f"   Category: {t.get('category')}")
    print(f"   AI Priority: {t.get('ai_priority')}")
    print(f"   AI Reasoning: {t.get('ai_reasoning')[:60]}...")
    
    # Validation logic
    if t.get('ai_priority') and t.get('category'):
        print("✅ AI Analysis SUCCESS")
    else:
        print("❌ AI Analysis FAILED (fields empty)")
        # Proceeding anyway to test approval
except Exception as e:
    print(f"❌ Verification Failed: {e}")

# Test 4: Approve
print(f"\n[5] Approving & Closing Ticket...")
try:
    r = requests.post(f"{BASE_URL}/tickets/{ticket_id}/approve")
    if r.status_code == 200:
        res = r.json()
        print(f"✅ Ticket Closed. PDF: {res.get('pdf_filename')}")
    else:
        print(f"❌ Approval Failed: {r.text}")
except Exception as e:
    print(f"❌ Approval Error: {e}")

# Test 5: Analytics
print(f"\n[6] Checking Analytics API...")
try:
    r = requests.get(f"{BASE_URL}/api/stats")
    stats = r.json()
    print(f"✅ KPI Stats Fetched:")
    print(f"   Total Tickets: {stats.get('total_tickets')}")
    print(f"   Closed: {stats.get('closed_count')}")
    print(f"   AI Analyzed: {stats.get('ai_analyzed_count')}")
except Exception as e:
    print(f"❌ Analytics Failed: {e}")

print("\n" + "="*70)
print("✅ FINAL TEST SEQUENCE COMPLETE")
print("="*70)
