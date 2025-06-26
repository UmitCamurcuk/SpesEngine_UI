import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../../context/i18nContext';
import systemSettingsService from '../../../../services/api/systemSettingsService';
import { useNotification } from '../../../../components/notifications';

interface IntegrationFormData {
  // API Entegrasyonları
  enablePublicAPI: boolean;
  apiRateLimit: string;
  
  // Email Servisi
  emailProvider: string;
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  fromEmail: string;
  
  // SSO Entegrasyonu
  ssoProvider: string;
  ssoClientId: string;
  ssoClientSecret: string;
  ssoCallbackUrl: string;
  
  // Slack Entegrasyonu
  slackEnabled: boolean;
  slackWebhookUrl: string;
  slackChannel: string;
  slackUsername: string;
  slackIconEmoji: string;
  slackNotifyOnErrors: boolean;
  slackNotifyOnWarnings: boolean;
  slackNotifyOnSuccess: boolean;
}

const IntegrationSettings: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<IntegrationFormData>({
    // API Entegrasyonları
    enablePublicAPI: false,
    apiRateLimit: '1000',
    
    // Email Servisi
    emailProvider: 'smtp',
    smtpHost: '',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: '',
    
    // SSO Entegrasyonu
    ssoProvider: 'none',
    ssoClientId: '',
    ssoClientSecret: '',
    ssoCallbackUrl: '',
    
    // Slack Entegrasyonu
    slackEnabled: false,
    slackWebhookUrl: '',
    slackChannel: '#general',
    slackUsername: 'SpesEngine Bot',
    slackIconEmoji: ':robot_face:',
    slackNotifyOnErrors: true,
    slackNotifyOnWarnings: false,
    slackNotifyOnSuccess: false,
  });

  // Ayarları yükle
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settings = await systemSettingsService.getSettings();
        
        setFormData({
          enablePublicAPI: settings.integrations.api.enablePublicAPI || false,
          apiRateLimit: (settings.integrations.api.rateLimit || 1000).toString(),
          emailProvider: settings.integrations.email.provider || 'smtp',
          smtpHost: settings.integrations.email.host || '',
          smtpPort: (settings.integrations.email.port || 587).toString(),
          smtpUsername: settings.integrations.email.username || '',
          smtpPassword: settings.integrations.email.password || '',
          fromEmail: settings.integrations.email.fromEmail || '',
          ssoProvider: settings.integrations.sso.provider || 'none',
          ssoClientId: settings.integrations.sso.clientId || '',
          ssoClientSecret: settings.integrations.sso.clientSecret || '',
          ssoCallbackUrl: settings.integrations.sso.callbackUrl || '',
          slackEnabled: settings.integrations.slack?.enabled || false,
          slackWebhookUrl: settings.integrations.slack?.webhookUrl || '',
          slackChannel: settings.integrations.slack?.channel || '#general',
          slackUsername: settings.integrations.slack?.username || 'SpesEngine Bot',
          slackIconEmoji: settings.integrations.slack?.iconEmoji || ':robot_face:',
          slackNotifyOnErrors: settings.integrations.slack?.notifyOnErrors || true,
          slackNotifyOnWarnings: settings.integrations.slack?.notifyOnWarnings || false,
          slackNotifyOnSuccess: settings.integrations.slack?.notifyOnSuccess || false,
        });
      } catch (error) {
        console.error('Entegrasyon ayarları yüklenirken hata:', error);
        showToast({
          type: 'error',
          title: 'Hata',
          message: 'Entegrasyon ayarları yüklenirken bir hata oluştu',
          duration: 5000
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const integrationUpdate = {
        api: {
          enabled: true,
          enablePublicAPI: formData.enablePublicAPI,
          rateLimit: parseInt(formData.apiRateLimit, 10)
        },
        email: {
          provider: formData.emailProvider,
          host: formData.smtpHost,
          port: parseInt(formData.smtpPort, 10),
          username: formData.smtpUsername,
          password: formData.smtpPassword,
          fromEmail: formData.fromEmail,
          senderEmail: formData.fromEmail
        },
        sso: {
          provider: formData.ssoProvider,
          clientId: formData.ssoClientId,
          clientSecret: formData.ssoClientSecret,
          callbackUrl: formData.ssoCallbackUrl
        },
        slack: {
          enabled: formData.slackEnabled,
          webhookUrl: formData.slackWebhookUrl,
          channel: formData.slackChannel,
          username: formData.slackUsername,
          iconEmoji: formData.slackIconEmoji,
          notifyOnErrors: formData.slackNotifyOnErrors,
          notifyOnWarnings: formData.slackNotifyOnWarnings,
          notifyOnSuccess: formData.slackNotifyOnSuccess
        }
      };

      await systemSettingsService.updateSection('integrations', integrationUpdate);
      
      showToast({
        type: 'success',
        title: 'Başarılı',
        message: 'Entegrasyon ayarları başarıyla güncellendi',
        duration: 3000
      });
    } catch (error) {
      console.error('Entegrasyon ayarları güncellenirken hata:', error);
      showToast({
        type: 'error',
        title: 'Hata',
        message: 'Entegrasyon ayarları güncellenirken bir hata oluştu',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const testSlackConnection = async () => {
    if (!formData.slackWebhookUrl) {
      showToast({
        type: 'warning',
        title: 'Uyarı',
        message: 'Slack webhook URL\'si gerekli',
        duration: 3000
      });
      return;
    }

    try {
      // Backend üzerinden test isteği gönder
      const result = await systemSettingsService.testSlackWebhook({
        webhookUrl: formData.slackWebhookUrl,
        channel: formData.slackChannel,
        username: formData.slackUsername,
        iconEmoji: formData.slackIconEmoji
      });

      if (result.success) {
        showToast({
          type: 'success',
          title: 'Başarılı',
          message: result.message || 'Slack bağlantısı başarıyla test edildi!',
          duration: 5000
        });
      } else {
        throw new Error(result.message || 'Slack test başarısız');
      }
    } catch (error: any) {
      console.error('Slack test hatası:', error);
      
      // Backend'den gelen hata mesajını kullan
      const errorMessage = error.response?.data?.message || error.message || 'Slack bağlantısı test edilirken bir hata oluştu';
      
      showToast({
        type: 'error',
        title: 'Hata',
        message: errorMessage,
        duration: 5000
      });
    }
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
          Entegrasyonlar
        </h2>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
        >
          Kaydet
        </button>
      </div>
      
      <div className="space-y-8">
        {/* API Entegrasyonu */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            API Entegrasyonu
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enablePublicAPI"
                name="enablePublicAPI"
                checked={formData.enablePublicAPI}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="enablePublicAPI" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Public API'yi Etkinleştir
              </label>
            </div>
            
            <div>
              <label htmlFor="apiRateLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                API Hız Limiti (İstek/Saat)
              </label>
              <input
                type="number"
                id="apiRateLimit"
                name="apiRateLimit"
                value={formData.apiRateLimit}
                onChange={handleChange}
                min="10"
                max="10000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Slack Entegrasyonu */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Slack Entegrasyonu
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="slackEnabled"
                name="slackEnabled"
                checked={formData.slackEnabled}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="slackEnabled" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Slack Entegrasyonunu Etkinleştir
              </label>
            </div>

            {formData.slackEnabled && (
              <div className="space-y-4 pl-6 border-l-2 border-purple-200 dark:border-purple-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="slackWebhookUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Webhook URL
                    </label>
                    <input
                      type="url"
                      id="slackWebhookUrl"
                      name="slackWebhookUrl"
                      value={formData.slackWebhookUrl}
                      onChange={handleChange}
                      placeholder="https://hooks.slack.com/services/..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="slackChannel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kanal
                    </label>
                    <input
                      type="text"
                      id="slackChannel"
                      name="slackChannel"
                      value={formData.slackChannel}
                      onChange={handleChange}
                      placeholder="#general"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="slackUsername" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kullanıcı Adı
                    </label>
                    <input
                      type="text"
                      id="slackUsername"
                      name="slackUsername"
                      value={formData.slackUsername}
                      onChange={handleChange}
                      placeholder="SpesEngine Bot"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="slackIconEmoji" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      İkon Emoji
                    </label>
                    <input
                      type="text"
                      id="slackIconEmoji"
                      name="slackIconEmoji"
                      value={formData.slackIconEmoji}
                      onChange={handleChange}
                      placeholder=":robot_face:"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bildirim Ayarları</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="slackNotifyOnErrors"
                        name="slackNotifyOnErrors"
                        checked={formData.slackNotifyOnErrors}
                        onChange={handleChange}
                        className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                      />
                      <label htmlFor="slackNotifyOnErrors" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Hata bildirimleri
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="slackNotifyOnWarnings"
                        name="slackNotifyOnWarnings"
                        checked={formData.slackNotifyOnWarnings}
                        onChange={handleChange}
                        className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                      />
                      <label htmlFor="slackNotifyOnWarnings" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Uyarı bildirimleri
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="slackNotifyOnSuccess"
                        name="slackNotifyOnSuccess"
                        checked={formData.slackNotifyOnSuccess}
                        onChange={handleChange}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <label htmlFor="slackNotifyOnSuccess" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Başarı bildirimleri
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={testSlackConnection}
                    disabled={!formData.slackWebhookUrl}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Bağlantıyı Test Et
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Email Entegrasyonu */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email Entegrasyonu
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                SMTP Host
              </label>
              <input
                type="text"
                id="smtpHost"
                name="smtpHost"
                value={formData.smtpHost}
                onChange={handleChange}
                placeholder="smtp.gmail.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                SMTP Port
              </label>
              <input
                type="number"
                id="smtpPort"
                name="smtpPort"
                value={formData.smtpPort}
                onChange={handleChange}
                placeholder="587"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="smtpUsername" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                id="smtpUsername"
                name="smtpUsername"
                value={formData.smtpUsername}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Şifre
              </label>
              <input
                type="password"
                id="smtpPassword"
                name="smtpPassword"
                value={formData.smtpPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gönderici Email
              </label>
              <input
                type="email"
                id="fromEmail"
                name="fromEmail"
                value={formData.fromEmail}
                onChange={handleChange}
                placeholder="noreply@spesengine.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationSettings; 