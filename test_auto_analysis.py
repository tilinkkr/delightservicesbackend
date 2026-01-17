import requests
import time

print("Testing Automatic AI Analysis on Ticket Creation")
print("="*60)

# Create ticket
print("\n[1] Creating ticket...")
r = requests.post('http://127.0.0.1:8000/tickets', json={
    'title': 'Automatic Analysis Test',
    'description': 'Testing if AI agents analyze automatically on creation',
    'priority': 'High',
    'status': 'New'
})

ticket_id = r.json()['id']
print(f"✅ Created ticket #{ticket_id}")

# Wait for background analysis
print("\n[2] Waiting 8 seconds for automatic analysis...")
time.sleep(8)

# Check if analyzed
print("\n[3] Checking if AI analysis completed automatically...")
t = requests.get(f'http://127.0.0.1:8000/tickets/{ticket_id}').json()

print(f"\nResults:")
print(f"  AI Priority: {t.get('ai_priority')}")
print(f"  Category: {t.get('category')}")
print(f"  Department: {t.get('department')}")
print(f"  AI Reasoning: {t.get('ai_reasoning', 'None')[:80]}...")

if t.get('ai_priority'):
    print(f"\n✅ SUCCESS! Automatic analysis is WORKING")
else:
    print(f"\n⚠️  Analysis not complete yet (may need more time)")
