"""
Item Model (Database Table)
Represents items that lenders offer for borrowing
"""

from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, DateTime, ForeignKey, ARRAY, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from app.config.database import Base

class ItemStatusEnum(str, Enum):
    """Item availability status"""
    AVAILABLE = "available"
    RENTED = "rented"
    DISPUTE = "dispute"
    INACTIVE = "inactive"


class Item(Base):
    """
    Item table - items available for borrowing
    Each item belongs to ONE lender (1-to-Many relationship)
    An item can be booked multiple times
    """
    __tablename__ = "items"

    item_id = Column(Integer, primary_key=True, index=True)
    lender_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)

    # Item Details
    title = Column(String(120), nullable=False)
    description = Column(Text, nullable=True)
    condition = Column(String(20), nullable=False)  # "New", "Good", or "Used"
    estimated_price = Column(Numeric(10, 2), nullable=False)  # Used to calculate deposit

    # Borrowing Rules
    min_days = Column(Integer, nullable=False)  # Minimum borrowing period
    max_days = Column(Integer, nullable=False)  # Maximum borrowing period
    daily_deposit = Column(Numeric(10, 2), nullable=False)  # Deposit per day

    # Images and Location
    images = Column(ARRAY(String), nullable=True)  # Array of image URLs
    location = Column(String(150), nullable=True)  # City or area

    # Availability
    is_active = Column(Boolean, default=True, index=True)  # Can be borrowed or disabled
    status = Column(SQLEnum(ItemStatusEnum), default=ItemStatusEnum.AVAILABLE, index=True)  # availability status

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    lender = relationship("User", back_populates="items")
    bookings = relationship("Booking", back_populates="item", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Item {self.item_id}: {self.title}>"
