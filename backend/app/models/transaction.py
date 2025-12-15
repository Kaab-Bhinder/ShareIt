"""
Transaction Model (Database Table)
Records all financial transactions (deposits, refunds, penalties)
"""

from sqlalchemy import Column, Integer, Numeric, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.config.database import Base


class TransactionTypeEnum(str, enum.Enum):
    """Enum for transaction types"""
    DEPOSIT = "DEPOSIT"  # Money locked for booking
    REFUND = "REFUND"    # Money returned after booking
    PENALTY = "PENALTY"  # Fine for late return or damage
    WITHDRAWAL = "WITHDRAWAL"  # User withdraws money from wallet
    TOPUP = "TOPUP"  # Money added to wallet via topup
    EARNING = "EARNING"  # Money earned from lending


class Transaction(Base):
    """
    Transaction table - logs all money movements
    Links user, wallet, and booking
    """
    __tablename__ = "transactions"

    tx_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    wallet_id = Column(Integer, ForeignKey("wallet.wallet_id"), nullable=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.booking_id"), nullable=True, index=True)

    # Amount and Type
    amount = Column(Numeric(10, 2), nullable=False)  # How much money
    tx_type = Column(Enum(TransactionTypeEnum), nullable=False)  # What kind of transaction
    description = Column(String(255), nullable=True)  # Additional notes

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="transactions")
    wallet = relationship("Wallet", back_populates="transactions")
    booking = relationship("Booking", back_populates="transactions")

    def __repr__(self):
        return f"<Transaction {self.tx_id}: {self.tx_type} ${self.amount}>"
