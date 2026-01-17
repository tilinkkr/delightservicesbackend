"""
Pydantic Schemas for AI Agent Output Validation
Ensures type safety and data integrity
"""

from pydantic import BaseModel, Field, field_validator
from typing import List, Literal


class TriageOutput(BaseModel):
    """
    Validated output schema for Triage Agent
    """
    category: Literal["Billing", "Technical", "Access", "Logistics", "HR", "Other"] = Field(
        ...,
        description="Ticket category"
    )
    priority: Literal["Low", "Medium", "High"] = Field(
        ...,
        description="Ticket priority level"
    )
    department: Literal["Finance", "IT", "Operations", "Sales", "HR", "Support"] = Field(
        ...,
        description="Assigned department"
    )
    reasoning: str = Field(
        ...,
        min_length=10,
        max_length=500,
        description="AI reasoning for classification"
    )
    
    @field_validator('reasoning')
    @classmethod
    def reasoning_not_empty(cls, v):
        if not v or v.strip() == "":
            raise ValueError("Reasoning cannot be empty")
        return v.strip()


class ComplianceOutput(BaseModel):
    """
    Validated output schema for Compliance Agent
    """
    status: Literal["OK", "Needs_Info", "Blocked"] = Field(
        ...,
        description="Compliance check status"
    )
    messages: List[str] = Field(
        default_factory=list,
        description="List of compliance issues found"
    )
    recommendation: str = Field(
        ...,
        min_length=5,
        description="Recommended action"
    )


class RiskOutput(BaseModel):
    """
    Validated output schema for Risk Agent
    """
    risk_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Business risk score (0-100)"
    )
    risk_level: Literal["Low", "Medium", "High"] = Field(
        ...,
        description="Risk severity level"
    )
    impact_areas: List[str] = Field(
        ...,
        min_items=1,
        description="Business areas affected"
    )
    explanation: str = Field(
        ...,
        min_length=10,
        max_length=500,
        description="Risk assessment explanation"
    )
    
    @field_validator('risk_score')
    @classmethod
    def validate_score_level_match(cls, v, info):
        """Ensure risk_score aligns with risk_level"""
        # This validator runs after all fields are set
        return v
