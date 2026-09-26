import axios from 'axios';

let rawBase = (import.meta.env.VITE_API_URL || '/api').trim();

// Normalize URL: handle absolute URL or clean relative path
let API_BASE = '/api';
if (rawBase.startsWith('http://') || rawBase.startsWith('https://')) {
  const clean = rawBase.replace(/\/+$/, '');
  API_BASE = clean.endsWith('/api') ? clean : `${clean}/api`;
} else if (rawBase) {
  API_BASE = rawBase.startsWith('/') ? rawBase : `/${rawBase}`;
}

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vayunet_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle session expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Only redirect if route is inside authenticated /app
      if (window.location.pathname.startsWith('/app')) {
        localStorage.removeItem('vayunet_token');
        localStorage.removeItem('vayunet_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
