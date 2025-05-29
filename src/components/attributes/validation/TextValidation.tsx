import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../context/i18nContext';
import { AttributeValidation } from '../../../types/attribute';

interface TextValidationProps {
  validation: Partial<AttributeValidation>;
  onChange: (validation: Partial<AttributeValidation>) => void;
}

const TextValidation: React.FC<TextValidationProps> = ({ validation, onChange }) => {
  const { t, currentLanguage } = useTranslation();
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = name !== 'pattern' ? parseInt(value) || undefined : undefined;
    
    const newValidation = {
      ...validation,
      [name]: name === 'pattern' ? value : numValue
    };
    
    // Cross-validation kontrolü
    validateFields(newValidation);
    
    onChange(newValidation);
  };
  
  const validateFields = (currentValidation: Partial<AttributeValidation>) => {
    const newErrors: Record<string, string> = {};
    
    // Min/Max length cross-validation
    if (currentValidation.minLength !== undefined && 
        currentValidation.maxLength !== undefined && 
        currentValidation.minLength > currentValidation.maxLength) {
      newErrors.minLength = 'Minimum uzunluk maksimum uzunluktan büyük olamaz';
      newErrors.maxLength = 'Maksimum uzunluk minimum uzunluktan küçük olamaz';
    }
    
    // Negatif değer kontrolü
    if (currentValidation.minLength !== undefined && currentValidation.minLength < 0) {
      newErrors.minLength = 'Minimum uzunluk negatif olamaz';
    }
    
    if (currentValidation.maxLength !== undefined && currentValidation.maxLength < 0) {
      newErrors.maxLength = 'Maksimum uzunluk negatif olamaz';
    }
    
    setErrors(newErrors);
  };
  
  // Component mount olduğunda mevcut validation'ı kontrol et
  useEffect(() => {
    validateFields(validation);
  }, [validation]);

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
            className={`w-full px-3 py-2 border ${errors.minLength ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white`}
            placeholder={t('min_length_placeholder', 'validation')}
          />
          {errors.minLength ? (
            <p className="mt-1 text-xs text-red-500">{errors.minLength}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('min_length_help', 'validation')}
            </p>
          )}
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
            className={`w-full px-3 py-2 border ${errors.maxLength ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white`}
            placeholder={t('max_length_placeholder', 'validation')}
          />
          {errors.maxLength ? (
            <p className="mt-1 text-xs text-red-500">{errors.maxLength}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('max_length_help', 'validation')}
            </p>
          )}
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