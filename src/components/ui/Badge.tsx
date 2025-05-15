import React from 'react';

export type BadgeColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  size?: BadgeSize;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  color = 'primary',
  size = 'md',
  className = '',
}) => {
  // Renk stilleri
  const colorStyles = {
    primary: 'bg-primary-light/20 text-primary-light dark:bg-primary-dark/20 dark:text-primary-dark',
    secondary: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
    dark: 'bg-gray-800 text-white dark:bg-gray-900 dark:text-gray-200',
    light: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  };

  // Boyut stilleri
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${colorStyles[color]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge; 