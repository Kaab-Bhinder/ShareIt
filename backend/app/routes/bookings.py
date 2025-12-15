"""
Booking Routes
Handles booking requests, management, and status updates
"""

from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from decimal import Decimal

from app.config.database import get_db
from app.models.booking import Booking, BookingStatusEnum
from app.models.item import Item, ItemStatusEnum
from app.models.user import User
from app.models.wallet import Wallet
from app.models.transaction import Transaction, TransactionTypeEnum
from app.schemas.booking import (
    BookingCreate,
    BookingResponse,
    BookingDecision,
)
from app.routes.auth import verify_token

router = APIRouter(prefix="/bookings", tags=["bookings"])


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


# ============ Routes ============

@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking: BookingCreate,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Create a new booking request (borrower requests to borrow an item)
    
    Args:
        booking: Booking data (item_id, start_date, end_date, reason)
        current_user_id: Current user's ID from token
        db: Database session
    
    Returns:
        BookingResponse with booking details
    """
    # Verify item exists and is active
    item = db.query(Item).filter(Item.item_id == booking.item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    
    if not item.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Item is not available")
    
    # Check if borrower is trying to book their own item
    if item.lender_id == current_user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot book your own item")
    
    # Calculate duration and deposit
    duration = (booking.end_date - booking.start_date).days
    if duration < item.min_days or duration > item.max_days:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Duration must be between {item.min_days} and {item.max_days} days"
        )
    
    total_deposit = item.daily_deposit * duration

    # Create booking (pending; lender must confirm)
    new_booking = Booking(
        item_id=booking.item_id,
        borrower_id=current_user_id,
        lender_id=item.lender_id,
        start_date=booking.start_date,
        end_date=booking.end_date,
        total_deposit=total_deposit,
        status=BookingStatusEnum.PENDING,
        reason=booking.reason,
    )
    
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    # Do NOT deduct wallet at creation; lender confirmation will perform deduction
    
    # Enrich response with item and user details
    lender = db.query(User).filter(User.user_id == new_booking.lender_id).first()
    borrower = db.query(User).filter(User.user_id == new_booking.borrower_id).first()
    
    booking_dict = {
        'booking_id': new_booking.booking_id,
        'item_id': new_booking.item_id,
        'borrower_id': new_booking.borrower_id,
        'lender_id': new_booking.lender_id,
        'start_date': new_booking.start_date,
        'end_date': new_booking.end_date,
        'total_deposit': new_booking.total_deposit,
        'status': new_booking.status.value,
        'reason': new_booking.reason,
        'created_at': new_booking.created_at,
        'item_title': item.title,
        'item_location': item.location,
        'lender_name': lender.full_name if lender else None,
        'borrower_name': borrower.full_name if borrower else None,
    }
    
    return booking_dict


@router.get("/", response_model=list[BookingResponse])
def get_user_bookings(
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Get all bookings for current user (as borrower and lender)
    
    Args:
        current_user_id: Current user's ID from token
        db: Database session
    
    Returns:
        List of BookingResponse
    """
    # Get bookings where user is borrower or lender
    bookings = db.query(Booking).filter(
        (Booking.borrower_id == current_user_id) | (Booking.lender_id == current_user_id)
    ).all()
    
    # Enrich with item and user details
    result = []
    for booking in bookings:
        booking_dict = {
            'booking_id': booking.booking_id,
            'item_id': booking.item_id,
            'borrower_id': booking.borrower_id,
            'lender_id': booking.lender_id,
            'start_date': booking.start_date,
            'end_date': booking.end_date,
            'total_deposit': booking.total_deposit,
            'status': booking.status.value,
            'reason': booking.reason,
            'created_at': booking.created_at,
        }
        
        # Add item details
        item = db.query(Item).filter(Item.item_id == booking.item_id).first()
        if item:
            booking_dict['item_title'] = item.title
            booking_dict['item_location'] = item.location
        
        # Add lender details
        lender = db.query(User).filter(User.user_id == booking.lender_id).first()
        if lender:
            booking_dict['lender_name'] = lender.full_name
        
        # Add borrower details
        borrower = db.query(User).filter(User.user_id == booking.borrower_id).first()
        if borrower:
            booking_dict['borrower_name'] = borrower.full_name
        
        result.append(booking_dict)
    
    return result


