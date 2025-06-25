import React from 'react';
import Button from './Button';

export type ConfirmationType = 
  | 'delete' 
  | 'warning' 
  | 'info' 
  | 'success' 
  | 'error' 
  | 'confirm' 
  | 'unauthorized' 
  | 'connection_lost';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: ConfirmationType;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

const getModalStyles = (type: ConfirmationType) => {
  switch (type) {
    case 'delete':
      return {
        icon: (
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
        iconBg: 'bg-red-100 dark:bg-red-900/20',
        primaryButton: 'danger' as const,
        defaultTitle: 'Silme Onayı',
        defaultMessage: 'Bu işlemi geri alamazsınız. Silmek istediğinizden emin misiniz?',
        defaultConfirmText: 'Sil',
        defaultCancelText: 'İptal'
      };
      
    case 'warning':
      return {
        icon: (
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
        iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
        primaryButton: 'primary' as const,
        defaultTitle: 'Uyarı',
        defaultMessage: 'Bu işlemle devam etmek istediğinizden emin misiniz?',
        defaultConfirmText: 'Devam Et',
        defaultCancelText: 'İptal'
      };
      
    case 'error':
      return {
        icon: (
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        iconBg: 'bg-red-100 dark:bg-red-900/20',
        primaryButton: 'primary' as const,
        defaultTitle: 'Hata',
        defaultMessage: 'Bir hata oluştu. Lütfen tekrar deneyiniz.',
        defaultConfirmText: 'Tamam',
        defaultCancelText: 'İptal'
      };
      
    case 'success':
      return {
        icon: (
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        iconBg: 'bg-green-100 dark:bg-green-900/20',
        primaryButton: 'primary' as const,
        defaultTitle: 'Başarılı',
        defaultMessage: 'İşlem başarıyla tamamlandı.',
        defaultConfirmText: 'Tamam',
        defaultCancelText: 'Kapat'
      };
      
    case 'info':
      return {
        icon: (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        iconBg: 'bg-blue-100 dark:bg-blue-900/20',
        primaryButton: 'primary' as const,
        defaultTitle: 'Bilgi',
        defaultMessage: 'Bilgilendirme mesajı.',
        defaultConfirmText: 'Tamam',
        defaultCancelText: 'Kapat'
      };
      
    case 'unauthorized':
      return {
        icon: (
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        ),
        iconBg: 'bg-red-100 dark:bg-red-900/20',
        primaryButton: 'primary' as const,
        defaultTitle: 'Yetkisiz İşlem',
        defaultMessage: 'Bu işlemi gerçekleştirmek için yeterli yetkiniz bulunmamaktadır.',
        defaultConfirmText: 'Tamam',
        defaultCancelText: 'Kapat'
      };
      
    case 'connection_lost':
      return {
        icon: (
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
        ),
        iconBg: 'bg-gray-100 dark:bg-gray-900/20',
        primaryButton: 'primary' as const,
        defaultTitle: 'Bağlantı Sorunu',
        defaultMessage: 'Sunucu ile bağlantı kesildi. Lütfen internet bağlantınızı kontrol edin.',
        defaultConfirmText: 'Yeniden Dene',
        defaultCancelText: 'Kapat'
      };
      
    default: // confirm
      return {
        icon: (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        iconBg: 'bg-blue-100 dark:bg-blue-900/20',
        primaryButton: 'primary' as const,
        defaultTitle: 'Onay',
        defaultMessage: 'İşlemi onaylıyor musunuz?',
        defaultConfirmText: 'Onayla',
        defaultCancelText: 'İptal'
      };
  }
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  title,
  message,
  confirmText,
  cancelText,
  isLoading = false,
  size = 'md',
  children
}) => {
  const styles = getModalStyles(type);
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  };
  
  if (!isOpen) return null;
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className={`
          bg-white dark:bg-gray-800 rounded-lg shadow-xl ${sizeClasses[size]} w-full 
          transform transition-all duration-200 ease-out
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start">
            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${styles.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
              {styles.icon}
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                {title || styles.defaultTitle}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {message || styles.defaultMessage}
                </p>
                {children && (
                  <div className="mt-3">
                    {children}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 sm:flex sm:flex-row-reverse sm:space-x-2 sm:space-x-reverse">
          <Button
            variant={styles.primaryButton}
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                İşleniyor...
              </div>
            ) : (
              confirmText || styles.defaultConfirmText
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="mt-3 w-full sm:mt-0 sm:w-auto"
          >
            {cancelText || styles.defaultCancelText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 