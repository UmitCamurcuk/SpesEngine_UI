import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../../context/i18nContext';
import systemSettingsService, { ISystemSettings } from '../../../../services/api/systemSettingsService';
import themeService from '../../../../services/themeService';
import { useTheme } from '../../../../context/ThemeContext';
import { toast } from 'react-toastify';

// Tema modu tipi - system ve custom değerlerini de ekle
type ThemeMode = 'light' | 'dark' | 'system' | 'custom';

interface ThemeFormData {
  mode: ThemeMode;
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
  themeName: string;
}

// Tema presetleri tanımı
const themePresets = [
  { id: 'default', name: 'SpesEngine Default', primaryColor: '#1f6feb', accentColor: '#f97316', backgroundColor: '#ffffff' },
  { id: 'greenish', name: 'Nature Green', primaryColor: '#10b981', accentColor: '#6366f1', backgroundColor: '#f0fdf4' },
  { id: 'blueish', name: 'Ocean Blue', primaryColor: '#3b82f6', accentColor: '#ec4899', backgroundColor: '#eff6ff' },
  { id: 'redish', name: 'Passionate Red', primaryColor: '#ef4444', accentColor: '#8b5cf6', backgroundColor: '#fef2f2' },
  { id: 'dark', name: 'High Contrast Dark', primaryColor: '#6366f1', accentColor: '#ec4899', backgroundColor: '#f5f3ff' },
  { id: 'emerald', name: 'Emerald Gold', primaryColor: '#059669', accentColor: '#fbbf24', backgroundColor: '#ecfdf5' },
  { id: 'purple', name: 'Royal Purple', primaryColor: '#7c3aed', accentColor: '#fb923c', backgroundColor: '#f5f3ff' },
  { id: 'navy', name: 'Navy Coral', primaryColor: '#1e3a8a', accentColor: '#f43f5e', backgroundColor: '#eef2ff' },
  { id: 'teal', name: 'Teal Rose', primaryColor: '#0d9488', accentColor: '#e11d48', backgroundColor: '#f0fdfa' },
  { id: 'slate', name: 'Slate Orange', primaryColor: '#475569', accentColor: '#f97316', backgroundColor: '#f8fafc' }
];

