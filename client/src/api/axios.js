import axios from 'axios';

let apiBase = '/api';
if (import.meta.env.VITE_API_URL) {
  let url = import.meta.env.VITE_API_URL.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  apiBase = `${url.replace(/\/$/, '')}/api`;
}

const api = axios.create({
  baseURL: apiBase,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally (only redirect if not already on an auth page)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/register')) {
        localStorage.removeItem('gt_token');
        localStorage.removeItem('gt_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
