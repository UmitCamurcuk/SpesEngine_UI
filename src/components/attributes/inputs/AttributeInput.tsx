import React from 'react';
import { useTranslation } from '../../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../../utils/translationUtils';
import TableInput from './TableInput';

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
              <option key={option._id || index} value={option._id || option.value || option}>
                {getEntityName(option, currentLanguage) || option.name || option.value || option}
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

      case 'table':
        return (
          <TableInput
            value={value}
            onChange={onChange}
            columns={attribute.validations?.columns || []}
            minRows={attribute.validations?.minRows}
            maxRows={attribute.validations?.maxRows}
            allowAddRows={attribute.validations?.allowAddRows}
            allowDeleteRows={attribute.validations?.allowDeleteRows}
            allowEditRows={attribute.validations?.allowEditRows}
            disabled={disabled}
            error={error}
          />
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
      <div className="flex items-center space-x-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {getEntityName(attribute, currentLanguage)}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {/* Description tooltip */}
        {getEntityDescription(attribute, currentLanguage) && (
          <div className="relative group">
            <button
              type="button"
              className="inline-flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* Tooltip */}
            <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded-md shadow-lg whitespace-nowrap z-10 max-w-xs">
              {getEntityDescription(attribute, currentLanguage)}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
            </div>
          </div>
        )}
      </div>
      
      {renderInput()}
      
      {/* Validation rules info */}
      {attribute.validationRules && (
        <div className="flex items-start space-x-2">
          <svg className="w-4 h-4 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            <strong>Kurallar:</strong> {attribute.validationRules}
          </p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="flex items-start space-x-2">
          <svg className="w-4 h-4 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
            {error}
          </p>
        </div>
      )}
    </div>
  );
});

export default AttributeInput; 