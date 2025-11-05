# 🚀 Render.com Deployment Rehberi

## 📋 Hızlı Başlangıç

### 1. Render.com Hesabı
1. [render.com](https://render.com) → Sign Up (GitHub ile giriş yapın)
2. GitHub repository'nizi bağlayın (`selimttasdemir/ibca.com`)

---

## 🔧 Backend Deployment (FastAPI)

### Adım 1: Backend Hazırlık

**`backend/requirements.txt` kontrol edin**:
```txt
fastapi
uvicorn[standard]
sqlalchemy
python-jose[cryptography]
passlib[bcrypt]
python-multipart
bcrypt
pillow
```

**`backend/render.yaml` oluşturun** (isteğe bağlı):
```yaml
services:
  - type: web
    name: ibca-backend
    runtime: python3
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn server:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: SECRET_KEY
        generateValue: true
      - key: ALGORITHM
        value: HS256
      - key: ACCESS_TOKEN_EXPIRE_DAYS
        value: 7
      - key: DATABASE_URL
        value: sqlite:///./academic_site.db
```

### Adım 2: Render.com'da Backend Oluştur

1. **Dashboard** → **New** → **Web Service**
2. **Connect Repository**: `ibca.com` seçin
3. **Configure**:
   ```
   Name: ibca-backend
   Region: Frankfurt (EU)
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn server:app --host 0.0.0.0 --port $PORT
   Instance Type: Free
   ```
4. **Environment Variables** (Advanced):
   ```
   SECRET_KEY = [Auto Generate]
   ALGORITHM = HS256
   ACCESS_TOKEN_EXPIRE_DAYS = 7
   DATABASE_URL = sqlite:///./academic_site.db
   ```
5. **Create Web Service**

### Adım 3: Backend URL'i Kopyala
- Deploy bitince: `https://ibca-backend.onrender.com`
- API test: `https://ibca-backend.onrender.com/docs`

---

## 🎨 Frontend Deployment (React)

### Adım 1: Frontend Hazırlık

**`frontend/.env.production` oluşturun**:
```env
REACT_APP_BACKEND_URL=https://ibca-backend.onrender.com
```

**`frontend/package.json` kontrol**:
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

### Adım 2: Render.com'da Frontend Oluştur

1. **Dashboard** → **New** → **Static Site**
2. **Connect Repository**: `ibca.com` seçin
3. **Configure**:
   ```
   Name: ibca-frontend
   Region: Frankfurt (EU)
   Branch: main
   Root Directory: frontend
   Build Command: npm install --legacy-peer-deps && npm run build
   Publish Directory: build
   ```
4. **Environment Variables**:
   ```
   REACT_APP_BACKEND_URL = https://ibca-backend.onrender.com
   ```
5. **Create Static Site**

### Adım 3: Frontend URL'i Al
- Deploy bitince: `https://ibca-frontend.onrender.com`

---

## 🔄 Backend CORS Güncelleme

Backend'de CORS ayarlarını güncelleyin:

**`backend/server.py`**:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://ibca-frontend.onrender.com",  # Buraya frontend URL'i
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Commit ve push yapın**:
```bash
git add backend/server.py
git commit -m "Update CORS for production"
git push origin main
```

Render otomatik re-deploy yapacak!

---

## 📝 Önemli Notlar

### 🆓 Free Tier Limitleri

**Backend (Web Service - Free)**:
- ✅ 750 saat/ay ücretsiz
- ⚠️ 15 dakika inaktiflikten sonra uyur
- ⚠️ İlk istek 30-60 saniye sürebilir (cold start)
- ✅ Otomatik HTTPS
- ✅ Otomatik deploy (git push)

**Frontend (Static Site - Free)**:
- ✅ Sınırsız bandwidth
- ✅ Global CDN
- ✅ Otomatik HTTPS
- ✅ Anında deploy

### 🗄️ Database Sorunu

**SQLite Render'da Çalışmaz!** (ephemeral disk)

**Çözümler**:

**Seçenek 1: PostgreSQL (Önerilen)**:
1. Render Dashboard → **New** → **PostgreSQL**
2. Name: `ibca-database`
3. Free tier seçin
4. Connection string kopyalayın
5. Backend environment variables:
   ```
   DATABASE_URL = postgresql://user:pass@host/db
   ```
6. `backend/requirements.txt` güncelleyin:
   ```txt
   psycopg2-binary
   ```
7. Veritabanı migration gerekir

**Seçenek 2: SQLite + Persistent Disk (Ücretli)**:
- Paid plan gerekir ($7/ay)

**Seçenek 3: External DB**:
- Supabase (PostgreSQL, free tier)
- PlanetScale (MySQL, free tier)
- Railway (PostgreSQL, free tier)

### 📁 File Upload Sorunu

**Render Free Tier**: Ephemeral disk (restart sonrası dosyalar silinir)

**Çözümler**:

**Seçenek 1: Render Disk (Ücretli)**:
- Paid plan + Persistent Disk ($0.25/GB/ay)

**Seçenek 2: Cloud Storage (Önerilen)**:
- **Cloudinary** (Ücretsiz 25GB)
- **AWS S3** (Ücretsiz 5GB)
- **Supabase Storage** (Ücretsiz 1GB)

**Seçenek 3: Base64 Embed**:
- PDF'leri database'de base64 olarak sakla (önerilmez)

---

## 🚀 Hızlı Deployment Özeti

### Minimum Viable Deployment (Test için)

```bash
# 1. Git push
git add .
git commit -m "Prepare for deployment"
git push origin main

# 2. Render.com → Backend Web Service
#    - Build: pip install -r requirements.txt
#    - Start: uvicorn server:app --host 0.0.0.0 --port $PORT
#    - Env: SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_DAYS

# 3. Render.com → Frontend Static Site
#    - Build: npm install && npm run build
#    - Publish: build
#    - Env: REACT_APP_BACKEND_URL=https://ibca-backend.onrender.com

# 4. Backend CORS güncelle → git push
```

**Deployment süresi**: ~10-15 dakika

---

## ⚡ Production Ready Deployment

### Ön Hazırlık

**1. PostgreSQL geçişi**:
```bash
# backend/database.py
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
# SQLite → PostgreSQL migration script gerekir
```

**2. Cloud Storage entegrasyonu**:
```python
# backend/file_utils.py
# S3, Cloudinary veya Supabase Storage
```

**3. Environment variables**:
```env
# Production
DATABASE_URL=postgresql://...
SECRET_KEY=super-secret-production-key
CLOUDINARY_URL=cloudinary://...
ALLOWED_ORIGINS=https://ibca-frontend.onrender.com
```

**4. Güvenlik**:
```python
# Admin şifresini değiştir
# Rate limiting ekle
# HTTPS only
```

---

## 🔍 Deployment Sonrası Kontrol

### Backend Test:
```bash
# API docs
https://ibca-backend.onrender.com/docs

# Health check
curl https://ibca-backend.onrender.com/api/courses
```

### Frontend Test:
```bash
# Ana sayfa
https://ibca-frontend.onrender.com

# Admin login
https://ibca-frontend.onrender.com/admin-login
```

### Logs:
```
Render Dashboard → Service → Logs
```

---

## 🐛 Yaygın Sorunlar

### 1. Backend Uyumuyor (Cold Start)
**Sorun**: İlk istek 30-60 saniye
**Çözüm**: 
- Paid plan ($7/ay)
- Veya cron job ile 14 dakikada bir ping (UptimeRobot)

### 2. Database Sıfırlanıyor
**Sorun**: Her restart'ta data kayboluyor
**Çözüm**: PostgreSQL kullanın

### 3. Dosyalar Siliniy
**Sorun**: Upload edilen PDF'ler kaybolur
**Çözüm**: Cloudinary veya S3 kullanın

### 4. CORS Hatası
**Sorun**: Frontend → Backend istekleri bloke
**Çözüm**: `allow_origins` listesine frontend URL ekleyin

### 5. Build Hatası
**Sorun**: Deployment fail
**Çözüm**: 
```bash
# Logs kontrol et
# requirements.txt veya package.json eksik paket
```

---

## 💰 Maliyet Hesabı

### Free Tier (Test/Demo):
- Backend: Ücretsiz (750h/ay, uyuyan)
- Frontend: Ücretsiz (sınırsız)
- **Toplam**: $0/ay
- **Sınırlama**: SQLite yok, dosya yok, cold start

### Paid Tier (Production):
- Backend: $7/ay (7/24 aktif)
- PostgreSQL: $7/ay (1GB)
- Disk: $2.5/ay (10GB)
- **Toplam**: $16.5/ay

### Alternatif (Hibrit):
- Backend: Render Free
- Database: Supabase Free (PostgreSQL)
- Storage: Cloudinary Free
- **Toplam**: $0/ay (limitli)

---

## 📚 Kaynaklar

- [Render Docs](https://render.com/docs)
- [Render Python Guide](https://render.com/docs/deploy-fastapi)
- [Render Static Sites](https://render.com/docs/static-sites)
- [PostgreSQL Migration](https://render.com/docs/databases)

---

## ✅ Deployment Checklist

- [ ] GitHub repository public/private ayarı
- [ ] Backend requirements.txt güncel
- [ ] Frontend .env.production oluşturuldu
- [ ] Backend CORS ayarları güncellendi
- [ ] PostgreSQL seçildi (veya SQLite ile test)
- [ ] Cloud Storage seçildi (veya local test)
- [ ] Admin şifresi değiştirildi
- [ ] Environment variables ayarlandı
- [ ] Backend deploy edildi
- [ ] Frontend deploy edildi
- [ ] API test edildi
- [ ] Frontend test edildi
- [ ] Logs kontrol edildi

---

**Son Güncelleme**: 5 Kasım 2025  
**Deployment Süresi**: ~15 dakika (test), ~2 saat (production)  
**Maliyet**: $0 (test) / $16.5/ay (production)
