"""
Kimlik Doğrulama ve Yetkilendirme Modülü

Bu modül, JWT tabanlı kimlik doğrulama ve yetkilendirme işlemlerini yönetir.
Kullanıcı giriş, token oluşturma ve doğrulama işlemlerini içerir.
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import os
import models
import schemas
from database import get_db


# ==================== GÜVENLİK YAPILANDIRMASI ====================

# JWT için gizli anahtar (ÜRETİMDE MUTLAKA DEĞİŞTİRİLMELİ!)
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production-12345')
ALGORITHM = "HS256"  # JWT şifreleme algoritması
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 saat (oturumu kapatana kadar)

# Şifre hashleme için bcrypt kullan
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 şeması (Bearer token)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ==================== ŞİFRE İŞLEMLERİ ====================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Düz metin şifreyi hashlenmiş şifre ile karşılaştır
    
    Args:
        plain_password: Düz metin şifre
        hashed_password: Hashlenmiş şifre
        
    Returns:
        bool: Şifreler eşleşiyorsa True
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Şifreyi hashle
    
    Args:
        password: Düz metin şifre
        
    Returns:
        str: Hashlenmiş şifre
    """
    return pwd_context.hash(password)



# ==================== TOKEN İŞLEMLERİ ====================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    JWT access token oluştur
    
    Args:
        data: Token'a eklenecek veri (genellikle kullanıcı bilgileri)
        expires_delta: Token geçerlilik süresi (opsiyonel)
        
    Returns:
        str: Kodlanmış JWT token
    """
    to_encode = data.copy()
    
    # Son kullanma tarihini belirle
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    # JWT token'ı oluştur
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# ==================== KULLANICI İŞLEMLERİ ====================

def get_user_by_username(db: Session, username: str):
    """
    Kullanıcı adına göre kullanıcıyı bul
    
    Args:
        db: Veritabanı oturumu
        username: Kullanıcı adı
        
    Returns:
        User: Kullanıcı nesnesi veya None
    """
    return db.query(models.User).filter(models.User.username == username).first()


def authenticate_user(db: Session, username: str, password: str):
    """
    Kullanıcıyı doğrula
    
    Args:
        db: Veritabanı oturumu
        username: Kullanıcı adı
        password: Şifre
        
    Returns:
        User: Başarılıysa kullanıcı nesnesi, değilse False
    """
    user = get_user_by_username(db, username)
    
    if not user:
        return False
    
    if not verify_password(password, user.hashed_password):
        return False
    
    return user


# ==================== YETKİLENDİRME ====================

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Token'dan mevcut kullanıcıyı al
    
    Args:
        token: JWT Bearer token
        db: Veritabanı oturumu
        
    Returns:
        User: Mevcut kullanıcı
        
    Raises:
        HTTPException: Token geçersizse veya kullanıcı bulunamazsa
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Kimlik bilgileri doğrulanamadı",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Token'ı çöz
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        
        if username is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # Kullanıcıyı veritabanından bul
    user = get_user_by_username(db, username=username)
    
    if user is None:
        raise credentials_exception
    
    return user


async def get_current_active_admin(current_user: models.User = Depends(get_current_user)):
    """
    Mevcut kullanıcının admin olduğunu doğrula
    
    Args:
        current_user: Mevcut kullanıcı
        
    Returns:
        User: Admin kullanıcı
        
    Raises:
        HTTPException: Kullanıcı aktif değilse veya admin yetkisi yoksa
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=400,
            detail="Pasif kullanıcı"
        )
    
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Yetersiz yetki - Admin erişimi gerekli"
        )
    
    return current_user