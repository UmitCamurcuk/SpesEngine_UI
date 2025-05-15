import React from 'react';
import { useTranslation } from '../../context/i18nContext';

const TranslationExample: React.FC = () => {
  const { t, currentLanguage } = useTranslation();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {t('translation_example_title', 'common')}
      </h2>
      
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        {t('current_language')}: <strong>{currentLanguage}</strong>
      </p>
      
      <div className="space-y-3">
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('greeting')}
          </span>
          <span className="block text-gray-900 dark:text-white">
            {t('welcome_message')}
          </span>
        </div>
        
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('product_example', 'products')}
          </span>
          <span className="block text-gray-900 dark:text-white">
            {t('product_description', 'products')}
          </span>
        </div>
        
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('error_example', 'errors')}
          </span>
          <span className="block text-gray-900 dark:text-white">
            {t('error_not_found', 'errors')}
          </span>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        {t('translation_help_text')}
      </div>
    </div>
  );
};

export default TranslationExample; 