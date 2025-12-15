"""
Wallet Model (Database Table)
Each user has ONE wallet to hold their balance for deposits and refunds
"""

from sqlalchemy import Column, Integer, Numeric, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.config.database import Base


class Wallet(Base):
    """
    Wallet table - one per user (1-to-1 relationship)
    Stores the user's balance for deposits, refunds, and penalties
    """
    __tablename__ = "wallet"

    wallet_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, unique=True, index=True)
    balance = Column(Numeric(10, 2), default=0.00, nullable=False)  # Current balance
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="wallet")
    transactions = relationship("Transaction", back_populates="wallet")

    def __repr__(self):
        return f"<Wallet {self.wallet_id}: Balance ${self.balance}>"
