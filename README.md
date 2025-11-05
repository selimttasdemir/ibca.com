# 🎓 Akademik Web Sitesi - Karabük Üniversitesi Mekatronik Mühendisliği

Tam özellikli akademik web sitesi: Admin paneli, öğrenci sistemi, ödev yönetimi, içerik yönetimi ve daha fazlası.

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknolojiler](#-teknolojiler)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [Admin Paneli](#-admin-paneli)
- [Öğrenci Sistemi](#-öğrenci-sistemi)
- [Ödev Atama Sistemi](#-ödev-atama-sistemi)
- [API Dokümantasyonu](#-api-dokümantasyonu)
- [Veritabanı Yapısı](#-veritabanı-yapısı)
- [Güvenlik](#-güvenlik)
- [Sorun Giderme](#-sorun-giderme)

---

## ✨ Özellikler

### 🎨 Genel Özellikler
- ✅ **Çok Dilli Destek**: Türkçe/İngilizce
- ✅ **Dark/Light Tema**: Otomatik tema değiştirme
- ✅ **Responsive Tasarım**: Mobil, tablet, desktop uyumlu
- ✅ **Modern UI**: React 19 + Tailwind CSS + Shadcn/ui
- ✅ **SEO Optimizasyonu**: Meta taglar ve sitemap

### 👨‍💼 Admin Paneli
- ✅ **İçerik Yönetimi**: Rich text editor (React-Quill)
- ✅ **Ders Yönetimi**: CRUD işlemleri, video/PDF ekleme
- ✅ **Ödev Atama Sistemi**: Tarih bazlı ödev tanımlama
- ✅ **Öğrenci Yönetimi**: 1000 öğrenci toplu import
- ✅ **Galeri**: Video (YouTube) ve fotoğraf yönetimi
- ✅ **Duyurular**: Pin/unpin, tarih sıralama
- ✅ **Yayınlar**: PDF yükleme, kategorileme
- ✅ **CV Yönetimi**: Dinamik CV oluşturma
- ✅ **Ödev İnceleme**: Öğrenci ödevlerini görüntüleme/silme
- ✅ **Analytics Dashboard**: Aktif öğrenci, ödev istatistikleri

### 👨‍🎓 Öğrenci Sistemi
- ✅ **Self-Registration**: Öğrenciler kendi kaydını oluşturabilir
- ✅ **Ders Seçimi**: Çoklu ders kayıt
- ✅ **Ödev Yükleme**: PDF formatında, 3MB limit
- ✅ **Ödev Geçmişi**: Yüklenen ödevleri görüntüleme
- ✅ **Otomatik Güncelleme**: Aynı ödeve tekrar yükleme eskisini siler
- ✅ **Tarih Kontrolü**: Sadece aktif ödevlere yükleme

### 📚 Ödev Atama Sistemi
- ✅ **Tarih Bazlı Kontrol**: Başlangıç ve bitiş tarihi
- ✅ **Aktif/Pasif Yönetimi**: Ödevleri aktif/pasif yapma
- ✅ **Süre Uzatma**: Due date güncelleme
- ✅ **Otomatik Engelleme**: Süre dolunca yükleme kapanır
- ✅ **Bildirim Sistemi**: Herkes ödev bildirimlerini görebilir
- ✅ **Ders Bazlı Filtreleme**: Her dersin kendi ödevleri

### 📄 İçerik Özellikleri
- ✅ **Dersler**: Video, PDF, notlar
- ✅ **Yayınlar**: PDF yükleme, görüntüleme
- ✅ **Galeri**: Fotoğraf + YouTube video entegrasyonu
- ✅ **Duyurular**: Pinli/pinli olmayan
- ✅ **CV**: Eğitim, deneyim, projeler

---

## 🛠 Teknolojiler

### Backend
- **Framework**: FastAPI (Python 3.12+)
- **Database**: SQLite (SQLAlchemy ORM)
- **Authentication**: JWT (7 gün expiry)
- **Password Hashing**: bcrypt
- **File Upload**: 3MB PDF limit
- **CORS**: Tam destek

### Frontend
- **Framework**: React 19
- **Styling**: Tailwind CSS
- **Components**: Shadcn/ui
- **Rich Text**: react-quill-new
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Icons**: Lucide React

### Development Tools
- **Backend Server**: Uvicorn
- **Frontend Server**: React Scripts
- **Package Manager**: pip (backend), npm (frontend)

---

## 🚀 Kurulum

### Gereksinimler
- Python 3.12 veya üzeri
- Node.js 18 veya üzeri
- npm veya yarn

### 1. Repository'yi Klonlayın
```bash
git clone https://github.com/selimttasdemir/ibca.com.git
cd ibca.com
```

### 2. Backend Kurulumu

```bash
# Virtual environment oluştur
python3 -m venv .venv

# Aktif et (Linux/Mac)
source .venv/bin/activate

# Aktif et (Windows)
.venv\Scripts\activate

# Bağımlılıkları yükle
cd backend
pip install -r requirements.txt
```

**Backend .env Dosyası** (`backend/.env`):
```env
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_DAYS=7
DATABASE_URL=sqlite:///./academic_site.db
```

**Veritabanını Başlat**:
```bash
# Backend klasöründe
python populate_db.py
```

Bu komut:
- Veritabanı tablolarını oluşturur
- Admin kullanıcısı oluşturur (username: `admin`, password: `admin`)
- 1000 test öğrencisi oluşturur (2025000001-2025001000)
- Örnek dersler ekler

### 3. Frontend Kurulumu

```bash
cd ../frontend
npm install
```

**Frontend .env Dosyası** (`frontend/.env`):
```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

### 4. Sunucuları Başlatın

**Terminal 1 - Backend**:
```bash
cd backend
source ../.venv/bin/activate  # veya .venv\Scripts\activate (Windows)
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm start
```

Tarayıcıda otomatik açılacak: `http://localhost:3000`

---

## 📖 Kullanım

### İlk Giriş

**Admin Girişi**:
- URL: `http://localhost:3000/admin-login`
- Kullanıcı adı: `admin`
- Şifre: `admin`

**Öğrenci Girişi**:
- URL: `http://localhost:3000/student-login`
- Öğrenci No: `2025000001` (1'den 1000'e kadar)
- Şifre: Son 6 hane (örn: `000001`)

**Öğrenci Kayıt**:
- URL: `http://localhost:3000/student-register`
- Öğrenci numarası, isim, şifre ve ders seçimi

---

## 👨‍💼 Admin Paneli

### 1. Kontrol Paneli
- **Toplam Öğrenci**: Kayıtlı öğrenci sayısı
- **Aktif Öğrenci**: Son 30 gün içinde giriş yapan
- **Toplam Ders**: Aktif ders sayısı
- **Toplam Ödev**: Yüklenen ödev sayısı

### 2. Dersler Yönetimi

**Ders Ekleme**:
1. "Yeni Ders Ekle" butonuna tıkla
2. Form doldur:
   - Ders Kodu (örn: MEM215)
   - Ders Adı
   - Seviye (Lisans/Yüksek Lisans/Doktora)
   - Dönem (Güz/Bahar)
   - Kredi
   - Açıklama (Rich text editor)
   - İçerik (JSON format):
     ```json
     {
       "videos": [
         {"title": "Ders 1", "url": "https://youtube.com/..."}
       ],
       "pdfs": [
         {"title": "Sunum 1", "url": "/uploads/pdfs/..."}
       ]
     }
     ```
3. Kaydet

**Ödev Tanımlama** (Her Ders İçin):
1. Dersin yanındaki "Ödev Tanımla" butonuna tıkla
2. Form doldur:
   - Başlık (örn: "1. Hafta Ödevi")
   - Açıklama
   - Başlangıç Tarihi
   - Son Teslim Tarihi
   - Aktif/Pasif
3. Kaydet

**Ödev Listesi**:
- Her dersin altında ödevler listelenir
- Aktif/pasif badge gösterilir
- Düzenle/Sil butonları
- Süre uzatmak için "Düzenle"

### 3. Ödevler Yönetimi

**Ödev İnceleme**:
- Tüm yüklenen ödevler listelenir
- Filtreleme: Ders, öğrenci
- PDF görüntüleme (tarayıcıda açılır)
- Silme (öğrenci yanlış yüklediyse)

**İstatistikler**:
- Ders bazında ödev sayısı
- Öğrenci bazında ödev sayısı
- En son yüklenenler

### 4. Öğrenci Yönetimi

**Öğrenci Ekleme**:
- Tek tek: Form ile
- Toplu: CSV/JSON import

**Öğrenci Düzenleme**:
- İsim, numara
- Kayıtlı dersler
- Aktif/pasif

### 5. Duyurular

**Duyuru Ekleme**:
1. Başlık, içerik (rich text)
2. Pin (üstte sabit)
3. Tarih otomatik

**Özellikler**:
- Pin/unpin
- Düzenle/Sil
- Tarih sıralama

### 6. Yayınlar

**Yayın Ekleme**:
1. Başlık, yazar, yıl
2. Dergi/Konferans
3. PDF yükleme (3MB)
4. Kategori

### 7. Galeri

**Fotoğraf Yükleme**:
- Resim upload (otomatik thumbnail)
- Başlık, açıklama

**Video Ekleme**:
- YouTube URL
- Başlık, açıklama
- Otomatik embed

### 8. CV Yönetimi

**Bölümler**:
- Kişisel Bilgiler
- Eğitim Geçmişi
- İş Deneyimi
- Yayınlar
- Projeler
- Beceriler

---

## 👨‍🎓 Öğrenci Sistemi

### 1. Kayıt ve Giriş

**Kayıt Olma**:
1. `/student-register` sayfasına git
2. Form doldur:
   - Öğrenci Numarası (10 haneli)
   - Ad Soyad
   - Şifre (min 6 karakter)
   - Ders Seçimi (çoklu)
3. Kaydet

**Giriş Yapma**:
1. `/student-login` sayfasına git
2. Öğrenci numarası + şifre
3. Dashboard'a yönlendir

### 2. Ödev Yükleme

**Adım 1: Ders Seçimi**
- Sadece kayıtlı olduğun dersler
- Aktif ödevi olmayan dersler pasif (seçilemez)
- Ödev sayısı gösterilir: "(2 ödev)"

**Adım 2: Ödev Seçimi**
- Dersin aktif ödevleri listelenir
- Başlangıç ve bitiş tarihleri gösterilir
- Açıklama gösterilir

**Adım 3: Dosya Yükleme**
- Sadece PDF
- Max 3MB
- Dosya adı: `OgrenciNo_DersKodu_Tarih.pdf`

**Önemli Kurallar**:
1. ✅ Aynı ödeve tekrar yükleme yaparsanız **eski dosya silinir**
2. ✅ Sadece başlangıç-bitiş tarihleri arasında yükleme
3. ✅ Süre dolunca otomatik kapanır
4. ❌ Ödev yoksa ders seçilemez
5. ❌ Ödev başlamamışsa yüklenemez

### 3. Ödev Geçmişi

**Yüklenen Ödevlerim**:
- Tüm yüklenen ödevler
- Ders, tarih bilgisi
- PDF görüntüleme
- Her ödev için sadece 1 dosya (en son yüklenen)

---

## 📝 Ödev Atama Sistemi

### Nasıl Çalışır?

**1. Admin Tarafı**:
```
Admin → Dersler → "Ödev Tanımla" → Form:
  - Başlık: "1. Hafta HTML/CSS Ödevi"
  - Açıklama: "Bootstrap kullanarak web sayfası oluşturun"
  - Başlangıç: 04.11.2025 09:00
  - Son Teslim: 11.11.2025 23:59
  - Aktif: ✓
```

**2. Bildirim Sistemi**:
- Herkes (giriş yapmadan) dersler sayfasında görür
- Ders kartında badge: "🗎 1 Ödev"
- Ders detayında "Ödevler" sekmesi
- Ödev bilgileri, tarihler gösterilir

**3. Öğrenci Tarafı**:
```
Öğrenci Login → Dashboard → Ders Seç (MEM215) → Ödev Seç:
  ✅ "1. Hafta HTML/CSS Ödevi" (Aktif, 7 gün kaldı)
  → Dosya Yükle → Kaydet
```

**4. Süre Kontrolü**:
```python
# Backend kontrolü
now = 05.11.2025 10:00

if now < start_date:  # 04.11.2025 09:00
    ❌ "Ödev henüz başlamadı"

if now > due_date:  # 11.11.2025 23:59
    ❌ "Ödev süresi doldu"

if start_date <= now <= due_date:
    ✅ Yükleme yapılabilir
```

**5. Güncelleme**:
```
Öğrenci aynı ödeve 2. kez yüklerse:
  1. Eski dosya silinir (disk'ten)
  2. Eski kayıt silinir (DB'den)
  3. Yeni dosya kaydedilir
  4. Sonuç: Sadece 1 dosya kalır
```

### Ödev Durumları

| Durum | Badge | Açıklama |
|-------|-------|----------|
| **Aktif** | 🟢 Yeşil | Şimdi yüklenebilir |
| **Yakında Başlayacak** | 🔵 Mavi | Başlangıç tarihi gelmedi |
| **Süresi Doldu** | 🔴 Kırmızı | Son teslim geçti |
| **Pasif** | ⚫ Gri | Admin tarafından devre dışı |

### Süre Uzatma

Admin panelinde:
1. Ödev listesinde "Düzenle"
2. "Son Teslim Tarihi" güncelleyin
3. Kaydedin
4. Öğrenciler tekrar yükleyebilir

---

## 🔌 API Dokümantasyonu

### Authentication

**Admin Login**:
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin"
}

Response:
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "user": {
    "username": "admin",
    "role": "admin"
  }
}
```

**Student Login**:
```http
POST /api/students/login
Content-Type: application/json

{
  "student_number": "2025000001",
  "password": "000001"
}

Response:
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "student": {
    "student_number": "2025000001",
    "full_name": "Ahmet Yılmaz",
    "enrolled_courses": [1, 2, 3]
  }
}
```

### Courses

**Get All Courses**:
```http
GET /api/courses

Response: [
  {
    "id": 1,
    "code": "MEM215",
    "name": "Internet Tabanlı Programlama",
    "level": "Lisans",
    "semester": "Güz",
    "credits": 4,
    "description": "HTML, CSS, JavaScript...",
    "is_active": true
  }
]
```

**Create Course** (Admin):
```http
POST /api/courses
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "MEM215",
  "name": "Internet Tabanlı Programlama",
  "level": "Lisans",
  "semester": "Güz",
  "credits": 4,
  "description": "<p>HTML, CSS...</p>",
  "content": "{\"videos\": [], \"pdfs\": []}"
}
```

### Homework Assignments

**Get Assignments** (Public):
```http
GET /api/homework-assignments?course_id=1&is_active=true

Response: [
  {
    "id": 1,
    "course_id": 1,
    "title": "1. Hafta Ödevi",
    "description": "HTML/CSS kullanarak...",
    "start_date": "2025-11-04T09:00:00",
    "due_date": "2025-11-11T23:59:00",
    "is_active": true
  }
]
```

**Create Assignment** (Admin):
```http
POST /api/homework-assignments
Authorization: Bearer {token}
Content-Type: application/json

{
  "course_id": 1,
  "title": "1. Hafta Ödevi",
  "description": "Bootstrap kullanarak web sayfası",
  "start_date": "2025-11-04T09:00:00",
  "due_date": "2025-11-11T23:59:00",
  "is_active": true
}
```

**Update Assignment** (Admin):
```http
PUT /api/homework-assignments/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "due_date": "2025-11-15T23:59:00"  // Süre uzatma
}
```

### Homeworks

**Upload Homework** (Student):
```http
POST /api/homeworks
Content-Type: multipart/form-data

Fields:
- student_number: "2025000001"
- student_name: "Ahmet Yılmaz"
- course_id: 1
- assignment_id: 1
- notes: "Ödev notları"
- file: (binary PDF)

Response:
{
  "id": 123,
  "student_number": "2025000001",
  "course_code": "MEM215",
  "file_url": "/uploads/pdfs/143000041120251.pdf",
  "upload_date": "2025-11-05T14:30:00"
}
```

**Get My Homeworks**:
```http
GET /api/homeworks/my-homeworks/2025000001

Response: [
  {
    "id": 123,
    "course_code": "MEM215",
    "course_name": "Internet Tabanlı Programlama",
    "file_url": "/uploads/pdfs/143000041120251.pdf",
    "upload_date": "2025-11-05T14:30:00",
    "notes": "Ödev notları"
  }
]
```

**Get All Homeworks** (Admin):
```http
GET /api/homeworks
Authorization: Bearer {token}

Response: [...]
```

---

## 💾 Veritabanı Yapısı

### Tablolar

**users** (Admin):
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100),
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**students**:
```sql
CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    student_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    enrolled_courses JSON,  -- [1, 2, 3]
    department VARCHAR(100),
    semester INTEGER,
    academic_year VARCHAR(20),
    last_login DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**courses**:
```sql
CREATE TABLE courses (
    id INTEGER PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(200) NOT NULL,
    level VARCHAR(50),  -- Lisans, Yüksek Lisans, Doktora
    semester VARCHAR(20),  -- Güz, Bahar
    credits INTEGER,
    description TEXT,
    content JSON,  -- {"videos": [], "pdfs": [], "notes": ""}
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);
```

**homework_assignments**:
```sql
CREATE TABLE homework_assignments (
    id INTEGER PRIMARY KEY,
    course_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATETIME NOT NULL,
    due_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

**homeworks**:
```sql
CREATE TABLE homeworks (
    id INTEGER PRIMARY KEY,
    student_id INTEGER,
    student_number VARCHAR(20) NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    course_id INTEGER NOT NULL,
    course_code VARCHAR(20),
    course_name VARCHAR(200),
    assignment_id INTEGER,  -- NULL için eski sistem uyumluluğu
    file_url VARCHAR(500) NOT NULL,
    notes TEXT,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (assignment_id) REFERENCES homework_assignments(id)
);
```

**announcements**:
```sql
CREATE TABLE announcements (
    id INTEGER PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);
```

**publications**:
```sql
CREATE TABLE publications (
    id INTEGER PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    authors VARCHAR(500),
    year INTEGER,
    journal VARCHAR(300),
    category VARCHAR(100),
    pdf_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**gallery**:
```sql
CREATE TABLE gallery (
    id INTEGER PRIMARY KEY,
    type VARCHAR(20),  -- 'image' veya 'video'
    title VARCHAR(200),
    description TEXT,
    url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**cv**:
```sql
CREATE TABLE cv (
    id INTEGER PRIMARY KEY,
    section VARCHAR(50),  -- 'education', 'experience', 'projects', 'skills'
    data JSON,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**analytics**:
```sql
CREATE TABLE analytics (
    id INTEGER PRIMARY KEY,
    total_courses INTEGER DEFAULT 0,
    total_homeworks INTEGER DEFAULT 0,
    total_students INTEGER DEFAULT 0,
    active_students INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔒 Güvenlik

### Authentication
- **JWT Tokens**: 7 gün geçerlilik
- **Password Hashing**: bcrypt ile
- **Dual System**: Admin ve öğrenci ayrı tokenlar

### File Upload
- **Format Check**: Sadece PDF
- **Size Limit**: 3MB (backend + frontend)
- **Path Validation**: Directory traversal koruması
- **Timestamp Naming**: Çakışma önleme

### CORS
```python
# Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### SQL Injection
- SQLAlchemy ORM kullanımı
- Prepared statements
- Input validation

### XSS Protection
- React otomatik escape
- DOMPurify (rich text için)

---

## 🐛 Sorun Giderme

### Backend Sorunları

**Sunucu başlamıyor**:
```bash
# Port zaten kullanılıyorsa
lsof -i :8000
kill -9 <PID>

# Veya farklı port kullan
uvicorn server:app --reload --port 8001
```

**Veritabanı hatası**:
```bash
# Veritabanını sıfırla
rm backend/academic_site.db
python backend/populate_db.py
```

**Import hatası**:
```bash
# Virtual environment aktif mi kontrol et
which python  # .venv içinde olmalı

# Bağımlılıkları tekrar yükle
pip install -r backend/requirements.txt
```

### Frontend Sorunları

**npm start çalışmıyor**:
```bash
# node_modules'ı sil ve tekrar yükle
rm -rf frontend/node_modules
cd frontend
npm install
```

**CORS hatası**:
```bash
# Backend .env dosyasını kontrol et
REACT_APP_BACKEND_URL=http://localhost:8000
```

**Build hatası**:
```bash
# Cache'i temizle
npm cache clean --force
rm -rf frontend/node_modules frontend/package-lock.json
npm install
```

### Dosya Yükleme Sorunları

**3MB hatası**:
- PDF kalitesini düşürün
- Online PDF compressor kullanın
- Fotoğrafları çıkarın

**Dosya görünmüyor**:
```bash
# uploads klasörü var mı?
ls -la backend/uploads/pdfs
ls -la backend/uploads/images

# Yoksa oluştur
mkdir -p backend/uploads/{pdfs,images,thumbnails}
```

### Ödev Yükleme Sorunları

**"Ödev henüz başlamadı" hatası**:
- Admin panelinden başlangıç tarihini kontrol edin
- Tarihleri geçmiş olarak ayarlayın

**"Ödev süresi doldu" hatası**:
- Admin panelinden "Düzenle" butonuna tıklayın
- Son teslim tarihini uzatın

**Ders seçilemiyor**:
- Öğrenci o derse kayıtlı mı?
- Dersin aktif ödevi var mı?
- Admin panelinden ödev tanımlayın

---

## 📁 Klasör Yapısı

```
ibca.com/
├── backend/
│   ├── server.py              # Ana FastAPI uygulaması
│   ├── models.py              # SQLAlchemy modelleri
│   ├── schemas.py             # Pydantic şemaları
│   ├── auth.py                # JWT ve password utils
│   ├── database.py            # DB bağlantısı
│   ├── file_utils.py          # Dosya yükleme/silme
│   ├── populate_db.py         # DB başlatma scripti
│   ├── requirements.txt       # Python bağımlılıkları
│   ├── academic_site.db       # SQLite veritabanı
│   └── uploads/
│       ├── pdfs/              # Yüklenen PDF'ler
│       ├── images/            # Yüklenen resimler
│       └── thumbnails/        # Resim thumbnail'leri
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # Shadcn/ui bileşenleri
│   │   │   ├── Header.js
│   │   │   ├── Footer.js
│   │   │   ├── ImageSlider.js
│   │   │   └── AnnouncementList.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   ├── LanguageContext.js
│   │   │   └── ThemeContext.js
│   │   ├── pages/
│   │   │   ├── HomePage.js
│   │   │   ├── CoursesPage.js
│   │   │   ├── CourseDetailPage.js
│   │   │   ├── AdminLoginPage.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── StudentLoginPage.js
│   │   │   ├── StudentRegisterPage.js
│   │   │   ├── StudentDashboard.js
│   │   │   ├── PublicationsPage.js
│   │   │   ├── GalleryPage.js
│   │   │   └── CVPage.js
│   │   ├── services/
│   │   │   └── api.js          # Axios instance
│   │   ├── i18n/
│   │   │   └── translations.js # Türkçe/İngilizce
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
│
├── .venv/                      # Python virtual environment
├── .gitignore
└── README.md                   # Bu dosya
```

---

## 📊 Özellik Listesi

### ✅ Tamamlanan Özellikler

#### Admin Paneli
- [x] Giriş/Çıkış sistemi
- [x] Dashboard (istatistikler)
- [x] Ders CRUD
- [x] Ödev atama sistemi
- [x] Ödev inceleme
- [x] Öğrenci yönetimi
- [x] Duyuru yönetimi
- [x] Yayın yönetimi
- [x] Galeri yönetimi
- [x] CV yönetimi
- [x] Analytics

#### Öğrenci Sistemi
- [x] Self-registration
- [x] Giriş/Çıkış
- [x] Ödev yükleme
- [x] Ödev geçmişi
- [x] Ders seçimi
- [x] Profil görüntüleme

#### Genel
- [x] Responsive tasarım
- [x] Dark/Light tema
- [x] Çok dilli (TR/EN)
- [x] PDF görüntüleme
- [x] Dosya yükleme
- [x] YouTube video entegrasyonu
- [x] Rich text editor
- [x] Tarih bazlı ödev kontrolü
- [x] Otomatik ödev güncelleme

### 🔮 Gelecek Özellikler

- [ ] Email bildirimleri
- [ ] Ödev notlandırma sistemi
- [ ] Online sınav sistemi
- [ ] Canlı ders entegrasyonu
- [ ] Forum/Soru-Cevap
- [ ] Dosya paylaşım sistemi
- [ ] Takvim entegrasyonu
- [ ] Mobil uygulama
- [ ] Excel export (ödev raporu)
- [ ] Öğrenci performans analizi

---

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'feat: Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

## 📝 Notlar

### Ödev Yükleme Kuralları

1. **Dosya Formatı**: Sadece PDF
2. **Dosya Boyutu**: Max 3MB
3. **Dosya Adı**: `OgrenciNo_DersKodu_Tarih.pdf` (örn: `2025000001_MEM215_05112025.pdf`)
4. **Tekrar Yükleme**: Aynı ödeve tekrar yükleme eski dosyayı SİLER
5. **Süre Kontrolü**: Başlangıç-bitiş tarihleri arası yükleme
6. **Ders Kaydı**: Sadece kayıtlı olduğunuz derslere yükleme

### Şifre Kuralları

**Admin**:
- Default: `admin` / `admin`
- Değiştirin: Üretim ortamında mutlaka değiştirin

**Öğrenci**:
- İlk şifre: Öğrenci numarasının son 6 hanesi
- Örnek: `2025000001` → `000001`
- Değiştirme: Self-registration ile kendi şifresi

### Dosya Yükleme

**Backend**:
- Klasör: `backend/uploads/`
- İsimlendirme: `HHMMSSDDMMYYYY` + random
- Örnek: `143052051120251_a7b3c9.pdf`

**Frontend**:
- Görüntüleme: `http://localhost:8000/uploads/pdfs/...`
- Tarayıcıda açılır (inline)

---

## 📞 İletişim

**Geliştirici**: Selim Taşdemir  
**GitHub**: [@selimttasdemir](https://github.com/selimttasdemir)  
**Repository**: [ibca.com](https://github.com/selimttasdemir/ibca.com)

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

## 🎉 Teşekkürler

- React ekibine
- FastAPI ekibine
- Shadcn/ui ekibine
- Tailwind CSS ekibine
- Tüm açık kaynak topluluğuna

---

**Son Güncelleme**: 5 Kasım 2025  
**Versiyon**: 1.0.0  
**Durum**: ✅ Production Ready
