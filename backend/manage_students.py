"""
Toplu Öğrenci Kaydı Scripti

Bu script, veritabanına toplu öğrenci kaydı ekler.
Örnek: 1000 öğrenci oluşturmak için kullanılır.
"""

from database import SessionLocal
import models
from auth import get_password_hash
import datetime

def create_bulk_students(count=1000):
    """
    Toplu öğrenci kaydı oluştur
    
    Args:
        count: Oluşturulacak öğrenci sayısı (default: 1000)
    """
    db = SessionLocal()
    
    try:
        # Mevcut öğrenci sayısını kontrol et
        existing_count = db.query(models.Student).count()
        print(f"📊 Mevcut öğrenci sayısı: {existing_count}")
        
        # Yıl bilgisi
        current_year = datetime.datetime.now().year
        
        created = 0
        skipped = 0
        
        print(f"🔄 {count} öğrenci kaydı oluşturuluyor...")
        
        for i in range(1, count + 1):
            # Öğrenci numarası (örn: 2024001001)
            student_number = f"{current_year}{str(i).zfill(6)}"
            
            # Öğrenci zaten var mı?
            existing = db.query(models.Student).filter(
                models.Student.student_number == student_number
            ).first()
            
            if existing:
                skipped += 1
                continue
            
            # Email oluştur
            email = f"{student_number}@ogrenci.karabuk.edu.tr"
            
            # Şifre oluştur (öğrenci numarasının son 6 hanesi)
            password = student_number[-6:]
            
            # Ad soyad oluştur
            full_name = f"Öğrenci {i}"
            
            # Sınıf ve dönem belirle (rastgele dağıtım)
            year = ((i - 1) % 4) + 1  # 1-4 arası döngü
            semester = "Güz" if (i % 2) == 1 else "Bahar"
            
            # Yeni öğrenci oluştur
            new_student = models.Student(
                student_number=student_number,
                full_name=full_name,
                email=email,
                hashed_password=get_password_hash(password),
                department="Mekatronik Mühendisliği",
                year=year,
                semester=semester,
                academic_year=f"{current_year}-{current_year+1}",
                is_active=True
            )
            
            db.add(new_student)
            created += 1
            
            # Her 100 öğrencide bir commit yap (performans için)
            if created % 100 == 0:
                db.commit()
                print(f"  ✓ {created} öğrenci oluşturuldu...")
        
        # Son kayıtları commit et
        db.commit()
        
        print(f"\n✅ Toplu öğrenci kaydı tamamlandı!")
        print(f"  📝 Oluşturulan: {created} öğrenci")
        print(f"  ⏭️  Atlanan (zaten var): {skipped} öğrenci")
        print(f"  📊 Toplam öğrenci sayısı: {db.query(models.Student).count()}")
        print(f"\n💡 Giriş Bilgileri:")
        print(f"  - Öğrenci No: {current_year}000001 - {current_year}{str(count).zfill(6)}")
        print(f"  - Şifre: Öğrenci numarasının son 6 hanesi (örn: 000001)")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Hata oluştu: {str(e)}")
    finally:
        db.close()


def delete_all_students():
    """Tüm öğrencileri sil"""
    db = SessionLocal()
    
    try:
        count = db.query(models.Student).count()
        print(f"🗑️  {count} öğrenci silinecek...")
        
        db.query(models.Student).delete()
        db.commit()
        
        print(f"✅ Tüm öğrenciler silindi!")
    except Exception as e:
        db.rollback()
        print(f"❌ Hata oluştu: {str(e)}")
    finally:
        db.close()


def delete_students_by_semester(semester, academic_year):
    """
    Belirli döneme ait öğrencileri sil
    
    Args:
        semester: Dönem (Güz veya Bahar)
        academic_year: Akademik yıl (örn: 2024-2025)
    """
    db = SessionLocal()
    
    try:
        students = db.query(models.Student).filter(
            models.Student.semester == semester,
            models.Student.academic_year == academic_year
        ).all()
        
        count = len(students)
        print(f"🗑️  {count} öğrenci silinecek ({semester} {academic_year})...")
        
        for student in students:
            db.delete(student)
        
        db.commit()
        
        print(f"✅ {count} öğrenci silindi!")
    except Exception as e:
        db.rollback()
        print(f"❌ Hata oluştu: {str(e)}")
    finally:
        db.close()


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Kullanım:")
        print("  python manage_students.py create [sayı]  - Toplu öğrenci oluştur (default: 1000)")
        print("  python manage_students.py delete-all     - Tüm öğrencileri sil")
        print("  python manage_students.py delete-semester <dönem> <yıl>  - Belirli döneme ait öğrencileri sil")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "create":
        count = int(sys.argv[2]) if len(sys.argv) > 2 else 1000
        create_bulk_students(count)
    
    elif command == "delete-all":
        confirm = input("⚠️  TÜM ÖĞRENCİLER SİLİNECEK! Emin misiniz? (evet/hayır): ")
        if confirm.lower() == "evet":
            delete_all_students()
        else:
            print("❌ İşlem iptal edildi.")
    
    elif command == "delete-semester":
        if len(sys.argv) < 4:
            print("❌ Dönem ve yıl belirtmelisiniz!")
            print("  Örnek: python manage_students.py delete-semester Güz 2024-2025")
            sys.exit(1)
        
        semester = sys.argv[2]
        academic_year = sys.argv[3]
        
        confirm = input(f"⚠️  {semester} {academic_year} dönemine ait öğrenciler silinecek! Emin misiniz? (evet/hayır): ")
        if confirm.lower() == "evet":
            delete_students_by_semester(semester, academic_year)
        else:
            print("❌ İşlem iptal edildi.")
    
    else:
        print(f"❌ Bilinmeyen komut: {command}")
        print("Kullanım: python manage_students.py [create|delete-all|delete-semester]")
