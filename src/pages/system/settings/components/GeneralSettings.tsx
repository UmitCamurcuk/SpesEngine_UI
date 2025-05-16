import React, { useState, useRef, ChangeEvent } from 'react';
import { useTranslation } from '../../../../context/i18nContext';

const GeneralSettings: React.FC = () => {
  const { t, changeLanguage, currentLanguage, supportedLanguages } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    companyName: 'SpesEngine, Inc.',
    systemTitle: 'SpesEngine MDM',
    language: currentLanguage,
    timezone: 'Europe/Istanbul',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24',
    logoUrl: '',
    logoFile: null as File | null
  });
  const [logoPreview, setLogoPreview] = useState<string>('/logo.png'); // Varsayılan logo

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
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Dil değiştiğinde context'i güncelle
    if (name === 'language') {
      changeLanguage(value);
    }
  };

  // Logo yükleme fonksiyonu
  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setFormData(prev => ({ ...prev, logoFile: file, logoUrl: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Logo URL değişikliği fonksiyonu
  const handleLogoUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, logoUrl: url, logoFile: null }));
    if (url) {
      setLogoPreview(url);
    } else {
      setLogoPreview('/logo.png'); // Varsayılan logo
    }
  };

  // Dosya yükleme alanını açma fonksiyonu
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
        {t('general_settings', 'system')}
      </h2>
      
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
                    (e.target as HTMLImageElement).src = '/logo.png';  // Hata durumunda varsayılan logo
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
            onChange={handleChange}
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
          <label htmlFor="currentLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('current_language', 'common')}
          </label>
          <select
            id="language"
            name="language"
            value={currentLanguage}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {languageOptions[lang as keyof typeof languageOptions]?.flag || ''} {languageOptions[lang as keyof typeof languageOptions]?.name || lang.toUpperCase()}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('language_selection_help', 'system')}
          </p>
        </div>

        {/* Varsayılan Dil */}
        <div>
          <label htmlFor="defaultLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('default_language', 'system')}
          </label>
          <select
            id="defaultLanguage"
            name="defaultLanguage"
            value={formData.language}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
          >
            <option value="tr">Türkçe</option>
            <option value="en">English</option>
          </select>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('default_language_help', 'system')}
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
            <option value="Europe/Istanbul">Europe/Istanbul (GMT+3)</option>
            <option value="Europe/London">Europe/London (GMT+0)</option>
            <option value="America/New_York">America/New_York (GMT-5)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
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
            <option value="DD.MM.YYYY">DD.MM.YYYY (31.12.2023)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2023)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (2023-12-31)</option>
          </select>
        </div>

        {/* Saat Formatı */}
        <div>
          <label htmlFor="timeFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('time_format', 'system')}
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="timeFormat24"
                name="timeFormat"
                value="24"
                checked={formData.timeFormat === '24'}
                onChange={handleChange}
                className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark"
              />
              <label htmlFor="timeFormat24" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                24 {t('hour', 'common')} (14:30)
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="timeFormat12"
                name="timeFormat"
                value="12"
                checked={formData.timeFormat === '12'}
                onChange={handleChange}
                className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark"
              />
              <label htmlFor="timeFormat12" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                12 {t('hour', 'common')} (2:30 PM)
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('system_information', 'system')}
        </h3>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('version', 'system')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                SpesEngine MDM v1.2.5
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('install_date', 'system')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                01.05.2023
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('server_environment', 'system')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                Production
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('last_update', 'system')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                15.10.2023
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings; 