import React from 'react';
import { useTranslation } from '../../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../../utils/translationUtils';

interface PasswordAttributeProps {
  attribute: any;
  value: any;
  onChange?: (value: any) => void;
  error?: string;
  disabled?: boolean;
  isEditing?: boolean;
}

// Tablo sütununda gösterim için
export const PasswordTableDisplay: React.FC<PasswordAttributeProps> = ({ value }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400 italic">-</span>;
  }

  return (
    <span className="text-sm text-gray-600 dark:text-gray-400">
      ••••••••
    </span>
  );
};

// Edit modunda input için
export const PasswordEditInput: React.FC<PasswordAttributeProps> = ({
  attribute,
  value,
  onChange,
  error,
  disabled = false
}) => {
  const { currentLanguage } = useTranslation();

  const baseClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
    error
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
  } ${
    disabled
      ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
      : 'bg-white dark:bg-gray-800'
  } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`;

  const placeholder = getEntityDescription(attribute, currentLanguage) || `${getEntityName(attribute, currentLanguage)} girin`;

  return (
    <div className="space-y-2">
      <input
        type="password"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={baseClasses}
        placeholder={placeholder}
      />
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

// Item detay sayfasında gösterim için
export const PasswordDetailDisplay: React.FC<PasswordAttributeProps> = ({
  attribute,
  value,
  isEditing = false,
  onChange,
  error,
  disabled = false
}) => {
  const { currentLanguage } = useTranslation();

  if (isEditing) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {getEntityName(attribute, currentLanguage)}
          {attribute.isRequired && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
        <PasswordEditInput
          attribute={attribute}
          value={value}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
        {getEntityDescription(attribute, currentLanguage) && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getEntityDescription(attribute, currentLanguage)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {getEntityName(attribute, currentLanguage)}
        {attribute.isRequired && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>
      <div className="min-h-[2.5rem] flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        {value === null || value === undefined || value === '' ? (
          <span className="text-gray-400 italic">-</span>
        ) : (
          <span className="text-gray-600 dark:text-gray-400">
            ••••••••
          </span>
        )}
      </div>
      {getEntityDescription(attribute, currentLanguage) && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {getEntityDescription(attribute, currentLanguage)}
        </p>
      )}
    </div>
  );
};
