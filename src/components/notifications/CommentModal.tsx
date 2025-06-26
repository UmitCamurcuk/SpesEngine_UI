import React, { useState } from 'react';
import Button from '../ui/Button';
import { CommentModalProps } from './types';

const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  title,
  changes,
  onSave,
  isLoading = false
}) => {
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleSave = () => {
    onSave(comment);
    setComment(''); // Clear comment after save
  };

  const handleClose = () => {
    setComment(''); // Clear comment on close
    onClose();
  };

  // ESC tuşu ile kapatma
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, isLoading]);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="
          bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full
          transform transition-all duration-200 ease-out
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
          {!isLoading && (
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
            >
              <span className="sr-only">Kapat</span>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Changes List */}
          {changes.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Yapılan Değişiklikler:
              </h4>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 max-h-32 overflow-y-auto">
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  {changes.map((change, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Comment Input */}
          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Yorum (İsteğe bağlı)
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Bu değişiklikler hakkında bir yorum ekleyin..."
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         disabled:opacity-50 disabled:cursor-not-allowed
                         placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center"
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal; 