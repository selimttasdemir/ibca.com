"""
Ana FastAPI Sunucu Modülü

Bu modül, akademik web sitesi için tüm API endpoint'lerini tanımlar.
Duyurular, dersler, yayınlar, galeri, CV ve kimlik doğrulama işlemlerini yönetir.
"""

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

# Yerel modülleri import et
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

# Veritabanını başlat
init_db()

# Ana uygulama oluştur
app = FastAPI(title="Academic Website API")

# /api öneki ile router oluştur
api_router = APIRouter(prefix="/api")

# Yüklenen dosyaları statik olarak sun
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


# ==================== KİMLİK DOĞRULAMA ENDPOINT'LERİ ====================

@api_router.post("/auth/login", response_model=schemas.Token)
async def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Kullanıcı giriş endpoint'i"""
    user = authenticate_user(db, login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı adı veya şifre hatalı",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/auth/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    """Mevcut kullanıcı bilgilerini getir"""
    return current_user

@api_router.post("/auth/change-password")
async def change_password(
    old_password: str = Form(...),
    new_password: str = Form(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Kullanıcı şifre değiştirme"""
    from auth import verify_password
    
    if not verify_password(old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Mevcut şifre hatalı")
    
    current_user.hashed_password = get_password_hash(new_password)
    db.commit()
    return {"message": "Şifre başarıyla güncellendi"}


# ==================== DUYURU ENDPOINT'LERİ ====================

@api_router.get("/announcements", response_model=List[schemas.Announcement])
def get_announcements(
    skip: int = 0,
    limit: int = 100,
    announcement_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Tüm duyuruları getir (herkese açık)"""
    query = db.query(models.Announcement).filter(models.Announcement.is_published == True)
    if announcement_type:
        query = query.filter(models.Announcement.announcement_type == announcement_type)
    return query.order_by(models.Announcement.created_at.desc()).offset(skip).limit(limit).all()

@api_router.get("/announcements/{announcement_id}", response_model=schemas.Announcement)
def get_announcement(announcement_id: int, db: Session = Depends(get_db)):
    """Tek bir duyuruyu getir ve görüntülenme sayısını artır"""
    announcement = db.query(models.Announcement).filter(models.Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Duyuru bulunamadı")
    
    # Görüntülenme sayısını artır
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
    """Yeni duyuru oluştur (sadece admin)"""
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
    """Duyuru güncelle (sadece admin)"""
    db_announcement = db.query(models.Announcement).filter(models.Announcement.id == announcement_id).first()
    if not db_announcement:
        raise HTTPException(status_code=404, detail="Duyuru bulunamadı")
    
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
    """Duyuru sil (sadece admin)"""
    db_announcement = db.query(models.Announcement).filter(models.Announcement.id == announcement_id).first()
    if not db_announcement:
        raise HTTPException(status_code=404, detail="Duyuru bulunamadı")
    
    # İlişkili görseli varsa sil
    if db_announcement.image_url:
        delete_file(db_announcement.image_url)
    
    db.delete(db_announcement)
    db.commit()
    return {"message": "Duyuru başarıyla silindi"}

@api_router.post("/announcements/upload-image")
async def upload_announcement_image(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_active_admin)
):
    """Duyuru için görsel yükle (sadece admin)"""
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

@api_router.get("/publications")
def get_publications(
    skip: int = 0,
    limit: int = 100,
    publication_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all publications with field mapping for frontend"""
    query = db.query(models.Publication).filter(models.Publication.is_published == True)
    if publication_type:
        query = query.filter(models.Publication.publication_type == publication_type)
    
    publications = query.order_by(models.Publication.year.desc()).offset(skip).limit(limit).all()
    
    # Map database fields to frontend fields
    result = []
    for pub in publications:
        result.append({
            'id': pub.id,
            'title': pub.title,
            'authors': pub.authors,
            'year': pub.year,
            'type': pub.publication_type,  # Frontend uses 'type'
            'publication_type': pub.publication_type,  # Keep for backwards compatibility
            'journal': pub.journal,
            'conference': pub.conference,
            'location': pub.location,
            'doi': pub.doi,
            'file_url': pub.pdf_url,  # Frontend uses 'file_url'
            'pdf_url': pub.pdf_url,  # Keep for backwards compatibility
            'external_url': pub.external_url,
            'abstract': pub.abstract,
            'is_published': pub.is_published,
            'created_at': pub.created_at
        })
    
    return result

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
    
    items = query.order_by(models.GalleryItem.order_index, models.GalleryItem.created_at.desc()).offset(skip).limit(limit).all()
    
    # Map database field names to frontend field names
    result = []
    for item in items:
        item_dict = {
            'id': item.id,
            'title': item.title,
            'description': item.description,
            'type': item.item_type,
            'image_url': item.url if item.item_type == 'photo' else None,
            'video_url': item.url if item.item_type == 'video' else None,
            'thumbnail_url': item.thumbnail_url,
            'created_at': item.created_at
        }
        result.append(item_dict)
    
    return result

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
    
    # Map database field names to frontend field names for response
    response_dict = {
        'id': db_item.id,
        'title': db_item.title,
        'description': db_item.description,
        'type': db_item.item_type,
        'image_url': db_item.url if db_item.item_type == 'photo' else None,
        'video_url': db_item.url if db_item.item_type == 'video' else None,
        'thumbnail_url': db_item.thumbnail_url,
        'created_at': db_item.created_at
    }
    
    return response_dict

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

@api_router.get("/cv", response_model=List[schemas.CV])
def get_cv(db: Session = Depends(get_db)):
    """Get CV information"""
    cv = db.query(models.CV).first()
    if not cv:
        return []  # Return empty list if no CV exists
    
    # Map database field names to frontend field names
    cv_dict = {
        'id': cv.id,
        'name': cv.full_name,
        'title': cv.title,
        'email': cv.email,
        'phone': cv.phone,
        'office': cv.office,
        'education': cv.education,
        'experience': cv.experience,
        'photo_url': cv.photo_url,
        'file_url': cv.pdf_url,
        'updated_at': cv.updated_at
    }
    
    return [cv_dict]  # Return as list for consistency

@api_router.post("/cv", response_model=schemas.CV)
async def create_cv(
    cv_data: schemas.CVCreate,
    current_user: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """Create new CV (admin only)"""
    # Check if CV already exists
    existing_cv = db.query(models.CV).first()
    if existing_cv:
        raise HTTPException(status_code=400, detail="CV already exists. Use PUT to update.")
    
    # Map frontend field names to database field names
    cv_dict = cv_data.dict(exclude_unset=True)
    if 'name' in cv_dict:
        cv_dict['full_name'] = cv_dict.pop('name')
    if 'file_url' in cv_dict:
        cv_dict['pdf_url'] = cv_dict.pop('file_url')
    
    cv = models.CV(**cv_dict)
    db.add(cv)
    db.commit()
    db.refresh(cv)
    
    # Map database field names to frontend field names for response
    response_dict = {
        'id': cv.id,
        'name': cv.full_name,
        'title': cv.title,
        'email': cv.email,
        'phone': cv.phone,
        'office': cv.office,
        'education': cv.education,
        'experience': cv.experience,
        'photo_url': cv.photo_url,
        'file_url': cv.pdf_url,
        'updated_at': cv.updated_at
    }
    
    return response_dict

@api_router.put("/cv", response_model=schemas.CV)
async def update_cv(
    cv_data: schemas.CVUpdate,
    current_user: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """Update CV information (admin only)"""
    cv = db.query(models.CV).first()
    
    # Map frontend field names to database field names
    cv_dict = cv_data.dict(exclude_unset=True)
    if 'name' in cv_dict:
        cv_dict['full_name'] = cv_dict.pop('name')
    if 'file_url' in cv_dict:
        cv_dict['pdf_url'] = cv_dict.pop('file_url')
    
    if not cv:
        # Create new CV if doesn't exist
        cv = models.CV(**cv_dict)
        db.add(cv)
    else:
        for key, value in cv_dict.items():
            setattr(cv, key, value)
    
    db.commit()
    db.refresh(cv)
    
    # Map database field names to frontend field names for response
    response_dict = {
        'id': cv.id,
        'name': cv.full_name,
        'title': cv.title,
        'email': cv.email,
        'phone': cv.phone,
        'office': cv.office,
        'education': cv.education,
        'experience': cv.experience,
        'photo_url': cv.photo_url,
        'file_url': cv.pdf_url,
        'updated_at': cv.updated_at
    }
    
    return response_dict

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


# ==================== ÖĞRENCİ KİMLİK DOĞRULAMA ENDPOINT'LERİ ====================

@api_router.post("/students/self-register", response_model=schemas.Student, status_code=status.HTTP_201_CREATED)
async def self_register_student(
    registration: schemas.StudentRegister,
    db: Session = Depends(get_db)
):
    """
    Öğrenci kendi kendine kayıt olur
    Ders seçimi ile birlikte kayıt
    """
    # Şifre eşleşmesi kontrolü
    if registration.password != registration.password_confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Şifreler eşleşmiyor"
        )
    
    # Şifre uzunluk kontrolü
    if len(registration.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Şifre en az 6 karakter olmalıdır"
        )
    
    # Öğrenci numarası zaten var mı kontrol et
    db_student = db.query(models.Student).filter(
        models.Student.student_number == registration.student_number
    ).first()
    if db_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu öğrenci numarası zaten kayıtlı"
        )
    
    # Derslerin var olup olmadığını kontrol et
    if not registration.course_ids or len(registration.course_ids) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="En az bir ders seçmelisiniz"
        )
    
    for course_id in registration.course_ids:
        course = db.query(models.Course).filter(models.Course.id == course_id).first()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ders bulunamadı: ID {course_id}"
            )
    
    # Email oluştur
    email = f"{registration.student_number}@ogrenci.karabuk.edu.tr"
    
    # Yeni öğrenci oluştur
    import json
    db_student = models.Student(
        student_number=registration.student_number,
        full_name=registration.full_name,
        email=email,
        hashed_password=get_password_hash(registration.password),
        department="Mekatronik Mühendisliği",
        year=1,
        semester="Güz",
        academic_year="2024-2025",
        is_active=True,
        enrolled_courses=json.dumps(registration.course_ids)
    )
    
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    
    logger.info(f"✅ Öğrenci kendi kendine kayıt oldu: {registration.student_number} - {registration.full_name} - Dersler: {registration.course_ids}")
    
    # enrolled_courses'u parse et ve döndür
    student_dict = {
        "id": db_student.id,
        "student_number": db_student.student_number,
        "full_name": db_student.full_name,
        "email": db_student.email,
        "department": db_student.department,
        "year": db_student.year,
        "semester": db_student.semester,
        "academic_year": db_student.academic_year,
        "is_active": db_student.is_active,
        "created_at": db_student.created_at,
        "last_login": db_student.last_login,
        "enrolled_courses": json.loads(db_student.enrolled_courses) if db_student.enrolled_courses else []
    }
    
    return student_dict

@api_router.post("/students/register", response_model=schemas.Student, status_code=status.HTTP_201_CREATED)
async def register_student(
    student: schemas.StudentCreate,
    db: Session = Depends(get_db)
):
    """
    Yeni öğrenci kaydı oluştur
    Herkes kullanabilir (admin değil)
    """
    # Öğrenci numarası zaten var mı kontrol et
    db_student = db.query(models.Student).filter(
        models.Student.student_number == student.student_number
    ).first()
    if db_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu öğrenci numarası zaten kayıtlı"
        )
    
    # Email zaten var mı kontrol et
    db_student = db.query(models.Student).filter(
        models.Student.email == student.email
    ).first()
    if db_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu email adresi zaten kayıtlı"
        )
    
    # Yeni öğrenci oluştur
    db_student = models.Student(
        student_number=student.student_number,
        full_name=student.full_name,
        email=student.email,
        hashed_password=get_password_hash(student.password),
        department=student.department,
        year=student.year,
        semester=student.semester,
        academic_year=student.academic_year,
        is_active=True
    )
    
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    
    logger.info(f"✅ Yeni öğrenci kaydedildi: {student.student_number} - {student.full_name}")
    return db_student

