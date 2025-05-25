import React from 'react';
import { useTranslation } from '../../context/i18nContext';

interface TranslationFieldsProps {
  label: string;
  fieldType: 'input' | 'textarea';
  translations: Record<string, string>;
  supportedLanguages: string[];
  currentLanguage: string;
  onChange: (language: string, value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  className?: string;
}

const TranslationFields: React.FC<TranslationFieldsProps> = ({
  label,
  fieldType,
  translations,
  supportedLanguages,
  currentLanguage,
  onChange,
  error,
  placeholder,
  required = false,
  rows = 3,
  className = ''
}) => {
  const { t } = useTranslation();

  const renderField = (language: string) => {
    const commonClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
      error && language === currentLanguage
        ? 'border-red-300 focus:ring-red-500 dark:border-red-700'
        : 'border-gray-300 focus:ring-blue-500 dark:border-gray-600'
    } dark:bg-gray-700 dark:text-white`;

    if (fieldType === 'textarea') {
      return (
        <textarea
          value={translations[language] || ''}
          onChange={(e) => onChange(language, e.target.value)}
          rows={rows}
          className={`${commonClasses} resize-none`}
          placeholder={placeholder || t('enter_description', 'common')}
        />
      );
    }

    return (
      <input
        type="text"
        value={translations[language] || ''}
        onChange={(e) => onChange(language, e.target.value)}
        className={commonClasses}
        placeholder={placeholder || `${language.toUpperCase()} dilinde girin`}
      />
    );
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className={fieldType === 'input' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
        {supportedLanguages && supportedLanguages.length > 0 && supportedLanguages.map((language) => (
          <div key={language}>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              {language.toUpperCase()}
              {language === currentLanguage && required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(language)}
          </div>
        ))}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default TranslationFields; 