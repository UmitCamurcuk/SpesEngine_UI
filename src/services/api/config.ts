import axios from 'axios';

// API temel URL'sini tanımlıyoruz - gerçek projenizde değiştirmeniz gerekecek
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:1903/api';

// API veri dönüştürmeleri için yardımcı fonksiyonlar
const cleanEmptyFields = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  
  //console.log("[API Config] Temizlenmeden önce:", JSON.stringify(obj, null, 2));
  
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
  
  // console.log("[API Config] Temizlendikten sonra:", JSON.stringify(cleaned, null, 2));
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
    // Localstorage'dan token alınıyor
    const token = localStorage.getItem('accessToken');
    
    // Eğer token varsa, isteğin header'ına ekleniyor
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Mevcut dil bilgisini localStorage'dan al ve Accept-Language header'ına ekle
    const currentLanguage = localStorage.getItem('language') || 'tr';
    config.headers['Accept-Language'] = currentLanguage;
    
    // Validasyon alanlarını temizle (POST ve PUT isteklerinde)
    if ((config.method === 'post' || config.method === 'put') && config.data) {
      //console.log('[API Config] Veri gönderilmeden önce tüm veri:', JSON.stringify(config.data, null, 2));
      
      // Validations alanı varsa, boş değerleri temizle
      if (config.data.validations) {
        //console.log('[API Config] Ham validasyon:', JSON.stringify(config.data.validations, null, 2));
        
        // Sayısal değerler için özel kontrol - 0 değeri geçerli olmalı
        const originalValidations = { ...config.data.validations };
        
        const cleanedValidations = cleanEmptyFields(config.data.validations);
        
        // Eğer temizleme sonrası validations objesi boş kaldıysa, tamamen kaldır
        if (Object.keys(cleanedValidations).length === 0) {
          //console.log('[API Config] Validasyon verileri tamamen boş, siliniyor');
          delete config.data.validations;
        } else {
          //console.log('[API Config] Temizlenmiş validasyon:', JSON.stringify(cleanedValidations, null, 2)); 
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
        // Refresh token ile yeni bir token almaya çalışalım
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          const response = await axios.post(`${baseURL}/auth/refresh-token`, {
            refreshToken,
          });
          
          // Yeni token'ı localStorage'a kaydedelim
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // Yeni token ile orijinal isteği tekrar gönderelim
          api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Token yenilenemezse kullanıcıyı çıkış yaptıralım
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Kullanıcıyı login sayfasına yönlendirelim
        window.location.href = '/auth/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 