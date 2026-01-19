from sqlmodel import Session
from app.database import engine, init_db
from app.models import Ticket
from datetime import datetime

def populate():
    init_db()
    
    tickets = [
        Ticket(
            title="VPN Connection Failed",
            description="Unable to connect to corporate VPN from home.",
            status="New",
            priority="High",
            category="Technical",
            department="IT",
            created_at=datetime.utcnow()
        ),
        Ticket(
            title="Invoice #1023 Delayed",
            description="Vendor waiting for payment for over 30 days.",
            status="In_Review",
            priority="High",
            category="Billing",
            department="Finance",
            created_at=datetime.utcnow()
        ),
        Ticket(
            title="Request for Photoshop License",
            description="Marketing team needs new license for intern.",
            status="New",
            priority="Low",
            category="Access",
            department="Operations",
            created_at=datetime.utcnow()
        ),
        Ticket(
            title="Server 4B Overheating",
            description="Temperature sensors indicating critical levels.",
            status="New",
            priority="High",
            category="Technical",
            department="IT",
            created_at=datetime.utcnow()
        ),
         Ticket(
            title="Q4 Sales Report Discrepancy",
            description="Numbers in dashboard don't match excel sheet.",
            status="New",
            priority="Medium",
            category="Technical",
            department="Sales",
            created_at=datetime.utcnow()
        ),
        Ticket(
            title="Office Chair Broken",
            description="Gas lift failed on Herman Miller chair.",
            status="New",
            priority="Low",
            category="Logistics",
            department="Operations",
            created_at=datetime.utcnow()
        ),
        Ticket(
            title="Expense Claim #998",
            description="Travel expenses for Client X meeting.",
            status="Approved",
            priority="Medium",
            category="Billing",
            department="Finance",
            created_at=datetime.utcnow()
        ),
        Ticket(
            title="New Employee Onboarding",
            description="Setup laptop and accounts for J. Doe.",
            status="New",
            priority="Medium",
            category="Access",
            department="IT",
            created_at=datetime.utcnow()
        ),
        Ticket(
            title="Bulk Order Coffee Beans",
            description="Pantry supply running low.",
            status="New",
            priority="Low",
            category="Logistics",
            department="Operations",
            created_at=datetime.utcnow()
        ),
        Ticket(
            title="CRM Access Issue",
            description="Sales team lead cannot view Q3 reports.",
            status="New",
            priority="High",
            category="Access",
            department="Sales",
            created_at=datetime.utcnow()
        )
    ]

    with Session(engine) as session:
        for ticket in tickets:
            session.add(ticket)
        session.commit()
    
    print("✅ Added 10 tickets to database")

if __name__ == "__main__":
    populate()
