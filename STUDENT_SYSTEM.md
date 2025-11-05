# Öğrenci Giriş Sistemi Dokümantasyonu

## Genel Bakış

Bu sistem, öğrencilerin akademik web sitesine giriş yapmalarını ve kendi panellerine erişmelerini sağlar. Toplu öğrenci kaydı ve dönem sonu temizleme özellikleri içerir.

## Özellikler

### 1. Öğrenci Girişi
- Öğrenci numarası ve şifre ile kimlik doğrulama
- JWT token tabanlı oturum yönetimi
- Son giriş zamanı takibi

### 2. Öğrenci Paneli
- Kişisel öğrenci bilgileri görüntüleme
- Son duyuruları görme
- Aktif dersleri listeleme
- Hızlı erişim linkleri

### 3. Toplu Öğrenci Kaydı
- Tek komutla binlerce öğrenci kaydı oluşturma
- Otomatik öğrenci numarası, email ve şifre oluşturma
- Dönem ve sınıf bilgisi atama

### 4. Dönem Sonu Temizleme
- Belirli döneme ait öğrencileri toplu silme
- Tüm öğrencileri silme (yeni dönem için)

## Kurulum

### Backend Gereksinimleri

Backend tarafında zaten tüm gereksinimler kurulu durumda:
- FastAPI
- SQLAlchemy
- PyJWT
- Bcrypt

### Veritabanı Tablosu

Student tablosu otomatik olarak oluşturulur:

```python
class Student(Base):
    id: int (PK)
    student_number: str (UNIQUE)
    full_name: str
    email: str (UNIQUE)
    hashed_password: str
    department: str
    year: int (1-4)
    semester: str (Güz/Bahar)
    academic_year: str
    is_active: bool
    created_at: datetime
    last_login: datetime
```

## Kullanım

### 1. Toplu Öğrenci Oluşturma

```bash
# 1000 öğrenci oluştur
cd /home/s/Yazılımlar/ibca.com/backend
python manage_students.py create 1000

# Özel sayıda öğrenci oluştur (örn: 500)
python manage_students.py create 500
```

**Çıktı:**
- Öğrenci No: 2025000001 - 2025001000
- Email: {öğrenci_no}@ogrenci.karabuk.edu.tr
- Şifre: Öğrenci numarasının son 6 hanesi (örn: 000001, 000002, vb.)
- Ad: Öğrenci 1, Öğrenci 2, vb.

### 2. Öğrenci Girişi (Frontend)

Ana sayfadan "Öğrenci Girişi" butonuna tıklayın veya direkt `/student-login` adresine gidin.

**Örnek Giriş Bilgileri:**
- Öğrenci No: `2025000001`
- Şifre: `000001`

### 3. Dönem Sonu Temizleme

```bash
# Belirli döneme ait öğrencileri sil
python manage_students.py delete-semester Güz 2024-2025

# Tüm öğrencileri sil
python manage_students.py delete-all
```

## API Endpoints

### Öğrenci Kaydı
```
POST /api/students/register
Body: {
  "student_number": "2025000001",
  "full_name": "Ahmet Yılmaz",
  "email": "2025000001@ogrenci.karabuk.edu.tr",
  "password": "000001",
  "department": "Mekatronik Mühendisliği",
  "year": 1,
  "semester": "Güz",
  "academic_year": "2024-2025"
}
```

### Öğrenci Girişi
```
POST /api/students/login
Body: {
  "student_number": "2025000001",
  "password": "000001"
}

Response: {
  "access_token": "eyJ...",
  "token_type": "bearer",
  "student": { ... }
}
```

### Toplu Öğrenci Oluşturma (Admin Only)
```
POST /api/students/bulk-create
Headers: {
  "Authorization": "Bearer {admin_token}"
}
Body: {
  "count": 1000,
  "department": "Mekatronik Mühendisliği",
  "year": 1,
  "semester": "Güz",
  "academic_year": "2024-2025",
  "password_prefix": "student"
}
```

### Öğrenci Listesi (Admin Only)
```
GET /api/students?skip=0&limit=100
Headers: {
  "Authorization": "Bearer {admin_token}"
}
```

### Öğrenci Silme (Admin Only)
```
DELETE /api/students/{student_id}
Headers: {
  "Authorization": "Bearer {admin_token}"
}
```