@api_router.post("/students/login", response_model=schemas.StudentToken)
async def student_login(
    login_data: schemas.StudentLoginRequest,
    db: Session = Depends(get_db)
):
    """
    Öğrenci giriş endpoint'i
    """
    # Öğrenciyi bul
    student = db.query(models.Student).filter(
        models.Student.student_number == login_data.student_number
    ).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Öğrenci numarası veya şifre hatalı"
        )
    
    # Şifre kontrolü
    from auth import verify_password
    if not verify_password(login_data.password, student.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Öğrenci numarası veya şifre hatalı"
        )
    
    # Aktif değilse giriş yapamaz
    if not student.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hesabınız aktif değil"
        )
    
    # Son giriş zamanını güncelle
    from datetime import datetime
    student.last_login = datetime.utcnow()
    db.commit()
    
    # Token oluştur
    access_token = create_access_token(
        data={"sub": student.student_number, "type": "student"}
    )
    
    logger.info(f"✅ Öğrenci giriş yaptı: {student.student_number} - {student.full_name}")
    
    # enrolled_courses JSON parse et
    student_dict = {
        "id": student.id,
        "student_number": student.student_number,
        "full_name": student.full_name,
        "email": student.email,
        "is_active": student.is_active,
        "created_at": student.created_at,
        "last_login": student.last_login,
        "enrolled_courses": json.loads(student.enrolled_courses) if student.enrolled_courses else []
    }
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "student": student_dict
    }