@router.get("/pending", response_model=list[BookingResponse])
def get_pending_bookings(
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Get pending booking requests for lender (requests on their items)
    
    Args:
        current_user_id: Current user's ID from token
        db: Database session
    
    Returns:
        List of pending BookingResponse
    """
    bookings = db.query(Booking).filter(
        Booking.lender_id == current_user_id,
        Booking.status == BookingStatusEnum.PENDING
    ).all()
    
    # Enrich with item and user details
    result = []
    for booking in bookings:
        booking_dict = {
            'booking_id': booking.booking_id,
            'item_id': booking.item_id,
            'borrower_id': booking.borrower_id,
            'lender_id': booking.lender_id,
            'start_date': booking.start_date,
            'end_date': booking.end_date,
            'total_deposit': booking.total_deposit,
            'status': booking.status.value,
            'reason': booking.reason,
            'created_at': booking.created_at,
        }
        
        # Add item details
        item = db.query(Item).filter(Item.item_id == booking.item_id).first()
        if item:
            booking_dict['item_title'] = item.title
            booking_dict['item_location'] = item.location
        
        # Add borrower details
        borrower = db.query(User).filter(User.user_id == booking.borrower_id).first()
        if borrower:
            booking_dict['borrower_name'] = borrower.full_name
        
        # Add lender details
        lender = db.query(User).filter(User.user_id == booking.lender_id).first()
        if lender:
            booking_dict['lender_name'] = lender.full_name
        
        result.append(booking_dict)
    
    return result


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Get single booking details
    
    Args:
        booking_id: Booking ID
        current_user_id: Current user's ID from token
        db: Database session
    
    Returns:
        BookingResponse
    """
    booking = db.query(Booking).filter(Booking.booking_id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    
    # Check authorization
    if booking.borrower_id != current_user_id and booking.lender_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return booking


@router.get("/active-items")
def get_active_items(db: Session = Depends(get_db)):
    """
    Return a mapping of item_id -> days_left for all accepted bookings
    that have not yet reached their end_date (i.e., currently rented).
    """
    today = datetime.utcnow().date()
    active = db.query(Booking).filter(
        Booking.status == BookingStatusEnum.ACCEPTED,
        Booking.end_date >= today
    ).all()
    result = {}
    for b in active:
        days_left = (b.end_date - today).days
        result[b.item_id] = max(0, days_left)
    return {"active": result}


@router.patch("/{booking_id}", response_model=BookingResponse)
def update_booking_status(
    booking_id: int,
    decision: BookingDecision,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Update booking status (lender accepts/rejects, or mark as returned)
    
    Args:
        booking_id: Booking ID
        decision: Decision data (status, notes)
        current_user_id: Current user's ID from token
        db: Database session
    
    Returns:
        Updated BookingResponse
    """
    booking = db.query(Booking).filter(Booking.booking_id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    
    # Convert string status to enum (handle both uppercase and lowercase)
    status_str = decision.status.lower() if isinstance(decision.status, str) else decision.status
    
    # Map string to enum
    try:
        new_status = BookingStatusEnum(status_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status: {decision.status}"
        )
    
    # Only lender can accept/reject, borrower can mark as returned
    if new_status in [BookingStatusEnum.ACCEPTED, BookingStatusEnum.REJECTED]:
        if booking.lender_id != current_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only lender can accept/reject")
        
        # If booking is accepted, deduct deposit from borrower's wallet
        if new_status == BookingStatusEnum.ACCEPTED:
            borrower_wallet = db.query(Wallet).filter(Wallet.user_id == booking.borrower_id).first()
            if not borrower_wallet:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Borrower wallet not found")
            
            # Check if borrower has sufficient balance
            if borrower_wallet.balance < Decimal(str(booking.total_deposit)):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient wallet balance. Required: ₹{booking.total_deposit}, Available: ₹{borrower_wallet.balance}"
                )
            
            # Deduct deposit from borrower's wallet
            borrower_wallet.balance = borrower_wallet.balance - Decimal(str(booking.total_deposit))
            
            # Create deposit transaction
            deposit_transaction = Transaction(
                user_id=booking.borrower_id,
                wallet_id=borrower_wallet.wallet_id,
                booking_id=booking.booking_id,
                tx_type=TransactionTypeEnum.DEPOSIT,
                amount=Decimal(str(booking.total_deposit)),
                description=f"Deposit locked for item '{db.query(Item).filter(Item.item_id == booking.item_id).first().title if booking.item_id else 'Unknown'}'",
            )
            db.add(deposit_transaction)
            
            # Credit deposit to lender's wallet
            lender_wallet = db.query(Wallet).filter(Wallet.user_id == booking.lender_id).first()
            if not lender_wallet:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Lender wallet not found")
            
            lender_wallet.balance = lender_wallet.balance + Decimal(str(booking.total_deposit))
            
            # Create earning transaction for lender
            item_title = db.query(Item).filter(Item.item_id == booking.item_id).first().title if booking.item_id else 'Unknown'
            earning_transaction = Transaction(
                user_id=booking.lender_id,
                wallet_id=lender_wallet.wallet_id,
                booking_id=booking.booking_id,
                tx_type=TransactionTypeEnum.EARNING,
                amount=Decimal(str(booking.total_deposit)),
                description=f"Earning from renting '{item_title}'",
            )
            db.add(earning_transaction)
            
            # Set item status to rented
            item = db.query(Item).filter(Item.item_id == booking.item_id).first()
            if item:
                item.status = ItemStatusEnum.RENTED
    
    # Borrower initiates return (RETURN_PENDING)
    if new_status == BookingStatusEnum.RETURN_PENDING:
        if booking.borrower_id != current_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only borrower can initiate return")
        
        # Check if there's an open dispute - if yes, can't mark as returned
        from app.models.dispute import Dispute, DisputeStatusEnum
        open_dispute = db.query(Dispute).filter(
            Dispute.booking_id == booking.booking_id,
            Dispute.status == DisputeStatusEnum.OPEN
        ).first()
        
        if open_dispute:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot mark as returned while dispute is open. Resolve dispute first."
            )
        
        # Just change status to RETURN_PENDING - wait for lender confirmation
        # No refund yet
    
    # Lender confirms return (RETURNED) - this closes the case
    if new_status == BookingStatusEnum.RETURNED:
        if booking.lender_id != current_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only lender can confirm return")
        
        # Booking must be in RETURN_PENDING status
        if booking.status != BookingStatusEnum.RETURN_PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Item must be marked as return_pending first"
            )
        
        # Refund deposit to borrower's wallet
        borrower_wallet = db.query(Wallet).filter(Wallet.user_id == booking.borrower_id).first()
        if borrower_wallet:
            borrower_wallet.balance = borrower_wallet.balance + Decimal(str(booking.total_deposit))
            
            # Create refund transaction
            refund_transaction = Transaction(
                user_id=booking.borrower_id,
                wallet_id=borrower_wallet.wallet_id,
                tx_type=TransactionTypeEnum.REFUND,
                amount=Decimal(str(booking.total_deposit)),
                description=f"Deposit refund for item '{db.query(Item).filter(Item.item_id == booking.item_id).first().title if booking.item_id else 'Unknown'}'",
            )
            db.add(refund_transaction)
        
        # Set item status back to available
        item = db.query(Item).filter(Item.item_id == booking.item_id).first()
        if item:
            item.status = ItemStatusEnum.AVAILABLE
    
    booking.status = new_status
    if decision.reason:
        booking.reason = decision.reason
    
    db.commit()
    db.refresh(booking)
    
    # Enrich response with item and user details
    item = db.query(Item).filter(Item.item_id == booking.item_id).first()
    lender = db.query(User).filter(User.user_id == booking.lender_id).first()
    borrower = db.query(User).filter(User.user_id == booking.borrower_id).first()
    
    booking_dict = {
        'booking_id': booking.booking_id,
        'item_id': booking.item_id,
        'borrower_id': booking.borrower_id,
        'lender_id': booking.lender_id,
        'start_date': booking.start_date,
        'end_date': booking.end_date,
        'total_deposit': booking.total_deposit,
        'status': booking.status.value,
        'reason': booking.reason,
        'created_at': booking.created_at,
        'item_title': item.title if item else None,
        'item_location': item.location if item else None,
        'lender_name': lender.full_name if lender else None,
        'borrower_name': borrower.full_name if borrower else None,
    }
    
    return booking_dict
