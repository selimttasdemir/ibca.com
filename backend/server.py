from fastapi import FastAPI, APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pathlib import Path
import os
import logging
from datetime import timedelta
import json

# Import local modules
from database import get_db, init_db
import models
import schemas
from auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    get_current_active_admin,
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from file_utils import save_upload_file, delete_file, UPLOAD_DIR

# Initialize database
init_db()

# Create the main app
app = FastAPI(title="Academic Website API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/login", response_model=schemas.Token)
async def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Login endpoint"""
    user = authenticate_user(db, login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/auth/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    """Get current user info"""
    return current_user

@api_router.post("/auth/change-password")
async def change_password(
    old_password: str = Form(...),
    new_password: str = Form(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    from auth import verify_password
    
    if not verify_password(old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    current_user.hashed_password = get_password_hash(new_password)
    db.commit()
    return {"message": "Password updated successfully"}

# ==================== ANNOUNCEMENT ENDPOINTS ====================

@api_router.get("/announcements", response_model=List[schemas.Announcement])
def get_announcements(
    skip: int = 0,
    limit: int = 100,
    announcement_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all announcements"""
    query = db.query(models.Announcement).filter(models.Announcement.is_published == True)
    if announcement_type:
        query = query.filter(models.Announcement.announcement_type == announcement_type)
    return query.order_by(models.Announcement.created_at.desc()).offset(skip).limit(limit).all()

