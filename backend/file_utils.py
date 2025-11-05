"""
Dosya Yükleme ve İşleme Yardımcı Fonksiyonları

Bu modül, görsel ve PDF dosyalarının yüklenmesi, optimize edilmesi,
küçük resimlerin oluşturulması ve silinmesi işlemlerini yönetir.
"""

from fastapi import UploadFile, HTTPException
from pathlib import Path
from PIL import Image
import os
import shutil
import re
from datetime import datetime
from typing import Optional


# ==================== DOSYA YÜKLEME YAPILANDIRMASI ====================

# Yükleme dizini
UPLOAD_DIR = Path("/home/s/Yazılımlar/ibca.com/backend/uploads")

# Dosya boyutu limitleri
MAX_IMAGE_SIZE = 1024 * 1024  # 1MB
MAX_PDF_SIZE = 10 * 1024 * 1024  # 10MB

# İzin verilen dosya tipleri
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
ALLOWED_PDF_TYPES = {"application/pdf"}

# Yükleme dizinlerini oluştur
(UPLOAD_DIR / "images").mkdir(parents=True, exist_ok=True)
(UPLOAD_DIR / "thumbnails").mkdir(parents=True, exist_ok=True)
(UPLOAD_DIR / "pdfs").mkdir(parents=True, exist_ok=True)



# ==================== GÖRSEL OPTİMİZASYONU ====================

def optimize_image(image_path: Path, max_size: int = MAX_IMAGE_SIZE) -> None:
    """
    Görseli optimize et (boyut küçültme ve kalite ayarlama)
    Orantılı küçültme yapılır, kırpma olmaz.
    
    Args:
        image_path: Görsel dosyasının yolu
        max_size: Maksimum dosya boyutu (byte)
        
    Raises:
        Exception: Görsel işlenirken hata oluşursa
    """
    try:
        with Image.open(image_path) as img:
            # Orijinal boyutları sakla
            original_width, original_height = img.size
            
            # RGBA, LA, P modlarını RGB'ye çevir
            if img.mode in ('RGBA', 'LA', 'P'):
                # Beyaz arka plan oluştur
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                # Şeffaflığı koru
                if img.mode == 'RGBA':
                    background.paste(img, mask=img.split()[-1])
                else:
                    background.paste(img)
                img = background
            
            # Orantılı küçültme - maksimum boyut 1920px
            max_dimension = 1920
            
            # En-boy oranını koru (aspect ratio)
            if img.width > max_dimension or img.height > max_dimension:
                # thumbnail metodu orantılı küçültme yapar (kırpmaz)
                img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
                print(f"Görsel boyutlandırıldı: {original_width}x{original_height} → {img.width}x{img.height}")
            
            # Optimize ederek kaydet (JPEG formatında)
            img.save(image_path, 'JPEG', quality=85, optimize=True)
            
            # Dosya boyutu hala büyükse kaliteyi kademeli olarak düşür
            quality = 85
            while image_path.stat().st_size > max_size and quality > 20:
                quality -= 10
                img.save(image_path, 'JPEG', quality=quality, optimize=True)
                print(f"Kalite azaltıldı: {quality}")
                
    except Exception as e:
        print(f"Görsel optimize edilirken hata: {e}")
        raise


def create_thumbnail(image_path: Path, thumbnail_path: Path, size: tuple = (300, 300)):
    """
    Görsel için küçük resim (thumbnail) oluştur
    En-boy oranı korunur, kırpma yapılmaz
    
    Args:
        image_path: Orijinal görsel yolu
        thumbnail_path: Oluşturulacak küçük resim yolu
        size: Maksimum küçük resim boyutu (genişlik, yükseklik)
        
    Raises:
        Exception: Küçük resim oluşturulurken hata oluşursa
    """
    try:
        with Image.open(image_path) as img:
            # Orijinal boyutları sakla
            original_size = img.size
            
            # thumbnail metodu orantılı küçültme yapar (en-boy oranını korur)
            img.thumbnail(size, Image.Resampling.LANCZOS)
            
            # JPEG olarak kaydet
            img.save(thumbnail_path, 'JPEG', quality=80, optimize=True)
            
            print(f"Thumbnail oluşturuldu: {original_size} → {img.size}")
            
    except Exception as e:
        print(f"Küçük resim oluşturulurken hata: {e}")
        raise



# ==================== DOSYA YÜKLEME ====================

