import React from 'react';

interface AvatarProps {
  user?: {
    avatar?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showEditButton?: boolean;
  onEditClick?: () => void;
  editable?: boolean;
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  user,
  size = 'md',
  className = '',
  showEditButton = false,
  onEditClick,
  editable = false,
  onClick
}) => {
  const getDisplayName = () => {
    if (!user) return 'Kullanıcı';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email || 'Kullanıcı';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs': return 'w-6 h-6 text-xs';
      case 'sm': return 'w-8 h-8 text-sm';
      case 'md': return 'w-10 h-10 text-base';
      case 'lg': return 'w-12 h-12 text-lg';
      case 'xl': return 'w-16 h-16 text-xl';
      case '2xl': return 'w-32 h-32 text-3xl';
      default: return 'w-10 h-10 text-base';
    }
  };

  const getEditButtonSize = () => {
    switch (size) {
      case 'xs': return 'w-3 h-3';
      case 'sm': return 'w-4 h-4';
      case 'md': return 'w-5 h-5';
      case 'lg': return 'w-6 h-6';
      case 'xl': return 'w-8 h-8';
      case '2xl': return 'w-10 h-10';
      default: return 'w-5 h-5';
    }
  };

  const getEditButtonPosition = () => {
    switch (size) {
      case 'xs': return '-bottom-0.5 -right-0.5';
      case 'sm': return '-bottom-0.5 -right-0.5';
      case 'md': return '-bottom-1 -right-1';
      case 'lg': return '-bottom-1 -right-1';
      case 'xl': return '-bottom-2 -right-2';
      case '2xl': return '-bottom-3 -right-3';
      default: return '-bottom-1 -right-1';
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`${getSizeClasses()} rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-90 transition-opacity ${
          onClick ? 'cursor-pointer' : ''
        }`}
        onClick={onClick}
      >
        {user?.avatar ? (
          <img 
            src={user.avatar} 
            alt="Avatar" 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Avatar yüklenemezse baş harfleri göster
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = getInitials();
              }
            }}
          />
        ) : (
          getInitials()
        )}
      </div>
      
      {showEditButton && editable && (
        <button
          onClick={onEditClick}
          className={`absolute ${getEditButtonPosition()} bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-2 border-white dark:border-gray-800`}
        >
          <svg className={`${getEditButtonSize()} text-gray-600 dark:text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Avatar;
