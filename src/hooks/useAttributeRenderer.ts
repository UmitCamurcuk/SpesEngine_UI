import React, { useMemo } from 'react';
import { useTranslation } from '../context/i18nContext';
import { getEntityName } from '../utils/translationUtils';

export interface AttributeData {
  _id: string;
  name: any;
  type: string;
  options?: any[];
  [key: string]: any;
}

export const useAttributeRenderer = () => {
  const { currentLanguage } = useTranslation();

  const renderAttributeValue = useMemo(() => {
    return (
      value: any, 
      attributeData?: AttributeData
    ): React.ReactNode => {
      if (!value || value === null || value === undefined) {
        return '-';
      }

      const attributeType = attributeData?.type || 'text';

      switch (attributeType) {
        case 'image':
          if (typeof value === 'string' && value.startsWith('http')) {
            return React.createElement('img', {
              src: value,
              alt: "Attribute",
              className: "w-16 h-16 object-cover rounded border",
              onError: (e: any) => {
                e.target.src = '/placeholder.png';
              }
            });
          }
          return value ? React.createElement('span', { className: "text-blue-600" }, "🖼️ ", value) : '-';

        case 'select':
          // Select tipinde seçilen option'ın name'ini göster
          if (attributeData?.options && Array.isArray(attributeData.options)) {
            const selectedOption = attributeData.options.find((opt: any) => 
              opt._id === value || opt.code === value || opt.value === value
            );
            if (selectedOption) {
              return getEntityName(selectedOption, currentLanguage);
            }
          }
          return typeof value === 'object' ? JSON.stringify(value) : String(value);

        case 'table':
          // Table tipindeki veriyi tablo olarak göster
          if (Array.isArray(value) && value.length > 0) {
            const tableData = value[0]; // İlk satırı göster
            if (typeof tableData === 'object') {
              const tableRows = Object.entries(tableData).map(([key, val]) => 
                React.createElement('div', { key, className: "flex justify-between" },
                  React.createElement('span', { className: "font-medium" }, key + ":"),
                  React.createElement('span', null, String(val))
                )
              );
              
              const moreRows = value.length > 1 ? 
                React.createElement('div', { className: "text-center text-gray-500 mt-1" }, 
                  `+${value.length - 1} more rows`
                ) : null;
              
              return React.createElement('div', { 
                className: "text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded border max-w-xs" 
              }, tableRows, moreRows);
            }
          }
          return typeof value === 'object' ? JSON.stringify(value) : String(value);

        case 'date':
          if (value) {
            try {
              return new Date(value).toLocaleDateString('tr-TR');
            } catch {
              return String(value);
            }
          }
          return '-';

        case 'boolean':
          return value ? 
            React.createElement('span', { className: "px-2 py-1 bg-green-100 text-green-800 rounded text-xs" }, "Evet") :
            React.createElement('span', { className: "px-2 py-1 bg-red-100 text-red-800 rounded text-xs" }, "Hayır");

        case 'number':
          return typeof value === 'number' ? value.toLocaleString('tr-TR') : String(value);

        case 'text':
        case 'textarea':
        case 'string':
        default:
          const strValue = String(value);
          return strValue.length > 50 ? 
            React.createElement('span', { title: strValue }, strValue.substring(0, 50) + "...") : 
            strValue;
      }
    };
  }, [currentLanguage]);

  return { renderAttributeValue };
}; 