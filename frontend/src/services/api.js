/**
 * API Servis Modülü
 * 
 * Bu modül, backend API'si ile iletişimi yönetir.
 * Tüm HTTP istekleri bu modül üzerinden yapılır.
 * Axios kullanarak RESTful API çağrıları yapar.
 */

import axios from 'axios';


// ==================== API YAPILANDIRMASI ====================

// Backend URL yapılandırması
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
// Trailing slash'i kaldır
const cleanBackendURL = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
const API_BASE_URL = `${cleanBackendURL}/api`;

// Debug: API URL'i konsola yazdır
console.log('🔗 API Configuration:', {
  BACKEND_URL,
  API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV
});

/**
 * Axios instance oluştur
 * Tüm API istekleri için temel yapılandırma
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// ==================== REQUEST INTERCEPTOR ====================

/**
 * Her istek öncesi çalışır
 * JWT token'ı otomatik olarak header'a ekler
 */
api.interceptors.request.use(
  (config) => {
    // LocalStorage'dan admin veya öğrenci token'ını al
    const adminToken = localStorage.getItem('authToken');
    const studentToken = localStorage.getItem('studentToken');
    
    // Önce öğrenci token'ına bak, yoksa admin token'ına bak
    const token = studentToken || adminToken;
    
    // Token varsa Authorization header'ına ekle
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// ==================== RESPONSE INTERCEPTOR ====================

/**
 * Her yanıt sonrası çalışır
 * Hata yönetimi ve 401 (Unauthorized) kontrolü yapar
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 hatası: Kullanıcı yetkisiz (token geçersiz veya süresi dolmuş)
    if (error.response?.status === 401) {
      // Öğrenci mi admin mi kontrol et
      const studentToken = localStorage.getItem('studentToken');
      const adminToken = localStorage.getItem('authToken');
      
      if (studentToken) {
        // Öğrenci token'ını temizle
        localStorage.removeItem('studentToken');
        localStorage.removeItem('studentData');
        // Öğrenci login sayfasına yönlendir
        window.location.href = '/student-login';
      } else if (adminToken) {
        // Admin token'ını temizle
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        // Admin login sayfasına yönlendir
        window.location.href = '/admin';
      }
    }
    
    return Promise.reject(error);
  }
);



// ==================== KİMLİK DOĞRULAMA API'LERİ ====================

/**
 * Kimlik doğrulama işlemleri için API fonksiyonları
 */
export const authAPI = {
  /**
   * Kullanıcı girişi yap
   * @param {string} username - Kullanıcı adı
   * @param {string} password - Şifre
   * @returns {Promise} Token ve token tipi
   */
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  /**
   * Mevcut kullanıcı bilgilerini al
   * @returns {Promise} Kullanıcı bilgileri
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  /**
   * Şifre değiştir
   * @param {string} oldPassword - Eski şifre
   * @param {string} newPassword - Yeni şifre
   * @returns {Promise} İşlem sonucu
   */
  changePassword: async (oldPassword, newPassword) => {
    const formData = new FormData();
    formData.append('old_password', oldPassword);
    formData.append('new_password', newPassword);
    
    const response = await api.post('/auth/change-password', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    return response.data;
  },
};


// ==================== DUYURU API'LERİ ====================

/**
 * Duyuru işlemleri için API fonksiyonları
 */
export const announcementAPI = {
  /**
   * Tüm duyuruları getir
   * @param {string|null} type - Duyuru tipi (opsiyonel)
   * @returns {Promise<Array>} Duyuru listesi
   */
  getAll: async (type = null) => {
    const params = type ? { announcement_type: type } : {};
    const response = await api.get('/announcements', { params });
    return response.data;
  },
  
  /**
   * ID'ye göre duyuru getir
   * @param {number} id - Duyuru ID
   * @returns {Promise<Object>} Duyuru detayları
   */
  getById: async (id) => {
    const response = await api.get(`/announcements/${id}`);
    return response.data;
  },
  
  /**
   * Yeni duyuru oluştur
   * @param {Object} data - Duyuru verileri
   * @returns {Promise<Object>} Oluşturulan duyuru
   */
  create: async (data) => {
    const response = await api.post('/announcements', data);
    return response.data;
  },
  
  /**
   * Duyuru güncelle
   * @param {number} id - Duyuru ID
   * @param {Object} data - Güncellenecek veriler
   * @returns {Promise<Object>} Güncellenmiş duyuru
   */
  update: async (id, data) => {
    const response = await api.put(`/announcements/${id}`, data);
    return response.data;
  },
  
  /**
   * Duyuru sil
   * @param {number} id - Duyuru ID
   * @returns {Promise<Object>} İşlem sonucu
   */
  delete: async (id) => {
    const response = await api.delete(`/announcements/${id}`);
    return response.data;
  },
  
  /**
   * Duyuru için görsel yükle
   * @param {File} file - Görsel dosyası
   * @returns {Promise<Object>} Yüklenen görsel bilgileri
   */
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/announcements/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    return response.data;
  },
};


// ==================== DERS API'LERİ ====================

/**
 * Ders işlemleri için API fonksiyonları
 */
export const courseAPI = {
  /**
   * Tüm dersleri getir
   * @param {string|null} level - Ders seviyesi (opsiyonel)
   * @returns {Promise<Array>} Ders listesi
   */
  getAll: async (level = null) => {
    const params = level ? { level } : {};
    const response = await api.get('/courses', { params });
    return response.data;
  },
  
  /**
   * ID'ye göre ders getir
   * @param {number} id - Ders ID
   * @returns {Promise<Object>} Ders detayları
   */
  getById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },
  
  /**
   * Yeni ders oluştur
   * @param {Object} data - Ders verileri
   * @returns {Promise<Object>} Oluşturulan ders
   */
  create: async (data) => {
    const response = await api.post('/courses', data);
    return response.data;
  },
  
  /**
   * Ders güncelle
   * @param {number} id - Ders ID
   * @param {Object} data - Güncellenecek veriler
   * @returns {Promise<Object>} Güncellenmiş ders
   */
  update: async (id, data) => {
    const response = await api.put(`/courses/${id}`, data);
    return response.data;
  },
  
  /**
   * Ders sil
   * @param {number} id - Ders ID
   * @returns {Promise<Object>} İşlem sonucu
   */
  delete: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },
};



