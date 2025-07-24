import axios from 'axios';
import { TokenService } from '../auth/tokenService';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Token ekleme
api.interceptors.request.use(
  (config) => {
    const token = TokenService.getAccessToken();
    if (token && !TokenService.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Hata yönetimi
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Token süresi dolmuşsa
      if (error.response.status === 401) {
        // Refresh token ile yeni token alma işlemi yapılabilir
        TokenService.clearTokens();
        window.location.href = '/auth/logout';
      }
      
      // Yetki hatası
      if (error.response.status === 403) {
        window.location.href = '/unauthorized';
      }
    }
    return Promise.reject(error);
  }
);

export default api; 