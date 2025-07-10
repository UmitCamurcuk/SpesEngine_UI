import axios from 'axios';
import { TokenService } from '../auth/tokenService';
import { TokenInterceptor } from '../auth/tokenInterceptor';

// API temel URL'sini tanımlıyoruz - gerçek projenizde değiştirmeniz gerekecek
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:1903/api';

// API veri dönüştürmeleri için yardımcı fonksiyonlar
const cleanEmptyFields = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  
  
  const cleaned: any = {};
  
  // Objenin her bir alanını kontrol et
  Object.entries(obj).forEach(([key, value]) => {
    // Sayısal değerler için özel kontrol ekle (0 değeri geçerlidir)
    if (typeof value === 'number' && value === 0) {
      cleaned[key] = value;
      return;
    }
    
    // undefined, null veya boş string değilse ekle
    if (value !== undefined && value !== null && value !== '') {
      // Eğer alt objeler varsa onları da temizle
      if (typeof value === 'object' && !Array.isArray(value)) {
        const cleanedNested = cleanEmptyFields(value);
        // Eğer alt obje temizlendikten sonra boş kalmadıysa ekle
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else if (Array.isArray(value)) {
        // Eğer dizi ise ve boş değilse ekle
        if (value.length > 0) {
          cleaned[key] = value;
        }
      } else {
        // Diğer tüm değerleri ekle
        cleaned[key] = value;
      }
    }
  });
  
  return cleaned;
};

// Axios instance oluşturuyoruz
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// İstek gönderilmeden önce çalışacak interceptor
api.interceptors.request.use(
  (config) => {
    // Token'ı ekle
    const token = TokenService.getAccessToken();
    if (token && !TokenService.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Mevcut dil bilgisini localStorage'dan al ve Accept-Language header'ına ekle
    const currentLanguage = localStorage.getItem('language') || 'tr';
    config.headers['Accept-Language'] = currentLanguage;
    
    // Validasyon alanlarını temizle (POST ve PUT isteklerinde)
    if ((config.method === 'post' || config.method === 'put') && config.data) {
      
      // Validations alanı varsa, boş değerleri temizle
      if (config.data.validations) {
        
        // Sayısal değerler için özel kontrol - 0 değeri geçerli olmalı
        const originalValidations = { ...config.data.validations };
        
        const cleanedValidations = cleanEmptyFields(config.data.validations);
        
        // Eğer temizleme sonrası validations objesi boş kaldıysa, tamamen kaldır
        if (Object.keys(cleanedValidations).length === 0) {
          delete config.data.validations;
        } else { 
          config.data.validations = cleanedValidations;
        }
      }
    }
    
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Yanıt alındıktan sonra çalışacak interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // 401 hatası ve token yenileme isteği değilse
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {
      originalRequest._retry = true;
      
      try {
        // TokenInterceptor ile token yenile
        const newToken = await TokenInterceptor.handleUnauthorized();
        
        // Yeni token ile orijinal isteği tekrar gönder
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Token yenilenemezse kullanıcıyı çıkış yaptır
        TokenService.clearTokens();
        window.location.href = '/auth/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 