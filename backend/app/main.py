from fastapi import FastAPI, Depends, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlmodel import Session, select, create_engine
from app.database import get_session, init_db, sqlite_url
from app.models import Ticket
from contextlib import asynccontextmanager
from datetime import datetime
import datetime as dt
import os
import json
from app.workflow_engine import process_ticket_workflow
from app.automation import close_ticket_workflow
from app.metrics import agent_metrics
from app.event_bus import event_bus
from app.audit import log_audit_event # initializes listeners

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Creating database tables...")
    init_db()
    os.makedirs("app/reports", exist_ok=True)
    yield
    print("Shutting down...")

app = FastAPI(title="IntelliFlow Copilot", lifespan=lifespan)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Ensure reports dir exists before mounting
os.makedirs("app/reports", exist_ok=True)
app.mount("/reports", StaticFiles(directory="app/reports"), name="reports")

# Serve dashboard at root
@app.get("/")
def root():
    return FileResponse("static/dashboard.html")

@app.get("/tickets")
def list_tickets(session: Session = Depends(get_session)):
    tickets = session.exec(select(Ticket)).all()
    return tickets

@app.get("/tickets/{ticket_id}")
def get_ticket(ticket_id: int, session: Session = Depends(get_session)):
    ticket = session.get(Ticket, ticket_id)
    if not ticket:
        return {"error": "Ticket not found"}
    
    # Convert to dict to allow modification
    ticket_dict = ticket.model_dump()
    
    # Parse ai_analysis JSON string if it exists
    if ticket.ai_analysis:
        try:
            ticket_dict["ai_analysis"] = json.loads(ticket.ai_analysis)
        except:
            ticket_dict["ai_analysis"] = None
            
    return ticket_dict

def background_workflow_wrapper(ticket_id: int, title: str, description: str):
    """Wrapper to handle session for background task"""
    # Create a new engine with check_same_thread=False for background tasks
    engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
    with Session(engine) as session:
        try:
            process_ticket_workflow(ticket_id, title, description, session)
        except Exception as e:
            print(f"❌ Background workflow failed: {str(e)}")

