import React from 'react';
import Avatar from './Avatar';

interface User {
  _id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface UserDisplayProps {
  user: User | null | undefined;
  showEmail?: boolean;
  showDate?: boolean;
  date?: string | Date;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'default' | 'created' | 'updated';
}

const UserDisplay: React.FC<UserDisplayProps> = ({
  user,
  showEmail = false,
  showDate = false,
  date,
  size = 'md',
  className = '',
  variant = 'default'
}) => {
  if (!user) {
    return (
      <div className={`text-gray-400 italic ${className}`}>
        N/A
      </div>
    );
  }

  const getUserDisplayName = () => {
    if (user.name) {
      return user.name;
    } else if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    } else if (user.email) {
      return user.email;
    }
    return 'Bilinmiyor';
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'w-3 h-3';
      case 'md': return 'w-4 h-4';
      case 'lg': return 'w-5 h-5';
      default: return 'w-4 h-4';
    }
  };

  const getContainerSize = () => {
    switch (size) {
      case 'sm': return 'w-6 h-6';
      case 'md': return 'w-8 h-8';
      case 'lg': return 'w-10 h-10';
      default: return 'w-8 h-8';
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'created':
        return {
          container: 'bg-blue-100 dark:bg-blue-900',
          icon: 'text-blue-600 dark:text-blue-400',
          svg: (
            <svg className={`${getIconSize()} text-blue-600 dark:text-blue-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )
        };
      case 'updated':
        return {
          container: 'bg-green-100 dark:bg-green-900',
          icon: 'text-green-600 dark:text-green-400',
          svg: (
            <svg className={`${getIconSize()} text-green-600 dark:text-green-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          )
        };
      default:
        return {
          container: 'bg-gray-100 dark:bg-gray-700',
          icon: 'text-gray-600 dark:text-gray-400',
          svg: (
            <svg className={`${getIconSize()} text-gray-600 dark:text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'md': return 'text-sm';
      case 'lg': return 'text-base';
      default: return 'text-sm';
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <div className={`${getTextSize()} ${className}`}>
      <div className="flex items-center space-x-2">
        <Avatar
          user={user}
          size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
          className={getContainerSize()}
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {getUserDisplayName()}
          </div>
          {showEmail && user.email && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </div>
          )}
          {showDate && date && (
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {new Date(date).toLocaleDateString('tr-TR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDisplay;
