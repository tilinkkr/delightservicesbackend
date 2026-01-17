"""
Audit Service - Persistent Event Logging
Writes all events to database for compliance
"""

from sqlmodel import Session
from app.models import AuditLog
from app.event_bus import event_bus
from datetime import datetime
import json


def log_audit_event(
    session: Session,
    event_type: str,
    category: str,
    ticket_id: int = None,
    actor: str = "System",
    description: str = "",
    metadata: dict = None,
    status: str = "SUCCESS",
    duration_ms: int = None
):
    """
    Write audit log entry to database
    
    Args:
        session: Database session
        event_type: Type of event (e.g., "TICKET_CREATED")
        category: Category (USER_ACTION, AI_ACTION, SYSTEM_ACTION)
        ticket_id: Related ticket ID
        actor: Who performed the action
        description: Human-readable description
        metadata: Additional structured data
        status: SUCCESS, FAILED, PENDING
        duration_ms: Execution time
    """
    
    log_entry = AuditLog(
        event_type=event_type,
        event_category=category,
        ticket_id=ticket_id,
        actor=actor,
        description=description,
        metadata_json=json.dumps(metadata) if metadata else None,
        status=status,
        created_at=datetime.utcnow(),
        duration_ms=duration_ms
    )
    
    session.add(log_entry)
    session.commit()
    
    print(f"📝 Audit logged: {event_type} - {description}")


# ============================================================================
# Event Listeners (Auto-triggered by event bus)
# ============================================================================

def get_db_session():
    from app.database import engine
    return Session(engine)

def audit_ticket_created(data: dict):
    """Listener for TICKET_CREATED events"""
    print(f"   🎧 Audit listener: TICKET_CREATED")
    try:
        with get_db_session() as session:
            log_audit_event(
                session=session,
                event_type="TICKET_CREATED",
                category="USER_ACTION",
                ticket_id=data.get("ticket_id"),
                actor=data.get("created_by", "User"),
                description=f"New ticket created: {data.get('title')}",
                metadata=data
            )
    except Exception as e:
        print(f"   ❌ Failed to persist audit log: {e}")

def audit_ai_analysis_complete(data: dict):
    """Listener for AI_ANALYSIS_COMPLETE events"""
    print(f"   🎧 Audit listener: AI_ANALYSIS_COMPLETE")
    try:
        with get_db_session() as session:
            log_audit_event(
                session=session,
                event_type="AI_ANALYZED",
                category="AI_ACTION",
                ticket_id=data.get("ticket_id"),
                actor="AI-Agent-Swarm",
                description=f"AI Analysis completed in {data.get('execution_time_seconds')}s",
                metadata=data,
                duration_ms=int(data.get("execution_time_seconds", 0) * 1000)
            )
    except Exception as e:
         print(f"   ❌ Failed to persist audit log: {e}")

def audit_ticket_closed(data: dict):
    """Listener for TICKET_CLOSED events"""
    print(f"   🎧 Audit listener: TICKET_CLOSED")
    try:
        with get_db_session() as session:
            log_audit_event(
                session=session,
                event_type="TICKET_CLOSED",
                category="SYSTEM_ACTION",
                ticket_id=data.get("ticket_id"),
                actor="RPA-Bot",
                description=f"Ticket closed and PDF report generated: {data.get('pdf_filename')}",
                metadata=data
            )
    except Exception as e:
         print(f"   ❌ Failed to persist audit log: {e}")


# Register listeners at module load
event_bus.on("TICKET_CREATED", audit_ticket_created)
event_bus.on("AI_ANALYSIS_COMPLETE", audit_ai_analysis_complete)
event_bus.on("TICKET_CLOSED", audit_ticket_closed)
