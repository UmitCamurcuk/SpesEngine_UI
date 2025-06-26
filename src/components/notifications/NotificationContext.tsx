import React, { createContext, useContext, useState, useCallback } from 'react';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);
import ToastContainer from './ToastContainer';
import ModalNotification from './ModalNotification';
import CommentModal from './CommentModal';
import { 
  NotificationContextType, 
  ToastNotification, 
  ModalNotificationProps,
  CommentModalProps 
} from './types';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  // Toast state
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  
  // Modal state
  const [modalProps, setModalProps] = useState<Omit<ModalNotificationProps, 'isOpen' | 'onClose'> | null>(null);
  
  // Comment modal state
  const [commentModalProps, setCommentModalProps] = useState<Omit<CommentModalProps, 'isOpen' | 'onClose'> | null>(null);

  // Toast functions
  const showToast = useCallback((notification: Omit<ToastNotification, 'id'>) => {
    const id = generateId();
    const newToast: ToastNotification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000 // Default 5 seconds
    };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Modal functions
  const showModal = useCallback((props: Omit<ModalNotificationProps, 'isOpen' | 'onClose'>) => {
    setModalProps(props);
  }, []);

  const closeModal = useCallback(() => {
    setModalProps(null);
  }, []);

  // Comment modal functions
  const showCommentModal = useCallback((props: Omit<CommentModalProps, 'isOpen' | 'onClose'>) => {
    setCommentModalProps(props);
  }, []);

  const closeCommentModal = useCallback(() => {
    setCommentModalProps(null);
  }, []);

  const contextValue: NotificationContextType = {
    showToast,
    showModal,
    showCommentModal,
    removeToast
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Toast Container */}
      <ToastContainer 
        toasts={toasts} 
        position="top-right"
        onRemove={removeToast} 
      />
      
      {/* Modal Notification */}
      {modalProps && (
        <ModalNotification 
          {...modalProps}
          isOpen={true}
          onClose={closeModal}
        />
      )}
      
      {/* Comment Modal */}
      {commentModalProps && (
        <CommentModal 
          {...commentModalProps}
          isOpen={true}
          onClose={closeCommentModal}
        />
      )}
    </NotificationContext.Provider>
  );
}; 