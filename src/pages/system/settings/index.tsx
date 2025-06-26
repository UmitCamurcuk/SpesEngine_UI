import React, { useState, useRef } from 'react';
import { useTranslation } from '../../../context/i18nContext';
import { useNotification } from '../../../components/notifications';
import GeneralSettings from './components/GeneralSettings';
import SecuritySettings from './components/SecuritySettings';
import BackupSettings from './components/BackupSettings';
import IntegrationSettings from './components/IntegrationSettings';
import NotificationSettings from './components/NotificationSettings';
import ThemeSettings from './components/ThemeSettings';
import LicenseSettings from './components/LicenseSettings';

// Ayar grupları
type SettingTab = {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.ReactNode;
};

const SystemSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<string>('general');
  const [loading, setLoading] = useState(false);

  // Tab tanımları
  const tabs: SettingTab[] = [
    {
      id: 'general',
      name: t('general_settings', 'system'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      component: <GeneralSettings />
    },
    {
      id: 'security',
      name: t('security_settings', 'system'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      component: <SecuritySettings />
    },
    {
      id: 'backup',
      name: t('backup_restore', 'system'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
      ),
      component: <BackupSettings />
    },
    {
      id: 'integration',
      name: t('integrations', 'system'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      component: <IntegrationSettings />
    },
    {
      id: 'notifications',
      name: t('notifications', 'system'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      component: <NotificationSettings />
    },
    {
      id: 'theme',
      name: t('appearance_themes', 'system'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      component: <ThemeSettings />
    },
    {
      id: 'license',
      name: t('license_info', 'system'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      component: <LicenseSettings />
    }
  ];

  // Aktif tab'ı değiştirme fonksiyonu
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Tüm ayarları kaydet
  const handleSaveAll = async () => {
    try {
      setLoading(true);
      // Her bir bileşenin kendi kaydetme fonksiyonunu çağır
      //const settings = await systemSettingsService.getSettings();
      // await systemSettingsService.updateSettings(settings);
      showToast({
        type: 'success',
        title: 'Başarılı',
        message: 'Ayarlar başarıyla kaydedildi',
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
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Başlık */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <svg className="w-7 h-7 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {t('system_settings', 'system')}
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {t('system_settings_description', 'system')}
        </p>
      </div>

      {/* Ana İçerik */}
      <div className="flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* Dikey Tab Menüsü */}
        <div className="w-full md:w-1/4 bg-gray-50 dark:bg-gray-900">
          <nav className="p-4">
            <ul className="space-y-2">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-light/10 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="flex-shrink-0 mr-3">{tab.icon}</span>
                    <span className="font-medium">{tab.name}</span>
                    {activeTab === tab.id && (
                      <span className="ml-auto">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Aktif Tab İçeriği */}
        <div className="w-full md:w-3/4 p-6">
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>

     
    </div>
  );
};

export default SystemSettingsPage; 