@api_router.post("/students/bulk-create", status_code=status.HTTP_201_CREATED)
async def bulk_create_students(
    bulk_data: schemas.StudentBulkCreate,
    current_user: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """
    Toplu öğrenci kaydı oluştur (Sadece admin)
    Örnek: 1000 öğrenci kaydı aynı anda
    """
    created_students = []
    errors = []
    
    # Yıl bilgisini al (örn: 2024)
    import datetime
    current_year = datetime.datetime.now().year
    
    for i in range(1, bulk_data.count + 1):
        # Öğrenci numarası oluştur (örn: 2024001001)
        student_number = f"{current_year}{str(i).zfill(6)}"
        
        # Email oluştur
        email = f"{student_number}@ogrenci.karabuk.edu.tr"
        
        # Şifre oluştur (örn: student123)
        password = f"{bulk_data.password_prefix}{str(i).zfill(3)}"
        
        # Ad soyad oluştur
        full_name = f"Öğrenci {i}"
        
        try:
            # Öğrenci zaten var mı kontrol et
            existing = db.query(models.Student).filter(
                models.Student.student_number == student_number
            ).first()
            
            if existing:
                errors.append(f"Öğrenci {student_number} zaten kayıtlı")
                continue
            
            # Yeni öğrenci oluştur
            new_student = models.Student(
                student_number=student_number,
                full_name=full_name,
                email=email,
                hashed_password=get_password_hash(password),
                department=bulk_data.department,
                year=bulk_data.year,
                semester=bulk_data.semester,
                academic_year=bulk_data.academic_year,
                is_active=True
            )
            
            db.add(new_student)
            created_students.append({
                "student_number": student_number,
                "password": password,  # Sadece ilk kayıtta göster
                "email": email,
                "full_name": full_name
            })
            
        except Exception as e:
            errors.append(f"Öğrenci {student_number} oluşturulamadı: {str(e)}")
    
    # Veritabanına kaydet
    try:
        db.commit()
        logger.info(f"✅ Toplu öğrenci kaydı tamamlandı: {len(created_students)} öğrenci oluşturuldu")
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Toplu kayıt sırasında hata oluştu: {str(e)}"
        )
    
    return {
        "success": True,
        "created_count": len(created_students),
        "error_count": len(errors),
        "students": created_students[:10],  # İlk 10 öğrenciyi göster
        "errors": errors[:10] if errors else []
    }