// ==================== YAYIN API'LERİ ====================

/**
 * Yayın işlemleri için API fonksiyonları
 */
export const publicationAPI = {
  /**
   * Tüm yayınları getir
   * @param {string|null} type - Yayın tipi (opsiyonel)
   * @returns {Promise<Array>} Yayın listesi
   */
  getAll: async (type = null) => {
    const params = type ? { publication_type: type } : {};
    const response = await api.get('/publications', { params });
    return response.data;
  },
  
  /**
   * Yeni yayın oluştur
   * @param {Object} data - Yayın verileri
   * @returns {Promise<Object>} Oluşturulan yayın
   */
  create: async (data) => {
    const response = await api.post('/publications', data);
    return response.data;
  },
  
  /**
   * Yayın güncelle
   * @param {number} id - Yayın ID
   * @param {Object} data - Güncellenecek veriler
   * @returns {Promise<Object>} Güncellenmiş yayın
   */
  update: async (id, data) => {
    const response = await api.put(`/publications/${id}`, data);
    return response.data;
  },
  
  /**
   * Yayın sil
   * @param {number} id - Yayın ID
   * @returns {Promise<Object>} İşlem sonucu
   */
  delete: async (id) => {
    const response = await api.delete(`/publications/${id}`);
    return response.data;
  },
  
  /**
   * Yayın için PDF yükle
   * @param {File} file - PDF dosyası
   * @returns {Promise<Object>} Yüklenen PDF bilgileri
   */
  uploadPDF: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/publications/upload-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    return response.data;
  },
};


// ==================== GALERİ API'LERİ ====================

/**
 * Galeri işlemleri için API fonksiyonları
 */
export const galleryAPI = {
  /**
   * Tüm galeri öğelerini getir
   * @param {string|null} type - Öğe tipi (opsiyonel)
   * @returns {Promise<Array>} Galeri öğeleri listesi
   */
  getAll: async (type = null) => {
    const params = type ? { item_type: type } : {};
    const response = await api.get('/gallery', { params });
    return response.data;
  },
  
  /**
   * Yeni galeri öğesi oluştur
   * @param {Object} data - Galeri öğesi verileri
   * @returns {Promise<Object>} Oluşturulan öğe
   */
  create: async (data) => {
    const response = await api.post('/gallery', data);
    return response.data;
  },
  
  /**
   * Galeri öğesi sil
   * @param {number} id - Öğe ID
   * @returns {Promise<Object>} İşlem sonucu
   */
  delete: async (id) => {
    const response = await api.delete(`/gallery/${id}`);
    return response.data;
  },
  
  /**
   * Galeri için fotoğraf yükle
   * @param {File} file - Fotoğraf dosyası
   * @returns {Promise<Object>} Yüklenen fotoğraf bilgileri
   */
  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/gallery/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    return response.data;
  },
};


// ==================== ÖZGEÇMİŞ API'LERİ ====================

/**
 * Özgeçmiş işlemleri için API fonksiyonları
 */
export const cvAPI = {
  /**
   * Özgeçmiş bilgilerini getir
   * @returns {Promise<Object>} Özgeçmiş bilgileri
   */
  get: async () => {
    const response = await api.get('/cv');
    return response.data;
  },
  
  /**
   * Yeni CV oluştur
   * @param {Object} data - CV verileri
   * @returns {Promise<Object>} Oluşturulan CV
   */
  create: async (data) => {
    const response = await api.post('/cv', data);
    return response.data;
  },
  
  /**
   * Özgeçmiş bilgilerini güncelle
   * @param {Object} data - Güncellenecek veriler
   * @returns {Promise<Object>} Güncellenmiş özgeçmiş
   */
  update: async (data) => {
    const response = await api.put('/cv', data);
    return response.data;
  },
  
  /**
   * CV için PDF yükle
   * @param {File} file - PDF dosyası
   * @returns {Promise<Object>} Yüklenen PDF bilgileri
   */
  uploadPDF: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/cv/upload-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    return response.data;
  },
  
  /**
   * CV için fotoğraf yükle
   * @param {File} file - Fotoğraf dosyası
   * @returns {Promise<Object>} Yüklenen fotoğraf bilgileri
   */
  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/cv/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    return response.data;
  },
};


// ==================== ANALİTİK API'LERİ ====================

/**
 * Analitik işlemleri için API fonksiyonları
 */
export const analyticsAPI = {
  /**
   * Site analitik verilerini getir
   * @returns {Promise<Object>} Analitik verileri
   */
  get: async () => {
    const response = await api.get('/analytics');
    return response.data;
  },
};


// ==================== EXPORT ====================

// Varsayılan export olarak api instance'ı dışa aktar
export default api;