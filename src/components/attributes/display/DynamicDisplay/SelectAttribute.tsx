import React from 'react';
import { useTranslation } from '../../../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../../../utils/translationUtils';

interface SelectAttributeProps {
  attribute: any;
  value: any;
  onChange?: (value: any) => void;
  error?: string;
  disabled?: boolean;
  isEditing?: boolean;
}

// Tablo sütununda gösterim için
export const SelectTableDisplay: React.FC<SelectAttributeProps> = ({ attribute, value }) => {
  const { currentLanguage } = useTranslation();

  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400 italic">-</span>;
  }

  if (attribute.options && Array.isArray(attribute.options)) {
    const option = attribute.options.find((opt: any) => opt._id === value);
    return (
      <span className="text-sm">
        {option ? getEntityName(option, currentLanguage) : value}
      </span>
    );
  }

  return <span className="text-sm">{value}</span>;
};

// Edit modunda input için
export const SelectEditInput: React.FC<SelectAttributeProps> = ({
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

  return (
    <div className="space-y-2">
      <select
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={baseClasses}
      >
        <option value="">Seçiniz</option>
        {attribute.options?.map((option: any) => (
          <option key={option._id} value={option._id}>
            {getEntityName(option, currentLanguage)}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

// Item detay sayfasında gösterim için
export const SelectDetailDisplay: React.FC<SelectAttributeProps> = ({
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
        <SelectEditInput
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
          <span>
            {attribute.options && Array.isArray(attribute.options) ? (
              (() => {
                const option = attribute.options.find((opt: any) => opt._id === value);
                return option ? getEntityName(option, currentLanguage) : value;
              })()
            ) : (
              value
            )}
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
