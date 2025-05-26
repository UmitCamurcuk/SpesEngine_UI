import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/i18nContext';
import Button from '../../components/ui/Button';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* 404 Illustration */}
          <div className="mx-auto h-32 w-32 text-gray-400 dark:text-gray-600 mb-8">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          
          {/* Error Code */}
          <h1 className="text-9xl font-bold text-gray-300 dark:text-gray-700 mb-4">404</h1>
          
          {/* Error Message */}
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('page_not_found_title', 'errors') || 'Sayfa Bulunamadı'}
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {t('page_not_found_description', 'errors') || 'Aradığınız sayfa mevcut değil veya taşınmış olabilir. Lütfen URL\'yi kontrol edin.'}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              onClick={() => navigate('/')}
              className="flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {t('go_home', 'errors') || 'Ana Sayfaya Dön'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('go_back', 'errors') || 'Geri Dön'}
            </Button>
          </div>
          
          {/* Additional Help */}
          <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              {t('need_help_title', 'errors') || 'Yardıma mı ihtiyacınız var?'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('need_help_description', 'errors') || 'Eğer bu sayfaya bir link aracılığıyla geldiğiniz düşünüyorsanız, lütfen sistem yöneticisi ile iletişime geçin.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = 'mailto:support@spesengine.com'}
                className="flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t('contact_support', 'errors') || 'Destek'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/docs', '_blank')}
                className="flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {t('documentation', 'errors') || 'Dokümantasyon'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 