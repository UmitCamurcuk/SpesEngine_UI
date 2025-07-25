import React from 'react';
import { useTranslation } from '../../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../../utils/translationUtils';

interface AttributeInputProps {
  attribute: any;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
}

const AttributeInput: React.FC<AttributeInputProps> = React.memo(({
  attribute,
  value,
  onChange,
  error,
  disabled = false
}) => {
  const { currentLanguage } = useTranslation();
  const required = attribute.isRequired || false;

  const baseClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
    error
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
  } ${
    disabled
      ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
      : 'bg-white dark:bg-gray-800'
  } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`;

  const renderInput = () => {
    const placeholder = getEntityDescription(attribute, currentLanguage) || `${getEntityName(attribute, currentLanguage)} girin`;

    switch (attribute.type) {
      case 'text':
      case 'string':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseClasses}
            placeholder={placeholder}
          />
        );

      case 'number':
      case 'integer':
      case 'decimal':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
            disabled={disabled}
            className={baseClasses}
            placeholder={placeholder}
            step={attribute.type === 'decimal' ? '0.01' : '1'}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseClasses}
            placeholder={placeholder}
          />
        );

      case 'url':
        return (
          <input
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseClasses}
            placeholder={placeholder}
          />
        );

      case 'password':
        return (
          <input
            type="password"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseClasses}
            placeholder={placeholder}
          />
        );

      case 'textarea':
      case 'multiline':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            rows={4}
            className={baseClasses}
            placeholder={placeholder}
          />
        );

      case 'select':
      case 'dropdown':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseClasses}
          >
            <option value="">Seçiniz...</option>
            {Array.isArray(attribute.options) && attribute.options.map((option: any, index: number) => (
              <option key={index} value={typeof option === 'string' ? option : option._id || option.value}>
                {typeof option === 'string' ? option : getEntityName(option, currentLanguage) || option.name || option.value}
              </option>
            ))}
          </select>
        );

      case 'boolean':
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {getEntityDescription(attribute, currentLanguage) || 'Evet/Hayır'}
            </span>
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseClasses}
          />
        );

      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseClasses}
          />
        );

      case 'time':
        return (
          <input
            type="time"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseClasses}
          />
        );

      case 'color':
        return (
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="h-10 w-full border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer disabled:cursor-not-allowed"
          />
        );

      case 'file':
        return (
          <input
            type="file"
            onChange={(e) => onChange(e.target.files?.[0] || null)}
            disabled={disabled}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
        );

      case 'range':
        return (
          <div className="space-y-2">
            <input
              type="range"
              value={value || 0}
              onChange={(e) => onChange(Number(e.target.value))}
              disabled={disabled}
              min={attribute.min || 0}
              max={attribute.max || 100}
              step={attribute.step || 1}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Değer: {value || 0}
            </div>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseClasses}
            placeholder={placeholder}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {getEntityName(attribute, currentLanguage)}
        {required && <span className="text-red-500 ml-1">*</span>}
        {attribute.validationRules && (
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            ({attribute.validationRules})
          </span>
        )}
      </label>
      
      {renderInput()}
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {!error && getEntityDescription(attribute, currentLanguage) && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {getEntityDescription(attribute, currentLanguage)}
        </p>
      )}
    </div>
  );
});

export default AttributeInput; 