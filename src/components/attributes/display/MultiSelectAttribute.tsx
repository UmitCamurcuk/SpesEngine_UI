import React from 'react';
import { useTranslation } from '../../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../../utils/translationUtils';

interface MultiSelectAttributeProps {
  attribute: any;
  value: any;
  onChange?: (value: any) => void;
  error?: string;
  disabled?: boolean;
  isEditing?: boolean;
}

// Tablo sütununda gösterim için
export const MultiSelectTableDisplay: React.FC<MultiSelectAttributeProps> = ({ attribute, value }) => {
  const { currentLanguage } = useTranslation();

  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400 italic">-</span>;
  }

  if (attribute.options && Array.isArray(attribute.options) && Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.slice(0, 2).map((val: string) => {
          const option = attribute.options.find((opt: any) => opt._id === val);
          return (
            <span key={val} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              {option ? getEntityName(option, currentLanguage) : val}
            </span>
          );
        })}
        {value.length > 2 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            +{value.length - 2} daha
          </span>
        )}
      </div>
    );
  }

  return <span className="text-sm">{Array.isArray(value) ? value.join(', ') : value}</span>;
};

// Edit modunda input için
export const MultiSelectEditInput: React.FC<MultiSelectAttributeProps> = ({
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
        multiple
        value={Array.isArray(value) ? value : []}
        onChange={(e) => {
          const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
          onChange?.(selectedOptions);
        }}
        disabled={disabled}
        className={baseClasses}
      >
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
export const MultiSelectDetailDisplay: React.FC<MultiSelectAttributeProps> = ({
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
        <MultiSelectEditInput
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
          <div className="flex flex-wrap gap-1">
            {attribute.options && Array.isArray(attribute.options) && Array.isArray(value) ? (
              value.map((val: string) => {
                const option = attribute.options.find((opt: any) => opt._id === val);
                return (
                  <span key={val} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {option ? getEntityName(option, currentLanguage) : val}
                  </span>
                );
              })
            ) : (
              <span>{Array.isArray(value) ? value.join(', ') : value}</span>
            )}
          </div>
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
