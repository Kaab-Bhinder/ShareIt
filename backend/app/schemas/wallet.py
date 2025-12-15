"""
Wallet and Transaction Schemas
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class TransactionResponse(BaseModel):
    """
    Schema for transaction response
    """
    transaction_id: int
    type: str  # "topup", "deposit", "refund", "penalty"
    amount: float
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class WalletBalance(BaseModel):
    """
    Schema for wallet balance response
    """
    balance: float
    currency: str = "PKR"
    transactions: List[TransactionResponse]


class TopupRequest(BaseModel):
    """
    Schema for wallet topup request
    """
    amount: float  # Amount to topup (in INR)
    payment_method: str = "credit_card"  # payment method used


class WalletResponse(BaseModel):
    """
    Schema for wallet info response
    """
    wallet_id: int
    user_id: int
    balance: float
    created_at: datetime

    class Config:
        from_attributes = True


class AddMoneyRequest(BaseModel):
    """
    Schema for adding money to wallet
    """
    amount: float  # Amount to add
