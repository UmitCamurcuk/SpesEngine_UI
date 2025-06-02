import { AxiosResponse } from 'axios';
import api from './config';
import { store } from '../../redux/store';

export interface ISystemSettings {
  _id: string;
  companyName: string;
  systemTitle: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  logoUrl: string;
  general?: {
    companyName: string;
    systemTitle: string;
    defaultLanguage: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    logoUrl: string;
  };
  theme: {
    mode: 'light' | 'dark' | 'system' | 'custom';
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    enableDarkMode: boolean;
    defaultDarkMode: boolean;
    enableCustomFonts: boolean;
    customFont: string;
    customLogoUrl: string;
    enableCustomStyles: boolean;
    customCSS: string;
    showLogo: boolean;
    showUserAvatar: boolean;
    menuStyle: 'side' | 'top';
    themeName?: string;
  };
  backup: {
    backupSchedule: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'manual';
    backupTime: string;
    retentionPeriod: number;
    backupLocation: 'local' | 's3';
    s3Bucket: string;
    s3Region: string;
    backupDatabase: boolean;
    backupUploads: boolean;
    backupLogs: boolean;
    compressionLevel: 'none' | 'low' | 'medium' | 'high';
    lastBackupTime?: string;
  };
  security: {
    passwordPolicy: 'basic' | 'medium' | 'strong' | 'very_strong';
    passwordExpiryDays: number;
    loginAttempts: number;
    sessionTimeout: number;
    allowedIPs: string[];
    enableTwoFactor: boolean;
    enforceSSL?: boolean;
  };
  notifications: {
    enableSystemNotifications: boolean;
    enableEmailNotifications: boolean;
    enablePushNotifications: boolean;
    notifyUserOnLogin: boolean;
    notifyUserOnPasswordChange: boolean;
    notifyUserOnRoleChange: boolean;
    notifyOnDataImport: boolean;
    notifyOnDataExport: boolean;
    notifyOnBulkChanges: boolean;
    notifyOnSystemUpdates: boolean;
    notifyOnBackupComplete: boolean;
    notifyOnSystemErrors: boolean;
    adminEmails: string[];
  };
  integrations: {
    api: {
      enabled: boolean;
      rateLimit: number;
    };
    email: {
      provider: string;
      smtpHost?: string;
      smtpPort?: number;
      smtpUsername?: string;
      smtpPassword?: string;
      senderEmail: string;
    };
    sso: {
      provider: string;
      clientId?: string;
      clientSecret?: string;
      domain?: string;
    };
    erp?: {
      integration: string;
      host: string;
      username: string;
      password: string;
    };
    analytics?: {
      enabled: boolean;
      provider: string;
      trackingId: string;
    };
  };
  license: {
    key: string;
    type: string;
    expiryDate: string;
    maxUsers: number;
    features: string[];
  };
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

const defaultSettings: ISystemSettings = {
  _id: 'default',
  companyName: 'SpesEngine',
  systemTitle: 'SpesEngine',
  defaultLanguage: 'tr',
  supportedLanguages: ['tr', 'en'],
  timezone: 'Europe/Istanbul',
  dateFormat: 'DD.MM.YYYY',
  timeFormat: 'HH:mm',
  logoUrl: '',
  theme: {
    mode: 'light',
    primaryColor: '#1f6feb',
    accentColor: '#f97316',
    backgroundColor: '#ffffff',
    enableDarkMode: true,
    defaultDarkMode: false,
    enableCustomFonts: false,
    customFont: 'Inter',
    customLogoUrl: '',
    enableCustomStyles: false,
    customCSS: '',
    showLogo: true,
    showUserAvatar: true,
    menuStyle: 'side'
  },
  backup: {
    backupSchedule: 'daily',
    backupTime: '00:00',
    retentionPeriod: 30,
    backupLocation: 'local',
    s3Bucket: '',
    s3Region: '',
    backupDatabase: true,
    backupUploads: true,
    backupLogs: true,
    compressionLevel: 'medium'
  },
  security: {
    passwordPolicy: 'medium',
    passwordExpiryDays: 90,
    loginAttempts: 5,
    sessionTimeout: 30,
    allowedIPs: [],
    enableTwoFactor: false,
    enforceSSL: true
  },
  notifications: {
    enableSystemNotifications: true,
    enableEmailNotifications: false,
    enablePushNotifications: false,
    notifyUserOnLogin: true,
    notifyUserOnPasswordChange: true,
    notifyUserOnRoleChange: true,
    notifyOnDataImport: true,
    notifyOnDataExport: true,
    notifyOnBulkChanges: true,
    notifyOnSystemUpdates: true,
    notifyOnBackupComplete: true,
    notifyOnSystemErrors: true,
    adminEmails: []
  },
  integrations: {
    api: {
      enabled: true,
      rateLimit: 100
    },
    email: {
      provider: 'smtp',
      senderEmail: 'no-reply@spesengine.com'
    },
    sso: {
      provider: ''
    }
  },
  license: {
    key: '',
    type: 'community',
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    maxUsers: 10,
    features: []
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

class SystemSettingsService {
  private baseUrl = '/system';

  private getAuthHeader() {
    const state = store.getState();
    const token = state.auth.accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private getOfflineSettings(): ISystemSettings {
    const savedSettings = localStorage.getItem('offlineSettings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  }

  async getSettings(): Promise<ISystemSettings> {
    try {
      const response = await api.get<{ success: boolean; data: ISystemSettings }>('/system');
      localStorage.setItem('offlineSettings', JSON.stringify(response.data.data));
      return response.data.data;
    } catch (error) {
      console.error('Sistem ayarları alınırken hata:', error);
      
      // Önce localStorage'daki ayarları kontrol et
      const savedSettings = localStorage.getItem('offlineSettings');
      if (savedSettings) {
        try {
          return JSON.parse(savedSettings);
        } catch {
          console.log('LocalStorage\'daki ayarlar okunamadı, varsayılan ayarlar kullanılacak');
        }
      }
      
      // Varsayılan ayarları döndür
      return this.getOfflineSettings();
    }
  }

  async getSectionSettings<T extends keyof ISystemSettings>(section: T): Promise<Partial<ISystemSettings>> {
    const response: AxiosResponse<{ success: boolean; data: Partial<ISystemSettings> }> = await api.get(`${this.baseUrl}/${section}`);
    return response.data.data;
  }

  async updateSection<T extends keyof ISystemSettings>(
    section: T,
    data: Partial<ISystemSettings[T]>
  ): Promise<{ success: boolean; data: ISystemSettings }> {
    try {
      // Veriyi göndermeden önce bir kopyasını oluştur ve undefined değerleri kaldır
      const sanitizedData = { ...data };
      Object.keys(sanitizedData).forEach(key => {
        if (sanitizedData[key as keyof typeof sanitizedData] === undefined) {
          delete sanitizedData[key as keyof typeof sanitizedData];
        }
      });

      
      const response: AxiosResponse<{ success: boolean; data: ISystemSettings }> = await api.put(
        `${this.baseUrl}/${section}`,
        sanitizedData
      );
      
      // Güncellenmiş verileri localStorage'a kaydet
      const localSettings = this.getOfflineSettings();
      localSettings[section] = response.data.data[section];
      localStorage.setItem('offlineSettings', JSON.stringify(localSettings));
      
      return response.data;
    } catch (error) {
      console.error(`${section} ayarları güncellenirken hata:`, error);
      
      const localSettings = this.getOfflineSettings();
      const currentSection = localSettings[section];
      
      if (typeof currentSection === 'object' && currentSection !== null) {
        localSettings[section] = {
          ...currentSection,
          ...data
        } as ISystemSettings[T];
      } else {
        localSettings[section] = data as ISystemSettings[T];
      }
      
      localStorage.setItem('offlineSettings', JSON.stringify(localSettings));
      
      return {
        success: false,
        data: localSettings
      };
    }
  }

  async resetToDefaults(): Promise<ISystemSettings> {
    try {
      const response: AxiosResponse<ISystemSettings> = await api.post(
        `${this.baseUrl}/reset`
      );
      
      localStorage.setItem('offlineSettings', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('Varsayılan ayarlara dönerken hata:', error);
      localStorage.setItem('offlineSettings', JSON.stringify(defaultSettings));
      return defaultSettings;
    }
  }
}

export default new SystemSettingsService(); 