from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

# Announcement Schemas
class AnnouncementBase(BaseModel):
    title: str
    content: str
    announcement_type: Optional[str] = 'course'
    image_url: Optional[str] = None
    date: Optional[str] = None
    is_published: bool = True

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    announcement_type: Optional[str] = None
    image_url: Optional[str] = None
    date: Optional[str] = None
    is_published: Optional[bool] = None

class Announcement(AnnouncementBase):
    id: int
    views: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Course Schemas
# Course Schemas
class CourseBase(BaseModel):
    code: str
    name: str
    level: Optional[str] = None
    semester: Optional[str] = None
    credits: Optional[int] = None
    description: Optional[str] = None
    content: Optional[str] = None  # JSON string: videos, pdfs, notes
    syllabus_url: Optional[str] = None
    materials_url: Optional[str] = None
    is_active: bool = True

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    level: Optional[str] = None
    semester: Optional[str] = None
    credits: Optional[int] = None
    description: Optional[str] = None
    content: Optional[str] = None  # JSON string: videos, pdfs, notes
    syllabus_url: Optional[str] = None
    materials_url: Optional[str] = None
    is_active: Optional[bool] = None

class Course(CourseBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Publication Schemas
class PublicationBase(BaseModel):
    title: str
    authors: str
    year: int
    publication_type: str
    journal: Optional[str] = None
    conference: Optional[str] = None
    location: Optional[str] = None
    doi: Optional[str] = None
    pdf_url: Optional[str] = None
    external_url: Optional[str] = None
    abstract: Optional[str] = None
    is_published: bool = True

class PublicationCreate(PublicationBase):
    pass

class PublicationUpdate(BaseModel):
    title: Optional[str] = None
    authors: Optional[str] = None
    year: Optional[int] = None
    publication_type: Optional[str] = None
    journal: Optional[str] = None
    conference: Optional[str] = None
    location: Optional[str] = None
    doi: Optional[str] = None
    pdf_url: Optional[str] = None
    external_url: Optional[str] = None
    abstract: Optional[str] = None
    is_published: Optional[bool] = None

class Publication(PublicationBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Gallery Schemas
class GalleryItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    item_type: str  # photo or video
    url: str
    date: Optional[str] = None
    is_published: bool = True

class GalleryItemCreate(GalleryItemBase):
    pass

class GalleryItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    is_published: Optional[bool] = None

class GalleryItem(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    type: str  # Frontend uses 'type' instead of 'item_type'
    image_url: Optional[str] = None  # For photos
    video_url: Optional[str] = None  # For videos
    thumbnail_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
        from_attributes = True

# CV Schemas
class CVBase(BaseModel):
    name: str = Field(alias='name')
    title: Optional[str] = None
    photo_url: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    office: Optional[str] = None
    education: Optional[str] = None
    experience: Optional[str] = None
    file_url: Optional[str] = Field(None, alias='file_url')
    
    class Config:
        populate_by_name = True

class CVCreate(CVBase):
    pass

class CVUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    office: Optional[str] = None
    education: Optional[str] = None
    experience: Optional[str] = None
    photo_url: Optional[str] = None
    file_url: Optional[str] = None
    
    class Config:
        populate_by_name = True

class CV(BaseModel):
    id: int
    name: str
    title: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    office: Optional[str] = None
    education: Optional[str] = None
    experience: Optional[str] = None
    photo_url: Optional[str] = None
    file_url: Optional[str] = None
    updated_at: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True

# Analytics Schema
class AnalyticsResponse(BaseModel):
    page_views: int
    unique_visitors: int
    total_announcements: int
    total_courses: int
    total_publications: int
    total_gallery_items: int
    total_students: int
    active_students: int
    last_updated: datetime
    
    class Config:
        from_attributes = True

# ==================== ÖĞRENCİ ŞEMALARI ====================

# Student Schemas
class StudentBase(BaseModel):
    student_number: str
    full_name: str
    email: EmailStr
    department: Optional[str] = "Mekatronik Mühendisliği"
    year: Optional[int] = 1
    semester: Optional[str] = "Güz"
    academic_year: Optional[str] = "2024-2025"

class StudentRegister(BaseModel):
    """Öğrenci kendini kayıt etmek için"""
    student_number: str
    full_name: str
    password: str
    password_confirm: str
    course_ids: List[int]  # Kayıt olunacak dersler

class StudentCreate(StudentBase):
    password: str
    enrolled_courses: Optional[List[int]] = None

class StudentBulkCreate(BaseModel):
    """Toplu öğrenci kayıt için"""
    count: int = Field(default=1000, ge=1, le=10000)
    department: str = "Mekatronik Mühendisliği"
    year: int = Field(default=1, ge=1, le=4)
    semester: str = "Güz"
    academic_year: str = "2024-2025"
    password_prefix: str = "student"  # Şifre: student123 formatında

class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    department: Optional[str] = None
    year: Optional[int] = None
    semester: Optional[str] = None
    academic_year: Optional[str] = None
    is_active: Optional[bool] = None

class Student(StudentBase):
    id: int
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    enrolled_courses: Optional[List[int]] = None
    
    class Config:
        from_attributes = True

class StudentLoginRequest(BaseModel):
    student_number: str
    password: str

class StudentToken(BaseModel):
    access_token: str
    token_type: str
    student: Student


# ==================== ÖDEV TANIMI ŞEMALARI ====================

class HomeworkAssignmentBase(BaseModel):
    course_id: int
    title: str
    description: Optional[str] = None
    start_date: datetime
    due_date: datetime
    is_active: bool = True

class HomeworkAssignmentCreate(HomeworkAssignmentBase):
    pass

class HomeworkAssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    is_active: Optional[bool] = None

class HomeworkAssignment(HomeworkAssignmentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ==================== ÖDEV ŞEMALARI ====================

class HomeworkBase(BaseModel):
    course_id: int
    assignment_id: Optional[int] = None
    notes: Optional[str] = None

class HomeworkCreate(HomeworkBase):
    pass

class Homework(HomeworkBase):
    id: int
    student_id: int
    student_number: str
    student_name: str
    course_code: str
    course_name: str
    file_url: str
    upload_date: datetime
    
    class Config:
        from_attributes = True
