import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE_URL = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH APIs ====================
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
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

// ==================== ANNOUNCEMENT APIs ====================
export const announcementAPI = {
  getAll: async (type = null) => {
    const params = type ? { announcement_type: type } : {};
    const response = await api.get('/announcements', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/announcements/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/announcements', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/announcements/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/announcements/${id}`);
    return response.data;
  },
  
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/announcements/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// ==================== COURSE APIs ====================
export const courseAPI = {
  getAll: async (level = null) => {
    const params = level ? { level } : {};
    const response = await api.get('/courses', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/courses', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/courses/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },
};

// ==================== PUBLICATION APIs ====================
export const publicationAPI = {
  getAll: async (type = null) => {
    const params = type ? { publication_type: type } : {};
    const response = await api.get('/publications', { params });
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/publications', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/publications/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/publications/${id}`);
    return response.data;
  },
  
  uploadPDF: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/publications/upload-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// ==================== GALLERY APIs ====================
export const galleryAPI = {
  getAll: async (type = null) => {
    const params = type ? { item_type: type } : {};
    const response = await api.get('/gallery', { params });
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/gallery', data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/gallery/${id}`);
    return response.data;
  },
  
  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/gallery/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// ==================== CV APIs ====================
export const cvAPI = {
  get: async () => {
    const response = await api.get('/cv');
    return response.data;
  },
  
  update: async (data) => {
    const response = await api.put('/cv', data);
    return response.data;
  },
  
  uploadPDF: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/cv/upload-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/cv/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// ==================== ANALYTICS APIs ====================
export const analyticsAPI = {
  get: async () => {
    const response = await api.get('/analytics');
    return response.data;
  },
};

export default api;