const ThemeSettings: React.FC = () => {
  const { t } = useTranslation();
  const { mode, setMode, colors, setColors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ThemeFormData>({
    mode: mode,
    primaryColor: colors.primaryColor,
    accentColor: colors.accentColor,
    backgroundColor: colors.backgroundColor || '#ffffff',
    enableDarkMode: true,
    defaultDarkMode: false,
    enableCustomFonts: false,
    customFont: 'Inter',
    customLogoUrl: '',
    enableCustomStyles: false,
    customCSS: '',
    showLogo: true,
    showUserAvatar: true,
    menuStyle: 'side',
    themeName: colors.themeName || 'default'
  });

  const [selectedTheme, setSelectedTheme] = useState(colors.themeName || 'default');

  // Ayarları yükle
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settings = await systemSettingsService.getSettings();
        
        if (!settings || !settings.theme) {
          throw new Error('Tema ayarları bulunamadı');
        }
        
        const themeSettings = settings.theme;
        
        const newFormData = {
          mode: themeSettings.mode || mode,
          primaryColor: themeSettings.primaryColor || colors.primaryColor,
          accentColor: themeSettings.accentColor || colors.accentColor,
          backgroundColor: themeSettings.backgroundColor || '#ffffff',
          enableDarkMode: themeSettings.enableDarkMode !== undefined ? themeSettings.enableDarkMode : true,
          defaultDarkMode: themeSettings.defaultDarkMode !== undefined ? themeSettings.defaultDarkMode : false,
          enableCustomFonts: themeSettings.enableCustomFonts !== undefined ? themeSettings.enableCustomFonts : false,
          customFont: themeSettings.customFont || 'Inter',
          customLogoUrl: themeSettings.customLogoUrl || '',
          enableCustomStyles: themeSettings.enableCustomStyles !== undefined ? themeSettings.enableCustomStyles : false,
          customCSS: themeSettings.customCSS || '',
          showLogo: themeSettings.showLogo !== undefined ? themeSettings.showLogo : true,
          showUserAvatar: themeSettings.showUserAvatar !== undefined ? themeSettings.showUserAvatar : true,
          menuStyle: themeSettings.menuStyle || 'side',
          themeName: themeSettings.themeName || 'default'
        };

        setFormData(newFormData);
        setMode(themeSettings.mode || 'system');
        setColors({
          primaryColor: themeSettings.primaryColor || colors.primaryColor,
          accentColor: themeSettings.accentColor || colors.accentColor,
          backgroundColor: themeSettings.backgroundColor || colors.backgroundColor,
          themeName: themeSettings.themeName || 'default'
        });

        // Tema presetini bul
        const preset = themePresets.find(p => 
          p.primaryColor === themeSettings.primaryColor && 
          p.accentColor === themeSettings.accentColor
        );
        if (preset) {
          setSelectedTheme(preset.id);
        }
      } catch (error) {
        console.error('Tema ayarları yüklenirken hata:', error);
        toast.error(t('theme_settings_load_error', 'system'));
        setError('Tema ayarları yüklenemedi. Lütfen daha sonra tekrar deneyiniz.');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    const updatedFormData = { ...formData, [name]: newValue };
    setFormData(updatedFormData);

    // Renk veya mod değişikliklerini anında uygula
    if (['primaryColor', 'accentColor', 'mode', 'enableDarkMode', 'defaultDarkMode'].includes(name)) {
      if (name === 'mode') {
        setMode(value as ThemeMode);
      }
      
      if (name === 'primaryColor' || name === 'accentColor') {
        setColors({
          primaryColor: name === 'primaryColor' ? value : updatedFormData.primaryColor,
          accentColor: name === 'accentColor' ? value : updatedFormData.accentColor,
          backgroundColor: updatedFormData.backgroundColor
        });
      }
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    try {
      setLoading(true);
      setError(null);


      const themeUpdate: ISystemSettings['theme'] = {
        mode: formData.mode,
        primaryColor: formData.primaryColor,
        accentColor: formData.accentColor,
        backgroundColor: formData.backgroundColor,
        enableDarkMode: formData.enableDarkMode,
        defaultDarkMode: formData.defaultDarkMode,
        enableCustomFonts: formData.enableCustomFonts,
        customFont: formData.customFont,
        customLogoUrl: formData.customLogoUrl,
        enableCustomStyles: formData.enableCustomStyles,
        customCSS: formData.customCSS,
        showLogo: formData.showLogo,
        showUserAvatar: formData.showUserAvatar,
        menuStyle: formData.menuStyle,
        themeName: selectedTheme
      };

      
      // API çağrısından önce verinin tüm alanlarını kontrol et
      Object.keys(themeUpdate).forEach((key) => {
        const k = key as keyof typeof themeUpdate;
        if (themeUpdate[k] === undefined) {
          console.warn(`Uyarı: ${key} alanı undefined değerine sahip`);
        }
      });
      
      const response = await systemSettingsService.updateSection('theme', themeUpdate);

      // Başarılı yanıt durumunda localStorage'a da kaydet
      if (response.success) {
        const updatedSettings = {
          theme: {
            ...themeUpdate
          }
        };
        localStorage.setItem('themeSettings', JSON.stringify(updatedSettings));
      }

      toast.success(t('settings_saved', 'system'));
    } catch (error) {
      console.error('Tema ayarları kaydedilirken hata:', error);
      const errorMessage = error instanceof Error ? error.message : 'Tema ayarları kaydedilirken bir hata oluştu';
      setError(errorMessage);
      toast.error(t('settings_save_error', 'system'));
    } finally {
      setLoading(false);
    }
  };

  const selectThemePreset = (preset: typeof themePresets[0]) => {
    setSelectedTheme(preset.id);
    const newFormData = {
      ...formData,
      primaryColor: preset.primaryColor,
      accentColor: preset.accentColor,
      backgroundColor: preset.backgroundColor,
      themeName: preset.id
    };
    setFormData(newFormData);
    
    // Renkleri güncelle ama modu değiştirme
    setColors({
      primaryColor: preset.primaryColor,
      accentColor: preset.accentColor,
      backgroundColor: preset.backgroundColor,
      themeName: preset.id
    });
    
    // Tema servisine bildir
    themeService.applyTheme({
      mode: formData.mode, // Mevcut modunu koru
      primaryColor: preset.primaryColor,
      accentColor: preset.accentColor,
      backgroundColor: preset.backgroundColor,
      themeName: preset.id
    });
    
    // Arkaplan rengini CSS değişkenlerine uygula
    document.documentElement.style.setProperty('--background-hover', preset.backgroundColor);
    document.documentElement.style.setProperty('--theme-background', preset.backgroundColor);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light dark:border-primary-dark"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white">
          {t('appearance_themes', 'system')}
        </h2>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-lg hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('saving', 'common') : t('save', 'common')}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-8">
        {/* Tema Ayarları */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('theme_settings', 'system')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="mode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('color_mode', 'system')}
              </label>
              <select
                id="mode"
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
              >
                <option value="light">{t('light_mode', 'system')}</option>
                <option value="dark">{t('dark_mode', 'system')}</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableDarkMode"
                  name="enableDarkMode"
                  checked={formData.enableDarkMode}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded"
                />
                <label htmlFor="enableDarkMode" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('enable_dark_mode_switch', 'system')}
                </label>
              </div>
              
              {formData.enableDarkMode && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="defaultDarkMode"
                    name="defaultDarkMode"
                    checked={formData.defaultDarkMode}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded"
                  />
                  <label htmlFor="defaultDarkMode" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('default_to_dark_mode', 'system')}
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Renk Şemaları */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('color_scheme', 'system')}
          </h3>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('color_scheme_description', 'Seçtiğiniz renk şeması, tüm uygulama genelinde butonlar, navigasyon, kartlar, grafikler, veri tabloları ve daha fazlasına uygulanır.')}
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {t('dark_mode_note', 'Not: Seçtiğiniz tema rengi, karanlık mod görünümünü de otomatik olarak etkiler. Daha koyu temalar (navy, slate) seçerseniz, karanlık mod daha yüksek kontrasta sahip olacaktır.')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {themePresets.map(preset => (
                <div 
                  key={preset.id}
                  onClick={() => selectThemePreset(preset)}
                  className={`cursor-pointer p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                    selectedTheme === preset.id 
                      ? 'border-primary-light dark:border-primary-dark shadow-sm' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center mb-3">
                    {selectedTheme === preset.id && (
                      <svg className="w-4 h-4 mr-1.5 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{preset.name}</span>
                  </div>
                  <div className="rounded-md p-2 mb-2" style={{ backgroundColor: preset.backgroundColor }}>
                    <div className="flex space-x-2 mb-2">
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-200" 
                        style={{ backgroundColor: preset.primaryColor }}
                        title="Ana Renk"
                      ></div>
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-200" 
                        style={{ backgroundColor: preset.accentColor }}
                        title="Aksan Renk"
                      ></div>
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-200" 
                        style={{ backgroundColor: preset.backgroundColor }}
                        title="Arkaplan Rengi"
                      ></div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <div className="text-xs px-2 py-1 rounded" style={{ backgroundColor: preset.primaryColor, color: '#fff' }}>Buton</div>
                      <div className="text-xs px-2 py-1 rounded" style={{ backgroundColor: preset.accentColor, color: '#fff' }}>Vurgu</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                {t('theme_application_areas', 'Tema Renkleri Şu Alanlarda Kullanılır:')}
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('buttons_links', 'Butonlar ve Bağlantılar')}
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('navigation', 'Navigasyon Menüsü')}
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('form_elements', 'Form Elemanları')}
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('tables_data', 'Tablolar ve Veri Görünümleri')}
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('charts_graphs', 'Grafikler ve Çizelgeler')}
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('cards_panels', 'Kartlar ve Paneller')}
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('notifications', 'Bildirimler')}
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('progress_indicators', 'İlerleme Göstergeleri')}
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('icons_badges', 'Simgeler ve Rozetler')}
                </li>
              </ul>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div>
                <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('primary_color', 'system')}
                </label>
                <div className="flex">
                  <input
                    type="color"
                    id="primaryColor"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="h-10 w-10 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    name="primaryColor"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-r-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t('primary_color_help', 'Ana renk, butonlar, bağlantılar ve vurgu elemanlarında kullanılır')}
                </p>
              </div>
              
              <div>
                <label htmlFor="accentColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('accent_color', 'system')}
                </label>
                <div className="flex">
                  <input
                    type="color"
                    id="accentColor"
                    name="accentColor"
                    value={formData.accentColor}
                    onChange={handleChange}
                    className="h-10 w-10 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                  />
                  <input
                    type="text"
                    value={formData.accentColor}
                    onChange={handleChange}
                    name="accentColor"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t('accent_color_help', 'Aksan renk, ikincil vurgular, önemli bilgiler ve alternatif etkileşimler için kullanılır')}
                </p>
              </div>
              
              <div>
                <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('background_color', 'Arkaplan Rengi')}
                </label>
                <div className="flex">
                  <input
                    type="color"
                    id="backgroundColor"
                    name="backgroundColor"
                    value={formData.backgroundColor}
                    onChange={handleChange}
                    className="h-10 w-10 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
                  />
                  <input
                    type="text"
                    value={formData.backgroundColor}
                    onChange={handleChange}
                    name="backgroundColor"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t('background_color_help', '"Custom" mod seçildiğinde uygulamanın arkaplan rengi olarak kullanılır')}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Menü Düzeni */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('layout_settings', 'system')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="menuStyle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('menu_style', 'system')}
              </label>
              <select
                id="menuStyle"
                name="menuStyle"
                value={formData.menuStyle}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
              >
                <option value="side">{t('side_menu', 'system')}</option>
                <option value="top">{t('top_menu', 'system')}</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showLogo"
                  name="showLogo"
                  checked={formData.showLogo}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded"
                />
                <label htmlFor="showLogo" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('show_logo', 'system')}
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showUserAvatar"
                  name="showUserAvatar"
                  checked={formData.showUserAvatar}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded"
                />
                <label htmlFor="showUserAvatar" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('show_user_avatar', 'system')}
                </label>
              </div>
            </div>
            
            {formData.showLogo && (
              <div className="col-span-1 md:col-span-2">
                <label htmlFor="customLogoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('custom_logo_url', 'system')}
                </label>
                <input
                  type="text"
                  id="customLogoUrl"
                  name="customLogoUrl"
                  value={formData.customLogoUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t('custom_logo_help', 'system')}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Gelişmiş Özelleştirme */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('advanced_customization', 'system')}
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableCustomFonts"
                name="enableCustomFonts"
                checked={formData.enableCustomFonts}
                onChange={handleChange}
                className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded"
              />
              <label htmlFor="enableCustomFonts" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('enable_custom_fonts', 'system')}
              </label>
            </div>
            
            {formData.enableCustomFonts && (
              <div>
                <select
                  id="customFont"
                  name="customFont"
                  value={formData.customFont}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Montserrat">Montserrat</option>
                </select>
              </div>
            )}
            
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="enableCustomStyles"
                name="enableCustomStyles"
                checked={formData.enableCustomStyles}
                onChange={handleChange}
                className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded"
              />
              <label htmlFor="enableCustomStyles" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('enable_custom_css', 'system')}
              </label>
            </div>
            
            {formData.enableCustomStyles && (
              <div>
                <textarea
                  id="customCSS"
                  name="customCSS"
                  value={formData.customCSS}
                  onChange={handleChange}
                  rows={5}
                  placeholder="/* Custom CSS */\n.header { background-color: #f0f0f0; }"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark font-mono"
                ></textarea>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t('custom_css_help', 'system')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

export default ThemeSettings; 