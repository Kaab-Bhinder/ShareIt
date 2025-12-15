"""
Main FastAPI Application
Entry point for ShareIt backend API
"""

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.config.database import Base, engine
from app.routes import auth, items, bookings, disputes, wallet
from app.routes import uploads
# Import all models to register them with SQLAlchemy
from app.models import User, Wallet, Item, Booking, Transaction, Dispute

# Create all database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app instance
app = FastAPI(
    title="ShareIt API",
    description="Community-based borrow & lend system API",
    version="1.0.0"
)

# ============ CORS Configuration ============
# Allow frontend to communicate with backend
# IMPORTANT: This must be added BEFORE route handlers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=False,  # Set to False when using wildcard origin
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ============ Route Registration ============
app.include_router(auth.router)
app.include_router(items.router)
app.include_router(bookings.router)
app.include_router(disputes.router)
app.include_router(wallet.router)
app.include_router(uploads.router)

# ============ Health Check Routes ============

@app.get("/")
def read_root():
    """Root endpoint - API status"""
    return {"message": "ShareIt API is running ✓"}


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

# ============ Static Files (Uploads) ============
# Serve files saved by the uploads endpoint from /uploads/*
try:
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
except Exception:
    # Directory may not exist at import; uploads router ensures creation on first use
    pass


# ============ Run the app ============
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