def sanitize_filename(filename: str) -> str:
    """
    Dosya adını güvenli hale getir (Türkçe karakter ve özel karakterleri temizle)
    
    Args:
        filename: Orijinal dosya adı
        
    Returns:
        str: Temizlenmiş dosya adı
    """
    # Türkçe karakterleri değiştir
    turkish_map = {
        'ç': 'c', 'Ç': 'C',
        'ğ': 'g', 'Ğ': 'G',
        'ı': 'i', 'I': 'I',
        'İ': 'I', 'i': 'i',
        'ö': 'o', 'Ö': 'O',
        'ş': 's', 'Ş': 'S',
        'ü': 'u', 'Ü': 'U'
    }
    
    for turkish_char, latin_char in turkish_map.items():
        filename = filename.replace(turkish_char, latin_char)
    
    # Sadece harf, rakam, tire, alt çizgi ve nokta bırak
    filename = re.sub(r'[^a-zA-Z0-9._-]', '_', filename)
    
    # Birden fazla alt çizgiyi tek alt çizgiye indir
    filename = re.sub(r'_+', '_', filename)
    
    # Başta ve sonda alt çizgi varsa kaldır
    filename = filename.strip('_')
    
    return filename


async def save_upload_file(file: UploadFile, file_type: str = "image") -> dict:
    """
    Yüklenen dosyayı kaydet ve dosya bilgilerini döndür
    Dosya adı korunur, sadece tarih/saat eklenir: ornek_dosya_14225801012025.pdf
    
    Args:
        file: Yüklenen dosya
        file_type: Dosya tipi ("image" veya "pdf")
        
    Returns:
        dict: Dosya bilgileri (filename, url, size, vb.)
        
    Raises:
        HTTPException: Dosya tipi geçersizse veya kayıt sırasında hata oluşursa
    """
    # Dosya tipini doğrula
    if file_type == "image":
        if file.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Geçersiz görsel tipi. İzin verilenler: {', '.join(ALLOWED_IMAGE_TYPES)}"
            )
        upload_subdir = "images"
        
    elif file_type == "pdf":
        if file.content_type not in ALLOWED_PDF_TYPES:
            raise HTTPException(
                status_code=400,
                detail="Geçersiz dosya tipi. Sadece PDF dosyalarına izin verilir"
            )
        upload_subdir = "pdfs"
        
    else:
        raise HTTPException(status_code=400, detail="Geçersiz dosya tipi")
    
    # Orijinal dosya adını al ve temizle
    original_filename = sanitize_filename(file.filename)
    file_path_obj = Path(original_filename)
    file_stem = file_path_obj.stem  # Uzantı olmadan dosya adı
    file_extension = file_path_obj.suffix  # .pdf, .jpg vb.
    
    # Tarih ve saat ekle: GGSSddMMYYYY formatında
    # Örnek: 14:22:58 01/01/2025 -> 14225801012025
    timestamp = datetime.now().strftime("%H%M%S%d%m%Y")
    
    # Yeni dosya adı: orjinal_ad_tarihsaat.uzanti
    unique_filename = f"{file_stem}_{timestamp}{file_extension}"
    file_path = UPLOAD_DIR / upload_subdir / unique_filename
    
    # Dosyayı kaydet
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dosya kaydedilirken hata: {str(e)}")
    
    # Sonuç bilgilerini hazırla
    result = {
        "filename": unique_filename,
        "url": f"/uploads/{upload_subdir}/{unique_filename}",
        "size": file_path.stat().st_size
    }
    
    # Görsel ise optimize et
    if file_type == "image":
        try:
            optimize_image(file_path)
            
            # Küçük resim oluştur
            thumbnail_filename = f"thumb_{unique_filename}"
            thumbnail_path = UPLOAD_DIR / "thumbnails" / thumbnail_filename
            create_thumbnail(file_path, thumbnail_path)
            
            result["thumbnail_url"] = f"/uploads/thumbnails/{thumbnail_filename}"
            result["optimized_size"] = file_path.stat().st_size
            
        except Exception as e:
            print(f"Uyarı: Görsel optimize edilemedi: {e}")
    
    # PDF ise boyut kontrolü yap
    elif file_type == "pdf":
        if file_path.stat().st_size > MAX_PDF_SIZE:
            file_path.unlink()  # Dosyayı sil
            raise HTTPException(
                status_code=400,
                detail=f"PDF dosyası çok büyük. Maksimum boyut: {MAX_PDF_SIZE / (1024*1024)}MB"
            )
    
    return result


# ==================== DOSYA SİLME ====================

def delete_file(file_url: str) -> bool:
    """
    Dosyayı sistemden sil
    
    Args:
        file_url: Silinecek dosyanın URL'si
        
    Returns:
        bool: Başarılıysa True
    """
    try:
        if file_url.startswith("/uploads/"):
            file_path = UPLOAD_DIR / file_url.replace("/uploads/", "")
            
            # Dosyayı sil
            if file_path.exists():
                file_path.unlink()
                
                # Küçük resim varsa onu da sil
                if "images/" in file_url:
                    filename = file_path.name
                    thumbnail_path = UPLOAD_DIR / "thumbnails" / f"thumb_{filename}"
                    if thumbnail_path.exists():
                        thumbnail_path.unlink()
                        
                return True
                
    except Exception as e:
        print(f"Dosya silinirken hata: {e}")
        
    return False