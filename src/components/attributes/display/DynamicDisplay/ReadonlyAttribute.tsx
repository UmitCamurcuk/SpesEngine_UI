import React from 'react';
import { useTranslation } from '../../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../../utils/translationUtils';

interface ReadonlyAttributeProps {
  attribute: any;
  value: any;
  onChange?: (value: any) => void;
  error?: string;
  disabled?: boolean;
  isEditing?: boolean;
}

// Tablo sütununda gösterim için
export const ReadonlyTableDisplay: React.FC<ReadonlyAttributeProps> = ({ value }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400 italic">-</span>;
  }

  return (
    <span className="text-sm text-gray-600 dark:text-gray-400">
      {String(value)}
    </span>
  );
};

// Edit modunda input için (readonly olduğu için sadece görüntüleme)
export const ReadonlyEditInput: React.FC<ReadonlyAttributeProps> = ({
  attribute,
  value,
  error
}) => {
  const { currentLanguage } = useTranslation();

  return (
    <div className="space-y-2">
      <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed">
        {value || '-'}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

// Item detay sayfasında gösterim için
export const ReadonlyDetailDisplay: React.FC<ReadonlyAttributeProps> = ({
  attribute,
  value,
  isEditing = false,
  error
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
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(Salt okunur)</span>
        </label>
        <ReadonlyEditInput
          attribute={attribute}
          value={value}
          error={error}
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
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(Salt okunur)</span>
      </label>
      <div className="min-h-[2.5rem] flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        {value === null || value === undefined || value === '' ? (
          <span className="text-gray-400 italic">-</span>
        ) : (
          <span>
            {String(value)}
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
