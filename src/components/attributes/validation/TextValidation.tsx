import React from 'react';
import { AttributeValidation } from '../../../services/api/attributeService';
import { useTranslation } from '../../../context/i18nContext';

interface TextValidationProps {
  validation: Partial<AttributeValidation>;
  onChange: (validation: Partial<AttributeValidation>) => void;
}

const TextValidation: React.FC<TextValidationProps> = ({ validation, onChange }) => {
  const { t, currentLanguage } = useTranslation();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = name !== 'pattern' ? parseInt(value) || undefined : undefined;
    
    onChange({
      ...validation,
      [name]: name === 'pattern' ? value : numValue
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">{t('text_validation_rules', 'validation')}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Minimum Uzunluk */}
        <div>
          <label htmlFor="minLength" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('min_length', 'validation')}
          </label>
          <input
            type="number"
            id="minLength"
            name="minLength"
            min="0"
            value={validation.minLength || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
            placeholder={t('min_length_placeholder', 'validation')}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t('min_length_help', 'validation')}
          </p>
        </div>
        
        {/* Maximum Uzunluk */}
        <div>
          <label htmlFor="maxLength" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('max_length', 'validation')}
          </label>
          <input
            type="number"
            id="maxLength"
            name="maxLength"
            min="0"
            value={validation.maxLength || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
            placeholder={t('max_length_placeholder', 'validation')}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t('max_length_help', 'validation')}
          </p>
        </div>
      </div>
      
      {/* Regex Pattern */}
      <div>
        <label htmlFor="pattern" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('pattern', 'validation')}
        </label>
        <input
          type="text"
          id="pattern"
          name="pattern"
          value={validation.pattern || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
          placeholder={t('pattern_placeholder', 'validation')}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {t('pattern_help', 'validation')}
        </p>
      </div>
    </div>
  );
};

export default TextValidation; 