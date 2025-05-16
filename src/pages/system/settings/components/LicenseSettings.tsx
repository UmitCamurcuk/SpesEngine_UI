import React, { useState } from 'react';
import { useTranslation } from '../../../../context/i18nContext';

const LicenseSettings: React.FC = () => {
  const { t } = useTranslation();
  const [licenseInfo, setLicenseInfo] = useState({
    licenseKey: 'XXXX-XXXX-XXXX-XXXX-XXXX',
    company: 'SpesEngine, Inc.',
    email: 'license@example.com',
    expiryDate: '2024-12-31',
    maxUsers: 50,
    edition: 'Enterprise',
    features: ['Master Data Management', 'Relationship Management', 'Workflow Automation', 'API Access', 'Advanced Analytics'],
    status: 'active'
  });

  const [newLicenseKey, setNewLicenseKey] = useState('');

  const activateLicense = () => {
    alert(t('license_activation_placeholder', 'system'));
    setNewLicenseKey('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
        {t('license_info', 'system')}
      </h2>
      
      <div className="space-y-8">
        {/* Mevcut Lisans Bilgileri */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('current_license', 'system')}
          </h3>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-900 dark:text-white font-semibold">
                SpesEngine MDM - {licenseInfo.edition}
              </div>
              <div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  licenseInfo.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'
                }`}>
                  {licenseInfo.status === 'active' ? t('active', 'common') : t('inactive', 'common')}
                </span>
              </div>
            </div>
            
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('license_key', 'system')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {licenseInfo.licenseKey}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('company', 'system')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {licenseInfo.company}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('registered_email', 'system')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {licenseInfo.email}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('expiry_date', 'system')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(licenseInfo.expiryDate).toLocaleDateString()}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('max_users', 'system')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {licenseInfo.maxUsers}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        {/* Lisans Özellikleri */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('included_features', 'system')}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {licenseInfo.features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Lisans Yükseltme/Değiştirme */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('license_management', 'system')}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="newLicenseKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('new_license_key', 'system')}
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="newLicenseKey"
                  value={newLicenseKey}
                  onChange={(e) => setNewLicenseKey(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg rounded-r-none focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                />
                <button
                  type="button"
                  onClick={activateLicense}
                  className="px-4 py-2.5 bg-primary-light dark:bg-primary-dark text-white rounded-lg rounded-l-none hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-offset-2 transition-colors"
                >
                  {t('activate', 'system')}
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('license_key_help', 'system')}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-offset-2 transition-colors"
              >
                {t('upgrade_license', 'system')}
              </button>
              
              <button
                type="button"
                className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-offset-2 transition-colors"
              >
                {t('contact_support', 'system')}
              </button>
              
              <button
                type="button"
                className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-offset-2 transition-colors"
              >
                {t('view_purchase_history', 'system')}
              </button>
            </div>
          </div>
        </div>
        
        {/* Hukuki Bilgiler */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('legal_information', 'system')}
          </h3>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('license_legal_info', 'system')}
            </p>
            
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-offset-2 transition-colors"
              >
                {t('privacy_policy', 'system')}
              </button>
              
              <button
                type="button"
                className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-offset-2 transition-colors"
              >
                {t('terms_of_service', 'system')}
              </button>
              
              <button
                type="button"
                className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-offset-2 transition-colors"
              >
                {t('license_agreement', 'system')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicenseSettings; 