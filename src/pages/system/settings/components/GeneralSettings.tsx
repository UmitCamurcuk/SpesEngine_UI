import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useTranslation } from '../../../../context/i18nContext';
import systemSettingsService, { ISystemSettings } from '../../../../services/api/systemSettingsService';
import { toast } from 'react-toastify';

interface GeneralFormData {
  companyName: string;
  systemTitle: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  logoUrl: string;
  logoFile: File | null;
}

const defaultFormData: GeneralFormData = {
  companyName: '',
  systemTitle: '',
  language: 'tr', // Varsayılan dil
  timezone: 'Europe/Istanbul',
  dateFormat: 'DD.MM.YYYY',
  timeFormat: '24',
  logoUrl: '',
  logoFile: null
};

const GeneralSettings: React.FC = () => {
  const { t, changeLanguage, currentLanguage, supportedLanguages } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState<GeneralFormData>(defaultFormData);
  const [logoPreview, setLogoPreview] = useState<string>('/logo.png');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentFormData = useRef<GeneralFormData>(defaultFormData);

  // Form verilerini güncelleme fonksiyonu
  const updateFormData = (newData: Partial<GeneralFormData>) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        ...newData
      };
      currentFormData.current = updated;
      return updated;
    });
  };

  // Ayarları yükle
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const settings = await systemSettingsService.getSettings();
        
        console.log('Backend\'den gelen ayarlar:', settings);

        if (!settings) {
          throw new Error('Ayarlar yüklenemedi');
        }

        // Yeni form verilerini hazırla
        const newFormData = {
          companyName: settings.companyName || '',
          systemTitle: settings.systemTitle || '',
          language: settings.defaultLanguage || currentLanguage,
          timezone: settings.timezone || 'Europe/Istanbul',
          dateFormat: settings.dateFormat || 'DD.MM.YYYY',
          timeFormat: settings.timeFormat || '24',
          logoUrl: settings.logoUrl || '',
          logoFile: null
        };

        console.log('Form verileri yükleniyor:', newFormData);

        // State ve ref'i güncelle
        setFormData(newFormData);
        currentFormData.current = newFormData;

        if (settings.logoUrl) {
          setLogoPreview(settings.logoUrl);
        }
      } catch (error) {
        console.error('Ayarlar yüklenirken hata:', error);
        const errorMessage = error instanceof Error ? error.message : 'Ayarlar yüklenirken bir hata oluştu';
        setError(errorMessage);
        toast.error(t('settings_load_error', 'system'));
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [currentLanguage]);

  // Dil kodlarına göre bayrak ve isim eşleştirmesi
  const languageOptions = {
    tr: {
      name: 'Türkçe',
      flag: '🇹🇷'
    },
    en: {
      name: 'English',
      flag: '🇬🇧'
    },
    de: {
      name: 'Deutsch',
      flag: '🇩🇪'
    },
    fr: {
      name: 'Français',
      flag: '🇫🇷'
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log('Input değişikliği:', { name, value });

    // Form verilerini güncelle
    const newFormData = {
      ...currentFormData.current,
      [name]: value
    };
    
    console.log('Yeni form verileri:', newFormData);
    
    // State ve ref'i güncelle
    setFormData(newFormData);
    currentFormData.current = newFormData;

    // Dil değişikliği için ayrı işlem
    if (name === 'language') {
      handleLanguageChange(value);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    console.log('handleSave fonksiyonu çağrıldı');
    
    try {
      if (e) {
        e.preventDefault();
        console.log('Form submit engellendi');
      }

      console.log('Mevcut form verileri:', formData);
      console.log('Ref\'teki veriler:', currentFormData.current);

      setLoading(true);
      setError(null);

      const settingsUpdate = {
        companyName: formData.companyName.trim(),
        systemTitle: formData.systemTitle.trim(),
        defaultLanguage: formData.language,
        timezone: formData.timezone,
        dateFormat: formData.dateFormat,
        timeFormat: formData.timeFormat,
        logoUrl: formData.logoUrl
      };

      console.log('Backend\'e gönderilecek veriler:', settingsUpdate);

      try {
        const response = await systemSettingsService.updateSection('general', settingsUpdate);
        console.log('Backend\'den gelen yanıt:', response);

        if (response) {
          const updatedFormData = {
            ...formData,
            companyName: response.companyName || formData.companyName,
            systemTitle: response.systemTitle || formData.systemTitle,
            language: response.defaultLanguage || formData.language,
            timezone: response.timezone || formData.timezone,
            dateFormat: response.dateFormat || formData.dateFormat,
            timeFormat: response.timeFormat || formData.timeFormat,
            logoUrl: response.logoUrl || formData.logoUrl
          };

          setFormData(updatedFormData);
          currentFormData.current = updatedFormData;
          console.log('Form verileri güncellendi:', updatedFormData);
        }

        toast.success(t('settings_saved', 'system'));
      } catch (error) {
        console.error('API hatası:', error);
        throw error;
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ayarlar kaydedilirken bir hata oluştu';
      setError(errorMessage);
      toast.error(t('settings_save_error', 'system'));
    } finally {
      setLoading(false);
    }
  };

  // Dil değişikliği için ayrı fonksiyon
  const handleLanguageChange = async (value: string) => {
    try {
      setLoading(true);

      // Önce form state'ini güncelle
      setFormData(prev => ({
        ...prev,
        language: value
      }));

      // Dil değişikliğini uygula
      changeLanguage(value);

      // Backend'e kaydet
      const settingsUpdate: Partial<ISystemSettings> = {
        defaultLanguage: value
      };

      const response = await systemSettingsService.updateSection('general', settingsUpdate);

      toast.success(t('language_updated', 'system'));
    } catch (error) {
      console.error('Dil güncellenirken hata:', error);
      toast.error(t('update_error', 'system'));
    } finally {
      setLoading(false);
    }
  };

  // Logo yükleme fonksiyonu
  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result as string);
          setFormData(prev => ({ ...prev, logoFile: file, logoUrl: '' }));
        };
        reader.readAsDataURL(file);

        // TODO: Logo dosyasını bir CDN'e yükle ve URL'i al
        const logoUrl = '/uploaded-logo.png'; // Bu kısım CDN entegrasyonu ile değiştirilecek

        // Logo URL'ini güncelle
        await systemSettingsService.updateSection('theme', { customLogoUrl: logoUrl });
        toast.success(t('logo_updated', 'system'));
      } catch (error) {
        console.error('Logo yüklenirken hata:', error);
        toast.error(t('logo_upload_error', 'system'));
      }
    }
  };

  // Logo URL değişikliği fonksiyonu
  const handleLogoUrlChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    try {
      setFormData(prev => ({ ...prev, logoUrl: url, logoFile: null }));

      if (url) {
        setLogoPreview(url);
        await systemSettingsService.updateSection('theme', { customLogoUrl: url });
        toast.success(t('logo_updated', 'system'));
      } else {
        setLogoPreview('/logo.png');
      }
    } catch (error) {
      console.error('Logo URL güncellenirken hata:', error);
      toast.error(t('logo_update_error', 'system'));
    }
  };

  // Dosya yükleme alanını açma fonksiyonu
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light dark:border-primary-dark"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className="text-red-500 dark:text-red-400 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium">{t('error_occurred', 'system')}</h3>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-lg hover:bg-primary-light/90 dark:hover:bg-primary-dark/90"
        >
          {t('try_again', 'system')}
        </button>
      </div>
    );
  }

  return (
    <form 
      ref={formRef} 
      onSubmit={(e) => {
        console.log('Form submit edildi');
        handleSave(e);
      }} 
      className="space-y-6"
    >
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white">
          {t('general_settings', 'system')}
        </h2>
        <button
          type="submit"
          disabled={loading}
          onClick={() => console.log('Kaydet butonuna tıklandı')}
          className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-lg hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('saving', 'common') : t('save', 'common')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo Ayarları */}
        <div className="md:col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('logo_settings', 'system')}
          </h3>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo Önizleme */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="w-40 h-40 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex items-center justify-center bg-white">
                <img
                  src={logoPreview}
                  alt={t('company_logo', 'system')}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                />
              </div>
              <button
                type="button"
                onClick={triggerFileInput}
                className="mt-3 px-3 py-1.5 bg-primary-light dark:bg-primary-dark text-white text-sm rounded hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
              >
                {t('upload_logo', 'system')}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleLogoUpload}
              />
            </div>

            {/* Logo URL */}
            <div className="flex-grow">
              <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('logo_url', 'system')}
              </label>
              <input
                type="text"
                id="logoUrl"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleLogoUrlChange}
                placeholder="https://example.com/logo.png"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('logo_help', 'system')}
              </p>
              <div className="mt-3">
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">
                  {t('logo_requirements', 'system')}:
                </p>
                <ul className="text-sm text-gray-500 dark:text-gray-400 list-disc list-inside">
                  <li>{t('logo_size_recommendation', 'system')}</li>
                  <li>{t('logo_format_support', 'system')}</li>
                  <li>{t('logo_transparent_recommendation', 'system')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Şirket Adı */}
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('company_name', 'system')}
          </label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={(e) => {
              console.log('Şirket adı değişti:', e.target.value);
              handleChange(e);
            }}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('company_name_help', 'system')}
          </p>
        </div>

        {/* Sistem Başlığı */}
        <div>
          <label htmlFor="systemTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('system_title', 'system')}
          </label>
          <input
            type="text"
            id="systemTitle"
            name="systemTitle"
            value={formData.systemTitle}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('system_title_help', 'system')}
          </p>
        </div>

        {/* Mevcut Dil */}
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('current_language', 'common')}
          </label>
          <select
            id="language"
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {languageOptions[lang as keyof typeof languageOptions]?.flag} {languageOptions[lang as keyof typeof languageOptions]?.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('language_selection_help', 'system')}
          </p>
        </div>

        {/* Zaman Dilimi */}
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('timezone', 'system')}
          </label>
          <select
            id="timezone"
            name="timezone"
            value={formData.timezone}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
          >
            <option value="Europe/Istanbul">Europe/Istanbul (UTC+3)</option>
            <option value="Europe/London">Europe/London (UTC+0/+1)</option>
            <option value="America/New_York">America/New_York (UTC-5/-4)</option>
            {/* Diğer zaman dilimleri eklenebilir */}
          </select>
        </div>

        {/* Tarih Formatı */}
        <div>
          <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('date_format', 'system')}
          </label>
          <select
            id="dateFormat"
            name="dateFormat"
            value={formData.dateFormat}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
          >
            <option value="DD.MM.YYYY">31.12.2023</option>
            <option value="MM/DD/YYYY">12/31/2023</option>
            <option value="YYYY-MM-DD">2023-12-31</option>
          </select>
        </div>

        {/* Saat Formatı */}
        <div>
          <label htmlFor="timeFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('time_format', 'system')}
          </label>
          <select
            id="timeFormat"
            name="timeFormat"
            value={formData.timeFormat}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
          >
            <option value="24">24 {t('hour', 'common')} (14:30)</option>
            <option value="12">12 {t('hour', 'common')} (2:30 PM)</option>
          </select>
        </div>
      </div>
    </form>
  );
};

export default GeneralSettings; 