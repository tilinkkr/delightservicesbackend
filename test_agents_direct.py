"""
Direct agent test - bypasses background tasks
Tests if agents + database update work
"""

from sqlmodel import Session, select
from app.database import engine
from app.models import Ticket

print("="*70)
print("🧪 DIRECT AGENT TEST (No Background Tasks)")
print("="*70)

# Get ticket 29 (or find another valid one)
with Session(engine) as session:
    # Try to find recent ticket to test
    tickets = session.exec(select(Ticket).order_by(Ticket.id.desc())).all()
    if not tickets:
        print("❌ No tickets found in DB")
        exit(1)
        
    ticket = tickets[0] # Use most recent
    
    print(f"\n✅ Ticket found: #{ticket.id} - {ticket.title}")
    print(f"   Before: ai_priority = {ticket.ai_priority}")
    
    # Call workflow directly (synchronous)
    print("\n🔄 Calling workflow_engine directly...")
    
    try:
        from app.workflow_engine import process_ticket_workflow
        
        result = process_ticket_workflow(
            ticket.id,
            ticket.title,
            ticket.description,
            session
        )
        
        print(f"\n✅ Workflow returned:")
        print(f"   Triage: {result.get('triage', {}).get('category')}")
        print(f"   Priority: {result.get('triage', {}).get('priority')}")
        
        # Refresh ticket from DB
        session.refresh(ticket)
        
        print(f"\n📊 Database state after workflow:")
        print(f"   ai_priority: {ticket.ai_priority}")
        print(f"   ai_reasoning: {str(ticket.ai_reasoning)[:100] if ticket.ai_reasoning else None}...")
        print(f"   category: {ticket.category}")
        
        if ticket.ai_priority:
            print(f"\n✅ SUCCESS - Agents + Database working!")
        else:
            print(f"\n❌ FAILED - Workflow ran but didn't update database")
            
    except Exception as e:
        print(f"\n❌ WORKFLOW FAILED:")
        print(f"   {str(e)}")
        import traceback
        traceback.print_exc()
