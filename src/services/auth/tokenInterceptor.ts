import { TokenService } from './tokenService';
import authService from './authService';

interface RequestConfig {
  headers: Record<string, string>;
}

export class TokenInterceptor {
  private static isRefreshing = false;
  private static failedQueue: Array<{
    resolve: (value: string) => void;
    reject: (error: any) => void;
  }> = [];

  // Request interceptor - her istekte access token ekle
  static attachToken(config: RequestConfig): RequestConfig {
    const accessToken = TokenService.getAccessToken();
    
    if (accessToken && !TokenService.isTokenExpired(accessToken)) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  }

  // Response interceptor - 401 durumunda token yenile
  static async handleUnauthorized(): Promise<string> {
    if (this.isRefreshing) {
      // Zaten refresh işlemi devam ediyorsa, kuyruğa ekle
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const refreshToken = TokenService.getRefreshToken();
      
      if (!refreshToken || TokenService.isTokenExpired(refreshToken)) {
        // Refresh token da geçersizse, logout yap
        this.processQueue(null);
        TokenService.clearTokens();
        window.location.href = '/auth/login';
        throw new Error('Refresh token geçersiz');
      }

      // Token yenile
      const response = await authService.refreshToken(refreshToken);
      
      if (response.success) {
        TokenService.setTokens(response.accessToken, response.refreshToken);
        this.processQueue(response.accessToken);
        return response.accessToken;
      } else {
        throw new Error('Token yenilenemedi');
      }
    } catch (error) {
      this.processQueue(null);
      TokenService.clearTokens();
      window.location.href = '/auth/login';
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Kuyruktaki istekleri işle
  private static processQueue(token: string | null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (token) {
        resolve(token);
      } else {
        reject(new Error('Token yenilenemedi'));
      }
    });
    
    this.failedQueue = [];
  }

  // API isteği için hazırlık
  static async prepareRequest(): Promise<RequestConfig> {
    const accessToken = TokenService.getAccessToken();
    
    // Access token yoksa veya süre dolmuşsa
    if (!accessToken || TokenService.isTokenExpired(accessToken)) {
      // Refresh token'la yenilemeyi dene
      try {
        const newToken = await this.handleUnauthorized();
        return {
          headers: {
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json'
          }
        };
      } catch (error) {
        // Yenileme başarısızsa, login'e yönlendir
        throw new Error('Authentication required');
      }
    }

    return {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };
  }

  // Manuel token kontrolü ve yenileme
  static async ensureValidToken(): Promise<boolean> {
    const accessToken = TokenService.getAccessToken();
    
    if (!accessToken) return false;
    
    // Token süresinin bitmesine 5 dakika kaldıysa yenile
    if (this.shouldRefreshToken(accessToken)) {
      try {
        await this.handleUnauthorized();
        return true;
      } catch (error) {
        return false;
      }
    }
    
    return true;
  }

  // Token'ın yenilenmesi gerekip gerekmediğini kontrol et
  private static shouldRefreshToken(token: string): boolean {
    try {
      const decoded = TokenService.decodeToken(token);
      if (!decoded || !decoded.exp) return true;
      
      // 5 dakika kala yenile
      const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
      return decoded.exp * 1000 < fiveMinutesFromNow;
    } catch (error) {
      return true;
    }
  }
} 