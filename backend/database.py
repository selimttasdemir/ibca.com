"""
Veritabanı Yapılandırması ve Bağlantı Yönetimi

Bu modül, SQLAlchemy kullanarak veritabanı bağlantısını yapılandırır ve yönetir.
SQLite veritabanı kullanır (dosya tabanlı, harici DB sunucusu gerektirmez).
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from pathlib import Path

# ==================== VERİTABANI YAPILANDIRMASI ====================

# SQLite kullanımı (deployment için - dosya tabanlı, harici DB gerekmez)
ROOT_DIR = Path(__file__).parent
DATABASE_URL = f"sqlite:///{ROOT_DIR}/academic_site.db"

# Not: Gelecekte PostgreSQL gerekirse, aşağıdaki satırı aktif et:
# DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://user:password@localhost/academic_db')

# Veritabanı motoru oluştur
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=False  # SQL sorgularını logla (geliştirme için True yapılabilir)
)

# Veritabanı oturum yapılandırması
SessionLocal = sessionmaker(
    autocommit=False,  # Otomatik commit kapalı
    autoflush=False,   # Otomatik flush kapalı
    bind=engine        # Motor ile bağlantı
)

# Model sınıfları için temel sınıf
Base = declarative_base()


# ==================== VERİTABANI YARDIMCI FONKSİYONLARI ====================

def get_db():
    """
    Veritabanı oturumu al (Dependency Injection için)
    
    Kullanım:
        @app.get("/items")
        def get_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    
    Yields:
        Session: Veritabanı oturumu
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Veritabanını başlat ve tabloları oluştur
    
    Tüm model sınıflarını import eder ve tablolarını oluşturur.
    Uygulama başlangıcında bir kez çalıştırılmalıdır.
    """
    import models
    Base.metadata.create_all(bind=engine)
    print("✅ Veritabanı başarıyla başlatıldı")