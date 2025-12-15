"""
Booking Model (Database Table)
Represents a borrow request from borrower to lender
"""

from sqlalchemy import Column, Integer, Date, Numeric, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.config.database import Base


class BookingStatusEnum(str, enum.Enum):
    """Enum for booking status"""
    PENDING = "pending"  # Waiting for lender approval
    ACCEPTED = "accepted"  # Lender approved, item is rented
    REJECTED = "rejected"  # Lender rejected
    AWAITING_PICKUP = "awaiting_pickup"  # Ready for pickup
    PICKED_UP = "picked_up"  # Borrower picked up item
    RETURN_PENDING = "return_pending"  # Borrower initiated return, awaiting lender confirmation
    RETURNED = "returned"  # Lender confirmed return received, case closed


class Booking(Base):
    """
    Booking table - records all borrow requests
    Links borrower, lender, and item
    """
    __tablename__ = "bookings"

    booking_id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.item_id"), nullable=False, index=True)
    borrower_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    lender_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)

    # Dates
    start_date = Column(Date, nullable=False)  # When borrower wants to start
    end_date = Column(Date, nullable=False)    # When borrower will return

    # Financial
    total_deposit = Column(Numeric(10, 2), nullable=False)  # Calculated deposit

    # Status and Reason
    status = Column(Enum(BookingStatusEnum), default=BookingStatusEnum.PENDING, index=True)
    reason = Column(String(255), nullable=True)  # Why they need the item

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    item = relationship("Item", back_populates="bookings")
    borrower = relationship("User", back_populates="bookings_as_borrower", foreign_keys=[borrower_id])
    lender = relationship("User", back_populates="bookings_as_lender", foreign_keys=[lender_id])
    transactions = relationship("Transaction", back_populates="booking", cascade="all, delete-orphan")
    disputes = relationship("Dispute", back_populates="booking", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Booking {self.booking_id}: Item {self.item_id} - {self.status}>"
