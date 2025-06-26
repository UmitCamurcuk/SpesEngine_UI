import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useTranslation } from '../../../../context/i18nContext';
import systemSettingsService, { ISystemSettings } from '../../../../services/api/systemSettingsService';
import { useNotification } from '../../../../components/notifications';

interface GeneralFormData {
  companyName: string;
  systemTitle: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  logoUrl: string;
  logoType: 'url' | 'upload';
}

const GeneralSettings: React.FC = () => {
  const { t, changeLanguage, currentLanguage, supportedLanguages } = useTranslation();
  const { showToast } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<GeneralFormData>({
    companyName: '',
    systemTitle: '',
    language: 'tr',
    timezone: 'Europe/Istanbul',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24',
    logoUrl: '',
    logoType: 'url'
  });
  const [logoPreview, setLogoPreview] = useState<string>('/logo.png');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Dosya boyutu ve tip validasyonu
  const validateImageFile = (file: File): string | null => {
    // Dosya boyutu kontrolü (2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return 'Dosya boyutu 2MB\'dan küçük olmalıdır';
    }

    // Dosya tipi kontrolü
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Sadece JPEG, PNG, GIF ve WebP formatları desteklenir';
    }

    return null;
  };

  // Görsel boyutlarını kontrol etme
  const validateImageDimensions = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        // Önerilen boyutlar: minimum 100x100, maksimum 500x500
        if (img.width < 100 || img.height < 100) {
          resolve('Logo minimum 100x100 pixel boyutunda olmalıdır');
        } else if (img.width > 1000 || img.height > 1000) {
          resolve('Logo maksimum 1000x1000 pixel boyutunda olmalıdır');
        } else {
          resolve(null);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve('Görsel dosyası okunamadı');
      };
      
      img.src = url;
    });
  };

  // Base64'e çevirme
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Ayarları yükle
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settings = await systemSettingsService.getSettings();

        setFormData({
          companyName: settings.companyName || '',
          systemTitle: settings.systemTitle || '',
          language: settings.defaultLanguage || currentLanguage,
          timezone: settings.timezone || 'Europe/Istanbul',
          dateFormat: settings.dateFormat || 'DD.MM.YYYY',
          timeFormat: settings.timeFormat || '24',
          logoUrl: settings.logoUrl || '',
          logoType: settings.logoUrl ? (settings.logoUrl.startsWith('data:') ? 'upload' : 'url') : 'url'
        });

        if (settings.logoUrl) {
          setLogoPreview(settings.logoUrl);
        }
      } catch (error) {
        console.error('Ayarlar yüklenirken hata:', error);
        showToast({
          type: 'error',
          title: 'Hata',
          message: 'Ayarlar yüklenirken bir hata oluştu',
          duration: 5000
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [currentLanguage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Dil değişikliği (otomatik kayıt)
  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    
    try {
      setSaving(true);
      
      // Form state'ini güncelle
      setFormData(prev => ({
        ...prev,
        language: newLanguage
      }));

      // Backend'e kaydet
      const result = await systemSettingsService.updateSection('general', {
        defaultLanguage: newLanguage
      });

      // LocalStorage'ı güncelle ve event dispatch et
      if (result.data) {
        localStorage.setItem('systemSettings', JSON.stringify(result.data));
        window.dispatchEvent(new CustomEvent('systemSettingsUpdated'));
      }

      // Dil değişikliğini uygula
      changeLanguage(newLanguage);

      showToast({
        type: 'success',
        title: 'Başarılı',
        message: 'Dil ayarı güncellendi',
        duration: 3000
      });
    } catch (error) {
      console.error('Dil güncellenirken hata:', error);
      showToast({
        type: 'error',
        title: 'Hata',
        message: 'Dil güncellenirken bir hata oluştu',
        duration: 5000
      });
    } finally {
      setSaving(false);
    }
  };

  // Logo dosyası yükleme
  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Dosya validasyonu
      const fileError = validateImageFile(file);
      if (fileError) {
        showToast({
          type: 'error',
          title: 'Geçersiz Dosya',
          message: fileError,
          duration: 5000
        });
        return;
      }

      // Boyut validasyonu
      const dimensionError = await validateImageDimensions(file);
      if (dimensionError) {
        showToast({
          type: 'error',
          title: 'Geçersiz Boyut',
          message: dimensionError,
          duration: 5000
        });
        return;
      }

      setSaving(true);

      // Base64'e çevir
      const base64 = await convertToBase64(file);
      
      // Önizleme güncelle
      setLogoPreview(base64);
      
      // Form state güncelle
      setFormData(prev => ({
        ...prev,
        logoUrl: base64,
        logoType: 'upload'
      }));

      // Backend'e kaydet
      const result = await systemSettingsService.updateSection('general', {
        logoUrl: base64
      });

      // LocalStorage'ı güncelle ve event dispatch et
      if (result.data) {
        localStorage.setItem('systemSettings', JSON.stringify(result.data));
        window.dispatchEvent(new CustomEvent('systemSettingsUpdated'));
      }

      showToast({
        type: 'success',
        title: 'Başarılı',
        message: 'Logo başarıyla yüklendi',
        duration: 3000
      });

    } catch (error) {
      console.error('Logo yüklenirken hata:', error);
      showToast({
        type: 'error',
        title: 'Hata',
        message: 'Logo yüklenirken bir hata oluştu',
        duration: 5000
      });
    } finally {
      setSaving(false);
    }
  };

  // Logo URL değişikliği
  const handleLogoUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({
      ...prev,
      logoUrl: url,
      logoType: 'url'
    }));

    if (url) {
      setLogoPreview(url);
    } else {
      setLogoPreview('/logo.png');
    }
  };

  // Logo URL'ini kaydet
  const handleLogoUrlSave = async () => {
    try {
      setSaving(true);

      if (formData.logoUrl && formData.logoType === 'url') {
        // URL validasyonu
        try {
          new URL(formData.logoUrl);
        } catch {
          showToast({
            type: 'error',
            title: 'Geçersiz URL',
            message: 'Lütfen geçerli bir URL girin',
            duration: 5000
          });
          return;
        }
      }

      const result = await systemSettingsService.updateSection('general', {
        logoUrl: formData.logoUrl
      });

      // LocalStorage'ı güncelle ve event dispatch et
      if (result.data) {
        localStorage.setItem('systemSettings', JSON.stringify(result.data));
        window.dispatchEvent(new CustomEvent('systemSettingsUpdated'));
      }

      showToast({
        type: 'success',
        title: 'Başarılı',
        message: 'Logo URL\'si güncellendi',
        duration: 3000
      });

    } catch (error) {
      console.error('Logo URL güncellenirken hata:', error);
      showToast({
        type: 'error',
        title: 'Hata',
        message: 'Logo URL güncellenirken bir hata oluştu',
        duration: 5000
      });
    } finally {
      setSaving(false);
    }
  };

  // Form kaydetme
  const handleSave = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    try {
      setSaving(true);

      const settingsUpdate = {
        companyName: formData.companyName.trim(),
        systemTitle: formData.systemTitle.trim(),
        defaultLanguage: formData.language,
        timezone: formData.timezone,
        dateFormat: formData.dateFormat,
        timeFormat: formData.timeFormat,
        logoUrl: formData.logoUrl
      };

      const result = await systemSettingsService.updateSection('general', settingsUpdate);

      // LocalStorage'ı güncelle ve event dispatch et
      if (result.data) {
        localStorage.setItem('systemSettings', JSON.stringify(result.data));
        window.dispatchEvent(new CustomEvent('systemSettingsUpdated'));
      }

      showToast({
        type: 'success',
        title: 'Başarılı',
        message: 'Genel ayarlar başarıyla güncellendi',
        duration: 3000
      });

    } catch (error) {
      console.error('Ayarlar kaydedilirken hata:', error);
      showToast({
        type: 'error',
        title: 'Hata',
        message: 'Ayarlar kaydedilirken bir hata oluştu',
        duration: 5000
      });
    } finally {
      setSaving(false);
    }
  };

  // Dosya yükleme alanını açma
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-light border-t-transparent dark:border-primary-dark dark:border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white">
          Genel Ayarlar
        </h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Logo Ayarları */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Logo Ayarları
          </h3>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Logo Önizleme */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="w-40 h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo Önizleme"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.png';
                    }}
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Logo Yok</p>
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={triggerFileInput}
                disabled={saving}
                className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Dosya Yükle
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleLogoUpload}
              />
              
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                <p>Max: 2MB</p>
                <p>100x100 - 1000x1000 px</p>
                <p>JPG, PNG, GIF, WebP</p>
              </div>
            </div>

            {/* Logo URL */}
            <div className="flex-grow space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={handleLogoUrlChange}
                    placeholder="https://example.com/logo.png"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleLogoUrlSave}
                    disabled={saving || !formData.logoUrl || formData.logoType !== 'url'}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    URL Kaydet
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Logo dosyası yüklemek yerine bir URL de kullanabilirsiniz
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Logo Önerileri:
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                  <li>• Şeffaf arka plan kullanın (PNG formatı)</li>
                  <li>• Kare veya yatay dikdörtgen şekil tercih edin</li>
                  <li>• Hem açık hem koyu tema için uygun olsun</li>
                  <li>• Temiz ve basit tasarım kullanın</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Genel Bilgiler */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Şirket Bilgileri
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Şirket Adı
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="systemTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sistem Başlığı
              </label>
              <input
                type="text"
                id="systemTitle"
                name="systemTitle"
                value={formData.systemTitle}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Dil ve Bölge Ayarları */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            Dil ve Bölge
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dil (Otomatik Kaydet)
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleLanguageChange}
                disabled={saving}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="tr">🇹🇷 Türkçe</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Zaman Dilimi
              </label>
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="Europe/Istanbul">Istanbul (+03:00)</option>
                <option value="Europe/London">London (+00:00)</option>
                <option value="America/New_York">New York (-05:00)</option>
                <option value="Asia/Tokyo">Tokyo (+09:00)</option>
              </select>
            </div>

            <div>
              <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tarih Formatı
              </label>
              <select
                id="dateFormat"
                name="dateFormat"
                value={formData.dateFormat}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label htmlFor="timeFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Saat Formatı
              </label>
              <select
                id="timeFormat"
                name="timeFormat"
                value={formData.timeFormat}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="24">24 Saat</option>
                <option value="12">12 Saat (AM/PM)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings; 