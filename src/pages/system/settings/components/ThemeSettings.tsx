import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../../context/i18nContext';
import systemSettingsService, { ISystemSettings } from '../../../../services/api/systemSettingsService';
import themeService from '../../../../services/themeService';
import { useTheme } from '../../../../context/ThemeContext';
import { toast } from 'react-toastify';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeFormData {
  mode: ThemeMode;
  primaryColor: string;
  accentColor: string;
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
}

const ThemeSettings: React.FC = () => {
  const { t } = useTranslation();
  const { mode, setMode, colors, setColors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ThemeFormData>({
    mode: mode,
    primaryColor: colors.primaryColor,
    accentColor: colors.accentColor,
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
  });

  const [selectedTheme, setSelectedTheme] = useState('default');

  // Ayarları yükle
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settings = await systemSettingsService.getSettings();
        const themeSettings = settings.theme;
        
        const newFormData = {
          mode: themeSettings.mode || mode,
          primaryColor: themeSettings.primaryColor || colors.primaryColor,
          accentColor: themeSettings.accentColor || colors.accentColor,
          enableDarkMode: themeSettings.enableDarkMode,
          defaultDarkMode: themeSettings.defaultDarkMode,
          enableCustomFonts: themeSettings.enableCustomFonts || false,
          customFont: themeSettings.customFont || 'Inter',
          customLogoUrl: themeSettings.customLogoUrl || '',
          enableCustomStyles: themeSettings.enableCustomStyles || false,
          customCSS: themeSettings.customCSS || '',
          showLogo: themeSettings.showLogo || true,
          showUserAvatar: themeSettings.showUserAvatar || true,
          menuStyle: themeSettings.menuStyle || 'side'
        };

        setFormData(newFormData);
        setMode(themeSettings.mode || 'system');
        setColors({
          primaryColor: themeSettings.primaryColor || colors.primaryColor,
          accentColor: themeSettings.accentColor || colors.accentColor
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
          accentColor: name === 'accentColor' ? value : updatedFormData.accentColor
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

      console.log('Kaydedilecek tema ayarları:', formData);

      const themeUpdate: ISystemSettings['theme'] = {
        mode: formData.mode,
        primaryColor: formData.primaryColor,
        accentColor: formData.accentColor,
        enableDarkMode: formData.enableDarkMode,
        defaultDarkMode: formData.defaultDarkMode,
        enableCustomFonts: formData.enableCustomFonts,
        customFont: formData.customFont,
        customLogoUrl: formData.customLogoUrl,
        enableCustomStyles: formData.enableCustomStyles,
        customCSS: formData.customCSS,
        showLogo: formData.showLogo,
        showUserAvatar: formData.showUserAvatar,
        menuStyle: formData.menuStyle
      };

      console.log('Backend\'e gönderilecek veriler:', themeUpdate);
      
      const response = await systemSettingsService.updateSection('theme', themeUpdate);
      console.log('Backend\'den gelen yanıt:', response);

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

  const themePresets = [
    { id: 'default', name: 'SpesEngine Default', primaryColor: '#1f6feb', accentColor: '#f97316' },
    { id: 'greenish', name: 'Nature Green', primaryColor: '#10b981', accentColor: '#6366f1' },
    { id: 'blueish', name: 'Ocean Blue', primaryColor: '#3b82f6', accentColor: '#ec4899' },
    { id: 'redish', name: 'Passionate Red', primaryColor: '#ef4444', accentColor: '#8b5cf6' },
    { id: 'dark', name: 'High Contrast Dark', primaryColor: '#6366f1', accentColor: '#ec4899' }
  ];

  const selectThemePreset = (preset: typeof themePresets[0]) => {
    setSelectedTheme(preset.id);
    const newFormData = {
      ...formData,
      primaryColor: preset.primaryColor,
      accentColor: preset.accentColor
    };
    setFormData(newFormData);
    setColors({
      primaryColor: preset.primaryColor,
      accentColor: preset.accentColor
    });
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
                <option value="system">{t('system_preference', 'system')}</option>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {themePresets.map(preset => (
                <div 
                  key={preset.id}
                  onClick={() => selectThemePreset(preset)}
                  className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                    selectedTheme === preset.id 
                      ? 'border-primary-light dark:border-primary-dark' 
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
                  <div className="flex space-x-2">
                    <div 
                      className="w-6 h-6 rounded-full" 
                      style={{ backgroundColor: preset.primaryColor }}
                    ></div>
                    <div 
                      className="w-6 h-6 rounded-full" 
                      style={{ backgroundColor: preset.accentColor }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
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