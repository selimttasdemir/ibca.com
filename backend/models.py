"""
Veritabanı Modelleri

Bu modül, uygulamanın tüm veritabanı modellerini (tablolarını) tanımlar.
SQLAlchemy ORM kullanarak veri yapılarını tanımlar.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


# ==================== KULLANICI MODELİ ====================

class User(Base):
    """
    Kullanıcı Modeli - Admin paneli için kullanıcı bilgileri
    
    Attributes:
        id: Benzersiz kullanıcı ID'si
        username: Kullanıcı adı (benzersiz)
        email: E-posta adresi (benzersiz)
        hashed_password: Hashlenmiş şifre
        full_name: Tam ad
        is_active: Aktif kullanıcı mı?
        is_admin: Admin yetkisi var mı?
        created_at: Oluşturulma zamanı
        updated_at: Son güncellenme zamanı
    """
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


# ==================== DUYURU MODELİ ====================

class Announcement(Base):
    """
    Duyuru Modeli - Akademik duyurular ve haberler
    
    Attributes:
        id: Benzersiz duyuru ID'si
        title: Duyuru başlığı
        content: Duyuru içeriği
        announcement_type: Duyuru tipi (department, course, event)
        image_url: Duyuru görseli URL'si
        date: Duyuru tarihi
        is_published: Yayınlanmış mı?
        created_at: Oluşturulma zamanı
        updated_at: Son güncellenme zamanı
        views: Görüntülenme sayısı
    """
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


# ==================== DERS MODELİ ====================

class Course(Base):
    """
    Ders Modeli - Akademik dersler ve bilgileri
    
    Attributes:
        id: Benzersiz ders ID'si
        code: Ders kodu (benzersiz)
        name: Ders adı
        level: Seviye (Lisans, Yüksek Lisans, Doktora)
        semester: Dönem (Güz, Bahar)
        credits: Kredi sayısı
        description: Ders açıklaması
        syllabus_url: Ders içeriği URL'si
        materials_url: Ders materyalleri URL'si
        content: İçerik (JSON: videolar, PDF'ler, notlar)
        is_active: Aktif ders mi?
        created_at: Oluşturulma zamanı
        updated_at: Son güncellenme zamanı
    """
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


# ==================== YAYIN MODELİ ====================

class Publication(Base):
    """
    Yayın Modeli - Akademik makaleler ve projeler
    
    Attributes:
        id: Benzersiz yayın ID'si
        title: Yayın başlığı
        authors: Yazarlar
        year: Yayın yılı
        publication_type: Yayın tipi (article, project)
        journal: Dergi adı
        conference: Konferans adı
        location: Konum
        doi: DOI numarası
        pdf_url: PDF dosya URL'si
        abstract: Özet
        is_published: Yayınlanmış mı?
        created_at: Oluşturulma zamanı
        updated_at: Son güncellenme zamanı
    """
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
    external_url = Column(String(500))  # Harici URL (ör: ResearchGate, Google Scholar)
    abstract = Column(Text)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ==================== GALERİ MODELİ ====================

class GalleryItem(Base):
    """
    Galeri Öğesi Modeli - Fotoğraflar ve videolar
    
    Attributes:
        id: Benzersiz galeri öğesi ID'si
        title: Başlık
        description: Açıklama
        item_type: Öğe tipi (photo, video)
        url: Dosya yolu veya YouTube URL'si
        thumbnail_url: Küçük resim URL'si
        date: Tarih
        is_published: Yayınlanmış mı?
        order_index: Sıralama indeksi
        created_at: Oluşturulma zamanı
        updated_at: Son güncellenme zamanı
    """
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


# ==================== ÖZGEÇMİŞ MODELİ ====================

class CV(Base):
    """
    CV Modeli - Akademisyen özgeçmiş bilgileri
    
    Attributes:
        id: Benzersiz CV ID'si
        full_name: Tam ad
        title: Ünvan
        photo_url: Fotoğraf URL'si
        email: E-posta
        phone: Telefon
        office: Ofis
        bio: Biyografi
        education: Eğitim bilgileri (JSON string)
        experience: Deneyim bilgileri (JSON string)
        research_interests: Araştırma ilgi alanları
        pdf_url: CV PDF URL'si
        updated_at: Son güncellenme zamanı
    """
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


# ==================== ANALİTİK MODELİ ====================

class Analytics(Base):
    """
    Analitik Modeli - Site istatistikleri ve analitik verileri
    
    Attributes:
        id: Benzersiz analitik ID'si
        page_views: Sayfa görüntülenme sayısı
        unique_visitors: Benzersiz ziyaretçi sayısı
        total_announcements: Toplam duyuru sayısı
        total_courses: Toplam ders sayısı
        total_publications: Toplam yayın sayısı
        total_gallery_items: Toplam galeri öğesi sayısı
        last_updated: Son güncellenme zamanı
    """
    __tablename__ = "analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    page_views = Column(Integer, default=0)
    unique_visitors = Column(Integer, default=0)
    total_announcements = Column(Integer, default=0)
    total_courses = Column(Integer, default=0)
    total_publications = Column(Integer, default=0)
    total_gallery_items = Column(Integer, default=0)
    total_students = Column(Integer, default=0)
    active_students = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ==================== ÖĞRENCİ MODELİ ====================

class Student(Base):
    """
    Öğrenci Modeli - Öğrenci giriş sistemi için
    
    Attributes:
        id: Benzersiz öğrenci ID'si
        student_number: Öğrenci numarası (benzersiz)
        full_name: Ad Soyad
        email: E-posta adresi
        hashed_password: Hashlenmiş şifre
        department: Bölüm
        year: Sınıf (1-4)
        semester: Dönem (Güz/Bahar)
        academic_year: Akademik yıl (örn: 2024-2025)
        is_active: Aktif öğrenci mi?
        created_at: Kayıt tarihi
        last_login: Son giriş zamanı
    """
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    student_number = Column(String(20), unique=True, nullable=False, index=True)
    full_name = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    department = Column(String(100), default="Mekatronik Mühendisliği")
    year = Column(Integer, default=1)  # 1-4 arası
    semester = Column(String(20), default="Güz")  # Güz veya Bahar
    academic_year = Column(String(20), default="2024-2025")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    enrolled_courses = Column(Text, nullable=True)  # JSON string: [1, 2, 3] (course IDs)


# ==================== ÖDEV TANIMI MODELİ ====================

class HomeworkAssignment(Base):
    """
    Ödev Tanımı Modeli - Hoca tarafından oluşturulan ödev tanımları
    
    Attributes:
        id: Benzersiz ödev tanımı ID'si
        course_id: Ders ID'si (Foreign Key)
        title: Ödev başlığı
        description: Ödev açıklaması
        start_date: Başlangıç tarihi
        due_date: Son teslim tarihi
        is_active: Aktif mi
        created_at: Oluşturulma tarihi
        updated_at: Güncellenme tarihi
    """
    __tablename__ = "homework_assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(DateTime, nullable=False)
    due_date = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ==================== ÖDEV MODELİ ====================

class Homework(Base):
    """
    Ödev Modeli - Öğrenci ödev yüklemeleri
    
    Attributes:
        id: Benzersiz ödev ID'si
        assignment_id: Ödev tanımı ID'si (Foreign Key)
        student_id: Öğrenci ID'si (Foreign Key)
        course_id: Ders ID'si (Foreign Key)
        student_number: Öğrenci numarası
        student_name: Öğrenci adı
        course_code: Ders kodu
        course_name: Ders adı
        file_url: Yüklenen dosyanın URL'i
        upload_date: Yükleme tarihi
        notes: Öğrenci notları (opsiyonel)
    """
    __tablename__ = "homeworks"
    
    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, nullable=True, index=True)  # Ödev tanımı ID (nullable - eski ödevler için)
    student_id = Column(Integer, nullable=False, index=True)
    course_id = Column(Integer, nullable=False, index=True)
    student_number = Column(String(20), nullable=False)
    student_name = Column(String(200), nullable=False)
    course_code = Column(String(20), nullable=False)
    course_name = Column(String(200), nullable=False)
    file_url = Column(String(500), nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)