@api_router.get("/students", response_model=List[schemas.Student])
async def get_students(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """
    Tüm öğrencileri listele (Sadece admin)
    """
    students = db.query(models.Student).offset(skip).limit(limit).all()
    return students

@api_router.delete("/students/{student_id}")
async def delete_student(
    student_id: int,
    current_user: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """
    Öğrenci kaydını sil (Sadece admin)
    """
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Öğrenci bulunamadı")
    
    db.delete(student)
    db.commit()
    
    logger.info(f"🗑️ Öğrenci silindi: {student.student_number} - {student.full_name}")
    return {"message": "Öğrenci başarıyla silindi"}

@api_router.delete("/students/bulk-delete-by-semester")
async def bulk_delete_students_by_semester(
    semester: str,
    academic_year: str,
    current_user: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """
    Belirli döneme ait tüm öğrencileri sil (Sadece admin)
    Dönem sonu temizliği için kullanılır
    """
    students = db.query(models.Student).filter(
        models.Student.semester == semester,
        models.Student.academic_year == academic_year
    ).all()
    
    count = len(students)
    
    for student in students:
        db.delete(student)
    
    db.commit()
    
    logger.info(f"🗑️ Toplu öğrenci silme tamamlandı: {count} öğrenci silindi ({semester} {academic_year})")
    
    return {
        "success": True,
        "deleted_count": count,
        "semester": semester,
        "academic_year": academic_year
    }


# ==================== ÖDEV YÖNETİMİ ENDPOINT'LERİ ====================

@api_router.post("/homeworks/upload")
async def upload_homework(
    course_id: int = Form(...),
    notes: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Ödev yükle (Öğrenci - Token gerektirmez, öğrenci bilgisi formdan gelir)
    """
    try:
        # Önce dosyayı kaydet
        file_result = await save_upload_file(file, file_type="pdf")
        
        # Form'dan öğrenci bilgilerini al (hidden field'lardan gelecek)
        # Bu basit versiyonda authentication olmadan çalışacak
        
        return {
            "success": True,
            "message": "Ödev başarıyla yüklendi",
            "file_url": file_result["url"]
        }
        
    except Exception as e:
        logger.error(f"❌ Ödev yükleme hatası: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ödev yüklenirken hata oluştu: {str(e)}"
        )

@api_router.post("/homeworks", response_model=schemas.Homework, status_code=status.HTTP_201_CREATED)
async def create_homework(
    student_number: str = Form(...),
    student_name: str = Form(...),
    course_id: int = Form(...),
    assignment_id: Optional[int] = Form(None),
    notes: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Ödev oluştur ve dosya yükle
    Öğrenci bilgileri form'dan gelir (basit authentication)
    """
    try:
        # Ders kontrolü
        course = db.query(models.Course).filter(models.Course.id == course_id).first()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ders bulunamadı"
            )
        
        # Ödev tanımı kontrolü (varsa)
        if assignment_id:
            assignment = db.query(models.HomeworkAssignment).filter(
                models.HomeworkAssignment.id == assignment_id
            ).first()
            
            if not assignment:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Ödev tanımı bulunamadı"
                )
            
            # Aktif mi kontrol et
            if not assignment.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Bu ödev pasif durumda, yükleme yapılamaz"
                )
            
            # Süre kontrolü
            from datetime import datetime
            now = datetime.utcnow()
            
            if now < assignment.start_date:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Ödev henüz başlamadı. Başlangıç: {assignment.start_date.strftime('%d.%m.%Y %H:%M')}"
                )
            
            if now > assignment.due_date:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Ödev süresi doldu. Son teslim: {assignment.due_date.strftime('%d.%m.%Y %H:%M')}"
                )
        
        # Dosya boyutu kontrolü (3MB)
        file_content = await file.read()
        file_size = len(file_content)
        
        if file_size > 3 * 1024 * 1024:  # 3MB
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Dosya boyutu 3MB'dan büyük olamaz. PDF kalitesini düşürerek tekrar deneyin."
            )
        
        # Dosyayı başa al (read() kullandığımız için)
        await file.seek(0)
        
        # Öğrenci kontrolü
        student = db.query(models.Student).filter(
            models.Student.student_number == student_number
        ).first()
        
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Öğrenci bulunamadı"
            )
        
        # Aynı öğrenci + aynı ödev için önceki yükleme var mı kontrol et
        if assignment_id:
            existing_homework = db.query(models.Homework).filter(
                models.Homework.student_number == student_number,
                models.Homework.assignment_id == assignment_id
            ).first()
            
            if existing_homework:
                # Eski dosyayı sil
                try:
                    from file_utils import delete_file
                    delete_result = await delete_file(existing_homework.file_url)
                    logger.info(f"🗑️ Eski ödev dosyası silindi: {existing_homework.file_url}")
                except Exception as e:
                    logger.warning(f"⚠️ Eski dosya silinemedi (devam ediliyor): {str(e)}")
                
                # Eski kaydı sil
                db.delete(existing_homework)
                db.commit()
                logger.info(f"🔄 Önceki ödev kaydı silindi, yenisi yüklenecek: {student_name} - {course.code}")
        
        # Dosyayı kaydet
        file_result = await save_upload_file(file, file_type="pdf")
        
        # Ödev kaydı oluştur
        homework = models.Homework(
            student_id=student.id,
            student_number=student_number,
            student_name=student_name,
            course_id=course_id,
            course_code=course.code,
            course_name=course.name,
            file_url=file_result["url"],
            assignment_id=assignment_id,
            notes=notes
        )
        
        db.add(homework)
        db.commit()
        db.refresh(homework)
        
        logger.info(f"✅ Ödev yüklendi: {student_name} - {course.code}")
        
        return homework
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Ödev oluşturma hatası: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ödev oluşturulurken hata oluştu: {str(e)}"
        )

