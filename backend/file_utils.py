from fastapi import UploadFile, HTTPException
from pathlib import Path
from PIL import Image
import os
import uuid
import shutil
from typing import Optional

# File upload configuration
UPLOAD_DIR = Path("/app/backend/uploads")
MAX_IMAGE_SIZE = 1024 * 1024  # 1MB
MAX_PDF_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
ALLOWED_PDF_TYPES = {"application/pdf"}

# Create upload directories
(UPLOAD_DIR / "images").mkdir(parents=True, exist_ok=True)
(UPLOAD_DIR / "thumbnails").mkdir(parents=True, exist_ok=True)
(UPLOAD_DIR / "pdfs").mkdir(parents=True, exist_ok=True)

def optimize_image(image_path: Path, max_size: int = MAX_IMAGE_SIZE) -> None:
    """
    Optimize image size by reducing quality and dimensions if needed
    """
    try:
        with Image.open(image_path) as img:
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            
            # Resize if too large
            max_dimension = 1920
            if img.width > max_dimension or img.height > max_dimension:
                img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
            
            # Save with optimization
            img.save(image_path, 'JPEG', quality=85, optimize=True)
            
            # Check file size and reduce quality if still too large
            quality = 85
            while image_path.stat().st_size > max_size and quality > 20:
                quality -= 10
                img.save(image_path, 'JPEG', quality=quality, optimize=True)
                
    except Exception as e:
        print(f"Error optimizing image: {e}")
        raise

def create_thumbnail(image_path: Path, thumbnail_path: Path, size: tuple = (300, 300)):
    """
    Create thumbnail for image
    """
    try:
        with Image.open(image_path) as img:
            img.thumbnail(size, Image.Resampling.LANCZOS)
            img.save(thumbnail_path, 'JPEG', quality=80, optimize=True)
    except Exception as e:
        print(f"Error creating thumbnail: {e}")
        raise

async def save_upload_file(file: UploadFile, file_type: str = "image") -> dict:
    """
    Save uploaded file and return file info
    """
    # Validate file type
    if file_type == "image":
        if file.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid image type. Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}"
            )
        upload_subdir = "images"
    elif file_type == "pdf":
        if file.content_type not in ALLOWED_PDF_TYPES:
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Only PDF files are allowed"
            )
        upload_subdir = "pdfs"
    else:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / upload_subdir / unique_filename
    
    # Save file
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")
    
    result = {
        "filename": unique_filename,
        "url": f"/uploads/{upload_subdir}/{unique_filename}",
        "size": file_path.stat().st_size
    }
    
    # Optimize image if needed
    if file_type == "image":
        try:
            optimize_image(file_path)
            
            # Create thumbnail
            thumbnail_filename = f"thumb_{unique_filename}"
            thumbnail_path = UPLOAD_DIR / "thumbnails" / thumbnail_filename
            create_thumbnail(file_path, thumbnail_path)
            
            result["thumbnail_url"] = f"/uploads/thumbnails/{thumbnail_filename}"
            result["optimized_size"] = file_path.stat().st_size
        except Exception as e:
            print(f"Warning: Could not optimize image: {e}")
    
    # Check PDF size
    elif file_type == "pdf":
        if file_path.stat().st_size > MAX_PDF_SIZE:
            file_path.unlink()  # Delete file
            raise HTTPException(
                status_code=400,
                detail=f"PDF file too large. Maximum size: {MAX_PDF_SIZE / (1024*1024)}MB"
            )
    
    return result

def delete_file(file_url: str) -> bool:
    """
    Delete file from filesystem
    """
    try:
        if file_url.startswith("/uploads/"):
            file_path = UPLOAD_DIR / file_url.replace("/uploads/", "")
            if file_path.exists():
                file_path.unlink()
                
                # Delete thumbnail if exists
                if "images/" in file_url:
                    filename = file_path.name
                    thumbnail_path = UPLOAD_DIR / "thumbnails" / f"thumb_{filename}"
                    if thumbnail_path.exists():
                        thumbnail_path.unlink()
                return True
    except Exception as e:
        print(f"Error deleting file: {e}")
    return False