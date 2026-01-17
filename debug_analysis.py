"""
AI Analysis Bug Diagnostic Tool
Tests each step of the analysis pipeline
"""

import requests
import time
import json

BASE_URL = "http://127.0.0.1:8000"

print("="*70)
print("🐛 AI ANALYSIS BUG DIAGNOSTIC")
print("="*70)

# Step 1: Create a test ticket
print("\n[STEP 1] Creating test ticket...")
test_ticket = {
    "title": "DEBUG: Server crash urgent help",
    "description": "Production server down affecting 500 users. VIP customer impacted. Need immediate assistance.",
    "priority": "High",
    "status": "New"
}

try:
    r = requests.post(f"{BASE_URL}/tickets", json=test_ticket, timeout=5)
    if r.status_code == 200:
        ticket = r.json()
        ticket_id = ticket['id']
        print(f"✅ Ticket created: ID = {ticket_id}")
        print(f"   Initial state:")
        print(f"   - ai_priority: {ticket.get('ai_priority')}")
        print(f"   - ai_reasoning: {ticket.get('ai_reasoning')}")
    else:
        print(f"❌ Create failed: {r.status_code}")
        print(f"   Response: {r.text}")
        exit(1)
except Exception as e:
    print(f"❌ Create error: {str(e)}")
    exit(1)

# Step 2: Check if Ollama is running
print("\n[STEP 2] Checking Ollama...")
try:
    # Use localhost directly, assuming running locally
    r = requests.get("http://localhost:11434/api/tags", timeout=2)
    if r.status_code == 200:
        models = r.json().get("models", [])
        has_mistral = any("mistral" in m.get("name", "").lower() for m in models)
        if has_mistral:
            print("✅ Ollama running with Mistral model")
        else:
            print("⚠️  Ollama running but Mistral not found")
            try:
                 print(f"   Available models: {[m.get('name') for m in models]}")
            except: pass
    else:
        print(f"⚠️  Ollama returned {r.status_code}")
except Exception as e:
    print(f"⚠️  Ollama not reachable: {str(e)}")
    print("   AI will use rule-based fallback")

# Step 3: Trigger AI analysis
print(f"\n[STEP 3] Triggering AI analysis for ticket {ticket_id}...")
try:
    r = requests.post(f"{BASE_URL}/tickets/{ticket_id}/analyze", timeout=5)
    if r.status_code == 200:
        result = r.json()
        print(f"✅ Analysis triggered: {result}")
        
        # Check what was returned
        if result.get("status") == "queued":
            print("   → Analysis is running in background")
        else:
            print(f"   → Unexpected response: {result}")
    else:
        print(f"❌ Analysis failed: {r.status_code}")
        print(f"   Response: {r.text}")
        exit(1)
except Exception as e:
    print(f"❌ Analysis error: {str(e)}")
    exit(1)

# Step 4: Poll for results
print(f"\n[STEP 4] Polling for results (max 30 seconds)...")
for i in range(15):  # Poll 15 times (30 seconds)
    time.sleep(2)
    
    try:
        r = requests.get(f"{BASE_URL}/tickets/{ticket_id}", timeout=2)
        if r.status_code == 200:
            ticket = r.json()
            
            ai_priority = ticket.get('ai_priority')
            ai_reasoning = ticket.get('ai_reasoning')
            
            if ai_priority and ai_reasoning:
                print(f"\n✅ RESULTS FOUND after {(i+1)*2} seconds!")
                print(f"\n   AI Priority: {ai_priority}")
                print(f"   AI Reasoning: {ai_reasoning[:150]}...")
                print(f"   Category: {ticket.get('category')}")
                print(f"   Department: {ticket.get('department')}")
                
                print(f"\n{'='*70}")
                print("✅ AI ANALYSIS WORKING CORRECTLY")
                print("="*70)
                exit(0)
            else:
                print(f"   Poll {i+1}/15: ai_priority = {ai_priority}, waiting...")
    except Exception as e:
        print(f"   Poll {i+1}/15: Error - {str(e)}")

# If we get here, analysis never completed
print(f"\n{'='*70}")
print("❌ AI ANALYSIS FAILED - Results not populated after 30 seconds")
print("="*70)

print("\n🔍 DEBUGGING HINTS:")
print("1. Check uvicorn terminal for errors")
print("2. Check if workflow_engine.py is being called")
print("3. Check if background task is executing")
print("4. Verify database.db is writable (not locked)")

exit(1)
