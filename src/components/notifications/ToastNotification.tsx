import React, { useEffect, useState } from 'react';
import { ToastNotification, NotificationType } from './types';

interface ToastProps {
  toast: ToastNotification;
  onRemove: (id: string) => void;
}

const getToastIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'error':
      return (
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'warning':
      return (
        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case 'info':
      return (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

const getToastStyles = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        iconBg: 'bg-green-100 dark:bg-green-900/40',
        titleColor: 'text-green-800 dark:text-green-200',
        messageColor: 'text-green-700 dark:text-green-300'
      };
    case 'error':
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        iconBg: 'bg-red-100 dark:bg-red-900/40',
        titleColor: 'text-red-800 dark:text-red-200',
        messageColor: 'text-red-700 dark:text-red-300'
      };
    case 'warning':
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        iconBg: 'bg-yellow-100 dark:bg-yellow-900/40',
        titleColor: 'text-yellow-800 dark:text-yellow-200',
        messageColor: 'text-yellow-700 dark:text-yellow-300'
      };
    case 'info':
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        iconBg: 'bg-blue-100 dark:bg-blue-900/40',
        titleColor: 'text-blue-800 dark:text-blue-200',
        messageColor: 'text-blue-700 dark:text-blue-300'
      };
  }
};

const ToastComponent: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const styles = getToastStyles(toast.type);
  const icon = getToastIcon(toast.type);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 50);

    // Auto dismiss
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  return (
    <div 
      className={`
        transform transition-all duration-300 ease-out max-w-sm w-full
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isLeaving ? 'translate-x-full opacity-0' : ''}
      `}
    >
      <div className={`
        ${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4
        backdrop-blur-sm
      `}>
        <div className="flex items-start">
          <div className={`${styles.iconBg} flex-shrink-0 rounded-lg p-1 mr-3`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-sm font-medium ${styles.titleColor}`}>
                  {toast.title}
                </p>
                {toast.message && (
                  <p className={`mt-1 text-sm ${styles.messageColor}`}>
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleDismiss}
                className="ml-4 inline-flex text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
              >
                <span className="sr-only">Kapat</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastComponent; 