export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

// Toast Notification
export interface ToastNotification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  position?: NotificationPosition;
}

// Modal Notification
export interface ModalNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  type: NotificationType;
  title: string;
  message: string;
  icon?: React.ReactNode;
  customContent?: React.ReactNode;
  primaryButton?: {
    text: string;
    onClick: () => void;
    variant?: 'primary' | 'success' | 'error' | 'warning';
  };
  secondaryButton?: {
    text: string;
    onClick: () => void;
  };
}

// Comment Modal
export interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  changes: string[];
  onSave: (comment: string) => void;
  isLoading?: boolean;
}

// Notification Context
export interface NotificationContextType {
  showToast: (notification: Omit<ToastNotification, 'id'>) => void;
  showModal: (props: Omit<ModalNotificationProps, 'isOpen' | 'onClose'>) => void;
  showCommentModal: (props: Omit<CommentModalProps, 'isOpen' | 'onClose'>) => void;
  removeToast: (id: string) => void;
} 