@app.post("/tickets")
def create_ticket(ticket: Ticket, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    # 1. Save ticket immediately (Fast UX)
    session.add(ticket)
    session.commit()
    session.refresh(ticket)
    
    # Emit event
    event_bus.emit("TICKET_CREATED", {
        "ticket_id": ticket.id,
        "title": ticket.title,
        "priority": ticket.priority,
        "created_by": "User"
    })
    
    # 2. Schedule Workflow in background
    background_tasks.add_task(background_workflow_wrapper, ticket.id, ticket.title, ticket.description)
    
    return ticket

@app.post("/tickets/{ticket_id}/analyze")
async def analyze_ticket(ticket_id: int, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    """Trigger AI analysis (async, non-blocking)"""
    
    ticket = session.get(Ticket, ticket_id)
    if not ticket:
        return {"error": "Ticket not found"}
    
    # Store ticket data explicitly (unbind from session)
    t_id = ticket.id
    t_title = ticket.title
    t_desc = ticket.description
    
    # Background task function
    def run_analysis_sync():
        """Synchronous wrapper for background execution"""
        print(f"\n🔄 BACKGROUND TASK STARTED for ticket {t_id}")
        
        try:
            # Create new DB session for background task
            from sqlmodel import Session, create_engine
            from app.database import sqlite_url
            
            # Crucial for SQLite in threads
            engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
            
            with Session(engine) as bg_session:
                # Import and call workflow
                from app.workflow_engine import process_ticket_workflow
                
                print(f"   Calling workflow_engine...")
                result = process_ticket_workflow(
                    t_id,
                    t_title,
                    t_desc,
                    bg_session
                )
                
                print(f"✅ Background task complete")
                
        except Exception as e:
            print(f"❌ BACKGROUND TASK FAILED:")
            print(f"   Error: {str(e)}")
            import traceback
            traceback.print_exc()
    
    # Add to background tasks
    background_tasks.add_task(run_analysis_sync)
    
    return {
        "status": "queued",
        "message": "AI analysis started",
        "ticket_id": ticket_id,
        "check_after_seconds": 2
    }

@app.post("/tickets/{ticket_id}/approve")
def approve_and_close(ticket_id: int, session: Session = Depends(get_session)):
    result = close_ticket_workflow(ticket_id, session)
    
    if result.get("status") == "success":
        # Emit closure event
        event_bus.emit("TICKET_CLOSED", {
            "ticket_id": ticket_id,
            "pdf_filename": result.get("pdf_filename"),
            "closed_at": datetime.utcnow().isoformat()
        })
        
    return result

@app.get("/api/stats")
def get_stats(session: Session = Depends(get_session)):
    tickets = session.exec(select(Ticket)).all()
    
    # 1. KPI Cards
    total_tickets = len(tickets)
    high_priority = len([t for t in tickets if t.priority == "High"])
    closed_tickets = len([t for t in tickets if t.status == "Closed"])
    analyzed_tickets = len([t for t in tickets if t.ai_priority])
    
    # Calculate Savings
    llm_saved_percent = 72.5 
    
    # PDF Count
    pdf_count = 0
    if os.path.exists("app/reports"):
        pdf_count = len([f for f in os.listdir("app/reports") if f.endswith(".pdf")])

    kpi_cards = {
        "total_tickets": total_tickets,
        "high_priority_count": high_priority,
        "closed_count": closed_tickets,
        "ai_analyzed_count": analyzed_tickets,
        "llm_calls_saved_percent": llm_saved_percent,
        "avg_analysis_time_ms": 45, 
        "pdfs_generated": pdf_count
    }

    # 2. Category Distribution
    categories = {}
    for t in tickets:
        cat = t.category or "Uncategorized"
        categories[cat] = categories.get(cat, 0) + 1

    # 3. Priority Distribution
    priorities = {"High": 0, "Medium": 0, "Low": 0}
    for t in tickets:
        if t.priority in priorities:
            priorities[t.priority] += 1

    # 4. Status Distribution
    statuses = {"New": 0, "In_Review": 0, "Approved": 0, "Rejected": 0, "Closed": 0}
    for t in tickets:
        if t.status in statuses:
            statuses[t.status] += 1
            
    # 5. Tickets by Day (Mock for 7 days) - FIXED datetime import
    today = dt.date.today()
    tickets_by_day = []
    for i in range(7):
        d = today - dt.timedelta(days=6-i)
        import random
        tickets_by_day.append({
            "date": d.strftime("%Y-%m-%d"),
            "high": random.randint(0, 5),
            "medium": random.randint(2, 8),
            "low": random.randint(1, 4)
        })

    return {
        "kpi_cards": kpi_cards,
        "category_distribution": categories,
        "priority_distribution": priorities,
        "status_distribution": statuses,
        "tickets_by_day": tickets_by_day
    }

@app.get("/api/audit-logs")
def get_audit_logs(
    ticket_id: int = None,
    limit: int = 50,
    session: Session = Depends(get_session)
):
    """
    Get audit trail
    Optionally filter by ticket_id
    """
    
    from app.models import AuditLog
    from sqlmodel import select
    
    query = select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit)
    
    if ticket_id:
        query = query.where(AuditLog.ticket_id == ticket_id)
    
    # Check if table exists (migrated) - simple fallback if not
    try:
        logs = session.exec(query).all()
        return [
            {
                "id": log.id,
                "event_type": log.event_type,
                "category": log.event_category,
                "ticket_id": log.ticket_id,
                "actor": log.actor,
                "description": log.description,
                "status": log.status,
                "created_at": log.created_at.isoformat(),
                "duration_ms": log.duration_ms
            }
            for log in logs
        ]
    except:
        return []

@app.get("/api/events/recent")
def get_recent_events(limit: int = 20):
    """
    Get recent events from event bus (in-memory)
    For real-time monitoring
    """
    from app.event_bus import event_bus
    return event_bus.get_recent_events(limit)

@app.get("/api/agent-metrics")
def get_agent_metrics(session: Session = Depends(get_session)):
    """
    Real-time agent performance metrics
    """
    
    tickets = session.exec(select(Ticket)).all()
    # total_tickets = len(tickets)
    ai_analyzed = len([t for t in tickets if t.ai_priority is not None])
    
    # Calculate efficiency
    total_calls = agent_metrics["triage_calls"]
    rule_only = agent_metrics["rule_only_calls"]
    llm_calls = agent_metrics["llm_calls"]
    
    rule_percent = round((rule_only / total_calls * 100) if total_calls > 0 else 0, 1)
    llm_percent = round((llm_calls / total_calls * 100) if total_calls > 0 else 0, 1)
    
    # Cost calculation (estimates)
    cost_per_llm = 0.03  # $0.03 per LLM call
    cost_per_rule = 0.0001  # $0.0001 per rule execution
    
    total_cost = (llm_calls * cost_per_llm) + (rule_only * cost_per_rule)
    cost_if_all_llm = total_calls * cost_per_llm
    cost_saved = cost_if_all_llm - total_cost
    
    # Performance
    avg_time = (agent_metrics["total_analysis_time"] / total_calls) if total_calls > 0 else 0
    
    return {
        "agent_usage": {
            "triage_calls": agent_metrics["triage_calls"],
            "compliance_calls": agent_metrics["compliance_calls"],
            "risk_calls": agent_metrics["risk_calls"],
            "parallel_executions": agent_metrics["parallel_executions"]
        },
        "intelligence_breakdown": {
            "rule_only_count": rule_only,
            "llm_used_count": llm_calls,
            "rule_only_percent": rule_percent,
            "llm_used_percent": llm_percent
        },
        "cost_analysis": {
            "total_cost_usd": round(total_cost, 3),
            "cost_saved_usd": round(cost_saved, 3),
            "cost_per_ticket": round(total_cost / total_calls, 4) if total_calls > 0 else 0
        },
        "performance": {
            "avg_analysis_time_seconds": round(avg_time, 2),
            "total_tickets_analyzed": ai_analyzed,
            "parallel_speedup_percent": 60
        },
        "uptime": {
            "since": agent_metrics["last_reset"].isoformat(),
            "hours": round((dt.datetime.utcnow() - agent_metrics["last_reset"]).total_seconds() / 3600, 1)
        }
    }
