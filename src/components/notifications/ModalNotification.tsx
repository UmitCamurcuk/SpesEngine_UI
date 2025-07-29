import React from 'react';
import Button from '../ui/Button';
import { ModalNotificationProps, NotificationType } from './types';

const getModalIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return (
        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'error':
      return (
        <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'warning':
      return (
        <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case 'info':
      return (
        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

const getModalStyles = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return {
        iconBg: 'bg-green-100 dark:bg-green-900/20',
        titleColor: 'text-green-800 dark:text-green-200',
        messageColor: 'text-green-700 dark:text-green-300'
      };
    case 'error':
      return {
        iconBg: 'bg-red-100 dark:bg-red-900/20',
        titleColor: 'text-red-800 dark:text-red-200',
        messageColor: 'text-red-700 dark:text-red-300'
      };
    case 'warning':
      return {
        iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
        titleColor: 'text-yellow-800 dark:text-yellow-200',
        messageColor: 'text-yellow-700 dark:text-yellow-300'
      };
    case 'info':
      return {
        iconBg: 'bg-blue-100 dark:bg-blue-900/20',
        titleColor: 'text-blue-800 dark:text-blue-200',
        messageColor: 'text-blue-700 dark:text-blue-300'
      };
  }
};

const getButtonVariant = (variant?: string) => {
  switch (variant) {
    case 'success':
      return 'primary';
    case 'error':
      return 'secondary';
    case 'warning':
      return 'outline';
    default:
      return 'primary';
  }
};

const ModalNotification: React.FC<ModalNotificationProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  icon,
  customContent,
  primaryButton,
  secondaryButton
}) => {
  if (!isOpen) return null;

  const styles = getModalStyles(type);
  const defaultIcon = getModalIcon(type);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ESC tuşu ile kapatma
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="
          bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto
          transform transition-all duration-200 ease-out
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="absolute top-4 right-4">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
          >
            <span className="sr-only">Kapat</span>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Icon */}
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${styles.iconBg} mb-4`}>
            {icon || defaultIcon}
          </div>

          {/* Title */}
          <h3 className={`text-lg font-medium mb-2 ${styles.titleColor}`}>
            {title}
          </h3>

          {/* Message */}
          {message && (
            <p className={`text-sm mb-6 ${styles.messageColor}`}>
              {message}
            </p>
          )}

          {/* Custom Content */}
          {customContent && (
            <div className="mb-6">
              {customContent}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {primaryButton && (
              <Button
                variant={getButtonVariant(primaryButton.variant) as any}
                onClick={primaryButton.onClick}
                className="sm:order-2"
              >
                {primaryButton.text}
              </Button>
            )}
            {secondaryButton && (
              <Button
                variant="outline"
                onClick={secondaryButton.onClick}
                className="sm:order-1"
              >
                {secondaryButton.text}
              </Button>
            )}
            {!primaryButton && !secondaryButton && (
              <Button
                variant="primary"
                onClick={onClose}
              >
                Tamam
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalNotification; 