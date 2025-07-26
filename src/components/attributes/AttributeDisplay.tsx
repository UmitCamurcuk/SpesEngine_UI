import React from 'react';
import { useTranslation } from '../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../utils/translationUtils';
import { AttributeInput } from './inputs';

interface AttributeDisplayProps {
  attribute: any;
  value: any;
  isEditing: boolean;
  onChange?: (value: any) => void;
  error?: string;
  disabled?: boolean;
}

const AttributeDisplay: React.FC<AttributeDisplayProps> = React.memo(({
  attribute,
  value,
  isEditing,
  onChange,
  error,
  disabled = false
}) => {
  const { currentLanguage } = useTranslation();

  // Render attribute value based on type
  const renderValue = () => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic">-</span>;
    }

    switch (attribute.type) {
      case 'boolean':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {value ? 'Evet' : 'Hayır'}
          </span>
        );
      
      case 'select':
        if (attribute.options && Array.isArray(attribute.options)) {
          const option = attribute.options.find((opt: any) => opt._id === value);
          return option ? getEntityName(option, currentLanguage) : value;
        }
        return value;
      
      case 'multiselect':
        if (attribute.options && Array.isArray(attribute.options) && Array.isArray(value)) {
          return (
            <div className="flex flex-wrap gap-1">
              {value.map((val: string) => {
                const option = attribute.options.find((opt: any) => opt._id === val);
                return (
                  <span key={val} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {option ? getEntityName(option, currentLanguage) : val}
                  </span>
                );
              })}
            </div>
          );
        }
        return Array.isArray(value) ? value.join(', ') : value;
      
      case 'date':
        return new Date(value).toLocaleDateString('tr-TR');
      
      case 'datetime':
        return new Date(value).toLocaleString('tr-TR');
      
      case 'time':
        return new Date(`2000-01-01T${value}`).toLocaleTimeString('tr-TR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      
      case 'number':
      case 'integer':
      case 'decimal':
        return (
          <span className="font-mono">
            {typeof value === 'number' ? value.toLocaleString('tr-TR') : value}
          </span>
        );
      
      case 'email':
        return (
          <a 
            href={`mailto:${value}`} 
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {value}
          </a>
        );
      
      case 'url':
        return (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {value}
          </a>
        );
      
      case 'textarea':
      case 'text':
      case 'string':
      default:
        return (
          <span className="whitespace-pre-wrap">
            {String(value)}
          </span>
        );
    }
  };

  // Get attribute type display name
  const getTypeDisplayName = () => {
    const typeMap: Record<string, string> = {
      'text': 'Metin',
      'string': 'Metin',
      'number': 'Sayı',
      'integer': 'Tam Sayı',
      'decimal': 'Ondalık',
      'boolean': 'Evet/Hayır',
      'select': 'Seçim',
      'multiselect': 'Çoklu Seçim',
      'date': 'Tarih',
      'datetime': 'Tarih & Saat',
      'time': 'Saat',
      'email': 'E-posta',
      'url': 'URL',
      'textarea': 'Uzun Metin',
      'password': 'Şifre'
    };
    return typeMap[attribute.type] || attribute.type;
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {getEntityName(attribute, currentLanguage)}
              </h4>
              {attribute.isRequired && (
                <span className="text-red-500 text-xs">*</span>
              )}
            </div>
            {getEntityDescription(attribute, currentLanguage) && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {getEntityDescription(attribute, currentLanguage)}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              {getTypeDisplayName()}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {attribute.code}
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {isEditing ? (
          <div className="space-y-2">
            <AttributeInput
              attribute={attribute}
              value={value}
              onChange={onChange || (() => {})}
              error={error}
              disabled={disabled}
            />
            {error && (
              <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            )}
          </div>
        ) : (
          <div className="min-h-[2.5rem] flex items-center">
            {renderValue()}
          </div>
        )}
      </div>
    </div>
  );
});

export default AttributeDisplay; 