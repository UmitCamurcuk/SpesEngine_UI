import React from 'react';
import ToastComponent from './ToastNotification';
import { ToastNotification, NotificationPosition } from './types';

interface ToastContainerProps {
  toasts: ToastNotification[];
  position?: NotificationPosition;
  onRemove: (id: string) => void;
}

const getContainerPosition = (position: NotificationPosition) => {
  switch (position) {
    case 'top-right':
      return 'top-4 right-4';
    case 'top-left':
      return 'top-4 left-4';
    case 'bottom-right':
      return 'bottom-4 right-4';
    case 'bottom-left':
      return 'bottom-4 left-4';
    case 'top-center':
      return 'top-4 left-1/2 transform -translate-x-1/2';
    case 'bottom-center':
      return 'bottom-4 left-1/2 transform -translate-x-1/2';
    default:
      return 'top-4 right-4';
  }
};

const ToastContainer: React.FC<ToastContainerProps> = ({ 
  toasts, 
  position = 'top-right', 
  onRemove 
}) => {
  if (toasts.length === 0) return null;

  return (
    <div 
      className={`fixed z-50 pointer-events-none ${getContainerPosition(position)}`}
    >
      <div className="flex flex-col gap-2 pointer-events-auto">
        {toasts.map((toast) => (
          <ToastComponent
            key={toast.id}
            toast={toast}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer; 