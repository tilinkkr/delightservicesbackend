"""
AI Agent & Ollama Diagnostic Tool
Tests each component of the AI analysis pipeline
"""

import requests
import json
from datetime import datetime

print("="*70)
print("🤖 INTELLIFLOW AI AGENT DIAGNOSTIC")
print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("="*70)

OLLAMA_API = "http://localhost:11434/api/generate"
MODEL_NAME = "mistral"

# Test ticket data
TEST_TICKET = {
    "id": 999,
    "title": "Production server down - urgent help needed",
    "description": "Our main API server crashed and 500 users cannot login. This is affecting VIP customers and causing revenue loss. Need immediate assistance."
}

errors = []
tests_passed = 0
tests_total = 0

# TEST 1: Ollama Service
print("\n" + "="*70)
print("TEST 1: OLLAMA SERVICE")
print("="*70)
tests_total += 1

try:
    print("Checking if Ollama is running...")
    response = requests.get("http://localhost:11434/api/tags", timeout=3)
    
    if response.status_code == 200:
        print("✅ Ollama is RUNNING")
        data = response.json()
        models = data.get("models", [])
        
        print(f"\n📦 Available models ({len(models)}):")
        for model in models:
            name = model.get("name", "unknown")
            size = model.get("size", 0) / (1024**3)
            print(f"   • {name} ({size:.2f} GB)")
        
        if any("mistral" in m.get("name", "").lower() for m in models):
            print("\n✅ Mistral model found")
            tests_passed += 1
        else:
            print("\n❌ Mistral model NOT FOUND")
            print("   Fix: Run → ollama pull mistral")
            errors.append("Mistral model missing")
    else:
        print(f"❌ Ollama returned status {response.status_code}")
        errors.append("Ollama unhealthy")
        
except requests.exceptions.ConnectionError:
    print("❌ OLLAMA NOT RUNNING")
    print("\n🔧 Fix:")
    print("   1. Open new Command Prompt")
    print("   2. Run: ollama serve")
    print("   3. Keep terminal open")
    errors.append("Ollama not running")
except Exception as e:
    print(f"❌ Error: {str(e)}")
    errors.append(f"Ollama error: {str(e)}")

# TEST 2: Import Modules
print("\n" + "="*70)
print("TEST 2: AGENT MODULE IMPORTS")
print("="*70)
tests_total += 1

try:
    from app.agents import triage_agent
    from app.rules import rule_engine
    from app.workflow_engine import process_ticket_workflow
    print("✅ All modules imported successfully")
    tests_passed += 1
except Exception as e:
    print(f"❌ Import error: {str(e)}")
    errors.append(f"Import error: {str(e)}")

# TEST 3: API Endpoint
print("\n" + "="*70)
print("TEST 3: API ENDPOINT TEST")
print("="*70)
tests_total += 1

try:
    # Create test ticket
    create_response = requests.post(
        "http://127.0.0.1:8000/tickets",
        json={
            "title": "Test AI Analysis",
            "description": "Server crashed need urgent help",
            "priority": "High",
            "status": "New"
        },
        timeout=5
    )
    
    if create_response.status_code == 200:
        ticket = create_response.json()
        ticket_id = ticket['id']
        print(f"✅ Created test ticket #{ticket_id}")
        
        # Trigger analysis
        analyze_response = requests.post(
            f"http://127.0.0.1:8000/tickets/{ticket_id}/analyze",
            timeout=5
        )
        
        if analyze_response.status_code == 200:
            print(f"✅ Analysis endpoint responded")
            
            # Wait for background task
            print("\nWaiting 10 seconds for background analysis...")
            import time
            time.sleep(10)
            
            # Check if updated
            check_response = requests.get(f"http://127.0.0.1:8000/tickets/{ticket_id}")
            updated_ticket = check_response.json()
            
            if updated_ticket.get('ai_priority'):
                print(f"\n✅ AI ANALYSIS WORKING!")
                print(f"   AI Priority: {updated_ticket['ai_priority']}")
                tests_passed += 1
            else:
                print(f"\n❌ AI fields still NULL - check server logs")
                errors.append("AI analysis not updating database")
        else:
            errors.append(f"Analyze endpoint failed: {analyze_response.status_code}")
    else:
        errors.append("Cannot create tickets")
        
except Exception as e:
    print(f"❌ API test failed: {str(e)}")
    errors.append(f"API error: {str(e)}")

# SUMMARY
print("\n" + "="*70)
print("📊 DIAGNOSTIC SUMMARY")
print("="*70)
print(f"\nTests Passed: {tests_passed}/{tests_total}")

if errors:
    print(f"\n❌ FAILURES ({len(errors)}):")
    for i, err in enumerate(errors, 1):
        print(f"   {i}. {err}")
else:
    print("\n🎉 ALL TESTS PASSED - AI AGENTS WORKING")

print("="*70)