### Dönem Bazlı Toplu Silme (Admin Only)
```
DELETE /api/students/bulk-delete-by-semester?semester=Güz&academic_year=2024-2025
Headers: {
  "Authorization": "Bearer {admin_token}"
}
```

## Güvenlik

### Şifre Yönetimi
- Tüm şifreler bcrypt ile hashlenmiş olarak saklanır
- İlk giriş şifresi öğrenci numarasının son 6 hanesidir
- Öğrenciler ilk girişten sonra şifrelerini değiştirebilir (gelecekte eklenecek)

### Token Yönetimi
- JWT token ile kimlik doğrulama
- Token süresi: 7 gün
- Token localStorage'da saklanır
- Her giriş için yeni token oluşturulur

### Rol Ayrımı
- Öğrenciler: Sadece kendi bilgilerini görüntüleyebilir
- Adminler: Tüm öğrencileri yönetebilir, toplu işlem yapabilir

## Frontend Sayfaları

### 1. StudentLoginPage.js
- `/student-login` rotasında
- Öğrenci numarası ve şifre girişi
- Hata mesajı gösterimi
- Ana sayfaya geri dönüş butonu

### 2. StudentDashboard.js
- `/student-dashboard` rotasında
- Öğrenci bilgileri kartı (sol kolon)
- Son duyurular (sağ kolon üst)
- Aktif dersler (sağ kolon alt)
- Hızlı erişim linkleri
- Çıkış butonu

## Context Değişiklikleri

`AuthContext.js` artık hem admin hem de öğrenci girişini destekler:

```javascript
// Admin için
const { user, login, logout, isAuthenticated } = useAuth();

// Öğrenci için
const { student, studentLogin, studentLogout, isStudentAuthenticated } = useAuth();
```

## Örnek Kullanım Senaryosu

### Dönem Başı
1. Admin panele giriş yapın
2. Yeni dönem için 1000 öğrenci kaydı oluşturun:
   ```bash
   python manage_students.py create 1000
   ```
3. Öğrencilere giriş bilgilerini duyurun:
   - Öğrenci No: 2025000001 - 2025001000
   - Şifre: Numaranın son 6 hanesi

### Dönem Sonu
1. Geçmiş döneme ait öğrencileri silin:
   ```bash
   python manage_students.py delete-semester Güz 2024-2025
   ```
2. Veya tüm öğrencileri silin:
   ```bash
   python manage_students.py delete-all
   ```

## Otomatik Temizleme (Gelecek Özellik)

Dönem sonu otomasyonu için APScheduler kullanılabilir:

```python
from apscheduler.schedulers.background import BackgroundScheduler

def cleanup_old_students():
    """Her dönem sonu öğrencileri otomatik sil"""
    # Güz dönemi: 31 Ocak
    # Bahar dönemi: 31 Temmuz
    pass

scheduler = BackgroundScheduler()
scheduler.add_job(cleanup_old_students, 'cron', month='1,7', day=31)
scheduler.start()
```

## Sorun Giderme

### Öğrenci giriş yapamıyor
1. Öğrenci numarasının doğru olduğundan emin olun
2. Şifrenin öğrenci numarasının son 6 hanesi olduğunu kontrol edin
3. Backend server'ın çalıştığından emin olun
4. Browser console'da hata mesajlarını kontrol edin

### Toplu kayıt çalışmıyor
1. Database bağlantısını kontrol edin
2. models.py'de Student modeli olduğundan emin olun
3. Yeterli disk alanı olduğunu kontrol edin

### Token hataları
1. localStorage'ı temizleyin
2. Tekrar giriş yapın
3. Token süresinin dolmadığını kontrol edin

## Geliştirme Önerileri

### Kısa Vadeli
- [ ] Şifre değiştirme özelliği
- [ ] Şifremi unuttum fonksiyonu
- [ ] Email doğrulama
- [ ] Profil fotoğrafı yükleme

### Uzun Vadeli
- [ ] Öğrenci ders seçimi
- [ ] Ödev yükleme sistemi
- [ ] Not görüntüleme
- [ ] Otomatik dönem sonu temizleme
- [ ] Öğrenci aktivite takibi
- [ ] Excel'den toplu import

## Lisans ve Telif Hakkı

© 2024 Karabük Üniversitesi - Mekatronik Mühendisliği Bölümü
Tüm hakları saklıdır.
