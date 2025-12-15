"""
Wallet Routes - Handle wallet balance and topup operations
"""

from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from decimal import Decimal

from app.config.database import get_db
from app.models.wallet import Wallet
from app.models.transaction import Transaction, TransactionTypeEnum
from app.schemas.wallet import WalletBalance, TopupRequest, TransactionResponse
from app.routes.auth import verify_token

router = APIRouter(prefix="/wallet", tags=["wallet"])


# ============ Helper Functions ============

def get_current_user_id(authorization: str = Header(None)):
    """Extract user ID from Bearer token"""
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid auth scheme")
        user_id = verify_token(token)
        return int(user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token format: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {str(e)}")



@router.get("/balance", response_model=WalletBalance)
def get_wallet_balance(
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Get current wallet balance for the logged-in user
    
    Args:
        current_user_id: Current user's ID from token
        db: Database session
    
    Returns:
        WalletBalance with balance and recent transactions
    """
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user_id).first()
    
    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found"
        )
    
    # Get recent transactions (last 10)
    transactions = (
        db.query(Transaction)
        .filter(Transaction.wallet_id == wallet.wallet_id)
        .order_by(Transaction.created_at.desc())
        .limit(10)
        .all()
    )
    
    transaction_responses = [
        TransactionResponse(
            transaction_id=t.tx_id,
            type=t.tx_type.value,
            amount=float(t.amount),
            description=t.description,
            created_at=t.created_at,
        )
        for t in transactions
    ]
    
    return WalletBalance(
        balance=float(wallet.balance),
        currency="PKR",
        transactions=transaction_responses,
    )


@router.post("/topup", response_model=WalletBalance)
def topup_wallet(
    request: TopupRequest,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Add funds to wallet via topup
    
    Args:
        request: TopupRequest with amount and payment method
        current_user_id: Current user's ID from token
        db: Database session
    
    Returns:
        Updated WalletBalance
    """
    if request.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be greater than 0"
        )
    
    if request.amount > 100000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount cannot exceed PKR 100,000"
        )
    
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user_id).first()
    
    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found"
        )
    
    # Add funds to wallet
    wallet.balance = wallet.balance + Decimal(str(request.amount))
    
    # Create transaction record
    transaction = Transaction(
        user_id=current_user_id,
        wallet_id=wallet.wallet_id,
        tx_type=TransactionTypeEnum.TOPUP,
        amount=Decimal(str(request.amount)),
        description=f"Wallet topup via {request.payment_method}",
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(wallet)
    
    # Return updated balance
    transactions = (
        db.query(Transaction)
        .filter(Transaction.wallet_id == wallet.wallet_id)
        .order_by(Transaction.created_at.desc())
        .limit(10)
        .all()
    )
    
    transaction_responses = [
        TransactionResponse(
            transaction_id=t.tx_id,
            type=t.tx_type.value,
            amount=float(t.amount),
            description=t.description,
            created_at=t.created_at,
        )
        for t in transactions
    ]
    
    return WalletBalance(
        balance=float(wallet.balance),
        currency="INR",
        transactions=transaction_responses,
    )


@router.get("/transactions", response_model=list[TransactionResponse])
def get_transactions(
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Get all transactions for the wallet
    
    Args:
        current_user_id: Current user's ID from token
        db: Database session
    
    Returns:
        List of all transactions
    """
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user_id).first()
    
    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found"
        )
    
    transactions = (
        db.query(Transaction)
        .filter(Transaction.wallet_id == wallet.wallet_id)
        .order_by(Transaction.created_at.desc())
        .all()
    )
    
    return [
        TransactionResponse(
            transaction_id=t.tx_id,
            type=t.tx_type.value,
            amount=float(t.amount),
            description=t.description,
            created_at=t.created_at,
        )
        for t in transactions
    ]
