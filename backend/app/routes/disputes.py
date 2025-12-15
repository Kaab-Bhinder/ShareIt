"""
Disputes Routes
Handles dispute creation, resolution, and management
"""

from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from datetime import datetime

from app.config.database import get_db
from app.models.dispute import Dispute, DisputeStatusEnum
from app.models.booking import Booking
from app.schemas.dispute import (
    DisputeCreate,
    DisputeResolve,
    DisputeResponse,
)
from app.routes.auth import verify_token

router = APIRouter(prefix="/disputes", tags=["disputes"])


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
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token format")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


# ============ Routes ============

@router.post("/", response_model=DisputeResponse, status_code=status.HTTP_201_CREATED)
def create_dispute(
    dispute: DisputeCreate,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Create a new dispute on a booking
    
    Args:
        dispute: Dispute data (booking_id, description, estimated_cost)
        current_user_id: Current user's ID from token
        db: Database session
    
    Returns:
        DisputeResponse with dispute details
    """
    # Verify booking exists
    booking = db.query(Booking).filter(Booking.booking_id == dispute.booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    
    # Check if user is part of this booking
    if booking.borrower_id != current_user_id and booking.lender_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    # Check if dispute already exists for this booking
    existing_dispute = db.query(Dispute).filter(
        Dispute.booking_id == dispute.booking_id
    ).first()
    
    if existing_dispute:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dispute already exists for this booking"
        )
    
    # Create dispute
    new_dispute = Dispute(
        booking_id=dispute.booking_id,
        raised_by=current_user_id,  # Automatically set to current user
        description=dispute.description,
        estimated_cost=dispute.estimated_cost,
        status=DisputeStatusEnum.OPEN,
    )
    
    db.add(new_dispute)
    db.commit()
    db.refresh(new_dispute)
    
    return new_dispute


@router.get("/", response_model=list[DisputeResponse])
def get_user_disputes(
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Get all disputes for current user (on their bookings)
    
    Args:
        current_user_id: Current user's ID from token
        db: Database session
    
    Returns:
        List of DisputeResponse
    """
    # Get disputes on bookings where user is borrower or lender
    disputes = db.query(Dispute).join(Booking).filter(
        (Booking.borrower_id == current_user_id) | (Booking.lender_id == current_user_id)
    ).all()
    
    return disputes


@router.get("/{dispute_id}", response_model=DisputeResponse)
def get_dispute(
    dispute_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Get single dispute details
    
    Args:
        dispute_id: Dispute ID
        current_user_id: Current user's ID from token
        db: Database session
    
    Returns:
        DisputeResponse
    """
    dispute = db.query(Dispute).filter(Dispute.dispute_id == dispute_id).first()
    if not dispute:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispute not found")
    
    # Check authorization
    booking = dispute.booking
    if booking.borrower_id != current_user_id and booking.lender_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return dispute


@router.patch("/{dispute_id}", response_model=DisputeResponse)
def resolve_dispute(
    dispute_id: int,
    resolution: DisputeResolve,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Resolve a dispute (admin or involved parties)
    
    Args:
        dispute_id: Dispute ID
        resolution: Resolution data (status, resolution_notes)
        current_user_id: Current user's ID from token
        db: Database session
    
    Returns:
        Updated DisputeResponse
    """
    dispute = db.query(Dispute).filter(Dispute.dispute_id == dispute_id).first()
    if not dispute:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispute not found")
    
    # Check authorization (both parties can resolve)
    booking = dispute.booking
    if booking.borrower_id != current_user_id and booking.lender_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    dispute.status = resolution.status
    dispute.resolution_notes = resolution.resolution_notes
    dispute.resolved_at = datetime.utcnow()
    
    db.commit()
    db.refresh(dispute)
    
    return dispute


@router.delete("/{dispute_id}")
def delete_dispute(
    dispute_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Delete a dispute (only open disputes, and by involved parties)
    
    Args:
        dispute_id: Dispute ID
        current_user_id: Current user's ID from token
        db: Database session
    
    Returns:
        Success message
    """
    dispute = db.query(Dispute).filter(Dispute.dispute_id == dispute_id).first()
    if not dispute:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispute not found")
    
    # Check authorization
    booking = dispute.booking
    if booking.borrower_id != current_user_id and booking.lender_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    # Only open disputes can be deleted
    if dispute.status != DisputeStatusEnum.OPEN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only open disputes can be deleted"
        )
    
    db.delete(dispute)
    db.commit()
    
    return {"message": "Dispute deleted successfully"}
