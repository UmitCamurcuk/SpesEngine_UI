import React from 'react';
import { useTranslation } from '../../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../../utils/translationUtils';

interface TextInputProps {
  attribute: any;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  attribute,
  value,
  onChange,
  error,
  required = false,
  disabled = false
}) => {
  const { currentLanguage } = useTranslation();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {getEntityName(attribute, currentLanguage)}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
        } ${
          disabled
            ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
            : 'bg-white dark:bg-gray-800'
        } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
        placeholder={getEntityDescription(attribute, currentLanguage) || `${getEntityName(attribute, currentLanguage)} girin`}
      />
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default TextInput; 