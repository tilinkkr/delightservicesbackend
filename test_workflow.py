import requests
import time
import os

BASE_URL = "http://127.0.0.1:8000"

def test_full_workflow():
    print("🚀 STARTING END-TO-END WORKFLOW TEST")
    
    # 1. Create Ticket
    print("\n1️⃣ Creating Ticket...")
    ticket_data = {
        "title": "Refund Request for Invoice #999",
        "description": "Customer needs refund for double charge on invoice #999. Urgent.",
        "status": "New"
    }
    res = requests.post(f"{BASE_URL}/tickets", json=ticket_data)
    ticket_id = res.json()["id"]
    print(f"✅ Created Ticket #{ticket_id}")

    # 2. Trigger Analysis
    print("\n2️⃣ Triggering AI Analysis...")
    start_time = time.time()
    res = requests.post(f"{BASE_URL}/tickets/{ticket_id}/analyze")
    print(res.json())
    print(f"✅ Triggered in {(time.time() - start_time)*1000:.2f}ms (Async verification)")

    # 3. Poll for Results
    print("\n3️⃣ Polling for Completion...")
    for i in range(10):
        time.sleep(1)
        res = requests.get(f"{BASE_URL}/tickets/{ticket_id}")
        ticket = res.json()
        if ticket.get("ai_priority"):
            print(f"✅ Analysis Complete! Priority: {ticket['ai_priority']}")
            print(f"   Reasoning: {ticket['ai_reasoning'][:50]}...")
            break
        print(".", end="", flush=True)
    else:
        print("❌ Timeout waiting for analysis")
        return

    # 4. Approve & Close
    print("\n4️⃣ Approving & Closing Ticket...")
    res = requests.post(f"{BASE_URL}/tickets/{ticket_id}/approve")
    result = res.json()
    
    if result["status"] == "success":
        print("✅ Ticket Closed Successfully")
        print(f"   PDF URL: {result['pdf_url']}")
        print(f"   Actions: {result['actions_completed']}")
        
        # Verify PDF exists (locally)
        pdf_path = f"app/reports/{result['pdf_filename']}"
        if os.path.exists(pdf_path):
             print(f"✅ PDF File verified on disk: {pdf_path}")
        else:
             print(f"❌ PDF File NOT found: {pdf_path}")
             
    else:
        print(f"❌ Failed to close ticket: {result}")

if __name__ == "__main__":
    test_full_workflow()
