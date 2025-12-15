"""
User Schemas (Request/Response Models)
These define what data clients send to the API and what the API returns.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    """
    Schema for user registration request
    Client sends this data when creating a new account
    """
    full_name: str  # User's full name
    email: EmailStr  # Email must be valid format
    password: str  # Password (will be hashed in the database)
    phone: Optional[str] = None  # Optional phone number
    address: Optional[str] = None  # Optional address
    role: str = "borrower"  # Default role is borrower


class UserLogin(BaseModel):
    """
    Schema for user login request
    Client sends this data when logging in
    """
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """
    Schema for user response
    API returns this when a user is created or retrieved
    Note: password_hash is NOT included here (security!)
    """
    user_id: int
    full_name: str
    email: str
    phone: Optional[str]
    address: Optional[str]
    role: str
    created_at: datetime

    class Config:
        from_attributes = True  # Can convert SQLAlchemy models to this schema


class TokenResponse(BaseModel):
    """
    Schema for login response
    Returns the JWT token and user info
    """
    access_token: str
    token_type: str  # Always "bearer"
    user: UserResponse
