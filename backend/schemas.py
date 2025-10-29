from pydantic import BaseModel, EmailStr
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
class CourseBase(BaseModel):
    code: str
    name: str
    level: Optional[str] = None
    semester: Optional[str] = None
    credits: Optional[int] = None
    description: Optional[str] = None
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
    pdf_url: Optional[str] = None
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

class GalleryItem(GalleryItemBase):
    id: int
    thumbnail_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# CV Schemas
class CVBase(BaseModel):
    full_name: str
    title: Optional[str] = None
    photo_url: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    office: Optional[str] = None
    bio: Optional[str] = None
    education: Optional[str] = None
    experience: Optional[str] = None
    research_interests: Optional[str] = None
    pdf_url: Optional[str] = None

class CVCreate(CVBase):
    pass

class CVUpdate(BaseModel):
    full_name: Optional[str] = None
    title: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    education: Optional[str] = None
    experience: Optional[str] = None

class CV(CVBase):
    id: int
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Analytics Schema
class AnalyticsResponse(BaseModel):
    page_views: int
    unique_visitors: int
    total_announcements: int
    total_courses: int
    total_publications: int
    total_gallery_items: int
    last_updated: datetime
    
    class Config:
        from_attributes = True