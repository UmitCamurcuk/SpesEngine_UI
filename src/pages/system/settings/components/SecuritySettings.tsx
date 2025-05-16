import React, { useState } from 'react';
import { useTranslation } from '../../../../context/i18nContext';

const SecuritySettings: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    passwordPolicy: 'strong',
    passwordExpiration: '90',
    twoFactorAuth: true,
    loginAttempts: '5',
    sessionTimeout: '30',
    allowedIPs: '',
    sslCertificate: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
        {t('security_settings', 'system')}
      </h2>
      
      <div className="space-y-8">
        {/* Şifre Politikası */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('password_policy', 'system')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="passwordPolicy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('password_strength', 'system')}
              </label>
              <select
                id="passwordPolicy"
                name="passwordPolicy"
                value={formData.passwordPolicy}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
              >
                <option value="basic">{t('basic', 'system')} (8+ {t('characters', 'system')})</option>
                <option value="medium">{t('medium', 'system')} (8+, {t('letters_and_numbers', 'system')})</option>
                <option value="strong">{t('strong', 'system')} (8+, {t('mixed_case_numbers_symbols', 'system')})</option>
                <option value="very_strong">{t('very_strong', 'system')} (12+, {t('mixed_case_numbers_symbols', 'system')})</option>
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('password_strength_help', 'system')}
              </p>
            </div>
            
            <div>
              <label htmlFor="passwordExpiration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('password_expiration', 'system')} ({t('days', 'common')})
              </label>
              <input
                type="number"
                id="passwordExpiration"
                name="passwordExpiration"
                value={formData.passwordExpiration}
                onChange={handleChange}
                min="0"
                max="365"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('password_expiration_help', 'system')}
              </p>
            </div>
          </div>
        </div>
        
        {/* İki Faktörlü Kimlik Doğrulama */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('authentication', 'system')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="twoFactorAuth"
                  name="twoFactorAuth"
                  checked={formData.twoFactorAuth}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded"
                />
                <label htmlFor="twoFactorAuth" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('enable_2fa', 'system')}
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 ml-6">
                {t('2fa_help', 'system')}
              </p>
            </div>
            
            <div>
              <label htmlFor="loginAttempts" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('max_login_attempts', 'system')}
              </label>
              <input
                type="number"
                id="loginAttempts"
                name="loginAttempts"
                value={formData.loginAttempts}
                onChange={handleChange}
                min="1"
                max="10"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('login_attempts_help', 'system')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Oturum Ayarları */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('session_settings', 'system')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('session_timeout', 'system')} ({t('minutes', 'common')})
              </label>
              <input
                type="number"
                id="sessionTimeout"
                name="sessionTimeout"
                value={formData.sessionTimeout}
                onChange={handleChange}
                min="1"
                max="1440"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('session_timeout_help', 'system')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Ağ Güvenliği */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('network_security', 'system')}
          </h3>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="allowedIPs" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('allowed_ips', 'system')}
              </label>
              <textarea
                id="allowedIPs"
                name="allowedIPs"
                value={formData.allowedIPs}
                onChange={handleChange}
                rows={3}
                placeholder="192.168.1.1, 10.0.0.0/24"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
              ></textarea>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('allowed_ips_help', 'system')}
              </p>
            </div>
            
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sslCertificate"
                  name="sslCertificate"
                  checked={formData.sslCertificate}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded"
                />
                <label htmlFor="sslCertificate" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('enforce_ssl', 'system')}
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 ml-6">
                {t('enforce_ssl_help', 'system')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings; 