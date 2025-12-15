"""
Booking Schemas (Request/Response Models)
"""

from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class BookingCreate(BaseModel):
    """
    Schema for creating a borrow request
    """
    item_id: int  # Which item to borrow
    start_date: date  # When to borrow from
    end_date: date  # When to return
    reason: Optional[str] = None  # Why they need it


class BookingDecision(BaseModel):
    """
    Schema for lender to accept/reject booking
    """
    status: str  # "accepted" or "rejected"
    reason: Optional[str] = None  # Optional reason/notes


class BookingStatusUpdate(BaseModel):
    """
    Schema for updating booking status (pickup/return)
    """
    status: str  # "picked_up" or "returned"


class BookingResponse(BaseModel):
    """
    Schema for booking response
    """
    booking_id: int
    item_id: int
    borrower_id: int
    lender_id: int
    start_date: date
    end_date: date
    total_deposit: float
    status: str  # pending, accepted, rejected, awaiting_pickup, picked_up, returned
    reason: Optional[str]
    created_at: datetime
    
    # Additional fields for display
    item_title: Optional[str] = None
    item_location: Optional[str] = None
    lender_name: Optional[str] = None
    borrower_name: Optional[str] = None

    class Config:
        from_attributes = True
