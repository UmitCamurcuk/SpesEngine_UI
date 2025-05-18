import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../../context/i18nContext';
import systemSettingsService, { ISystemSettings } from '../../../../services/api/systemSettingsService';
import { toast } from 'react-toastify';

interface IntegrationFormData {
  // API Entegrasyonları
  enablePublicAPI: boolean;
  apiRateLimit: string;
  
  // ERP Entegrasyonu
  erpIntegration: string;
  erpHost: string;
  erpUsername: string;
  erpPassword: string;
  
  // Analytics Entegrasyonu
  enableAnalytics: boolean;
  analyticsProvider: string;
  analyticsTrackingID: string;
  
  // Email Servisi
  emailProvider: string;
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  senderEmail: string;
  
  // SSO Entegrasyonu
  ssoProvider: string;
}

const IntegrationSettings: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<IntegrationFormData>({
    // API Entegrasyonları
    enablePublicAPI: true,
    apiRateLimit: '1000',
    
    // ERP Entegrasyonu
    erpIntegration: 'none',
    erpHost: '',
    erpUsername: '',
    erpPassword: '',
    
    // Analytics Entegrasyonu
    enableAnalytics: false,
    analyticsProvider: 'google',
    analyticsTrackingID: '',
    
    // Email Servisi
    emailProvider: 'smtp',
    smtpHost: '',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    senderEmail: '',
    
    // SSO Entegrasyonu
    ssoProvider: 'none',
  });

  // Ayarları yükle
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settings = await systemSettingsService.getSettings();
        
        setFormData({
          enablePublicAPI: settings.integrations.api.enabled,
          apiRateLimit: settings.integrations.api.rateLimit.toString(),
          erpIntegration: settings.integrations.erp?.integration ?? 'none',
          erpHost: settings.integrations.erp?.host ?? '',
          erpUsername: settings.integrations.erp?.username ?? '',
          erpPassword: settings.integrations.erp?.password ?? '',
          enableAnalytics: settings.integrations.analytics?.enabled ?? false,
          analyticsProvider: settings.integrations.analytics?.provider ?? 'google',
          analyticsTrackingID: settings.integrations.analytics?.trackingId ?? '',
          emailProvider: settings.integrations.email.provider,
          smtpHost: settings.integrations.email.smtpHost ?? '',
          smtpPort: (settings.integrations.email.smtpPort ?? 587).toString(),
          smtpUsername: settings.integrations.email.smtpUsername ?? '',
          smtpPassword: settings.integrations.email.smtpPassword ?? '',
          senderEmail: settings.integrations.email.senderEmail,
          ssoProvider: settings.integrations.sso.provider
        });
      } catch (error) {
        console.error('Entegrasyon ayarları yüklenirken hata:', error);
        toast.error(t('integration_settings_load_error', 'system'));
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    const updatedFormData = { ...formData, [name]: newValue };
    setFormData(updatedFormData);

    try {
      const integrationUpdate: Partial<ISystemSettings['integrations']> = {
        api: {
          enabled: updatedFormData.enablePublicAPI,
          rateLimit: parseInt(updatedFormData.apiRateLimit, 10)
        },
        erp: {
          integration: updatedFormData.erpIntegration,
          host: updatedFormData.erpHost,
          username: updatedFormData.erpUsername,
          password: updatedFormData.erpPassword
        },
        analytics: {
          enabled: updatedFormData.enableAnalytics,
          provider: updatedFormData.analyticsProvider,
          trackingId: updatedFormData.analyticsTrackingID
        },
        email: {
          provider: updatedFormData.emailProvider,
          smtpHost: updatedFormData.smtpHost,
          smtpPort: parseInt(updatedFormData.smtpPort, 10),
          smtpUsername: updatedFormData.smtpUsername,
          smtpPassword: updatedFormData.smtpPassword,
          senderEmail: updatedFormData.senderEmail
        },
        sso: {
          provider: updatedFormData.ssoProvider
        }
      };

      await systemSettingsService.updateSection('integrations', integrationUpdate);
      toast.success(t('integration_setting_updated', 'system'));
    } catch (error) {
      console.error('Entegrasyon ayarı güncellenirken hata:', error);
      toast.error(t('integration_setting_update_error', 'system'));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
        {t('integrations', 'system')}
      </h2>
      
      <div className="space-y-8">
        {/* API Entegrasyonu */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('api_integration', 'system')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enablePublicAPI"
                name="enablePublicAPI"
                checked={formData.enablePublicAPI}
                onChange={handleChange}
                className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded"
              />
              <label htmlFor="enablePublicAPI" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('enable_public_api', 'system')}
              </label>
            </div>
            
            <div>
              <label htmlFor="apiRateLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('api_rate_limit', 'system')} ({t('requests_per_hour', 'system')})
              </label>
              <input
                type="number"
                id="apiRateLimit"
                name="apiRateLimit"
                value={formData.apiRateLimit}
                onChange={handleChange}
                min="10"
                max="10000"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
              />
            </div>
          </div>
          
          {formData.enablePublicAPI && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-400">
              <h4 className="font-medium mb-2 flex items-center">
                <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('api_keys', 'system')}
              </h4>
              <p className="text-sm mb-3">
                {t('api_keys_info', 'system')}
              </p>
              <button 
                type="button"
                className="text-sm bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
              >
                {t('manage_api_keys', 'system')}
              </button>
            </div>
          )}
        </div>
        
        {/* ERP Entegrasyonu */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('erp_integration', 'system')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="erpIntegration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('erp_system', 'system')}
              </label>
              <select
                id="erpIntegration"
                name="erpIntegration"
                value={formData.erpIntegration}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
              >
                <option value="none">{t('none', 'common')}</option>
                <option value="sap">SAP</option>
                <option value="oracle">Oracle ERP</option>
                <option value="microsoft">Microsoft Dynamics</option>
                <option value="custom">{t('custom', 'system')}</option>
              </select>
            </div>
          </div>
          
          {formData.erpIntegration !== 'none' && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="erpHost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('connection_url', 'system')}
                </label>
                <input
                  type="text"
                  id="erpHost"
                  name="erpHost"
                  value={formData.erpHost}
                  onChange={handleChange}
                  placeholder="https://"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                />
              </div>
              
              <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="erpUsername" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('username', 'common')}
                  </label>
                  <input
                    type="text"
                    id="erpUsername"
                    name="erpUsername"
                    value={formData.erpUsername}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                  />
                </div>
                
                <div>
                  <label htmlFor="erpPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('password', 'common')}
                  </label>
                  <input
                    type="password"
                    id="erpPassword"
                    name="erpPassword"
                    value={formData.erpPassword}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                  />
                </div>
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <button 
                  type="button"
                  className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-lg hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-offset-2 transition-colors"
                >
                  {t('test_connection', 'system')}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Email Servisi */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('email_service', 'system')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="emailProvider" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('email_provider', 'system')}
              </label>
              <select
                id="emailProvider"
                name="emailProvider"
                value={formData.emailProvider}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
              >
                <option value="smtp">SMTP</option>
                <option value="sendgrid">SendGrid</option>
                <option value="mailgun">Mailgun</option>
                <option value="ses">Amazon SES</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('sender_email', 'system')}
              </label>
              <input
                type="email"
                id="senderEmail"
                name="senderEmail"
                value={formData.senderEmail}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
              />
            </div>
            
            {formData.emailProvider === 'smtp' && (
              <>
                <div>
                  <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SMTP {t('host', 'system')}
                  </label>
                  <input
                    type="text"
                    id="smtpHost"
                    name="smtpHost"
                    value={formData.smtpHost}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                  />
                </div>
                
                <div>
                  <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SMTP {t('port', 'system')}
                  </label>
                  <input
                    type="text"
                    id="smtpPort"
                    name="smtpPort"
                    value={formData.smtpPort}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                  />
                </div>
                
                <div>
                  <label htmlFor="smtpUsername" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SMTP {t('username', 'common')}
                  </label>
                  <input
                    type="text"
                    id="smtpUsername"
                    name="smtpUsername"
                    value={formData.smtpUsername}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                  />
                </div>
                
                <div>
                  <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SMTP {t('password', 'common')}
                  </label>
                  <input
                    type="password"
                    id="smtpPassword"
                    name="smtpPassword"
                    value={formData.smtpPassword}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                  />
                </div>
              </>
            )}
            
            <div className="col-span-1 md:col-span-2">
              <button 
                type="button"
                className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-lg hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-offset-2 transition-colors"
              >
                {t('send_test_email', 'system')}
              </button>
            </div>
          </div>
        </div>
        
        {/* SSO Entegrasyonu */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('sso_integration', 'system')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="ssoProvider" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('sso_provider', 'system')}
              </label>
              <select
                id="ssoProvider"
                name="ssoProvider"
                value={formData.ssoProvider}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
              >
                <option value="none">{t('none', 'common')}</option>
                <option value="google">Google</option>
                <option value="microsoft">Microsoft</option>
                <option value="okta">Okta</option>
                <option value="auth0">Auth0</option>
                <option value="saml">SAML 2.0</option>
              </select>
            </div>
          </div>
          
          {formData.ssoProvider !== 'none' && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-700 dark:text-yellow-400">
              <p className="text-sm mb-3">
                {t('sso_configuration_notice', 'system')}
              </p>
              <button 
                type="button"
                className="text-sm bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300 px-3 py-1.5 rounded hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors"
              >
                {t('configure_sso', 'system')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegrationSettings; 