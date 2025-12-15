"""
Items Routes
Handles item creation, listing, updating, and deletion
"""

from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from datetime import datetime

from app.config.database import get_db
from app.models.item import Item
from app.models.user import User
from app.schemas.item import ItemCreate, ItemUpdate, ItemResponse
from app.routes.auth import verify_token

router = APIRouter(prefix="/items", tags=["items"])


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

@router.post("/", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(
    item: ItemCreate,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Create a new item (lender only)
    
    Args:
        item: Item data
        current_user_id: Current user's ID from token
        db: Database session
    
    Returns:
        ItemResponse with created item info
    """
    # Verify user exists
    user = db.query(User).filter(User.user_id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Create new item
    new_item = Item(
        lender_id=current_user_id,
        title=item.title,
        description=item.description,
        condition=item.condition,
        estimated_price=item.estimated_price,
        min_days=item.min_days,
        max_days=item.max_days,
        daily_deposit=item.daily_deposit,
        images=item.images,
        location=item.location,
        is_active=True
    )
    
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    return new_item


@router.get("/", response_model=list[ItemResponse])
def get_all_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Get all active items
    
    Args:
        skip: Number of items to skip
        limit: Number of items to return
        db: Database session
    
    Returns:
        List of ItemResponse
    """
    items = db.query(Item).filter(Item.is_active == True).offset(skip).limit(limit).all()
    return items


@router.get("/lender/{lender_id}", response_model=list[ItemResponse])
def get_lender_items(lender_id: int, db: Session = Depends(get_db)):
    """
    Get all items from a specific lender
    
    Args:
        lender_id: ID of lender
        db: Database session
    
    Returns:
        List of ItemResponse
    """
    items = db.query(Item).filter(
        Item.lender_id == lender_id,
        Item.is_active == True
    ).all()
    return items


@router.get("/{item_id}", response_model=ItemResponse)
def get_item(item_id: int, db: Session = Depends(get_db)):
    """
    Get single item by ID
    
    Args:
        item_id: Item ID
        db: Database session
    
    Returns:
        ItemResponse
    """
    item = db.query(Item).filter(Item.item_id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return item


@router.patch("/{item_id}", response_model=ItemResponse)
def update_item(
    item_id: int,
    item_update: ItemUpdate,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Update item (owner only)
    
    Args:
        item_id: Item ID
        item_update: Updated data
        current_user_id: Current user's ID from token
        db: Database session
    
    Returns:
        Updated ItemResponse
    """
    item = db.query(Item).filter(Item.item_id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    
    if item.lender_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this item")
    
    # Update fields
    if item_update.title:
        item.title = item_update.title
    if item_update.description:
        item.description = item_update.description
    if item_update.condition:
        item.condition = item_update.condition
    if item_update.estimated_price:
        item.estimated_price = item_update.estimated_price
    if item_update.min_days:
        item.min_days = item_update.min_days
    if item_update.max_days:
        item.max_days = item_update.max_days
    if item_update.daily_deposit:
        item.daily_deposit = item_update.daily_deposit
    if item_update.images:
        item.images = item_update.images
    if item_update.location:
        item.location = item_update.location
    if item_update.is_active is not None:
        item.is_active = item_update.is_active
    
    db.commit()
    db.refresh(item)
    
    return item


@router.delete("/{item_id}")
def delete_item(
    item_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Delete/disable item (owner only)
    
    Args:
        item_id: Item ID
        current_user_id: Current user's ID from token
        db: Database session
    
    Returns:
        Success message
    """
    item = db.query(Item).filter(Item.item_id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    
    if item.lender_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this item")
    
    # Soft delete - just mark as inactive
    item.is_active = False
    db.commit()
    
    return {"message": "Item deleted successfully"}
