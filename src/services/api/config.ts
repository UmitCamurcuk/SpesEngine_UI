import axios from 'axios';
import { TokenService } from '../auth/tokenService';
import { TokenInterceptor } from '../auth/tokenInterceptor';

// Permission refresh için debounce mekanizması
let lastPermissionRefresh = 0;
const PERMISSION_REFRESH_COOLDOWN = 5000; // 5 saniye

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
      console.log('🔑 Token gönderiliyor:', token.substring(0, 20) + '...');
    } else {
      console.log('❌ Token bulunamadı veya süresi dolmuş');
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
    
    // 401 hatası kontrolü - login ve register endpoint'lerini muaf tut
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Login ve register endpoint'lerinde 401 hatası normal, logout yapma
      if (originalRequest.url === '/auth/login' || originalRequest.url === '/auth/register') {
        return Promise.reject(error);
      }
      
      // Permission version hatası - izinler güncellenmiş
      if (error.response?.data?.needsPermissionRefresh && !originalRequest._permissionRefreshRetry) {
        const now = Date.now();
        
        // Debounce kontrolü - son refresh'ten 5 saniye geçmemişse bekle
        if (now - lastPermissionRefresh < PERMISSION_REFRESH_COOLDOWN) {
          console.log('Permission refresh debounced - too frequent requests');
          return Promise.reject(error);
        }
        
        lastPermissionRefresh = now;
        originalRequest._permissionRefreshRetry = true;
        
        try {
          console.log('🔄 Refreshing permissions...');
          // Permission refresh yap
          const authService = await import('../auth/authService');
          const refreshedUser = await authService.default.refreshPermissions();
          
          // Redux store'u güncelle
          const { store } = await import('../../redux/store');
          store.dispatch({ 
            type: 'auth/setUser', 
            payload: refreshedUser 
          });
          
          console.log('✅ Permissions refreshed successfully');
          // İsteği yeniden gönder
          return api(originalRequest);
        } catch (permissionError) {
          console.error('❌ Permission refresh hatası:', permissionError);
          // Permission refresh başarısızsa logout yap
          TokenService.clearTokens();
          window.location.href = '/auth/logout';
        }
      }
      // Normal 401 hatası - token refresh
      else if (originalRequest.url !== '/auth/refresh-token') {
        originalRequest._retry = true;
        
        try {
          // TokenInterceptor ile token yenile
          const newToken = await TokenInterceptor.handleUnauthorized();
          
          // Yeni token ile orijinal isteği tekrar gönder
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Token yenilenemezse kullanıcıyı logout sayfasına yönlendir
          TokenService.clearTokens();
          window.location.href = '/auth/logout';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 