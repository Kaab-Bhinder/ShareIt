"""
Dispute Model (Database Table)
Records disputes between borrowers and lenders
Admins review and resolve these
"""

from sqlalchemy import Column, Integer, Text, Numeric, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.config.database import Base


class DisputeStatusEnum(str, enum.Enum):
    """Enum for dispute status"""
    OPEN = "open"  # Waiting for admin review
    RESOLVED = "resolved"  # Admin resolved the issue
    REJECTED = "rejected"  # Admin rejected the claim


class Dispute(Base):
    """
    Dispute table - handles conflicts between users
    Each booking can have at most ONE dispute
    """
    __tablename__ = "disputes"

    dispute_id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.booking_id"), nullable=False, unique=True, index=True)
    raised_by = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)  # Who filed the dispute

    # Dispute Details
    description = Column(Text, nullable=False)  # What went wrong (remarks from dispute maker)
    estimated_cost = Column(Numeric(10, 2), nullable=True)  # Claimed damage/loss amount

    # Status
    status = Column(Enum(DisputeStatusEnum), default=DisputeStatusEnum.OPEN, index=True)
    resolution_notes = Column(Text, nullable=True)  # Admin's decision and notes

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)  # When admin resolved it

    # Relationships
    booking = relationship("Booking", back_populates="disputes")
    raised_by_user = relationship("User", backref="disputes_raised")

    def __repr__(self):
        return f"<Dispute {self.dispute_id}: {self.status}>"