@api_router.get("/announcements/{announcement_id}", response_model=schemas.Announcement)
def get_announcement(announcement_id: int, db: Session = Depends(get_db)):
    """Get single announcement and increment views"""
    announcement = db.query(models.Announcement).filter(models.Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    # Increment views
    announcement.views += 1
    db.commit()
    db.refresh(announcement)
    return announcement

@api_router.post("/announcements", response_model=schemas.Announcement)
async def create_announcement(
    announcement: schemas.AnnouncementCreate,
    current_user: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """Create new announcement (admin only)"""
    db_announcement = models.Announcement(**announcement.dict())
    db.add(db_announcement)
    db.commit()
    db.refresh(db_announcement)
    return db_announcement

@api_router.put("/announcements/{announcement_id}", response_model=schemas.Announcement)
async def update_announcement(
    announcement_id: int,
    announcement: schemas.AnnouncementUpdate,
    current_user: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """Update announcement (admin only)"""
    db_announcement = db.query(models.Announcement).filter(models.Announcement.id == announcement_id).first()
    if not db_announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    for key, value in announcement.dict(exclude_unset=True).items():
        setattr(db_announcement, key, value)
    
    db.commit()
    db.refresh(db_announcement)
    return db_announcement

@api_router.delete("/announcements/{announcement_id}")
async def delete_announcement(
    announcement_id: int,
    current_user: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """Delete announcement (admin only)"""
    db_announcement = db.query(models.Announcement).filter(models.Announcement.id == announcement_id).first()
    if not db_announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    # Delete associated image if exists
    if db_announcement.image_url:
        delete_file(db_announcement.image_url)
    
    db.delete(db_announcement)
    db.commit()
    return {"message": "Announcement deleted successfully"}

@api_router.post("/announcements/upload-image")
async def upload_announcement_image(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_active_admin)
):
    """Upload image for announcement"""
    result = await save_upload_file(file, file_type="image")
    return result

# ==================== COURSE ENDPOINTS ====================

@api_router.get("/courses", response_model=List[schemas.Course])
def get_courses(
    skip: int = 0,
    limit: int = 100,
    level: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all courses"""
    query = db.query(models.Course).filter(models.Course.is_active == True)
    if level:
        query = query.filter(models.Course.level == level)
    return query.order_by(models.Course.code).offset(skip).limit(limit).all()

@api_router.get("/courses/{course_id}", response_model=schemas.Course)
def get_course(course_id: int, db: Session = Depends(get_db)):
    """Get single course with details"""
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@api_router.post("/courses", response_model=schemas.Course)
async def create_course(
    course: schemas.CourseCreate,
    current_user: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """Create new course (admin only)"""
    # Check if code already exists
    existing = db.query(models.Course).filter(models.Course.code == course.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Course code already exists")
    
    db_course = models.Course(**course.dict())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@api_router.put("/courses/{course_id}", response_model=schemas.Course)
async def update_course(
    course_id: int,
    course: schemas.CourseUpdate,
    current_user: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """Update course (admin only)"""
    db_course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    for key, value in course.dict(exclude_unset=True).items():
        setattr(db_course, key, value)
    
    db.commit()
    db.refresh(db_course)
    return db_course

@api_router.delete("/courses/{course_id}")
async def delete_course(
    course_id: int,
    current_user: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """Delete course (admin only)"""
    db_course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    db.delete(db_course)
    db.commit()
    return {"message": "Course deleted successfully"}

# ==================== PUBLICATION ENDPOINTS ====================

@api_router.get("/publications", response_model=List[schemas.Publication])
def get_publications(
    skip: int = 0,
    limit: int = 100,
    publication_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all publications"""
    query = db.query(models.Publication).filter(models.Publication.is_published == True)
    if publication_type:
        query = query.filter(models.Publication.publication_type == publication_type)
    return query.order_by(models.Publication.year.desc()).offset(skip).limit(limit).all()

@api_router.post("/publications", response_model=schemas.Publication)
async def create_publication(
    publication: schemas.PublicationCreate,
    current_user: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """Create new publication (admin only)"""
    db_publication = models.Publication(**publication.dict())
    db.add(db_publication)
    db.commit()
    db.refresh(db_publication)
    return db_publication

@api_router.put("/publications/{publication_id}", response_model=schemas.Publication)
async def update_publication(
    publication_id: int,
    publication: schemas.PublicationUpdate,
    current_user: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """Update publication (admin only)"""
    db_publication = db.query(models.Publication).filter(models.Publication.id == publication_id).first()
    if not db_publication:
        raise HTTPException(status_code=404, detail="Publication not found")
    
    for key, value in publication.dict(exclude_unset=True).items():
        setattr(db_publication, key, value)
    
    db.commit()
    db.refresh(db_publication)
    return db_publication

@api_router.delete("/publications/{publication_id}")
async def delete_publication(
    publication_id: int,
    current_user: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """Delete publication (admin only)"""
    db_publication = db.query(models.Publication).filter(models.Publication.id == publication_id).first()
    if not db_publication:
        raise HTTPException(status_code=404, detail="Publication not found")
    
    # Delete associated PDF if exists
    if db_publication.pdf_url:
        delete_file(db_publication.pdf_url)
    
    db.delete(db_publication)
    db.commit()
    return {"message": "Publication deleted successfully"}

@api_router.post("/publications/upload-pdf")
async def upload_publication_pdf(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_active_admin)
):
    """Upload PDF for publication"""
    result = await save_upload_file(file, file_type="pdf")
    return result

# ==================== GALLERY ENDPOINTS ====================

@api_router.get("/gallery", response_model=List[schemas.GalleryItem])
def get_gallery_items(
    skip: int = 0,
    limit: int = 100,
    item_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all gallery items"""
    query = db.query(models.GalleryItem).filter(models.GalleryItem.is_published == True)
    if item_type:
        query = query.filter(models.GalleryItem.item_type == item_type)
    return query.order_by(models.GalleryItem.order_index, models.GalleryItem.created_at.desc()).offset(skip).limit(limit).all()

@api_router.post("/gallery", response_model=schemas.GalleryItem)
async def create_gallery_item(
    gallery_item: schemas.GalleryItemCreate,
    current_user: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """Create new gallery item (admin only)"""
    db_item = models.GalleryItem(**gallery_item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@api_router.delete("/gallery/{item_id}")
async def delete_gallery_item(
    item_id: int,
    current_user: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """Delete gallery item (admin only)"""
    db_item = db.query(models.GalleryItem).filter(models.GalleryItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    
    # Delete associated files if exists
    if db_item.item_type == "photo" and db_item.url:
        delete_file(db_item.url)
        if db_item.thumbnail_url:
            delete_file(db_item.thumbnail_url)
    
    db.delete(db_item)
    db.commit()
    return {"message": "Gallery item deleted successfully"}

@api_router.post("/gallery/upload-photo")
async def upload_gallery_photo(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_active_admin)
):
    """Upload photo to gallery"""
    result = await save_upload_file(file, file_type="image")
    return result

# ==================== CV ENDPOINTS ====================

@api_router.get("/cv", response_model=schemas.CV)
def get_cv(db: Session = Depends(get_db)):
    """Get CV information"""
    cv = db.query(models.CV).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    return cv

@api_router.put("/cv", response_model=schemas.CV)
async def update_cv(
    cv_data: schemas.CVUpdate,
    current_user: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """Update CV information (admin only)"""
    cv = db.query(models.CV).first()
    if not cv:
        # Create new CV if doesn't exist
        cv = models.CV(**cv_data.dict(exclude_unset=True))
        db.add(cv)
    else:
        for key, value in cv_data.dict(exclude_unset=True).items():
            setattr(cv, key, value)
    
    db.commit()
    db.refresh(cv)
    return cv

@api_router.post("/cv/upload-pdf")
async def upload_cv_pdf(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_active_admin)
):
    """Upload CV PDF"""
    result = await save_upload_file(file, file_type="pdf")
    return result

@api_router.post("/cv/upload-photo")
async def upload_cv_photo(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_active_admin)
):
    """Upload CV photo"""
    result = await save_upload_file(file, file_type="image")
    return result

# ==================== ANALYTICS ENDPOINTS ====================

@api_router.get("/analytics", response_model=schemas.AnalyticsResponse)
async def get_analytics(
    current_user: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """Get site analytics (admin only)"""
    # Get or create analytics record
    analytics = db.query(models.Analytics).first()
    if not analytics:
        analytics = models.Analytics()
        db.add(analytics)
    
    # Update counts
    analytics.total_announcements = db.query(models.Announcement).count()
    analytics.total_courses = db.query(models.Course).count()
    analytics.total_publications = db.query(models.Publication).count()
    analytics.total_gallery_items = db.query(models.GalleryItem).count()
    
    db.commit()
    db.refresh(analytics)
    return analytics

# ==================== HELLO WORLD (for testing) ====================

@api_router.get("/")
async def root():
    return {"message": "Academic Website API - Backend is running!"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create default admin user on startup
@app.on_event("startup")
async def startup_event():
    """Create default admin user if not exists"""
    from database import SessionLocal
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(models.User).filter(models.User.username == "admin").first()
        if not admin:
            admin = models.User(
                username="admin",
                email="admin@example.com",
                full_name="Administrator",
                hashed_password=get_password_hash("admin123"),
                is_active=True,
                is_admin=True
            )
            db.add(admin)
            db.commit()
            logger.info("✅ Default admin user created (username: admin, password: admin123)")
        else:
            logger.info("✅ Admin user already exists")
    finally:
        db.close()

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application shutting down")
