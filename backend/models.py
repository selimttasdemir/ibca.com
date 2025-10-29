from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Announcement(Base):
    __tablename__ = "announcements"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    announcement_type = Column(String(50))  # department, course, event
    image_url = Column(String(500))
    date = Column(String(50))
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    views = Column(Integer, default=0)

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, nullable=False)
    name = Column(String(200), nullable=False)
    level = Column(String(50))  # Lisans, Yüksek Lisans, Doktora
    semester = Column(String(20))  # Güz, Bahar
    credits = Column(Integer)
    description = Column(Text)
    syllabus_url = Column(String(500))
    materials_url = Column(String(500))
    content = Column(Text)  # JSON: videos, pdfs, notes
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Publication(Base):
    __tablename__ = "publications"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    authors = Column(String(500), nullable=False)
    year = Column(Integer, nullable=False)
    publication_type = Column(String(50))  # article, project
    journal = Column(String(200))
    conference = Column(String(200))
    location = Column(String(200))
    doi = Column(String(100))
    pdf_url = Column(String(500))
    abstract = Column(Text)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class GalleryItem(Base):
    __tablename__ = "gallery_items"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    item_type = Column(String(20))  # photo, video
    url = Column(String(500), nullable=False)  # file path or YouTube URL
    thumbnail_url = Column(String(500))
    date = Column(String(50))
    is_published = Column(Boolean, default=True)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CV(Base):
    __tablename__ = "cv"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(200), nullable=False)
    title = Column(String(200))
    photo_url = Column(String(500))
    email = Column(String(100))
    phone = Column(String(50))
    office = Column(String(200))
    bio = Column(Text)
    education = Column(Text)  # JSON string
    experience = Column(Text)  # JSON string
    research_interests = Column(Text)
    pdf_url = Column(String(500))
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Analytics(Base):
    __tablename__ = "analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    page_views = Column(Integer, default=0)
    unique_visitors = Column(Integer, default=0)
    total_announcements = Column(Integer, default=0)
    total_courses = Column(Integer, default=0)
    total_publications = Column(Integer, default=0)
    total_gallery_items = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)