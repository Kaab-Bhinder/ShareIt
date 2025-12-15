"""
User Model (Database Table)
Represents users of the platform: borrowers, lenders, and admins
"""

from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.config.database import Base


class RoleEnum(str, enum.Enum):
    """Enum for user roles"""
    BORROWER = "borrower"
    LENDER = "lender"
    ADMIN = "admin"


class User(Base):
    """
    User table in the database
    Stores information about all platform users
    """
    __tablename__ = "users"

    # Primary Key
    user_id = Column(Integer, primary_key=True, index=True)

    # User Info
    full_name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)  # Hashed password (never store plain text!)
    phone = Column(String(20), nullable=True)
    address = Column(String(150), nullable=True)

    # Role
    role = Column(Enum(RoleEnum), default=RoleEnum.BORROWER, nullable=False)

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships (connections to other tables)
    wallet = relationship("Wallet", back_populates="user", uselist=False, cascade="all, delete-orphan")
    items = relationship("Item", back_populates="lender", cascade="all, delete-orphan")
    bookings_as_borrower = relationship("Booking", back_populates="borrower", foreign_keys="Booking.borrower_id")
    bookings_as_lender = relationship("Booking", back_populates="lender", foreign_keys="Booking.lender_id")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.user_id}: {self.full_name}>"
