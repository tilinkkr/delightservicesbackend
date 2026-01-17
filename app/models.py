from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Column, JSON

class Ticket(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    status: str = Field(default="New")  # New, In_Review, Approved, Rejected
    priority: str = Field(default="Medium")  # Low, Medium, High
    category: Optional[str] = None  # Billing, Technical, Access, Logistics
    department: Optional[str] = None  # Finance, IT, Operations, Sales
    
    # AI Fields
    ai_priority: Optional[str] = None
    ai_reasoning: Optional[str] = None
    
    # Store full JSON analysis payload (Triage, Compliance, Risk breakdown)
    # Storing as string for maximum compatibility with SQLite/SQLModel default
    ai_analysis: Optional[str] = None 
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AuditLog(SQLModel, table=True):
    """
    Audit trail for all system events
    Critical for enterprise compliance and debugging
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Event metadata
    event_type: str = Field(index=True)  # e.g., "TICKET_CREATED", "AI_ANALYZED"
    event_category: str  # "USER_ACTION", "AI_ACTION", "SYSTEM_ACTION"
    
    # Context
    ticket_id: Optional[int] = Field(default=None, index=True)
    actor: str = Field(default="System")  # "User", "AI-Triage", "RPA-Bot"
    
    # Details
    description: str
    metadata_json: Optional[str] = None  # JSON string for additional data
    
    # Status
    status: str = Field(default="SUCCESS")  # "SUCCESS", "FAILED", "PENDING"
    
    # Timing
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    duration_ms: Optional[int] = None  # Execution time if applicable
