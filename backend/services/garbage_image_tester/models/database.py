"""
Database Configuration and Connection Management

Provides SQLAlchemy engine, session management, and base model class.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment or use SQLite as default
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./garbage_validation.db")

# Create SQLAlchemy engine
# For SQLite, we need to enable check_same_thread=False for FastAPI compatibility
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False  # Set to True for SQL query logging during development
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for declarative models
Base = declarative_base()


def get_db():
    """
    Dependency function for FastAPI to get database session.
    
    Usage:
        @app.get("/endpoint")
        def endpoint(db: Session = Depends(get_db)):
            # Use db session here
            pass
    
    Yields:
        Session: SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database by creating all tables.
    
    This function should be called on application startup to ensure
    all tables exist in the database.
    """
    # Import all models to ensure they are registered with Base
    from models.submission import Submission
    from models.review_queue import ReviewQueueItem
    from models.audit_log import AuditLog
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")


def drop_all_tables():
    """
    Drop all tables from the database.
    
    WARNING: This will delete all data. Use only for testing or reset purposes.
    """
    Base.metadata.drop_all(bind=engine)
    print("All database tables dropped")
