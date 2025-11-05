# Akademik Web Sitesi - Kullanım Kılavuzu

## 📋 İçindekiler
- [Proje Hakkında](#proje-hakkında)
- [Kurulum](#kurulum)
- [Dosya Yükleme Sistemi](#dosya-yükleme-sistemi)
- [API Kullanımı](#api-kullanımı)
- [Sunucu Çalıştırma](#sunucu-çalıştırma)

---

## 🎯 Proje Hakkında

Bu proje, akademisyenler için geliştirilmiş full-stack bir web sitesidir.

### Özellikler
- 📢 Duyuru yönetimi
- 📚 Ders ve kurs yönetimi
- 📄 Akademik yayınlar
- 🖼️ Galeri (fotoğraf ve video)
- 👤 Özgeçmiş yönetimi
- 🔐 JWT tabanlı kimlik doğrulama
- 📊 Admin paneli

### Teknolojiler

**Backend:**
- Python 3.12+
- FastAPI
- SQLAlchemy (SQLite)
- JWT Authentication
- Pillow (görsel işleme)

**Frontend:**
- React 19
- Tailwind CSS
- Shadcn/ui
- Axios

---

## 🚀 Kurulum

### 1. Backend Kurulumu

```bash
# Proje dizinine git
cd /home/s/Yazılımlar/ibca.com

# Python sanal ortamı aktif (otomatik yapılandırıldı)
# Paketler zaten kurulu

# Backend'i başlat
cd backend
/home/s/Yazılımlar/ibca.com/.venv/bin/uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

**Backend URL:** http://localhost:8000
**API Docs:** http://localhost:8000/docs

### 2. Frontend Kurulumu

```bash
# Frontend dizinine git
cd /home/s/Yazılımlar/ibca.com/frontend

# Paketler zaten kurulu

# Frontend'i başlat
npm start
```

**Frontend URL:** http://localhost:3000

---

## 📁 Dosya Yükleme Sistemi

### Dosya Adlandırma Kuralı

Yüklenen PDF ve görseller **orijinal isimleriyle** kaydedilir, sadece sonuna tarih/saat damgası eklenir:

```
Orijinal: makine_elemanları_hafta1.pdf
Kaydedilen: makine_elemanlari_hafta1_14225801012025.pdf
             └─────────────────────┘ └──────────────┘
                Orijinal ad          Tarih-Saat Damgası
```

**Format:** `GGSSAAGGYYYY` (Saat:Dakika:Saniye - Gün/Ay/Yıl)

### Örnek Dosya İsimleri

```
ders_notlari.pdf → ders_notlari_09153003112025.pdf
sinav_sorulari.pdf → sinav_sorulari_14302503112025.pdf
proje_raporu.pdf → proje_raporu_16450403112025.pdf
```

### Dosya Erişim

**PDF Görüntüleme (Herkese Açık):**
```
GET http://localhost:8000/api/files/pdf/ders_notlari_09153003112025.pdf
```

**Görsel Görüntüleme (Herkese Açık):**
```
GET http://localhost:8000/api/files/image/foto_09153003112025.jpg
```

### Karakter Temizleme

Türkçe karakterler ve özel karakterler otomatik olarak temizlenir:

```
Yükleme Öncesi:          Yükleme Sonrası:
ç → c                    makine_elemanları.pdf
ğ → g                    →
ı → i                    makine_elemanlari_14225801012025.pdf
ö → o
ş → s
ü → u
Boşluk → _
```

---

## 🔌 API Kullanımı

### Kimlik Doğrulama

**Login:**
```bash
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

# Yanıt:
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

**Token Kullanımı:**
```bash
GET http://localhost:8000/api/auth/me
Authorization: Bearer eyJhbGc...
```

### PDF Yükleme (Admin)

```bash
POST http://localhost:8000/api/publications/upload-pdf
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: ders_notlari.pdf

# Yanıt:
{
  "filename": "ders_notlari_14225801012025.pdf",
  "url": "/uploads/pdfs/ders_notlari_14225801012025.pdf",
  "size": 245760
}
```

### PDF Görüntüleme (Herkes)

```bash
GET http://localhost:8000/api/files/pdf/ders_notlari_14225801012025.pdf
# Tarayıcıda doğrudan açılır
```

### Yayın Oluşturma

```bash
POST http://localhost:8000/api/publications
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Makine Elemanları Ders Notları",
  "authors": "Prof. Dr. İsim Soyisim",
  "year": 2025,
  "publication_type": "article",
  "pdf_url": "/uploads/pdfs/ders_notlari_14225801012025.pdf"
}
```

---

## 🎮 Sunucu Çalıştırma

### Backend Başlatma

```bash
cd /home/s/Yazılımlar/ibca.com/backend
/home/s/Yazılımlar/ibca.com/.venv/bin/uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

**Çıktı:**
```
✅ Veritabanı başarıyla başlatıldı
✅ Admin user already exists
INFO: Uvicorn running on http://0.0.0.0:8000
```

### Frontend Başlatma

```bash
cd /home/s/Yazılımlar/ibca.com/frontend
npm start
```

**Çıktı:**
```
Compiled successfully!
You can now view frontend in the browser.
  Local:            http://localhost:3000
```

---

## 👤 Varsayılan Admin Hesabı

```
Kullanıcı Adı: admin
Şifre: admin123
```

⚠️ **Önemli:** Üretim ortamında mutlaka şifre değiştirilmelidir!

---

## 📂 Dizin Yapısı

```
ibca.com/
├── backend/
│   ├── server.py           # Ana FastAPI sunucusu
│   ├── models.py           # Veritabanı modelleri
│   ├── schemas.py          # Pydantic şemaları
│   ├── auth.py             # Kimlik doğrulama
│   ├── database.py         # Veritabanı bağlantısı
│   ├── file_utils.py       # Dosya yükleme (GÜNCELLENDİ)
│   ├── academic_site.db    # SQLite veritabanı
│   └── uploads/
│       ├── images/         # Yüklenen görseller
│       ├── pdfs/           # Yüklenen PDF'ler
│       └── thumbnails/     # Küçük resimler
│
└── frontend/
    ├── src/
    │   ├── App.js          # Ana uygulama
    │   ├── services/
    │   │   └── api.js      # API servisleri
    │   ├── pages/          # Sayfa bileşenleri
    │   └── components/     # UI bileşenleri
    └── package.json
```

---

## 🔧 Yapılan Güncellemeler

### ✅ Tamamlanan İşlemler

1. **Backend kodları düzenlendi**
   - Tüm Python dosyalarına Türkçe yorumlar eklendi
   - Kod okunabilirliği artırıldı

2. **Frontend kodları düzenlendi**
   - App.js ve api.js Türkçe yorumlarla zenginleştirildi

3. **Dosya yükleme sistemi güncellendi**
   - Orijinal dosya adları korunuyor
   - Tarih/saat damgası ekleniyor
   - Türkçe karakter desteği
   - Format: `orjinal_ad_GGSSAAGGYYYY.uzanti`

4. **PDF görüntüleme eklendi**
   - Herkes PDF'leri görüntüleyebilir
   - Kimlik doğrulama gerekmez
   - Endpoint: `/api/files/pdf/{filename}`

5. **Python ortamı yapılandırıldı**
   - Virtual environment oluşturuldu
   - Tüm bağımlılıklar kuruldu

6. **Sunucular başlatıldı**
   - Backend: ✅ Çalışıyor (Port 8000)
   - Frontend: ⏳ Hazır (npm start ile başlatılabilir)

---

## 📝 Notlar

- SQLite veritabanı kullanılıyor (dosya tabanlı)
- Admin kullanıcı otomatik oluşturuluyor
- CORS tüm kaynaklara açık (geliştirme için)
- Dosya boyut limitleri:
  - PDF: 10MB
  - Görsel: 1MB (otomatik optimize edilir)

---

## 🐛 Sorun Giderme

### Backend başlamıyor
```bash
# Doğru dizinde olduğunuzdan emin olun
cd /home/s/Yazılımlar/ibca.com/backend

# Veritabanı dosyasını kontrol edin
ls -la academic_site.db

# Logları inceleyin
tail -f nohup.out
```

### Frontend başlamıyor
```bash
# Node modüllerini yeniden kurun
cd /home/s/Yazılımlar/ibca.com/frontend
rm -rf node_modules
npm install --legacy-peer-deps
npm start
```

---

## 📞 İletişim

Sorularınız için: GitHub Issues

**Proje Sahibi:** selimttasdemir
**Repository:** ibca.com
