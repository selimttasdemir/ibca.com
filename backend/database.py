from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from pathlib import Path

# Database configuration
# Use MongoDB (production)
DATABASE_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/academic_db')

# SQLite (local development - comment out for production)
# ROOT_DIR = Path(__file__).parent
# DATABASE_URL = f"sqlite:///{ROOT_DIR}/academic_site.db"

engine = create_engine(
    DATABASE_URL,
    # connect_args only needed for SQLite
    # connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database with tables"""
    import models
    Base.metadata.create_all(bind=engine)
    print("✅ Database initialized successfully")