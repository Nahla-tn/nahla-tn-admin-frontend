// src/lib/api/axios.ts
import axios from 'axios';
import { API_BASE_URL } from '@/constants/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor: nzidou l'token f kol request automatiquement
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== 'undefined' &&
      error.response?.status === 401 &&
      window.location.pathname !== '/login' // ⚠️ bch ma na3mlouch boucle infinie
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;