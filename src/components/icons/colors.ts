export const IconColors = {
  primary: 'text-primary-600 dark:text-primary-400',
  secondary: 'text-gray-600 dark:text-gray-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  danger: 'text-red-600 dark:text-red-400'
} as const;

export type IconColor = keyof typeof IconColors; 