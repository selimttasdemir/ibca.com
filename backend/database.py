from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from pathlib import Path

# Database configuration
# SQLite for deployment (file-based, no external DB needed)
ROOT_DIR = Path(__file__).parent
DATABASE_URL = f"sqlite:///{ROOT_DIR}/academic_site.db"

# Note: If PostgreSQL is needed in future, uncomment below:
# DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://user:password@localhost/academic_db')

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
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