import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/i18nContext';
import Button from '../../components/ui/Button';

const ServerErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Server Error Illustration */}
          <div className="mx-auto h-32 w-32 text-red-400 dark:text-red-600 mb-8">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01" />
            </svg>
          </div>
          
          {/* Error Code */}
          <h1 className="text-9xl font-bold text-red-300 dark:text-red-700 mb-4">500</h1>
          
          {/* Error Message */}
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('server_error_title', 'errors') || 'Sunucu Hatası'}
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {t('server_error_description', 'errors') || 'Sunucuda beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.'}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              onClick={handleRefresh}
              className="flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('refresh_page', 'errors') || 'Sayfayı Yenile'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {t('go_home', 'errors') || 'Ana Sayfaya Dön'}
            </Button>
          </div>
          
          {/* Error Details */}
          <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              {t('error_details_title', 'errors') || 'Hata Detayları'}
            </h3>
            <div className="text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t('error_code', 'errors') || 'Hata Kodu'}:</span>
                <span className="text-gray-900 dark:text-white font-mono">500</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t('timestamp', 'errors') || 'Zaman'}:</span>
                <span className="text-gray-900 dark:text-white font-mono">{new Date().toLocaleString('tr-TR')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t('request_id', 'errors') || 'İstek ID'}:</span>
                <span className="text-gray-900 dark:text-white font-mono">{Math.random().toString(36).substr(2, 9)}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('report_error_description', 'errors') || 'Bu hatayı bildirmek için aşağıdaki bilgileri destek ekibimizle paylaşın.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = 'mailto:support@spesengine.com?subject=Server Error Report&body=Error Code: 500%0ATimestamp: ' + new Date().toISOString()}
                className="w-full flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {t('report_error', 'errors') || 'Hatayı Bildir'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerErrorPage; 