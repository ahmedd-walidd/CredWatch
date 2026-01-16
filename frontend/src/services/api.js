import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (email, password) => 
    api.post('/auth/register', { email, password }),
  
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  me: () => 
    api.get('/auth/me'),
};

// Breach API
export const breachAPI = {
  check: (email) => 
    api.post('/breach/check', { email }),
  
  getHistory: (limit = 10) => 
    api.get(`/breach/history?limit=${limit}`),
  
  getStats: () => 
    api.get('/breach/stats'),
};

export default api;
