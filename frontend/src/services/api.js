import axios from 'axios';

// Connect to your local backend
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add the Token to every request if logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
};

export const moduleAPI = {
  getAll: () => api.get('/modules'),
  create: (data) => api.post('/modules', data),
  update: (id, data) => api.put(`/modules/${id}`, data),
  delete: (id) => api.delete(`/modules/${id}`),
};

export const assetAPI = {
  upload: (moduleId, formData) => 
    api.post(`/assets/${moduleId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getByModule: (moduleId) => api.get(`/assets/${moduleId}`),
  update: (id, data) => api.put(`/assets/${id}`, data),   // <--- MAKE SURE THIS IS HERE
  delete: (id) => api.delete(`/assets/${id}`),            // <--- MAKE SURE THIS IS HERE
};

export const aiAPI = {
  query: (text) => api.post('/ai/query', { query: text }),
};

export default api;