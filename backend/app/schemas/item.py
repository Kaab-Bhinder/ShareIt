"""
Item Schemas (Request/Response Models)
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ItemCreate(BaseModel):
    """
    Schema for creating an item (lender uploads item)
    """
    title: str  # Item name
    description: Optional[str] = None  # Detailed description
    condition: str  # New, Good, or Used
    estimated_price: float  # Price estimate (used for deposit calculation)
    min_days: int  # Minimum borrowing days
    max_days: int  # Maximum borrowing days
    daily_deposit: float  # Daily deposit amount
    images: Optional[List[str]] = None  # URLs of item photos
    location: str  # City or area


class ItemUpdate(BaseModel):
    """
    Schema for updating an item (only owner can update)
    """
    title: Optional[str] = None
    description: Optional[str] = None
    condition: Optional[str] = None
    estimated_price: Optional[float] = None
    min_days: Optional[int] = None
    max_days: Optional[int] = None
    daily_deposit: Optional[float] = None
    images: Optional[List[str]] = None
    location: Optional[str] = None
    is_active: Optional[bool] = None  # Enable/disable item


class ItemResponse(BaseModel):
    """
    Schema for item response (when retrieving items)
    """
    item_id: int
    lender_id: int
    title: str
    description: Optional[str]
    condition: str
    estimated_price: float
    min_days: int
    max_days: int
    daily_deposit: float
    images: Optional[List[str]]
    location: str
    is_active: bool
    status: Optional[str] = "available"  # availability status: available, rented, dispute, inactive
    created_at: datetime

    class Config:
        from_attributes = True
