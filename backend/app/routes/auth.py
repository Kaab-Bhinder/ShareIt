"""
Authentication Routes
Handles user registration, login, and JWT token management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

from app.config.database import get_db
from app.models.user import User
from app.models.wallet import Wallet
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse

load_dotenv()

# Create router for auth endpoints
router = APIRouter(prefix="/auth", tags=["authentication"])

# Password hashing context
# Using argon2 which is more secure and doesn't have bcrypt's 72-byte limit
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# JWT settings from environment variables
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))


# ============ Password Hashing Functions ============

def hash_password(password: str) -> str:
    """
    Hash a plain password using bcrypt
    
    Args:
        password: Plain text password
    
    Returns:
        Hashed password (never stores plain text!)
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password
    
    Args:
        plain_password: Plain text password from user
        hashed_password: Hashed password from database
    
    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


# ============ JWT Token Functions ============

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """
    Create a JWT access token
    
    Args:
        data: Data to encode in token (e.g., {"sub": user_id})
        expires_delta: Token expiration time
    
    Returns:
        JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    
    # Encode the JWT
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str):
    """
    Verify and decode a JWT token
    
    Args:
        token: JWT token string
    
    Returns:
        Token payload (contains user_id)
    
    Raises:
        HTTPException if token is invalid
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


# ============ Routes ============

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user
    
    Args:
        user: Registration data (full_name, email, password, phone, address)
        db: Database session
    
    Returns:
        UserResponse with created user info
    
    Raises:
        409: Email already exists
        400: Missing required fields
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists"
        )
    
    # Create new user with hashed password
    # Role defaults to "borrower" - users can switch to "lender" in dashboard
    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password_hash=hash_password(user.password),  # Hash password before storing!
        phone=user.phone,
        address=user.address,
        role=user.role if hasattr(user, 'role') and user.role else "borrower"  # Default to borrower
    )
    
    # Add user to database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create wallet for new user (every user needs a wallet)
    wallet = Wallet(user_id=new_user.user_id, balance=0.00)
    db.add(wallet)
    db.commit()
    
    return new_user


@router.post("/login", response_model=TokenResponse)
def login(user: UserLogin, db: Session = Depends(get_db)):
    """
    Login user and return JWT token
    
    Args:
        user: Login credentials (email, password)
        db: Database session
    
    Returns:
        TokenResponse with access_token, token_type, and user info
    
    Raises:
        401: Invalid email or password
    """
    # Find user by email
    db_user = db.query(User).filter(User.email == user.email).first()
    
    # Check if user exists and password is correct
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create JWT token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(db_user.user_id)},
        expires_delta=access_token_expires
    )
    
    # Return token and user info
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user
    }


# ============ User Management Endpoints ============

@router.get("/users", response_model=list[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    """
    Get all users (admin only)
    """
    users = db.query(User).all()
    return users


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """
    Get a specific user by ID
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """
    Delete a user (admin only)
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
