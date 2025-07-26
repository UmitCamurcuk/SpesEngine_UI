import React from 'react';
import { useTranslation } from '../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../utils/translationUtils';
import { AttributeInput } from './inputs';
import TableDisplay from './TableDisplay';

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
      
      case 'table':
        return (
          <TableDisplay
            value={value}
            columns={attribute.validations?.columns || []}
            isEditing={isEditing}
            onChange={onChange}
            disabled={disabled}
          />
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
      'password': 'Şifre',
      'table': 'Tablo'
    };
    return typeMap[attribute.type] || attribute.type;
  };

  // Special handling for table type
  if (attribute.type === 'table') {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                    {getEntityName(attribute, currentLanguage)}
                    {attribute.isRequired && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </h4>
                  {getEntityDescription(attribute, currentLanguage) && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {getEntityDescription(attribute, currentLanguage)}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                📊 {getTypeDisplayName()}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {attribute.code}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <TableDisplay
            value={value}
            columns={attribute.validations?.columns || []}
            isEditing={isEditing}
            onChange={onChange}
            disabled={disabled}
          />
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Get type icon
  const getTypeIcon = () => {
    const iconMap: Record<string, string> = {
      'text': '📝',
      'string': '📝',
      'number': '🔢',
      'integer': '🔢',
      'decimal': '🔢',
      'boolean': '✅',
      'select': '📋',
      'multiselect': '📋',
      'date': '📅',
      'datetime': '🕐',
      'time': '⏰',
      'email': '📧',
      'url': '🌐',
      'textarea': '📄',
      'password': '🔒'
    };
    return iconMap[attribute.type] || '📋';
  };

  // Get type color
  const getTypeColor = () => {
    const colorMap: Record<string, string> = {
      'text': 'blue',
      'string': 'blue',
      'number': 'green',
      'integer': 'green',
      'decimal': 'green',
      'boolean': 'purple',
      'select': 'indigo',
      'multiselect': 'indigo',
      'date': 'pink',
      'datetime': 'pink',
      'time': 'pink',
      'email': 'yellow',
      'url': 'cyan',
      'textarea': 'gray',
      'password': 'red'
    };
    return colorMap[attribute.type] || 'gray';
  };

  const typeColor = getTypeColor();

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className={`bg-gradient-to-r from-${typeColor}-50 to-${typeColor}-100 dark:from-${typeColor}-900/30 dark:to-${typeColor}-800/30 px-5 py-4 border-b border-gray-200 dark:border-gray-700`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div className={`h-8 w-8 rounded-lg bg-${typeColor}-100 dark:bg-${typeColor}-900/50 flex items-center justify-center`}>
                <span className="text-sm">{getTypeIcon()}</span>
              </div>
              <div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                  {getEntityName(attribute, currentLanguage)}
                  {attribute.isRequired && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </h4>
                {getEntityDescription(attribute, currentLanguage) && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {getEntityDescription(attribute, currentLanguage)}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-${typeColor}-100 text-${typeColor}-800 dark:bg-${typeColor}-900/50 dark:text-${typeColor}-300`}>
              {getTypeDisplayName()}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {attribute.code}
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        {isEditing ? (
          <div className="space-y-3">
            <AttributeInput
              attribute={attribute}
              value={value}
              onChange={onChange || (() => {})}
              error={error}
              disabled={disabled}
            />
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="min-h-[3rem] flex items-center">
            <div className="w-full">
              {renderValue()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default AttributeDisplay; 