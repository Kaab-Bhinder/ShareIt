"""
Database Configuration
This file sets up the connection to PostgreSQL database using SQLAlchemy.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get database URL from environment variable
# Format: postgresql://username:password@localhost:5432/database_name
DATABASE_URL = os.getenv("DATABASE_URL")

# Create SQLAlchemy engine
# echo=True will print all SQL queries (useful for debugging, turn off in production)
engine = create_engine(
    DATABASE_URL,
    echo=True,
    future=True
)

# Create a session factory
# SessionLocal is used to create database sessions for each request
SessionLocal = sessionmaker(
    autocommit=False,  # Don't auto-commit changes
    autoflush=False,   # Don't auto-flush changes
    bind=engine        # Bind to our engine
)

# Create a base class for our models to inherit from
Base = declarative_base()

def get_db():
    """
    Dependency function for FastAPI routes
    Provides a database session and closes it after the request
    
    Usage in routes:
    @app.get("/items/")
    def get_items(db: Session = Depends(get_db)):
        return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
