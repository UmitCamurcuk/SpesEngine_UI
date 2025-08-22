import api from '../api/config';
import { TokenService } from './tokenService';

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
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    role: any;
  };
}

// Auth işlemlerini içeren servis
const authService = {
  // Giriş işlemi
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    
    // Token'ları TokenService ile kaydet
    if (response.data.accessToken && response.data.refreshToken) {
      TokenService.setTokens(response.data.accessToken, response.data.refreshToken);
    } else {
      console.warn('Token\'lar response\'da bulunamadı!');
    }
    
    return response.data;
  },
  
  // Kayıt işlemi
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    
    // Token'ları TokenService ile kaydet
    if (response.data.accessToken && response.data.refreshToken) {
      TokenService.setTokens(response.data.accessToken, response.data.refreshToken);
    }
    
    return response.data;
  },
  
  // Çıkış işlemi
  logout: async (): Promise<void> => {
    const refreshToken = TokenService.getRefreshToken();
    
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    // Token'ları temizle
    TokenService.clearTokens();
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
    return TokenService.hasValidTokens();
  },
  
  // İzinleri yenile
  refreshPermissions: async () => {
    const response = await api.get('/auth/refresh-permissions');
    return response.data.user;
  },

  // Token yenile
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  // Profil güncelle
  updateProfile: async (profileData: any) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Avatar yükle
  uploadAvatar: async (formData: FormData) => {
    const response = await api.post('/auth/avatar', formData);
    return response.data;
  }
};

export default authService; 