import api from '../api/config';

// Auth servisinin tip tanımlamaları
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

// Auth işlemlerini içeren servis
const authService = {
  // Giriş işlemi
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    
    // Token'ları localStorage'a kaydet
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    return response.data;
  },
  
  // Kayıt işlemi
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    
    // Token'ları localStorage'a kaydet
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    return response.data;
  },
  
  // Çıkış işlemi
  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    // Token'ları localStorage'dan sil
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
  
  // Mevcut kullanıcı bilgisini getir
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      return null;
    }
  },
  
  // Şifre sıfırlama isteği gönder
  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await api.post('/auth/forgot-password', data);
  },
  
  // Şifre sıfırlama işlemi
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await api.post('/auth/reset-password', data);
  },
  
  // Kullanıcı giriş yapmış mı kontrolü
  isAuthenticated: (): boolean => {
    return localStorage.getItem('accessToken') !== null;
  },
};

export default authService; 