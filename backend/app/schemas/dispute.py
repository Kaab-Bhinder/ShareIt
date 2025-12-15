"""
Dispute Schemas
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DisputeCreate(BaseModel):
    """
    Schema for filing a dispute (borrower or lender files)
    """
    booking_id: int  # Which booking has the issue
    description: str  # Remarks/comments from dispute maker
    estimated_cost: Optional[float] = None  # How much damage/loss


class DisputeResolve(BaseModel):
    """
    Schema for admin to resolve dispute
    """
    status: str  # "resolved" or "rejected"
    resolution_notes: Optional[str] = None  # Admin's notes


class DisputeResponse(BaseModel):
    """
    Schema for dispute response - includes full dispute details and who raised it
    """
    dispute_id: int
    booking_id: int
    raised_by: int  # User ID of who filed the dispute
    description: str  # Remarks from dispute maker
    estimated_cost: Optional[float]
    status: str  # open, resolved, rejected
    resolution_notes: Optional[str]
    created_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True
