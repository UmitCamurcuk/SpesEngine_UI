interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
}

interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
  iat: number;
  exp: number;
}

export class TokenService {
  private static readonly ACCESS_TOKEN_KEY = 'spesengine_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'spesengine_refresh_token';
  
  // Access Token kaydet
  static setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  // Access Token al
  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  // Refresh Token kaydet
  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  // Refresh Token al
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Token'ları temizle
  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  // Token'ı decode et (doğrulamadan)
  static decodeToken(token: string): any {
    try {
      const base64Payload = token.split('.')[1];
      const payload = atob(base64Payload);
      return JSON.parse(payload);
    } catch (error) {
      return null;
    }
  }

  // Token süresini kontrol et
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return true;
      
      return Date.now() >= decoded.exp * 1000;
    } catch (error) {
      return true;
    }
  }

  // Token süresini al
  static getTokenExpiry(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return null;
      
      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  // Access token'dan kullanıcı bilgilerini al
  static getUserFromToken(): TokenPayload | null {
    const token = this.getAccessToken();
    if (!token || this.isTokenExpired(token)) {
      return null;
    }
    
    return this.decodeToken(token);
  }

  // Kullanıcının izinlerini al
  static getUserPermissions(): string[] {
    const user = this.getUserFromToken();
    return user?.permissions || [];
  }

  // Kullanıcının belirli bir izninin olup olmadığını kontrol et
  static hasPermission(permission: string): boolean {
    const permissions = this.getUserPermissions();
    return permissions.includes('*') || permissions.includes(permission);
  }

  // Kullanıcının herhangi bir izninin olup olmadığını kontrol et
  static hasAnyPermission(permissions: string[]): boolean {
    const userPermissions = this.getUserPermissions();
    if (userPermissions.includes('*')) return true;
    
    return permissions.some(permission => userPermissions.includes(permission));
  }

  // Token'ların geçerli olup olmadığını kontrol et
  static hasValidTokens(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    
    if (!accessToken || !refreshToken) return false;
    
    // Access token süresi dolmuşsa, refresh token'ı kontrol et
    if (this.isTokenExpired(accessToken)) {
      return !this.isTokenExpired(refreshToken);
    }
    
    return true;
  }

  // Token'ları kaydet
  static setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  }

  // Eski duplicate token'ları temizle (sadece bir kez çalıştırılmalı)
  static cleanupDuplicateTokens(): void {
    // Eski prefix'siz token'ları temizle
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    console.log('Duplicate tokens cleaned up');
  }
} 