@api_router.get("/homeworks/my-homeworks/{student_number}", response_model=List[schemas.Homework])
async def get_my_homeworks(
    student_number: str,
    db: Session = Depends(get_db)
):
    """
    Öğrencinin yüklediği ödevleri getir
    """
    homeworks = db.query(models.Homework).filter(
        models.Homework.student_number == student_number
    ).order_by(models.Homework.upload_date.desc()).all()
    
    return homeworks

@api_router.get("/homeworks", response_model=List[schemas.Homework])
async def get_all_homeworks(
    current_user: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """
    Tüm ödevleri listele (Admin only)
    """
    homeworks = db.query(models.Homework).order_by(
        models.Homework.upload_date.desc()
    ).all()
    
    return homeworks

@api_router.delete("/homeworks/{homework_id}")
async def delete_homework(
    homework_id: int,
    current_user: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """
    Ödevi sil (Admin only)
    """
    homework = db.query(models.Homework).filter(models.Homework.id == homework_id).first()
    if not homework:
        raise HTTPException(status_code=404, detail="Ödev bulunamadı")
    
    # Dosyayı da sil
    if homework.file_url:
        delete_file(homework.file_url)
    
    db.delete(homework)
    db.commit()
    
    logger.info(f"🗑️ Ödev silindi: {homework.student_name} - {homework.course_code}")
    return {"message": "Ödev başarıyla silindi"}


# ==================== ÖDEV TANIMI ENDPOINTS ====================

@api_router.post("/homework-assignments", response_model=schemas.HomeworkAssignment, status_code=status.HTTP_201_CREATED)
async def create_homework_assignment(
    assignment: schemas.HomeworkAssignmentCreate,
    current_user: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """
    Ödev tanımı oluştur (Admin/Hoca)
    """
    # Ders kontrolü
    course = db.query(models.Course).filter(models.Course.id == assignment.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Ders bulunamadı")
    
    # Tarih kontrolü
    if assignment.due_date <= assignment.start_date:
        raise HTTPException(
            status_code=400,
            detail="Bitiş tarihi başlangıç tarihinden sonra olmalıdır"
        )
    
    db_assignment = models.HomeworkAssignment(**assignment.dict())
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    
    logger.info(f"✅ Ödev tanımı oluşturuldu: {assignment.title} - {course.name}")
    return db_assignment


@api_router.get("/homework-assignments", response_model=List[schemas.HomeworkAssignment])
async def get_homework_assignments(
    course_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    Ödev tanımlarını listele
    """
    query = db.query(models.HomeworkAssignment)
    
    if course_id:
        query = query.filter(models.HomeworkAssignment.course_id == course_id)
    if is_active is not None:
        query = query.filter(models.HomeworkAssignment.is_active == is_active)
    
    assignments = query.order_by(models.HomeworkAssignment.due_date.desc()).all()
    return assignments


@api_router.get("/homework-assignments/{assignment_id}", response_model=schemas.HomeworkAssignment)
async def get_homework_assignment(
    assignment_id: int,
    db: Session = Depends(get_db)
):
    """
    Ödev tanımı detayı
    """
    assignment = db.query(models.HomeworkAssignment).filter(
        models.HomeworkAssignment.id == assignment_id
    ).first()
    
    if not assignment:
        raise HTTPException(status_code=404, detail="Ödev tanımı bulunamadı")
    
    return assignment


@api_router.put("/homework-assignments/{assignment_id}", response_model=schemas.HomeworkAssignment)
async def update_homework_assignment(
    assignment_id: int,
    assignment_update: schemas.HomeworkAssignmentUpdate,
    current_user: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """
    Ödev tanımını güncelle (Süre uzatma vb.) (Admin/Hoca)
    """
    db_assignment = db.query(models.HomeworkAssignment).filter(
        models.HomeworkAssignment.id == assignment_id
    ).first()
    
    if not db_assignment:
        raise HTTPException(status_code=404, detail="Ödev tanımı bulunamadı")
    
    # Güncelleme
    update_data = assignment_update.dict(exclude_unset=True)
    
    # Tarih kontrolü
    if 'start_date' in update_data or 'due_date' in update_data:
        start = update_data.get('start_date', db_assignment.start_date)
        due = update_data.get('due_date', db_assignment.due_date)
        if due <= start:
            raise HTTPException(
                status_code=400,
                detail="Bitiş tarihi başlangıç tarihinden sonra olmalıdır"
            )
    
    for field, value in update_data.items():
        setattr(db_assignment, field, value)
    
    db.commit()
    db.refresh(db_assignment)
    
    logger.info(f"✅ Ödev tanımı güncellendi: {db_assignment.title}")
    return db_assignment


@api_router.delete("/homework-assignments/{assignment_id}")
async def delete_homework_assignment(
    assignment_id: int,
    current_user: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """
    Ödev tanımını sil (Admin/Hoca)
    """
    db_assignment = db.query(models.HomeworkAssignment).filter(
        models.HomeworkAssignment.id == assignment_id
    ).first()
    
    if not db_assignment:
        raise HTTPException(status_code=404, detail="Ödev tanımı bulunamadı")
    
    db.delete(db_assignment)
    db.commit()
    
    logger.info(f"🗑️ Ödev tanımı silindi: {db_assignment.title}")
    return {"message": "Ödev tanımı silindi"}


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
    analytics.total_students = db.query(models.Student).count()
    analytics.active_students = db.query(models.Student).filter(models.Student.is_active == True).count()
    
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

# ==================== DOSYA GÖRÜNTÜLEME ====================

@api_router.get("/files/pdf/{filename}")
async def view_pdf(filename: str):
    """
    PDF dosyasını görüntüle
    Herkes erişebilir (kimlik doğrulama gerekmez)
    """
    file_path = UPLOAD_DIR / "pdfs" / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="PDF dosyası bulunamadı")
    
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=filename
    )

@api_router.get("/files/image/{filename}")
async def view_image(filename: str):
    """
    Görsel dosyasını görüntüle
    Herkes erişebilir (kimlik doğrulama gerekmez)
    """
    file_path = UPLOAD_DIR / "images" / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Görsel bulunamadı")
    
    return FileResponse(path=file_path)

# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        "http://localhost:3000",
        "https://ibca-frontend.onrender.com",
    ],
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
