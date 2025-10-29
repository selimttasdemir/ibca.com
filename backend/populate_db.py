"""
Script to populate database with mock data
"""
from database import SessionLocal
import models
from datetime import datetime
import json

def populate_db():
    db = SessionLocal()
    
    try:
        # Clear existing data
        print("Clearing existing data...")
        db.query(models.Announcement).delete()
        db.query(models.Course).delete()
        db.query(models.Publication).delete()
        db.query(models.GalleryItem).delete()
        db.commit()
        
        # Add Announcements
        print("Adding announcements...")
        announcements = [
            models.Announcement(
                title="RESMİ TATİL",
                content="Rektörlük'ten gelen yazıya göre Resmi Tatillere denk gelen dersler işlenmeyecek ve telafisi de yapılmayacaktır. Bu hafta Cumhuriyet Bayramı tatili 28.Ekim Salı Öğleden Sonra ve 29 Ekim Çarşamba gününe denk gelmektedir. Dolayısı ile benim derslerden İnt.Tab. Programlama dersi bu aralığa denk geldiği için işlenmeyecektir, telafisi de yapılmayacaktır.",
                announcement_type="department",
                date="25.10.2025",
                is_published=True
            ),
            models.Announcement(
                title="ÖĞRENCİ PROJELERİ DUYURUSU",
                content="TÜBİTAK 2209-A Üniversite Öğrencileri Araştırma Projeleri Destek programı ile 2209-B Üniversite Öğrencileri Sanayiye Yönelik Araştırma Projeleri Destek Programı 2025 yılı çağrısı 13 Ekim 2025 tarihi itibarıyla başvuruya açılmıştır. 3 ve 4 sınıfa gelen Mekatronik öğrencilerimiz Öğrenci Projelerine mutlaka başvursunlar.",
                announcement_type="course",
                date="25.10.2025",
                is_published=True
            ),
            models.Announcement(
                title="ÖDEV 2: MEM215-İNTERNET TABANLI PROGRAMLAMA",
                content="Son Teslim Tarihi: 27.10.2025-Pazar:24:00. https://www.w3schools.com/ sitesindeki HTML, CSS ve BOOSTRAP konularının her birinden 30 adet, toplamda 90 adet kısa uygulamaları yapın. Uygulamaları yaparken bütün yazılar, resimler ve renkleri değiştirmeye çalışın.",
                announcement_type="course",
                date="20.10.2025",
                is_published=True
            ),
            models.Announcement(
                title="KARİYER SÖYLEŞİLERİ ETKİNLİĞİ",
                content="Karabük Üniversitesi Kariyer Merkezi olarak, öğrencilerimizin iş dünyasını yakından tanımalarını desteklemek amacıyla düzenlediğimiz Kariyer Söyleşileri etkinlikleri başlıyor! Farklı sektörlerden alanında uzman yöneticilerin konuk olacağı bu etkinliklerde kariyer hikayeleri sizleri bekliyor.",
                announcement_type="event",
                date="13.10.2025",
                is_published=True
            )
        ]
        
        for ann in announcements:
            db.add(ann)
        
        # Add Courses
        print("Adding courses...")
        courses = [
            models.Course(
                code="MEM215",
                name="İnternet Tabanlı Programlama",
                level="Lisans",
                semester="Güz",
                credits=3,
                description="HTML, CSS, JavaScript ve Bootstrap kullanarak web uygulamaları geliştirme. Modern web teknolojileri ve responsive tasarım prensipleri.",
                is_active=True
            ),
            models.Course(
                code="MKT705",
                name="Bilgisayar Destekli Mekanik Sistem Tasarımı",
                level="Yüksek Lisans",
                semester="Güz",
                credits=3,
                description="CAD/CAE yazılımları kullanarak mekanik sistem modelleme ve analiz. Sonlu elemanlar yöntemi ve optimizasyon teknikleri.",
                is_active=True
            ),
            models.Course(
                code="MKT824",
                name="Görüntü İşleme ve Programlama",
                level="Doktora",
                semester="Güz",
                credits=3,
                description="Dijital görüntü işleme teknikleri ve algoritmalar. Python, OpenCV ve makine öğrenmesi uygulamaları.",
                is_active=True
            ),
            models.Course(
                code="MEM301",
                name="Mekatronik Sistem Tasarımı",
                level="Lisans",
                semester="Bahar",
                credits=4,
                description="Mekatronik sistemlerin entegre tasarımı. Sensörler, aktüatörler ve kontrol sistemleri.",
                is_active=True
            )
        ]
        
        for course in courses:
            db.add(course)
        
        # Add Publications
        print("Adding publications...")
        publications = [
            models.Publication(
                title="Web-Based Engineering Education Platform Development",
                authors="İbrahim Çayıroğlu, A. Yılmaz, M. Demir",
                year=2024,
                publication_type="article",
                journal="International Journal of Engineering Education",
                doi="10.xxxx/ijee.2024.xxxxx",
                abstract="Bu çalışmada web tabanlı mühendislik eğitim platformu geliştirilmiştir.",
                is_published=True
            ),
            models.Publication(
                title="Interactive Learning Tools for Mechanical Design",
                authors="İbrahim Çayıroğlu",
                year=2023,
                publication_type="project",
                conference="International Conference on Engineering Education",
                location="Istanbul, Turkey",
                abstract="Mekanik tasarım için interaktif öğrenme araçlarının geliştirilmesi.",
                is_published=True
            )
        ]
        
        for pub in publications:
            db.add(pub)
        
        # Add Gallery Items
        print("Adding gallery items...")
        gallery_items = [
            models.GalleryItem(
                title="Üniversite Kampüsü",
                description="Karabük Üniversitesi kampüs görünümü",
                item_type="photo",
                url="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800",
                date="2024",
                is_published=True,
                order_index=1
            ),
            models.GalleryItem(
                title="Laboratuvar Çalışmaları",
                description="Mekatronik laboratuvarında öğrenci çalışmaları",
                item_type="photo",
                url="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800",
                date="2024",
                is_published=True,
                order_index=2
            ),
            models.GalleryItem(
                title="Öğrenci Projeleri",
                description="Final proje sunumları",
                item_type="photo",
                url="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
                date="2024",
                is_published=True,
                order_index=3
            )
        ]
        
        for item in gallery_items:
            db.add(item)
        
        # Add CV
        print("Adding CV...")
        cv = models.CV(
            full_name="Prof. Dr. İbrahim ÇAYIROĞLU",
            title="Bölüm Başkanı - Mekatronik Mühendisliği",
            photo_url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
            email="icayiroglu@karabuk.edu.tr",
            phone="+90 370 418 7440",
            office="Mühendislik Fakültesi",
            bio="Mekatronik Mühendisliği alanında uzman akademisyen",
            education=json.dumps([
                {
                    "degree": "Doktora",
                    "field": "Mekatronik Mühendisliği",
                    "university": "Karabük Üniversitesi",
                    "year": "2015"
                },
                {
                    "degree": "Yüksek Lisans",
                    "field": "Makine Mühendisliği",
                    "university": "Karabük Üniversitesi",
                    "year": "2010"
                }
            ]),
            experience=json.dumps([
                {
                    "position": "Bölüm Başkanı",
                    "department": "Mekatronik Mühendisliği",
                    "institution": "Karabük Üniversitesi",
                    "startYear": "2020",
                    "endYear": "Halen"
                }
            ])
        )
        db.add(cv)
        
        db.commit()
        print("✅ Mock data added successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    populate_db()
