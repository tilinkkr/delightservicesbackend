"""
Test backend endpoints in isolation
Run AFTER health_check.py passes
"""

import requests
import time

BASE_URL = "http://127.0.0.1:8000"

print("🧪 BACKEND ENDPOINT TESTS")
print("="*60)

# Test 1: Root endpoint
print("\n1. Testing GET /")
try:
    r = requests.get(f"{BASE_URL}/")
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        print("   ✅ Root endpoint working")
    else:
        print(f"   ❌ Expected 200, got {r.status_code}")
except Exception as e:
    print(f"   ❌ Error: {e}")
    print("   → Is server running? (uvicorn app.main:app --reload)")

# Test 2: List tickets
print("\n2. Testing GET /tickets")
try:
    r = requests.get(f"{BASE_URL}/tickets")
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        tickets = r.json()
        print(f"   ✅ Got {len(tickets)} tickets")
        if tickets:
            print(f"   Sample: ID={tickets[0]['id']}, Title={tickets[0]['title'][:30]}")
    else:
        print(f"   ❌ Expected 200, got {r.status_code}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 3: Get single ticket
print("\n3. Testing GET /tickets/1")
try:
    r = requests.get(f"{BASE_URL}/tickets/1")
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        ticket = r.json()
        print(f"   ✅ Ticket: {ticket['title']}")
        print(f"   Fields: status={ticket['status']}, priority={ticket['priority']}")
        ai_reasoning = ticket.get('ai_reasoning', 'None')
        if ai_reasoning and len(ai_reasoning) > 50:
            ai_reasoning = ai_reasoning[:50] + "..."
        print(f"   AI fields: ai_priority={ticket.get('ai_priority')}, ai_reasoning={ai_reasoning}")
    else:
        print(f"   ❌ Expected 200, got {r.status_code}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 4: Trigger AI analysis
print("\n4. Testing POST /tickets/1/analyze")
try:
    r = requests.post(f"{BASE_URL}/tickets/1/analyze")
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        result = r.json()
        print(f"   ✅ Analysis triggered: {result}")
        
        # Wait and check if ai_priority was updated
        print("   Waiting 5 seconds for background task...")
        time.sleep(5)
        
        r2 = requests.get(f"{BASE_URL}/tickets/1")
        ticket = r2.json()
        if ticket.get('ai_priority'):
            print(f"   ✅ AI updated: priority={ticket['ai_priority']}")
        else:
            print("   ⚠️  AI fields still empty - check server logs")
    else:
        print(f"   ❌ Expected 200, got {r.status_code}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 5: Stats endpoint
print("\n5. Testing GET /api/stats")
try:
    r = requests.get(f"{BASE_URL}/api/stats")
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        stats = r.json()
        kpi = stats.get('kpi_cards', {})
        print(f"   ✅ Stats retrieved:")
        print(f"      Total tickets: {kpi.get('total_tickets')}")
        print(f"      AI analyzed: {kpi.get('ai_analyzed_count')}")
        print(f"      LLM saved: {kpi.get('llm_calls_saved_percent')}%")
    else:
        print(f"   ❌ Expected 200, got {r.status_code}")
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "="*60)
print("✅ BACKEND TESTS COMPLETE - Check output above")
print("="*60)
