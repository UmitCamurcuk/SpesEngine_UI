import React, { useState, useEffect } from 'react';
import { AttributeValidation } from '../../../types/attribute';
import { useTranslation } from '../../../context/i18nContext';

interface NumberValidationProps {
  validation: Partial<AttributeValidation>;
  onChange: (validation: Partial<AttributeValidation>) => void;
}

const NumberValidation: React.FC<NumberValidationProps> = ({ validation, onChange }) => {
  const { t, currentLanguage } = useTranslation();
  const [exactDigits, setExactDigits] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      // Boş string kontrolü
      if (value === '') {
        processedValue = undefined;
      } else {
        const numValue = parseFloat(value);
        processedValue = isNaN(numValue) ? undefined : numValue;
      }
    }
    
    const newValidation = {
      ...validation,
      [name]: processedValue
    };
    
    // Cross-validation kontrolü
    validateFields(newValidation);
    
    onChange(newValidation);
  };
  
  const validateFields = (currentValidation: Partial<AttributeValidation>) => {
    const newErrors: Record<string, string> = {};
    
    // Min/Max value cross-validation
    if (currentValidation.min !== undefined && 
        currentValidation.max !== undefined && 
        currentValidation.min > currentValidation.max) {
      newErrors.min = 'Minimum değer maksimum değerden büyük olamaz';
      newErrors.max = 'Maksimum değer minimum değerden küçük olamaz';
    }
    
    setErrors(newErrors);
  };
  
  // Component mount olduğunda mevcut validation'ı kontrol et
  useEffect(() => {
    validateFields(validation);
  }, [validation]);
  
  // Tam olarak X haneli sayı kısayolu
  const handleExactDigitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value;
    setExactDigits(digits);
    
    if (digits) {
      const digitCount = parseInt(digits);
      // min ve max değerleri belirleme
      if (digitCount > 0) {
        // Tam olarak n haneli bir sayı için:
        // n=1: min=0, max=9
        // n=2: min=10, max=99 
        // n=3: min=100, max=999
        // ...
        // n=11: min=10000000000, max=99999999999 (TCKNO için)
        const minValue = digitCount === 1 ? 0 : Math.pow(10, digitCount - 1);
        const maxValue = Math.pow(10, digitCount) - 1;
        
        const updatedValidation = {
          ...validation,
          min: minValue,
          max: maxValue,
          isInteger: true  // Tam hane için tam sayı (integer) kısıtlaması ekliyoruz
        };
        
        console.log(`[TCKNO Debug] Tam Hane sayısı değişti - ${digits} hane:`, updatedValidation);
        console.log(`[TCKNO Debug] ${digits} haneli sayı şu aralıkta olmalı: ${minValue} - ${maxValue}`);
        console.log(`[TCKNO Debug] Validasyon nesnesi:`, JSON.stringify(updatedValidation));
        
        // console.trace() ile çağrı yığınını kontrol et
        console.trace("[TCKNO Debug] validasyon değişikliği çağrı zinciri");
        
        onChange(updatedValidation);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">{t('number_validation_rules', 'validation')}</h3>
      
      {/* TCKNO gibi belirli hane sayısı gerektiren durumlar için kısayol */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 mb-4">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">{t('exact_digits_number', 'validation')}</h4>
        <div className="flex items-center">
          <input
            type="number"
            id="exactDigits"
            name="exactDigits"
            value={exactDigits}
            onChange={handleExactDigitsChange}
            min="1"
            max="20"
            className="w-20 px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white mr-2"
            placeholder={t('exact_digits_placeholder', 'validation')}
          />
          <label htmlFor="exactDigits" className="text-sm text-blue-700 dark:text-blue-400">
            {t('exact_digits_label', 'validation')}
          </label>
        </div>
        {exactDigits && parseInt(exactDigits) > 0 && (
          <p className="mt-1 text-xs text-blue-700 dark:text-blue-400">
            {t('exact_digits_range', 'validation').replace('{digits}', parseInt(exactDigits).toString())
              .replace('{min}', Math.pow(10, parseInt(exactDigits) - 1).toString())
              .replace('{max}', (Math.pow(10, parseInt(exactDigits)) - 1).toString())}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Minimum Değer */}
        <div>
          <label htmlFor="min" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('min_value', 'validation')}
          </label>
          <input
            type="number"
            id="min"
            name="min"
            value={validation.min === undefined ? '' : validation.min}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.min ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white`}
            placeholder={t('min_value_placeholder', 'validation')}
          />
          {errors.min ? (
            <p className="mt-1 text-xs text-red-500">{errors.min}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('min_value_help', 'validation')}
            </p>
          )}
        </div>
        
        {/* Maximum Değer */}
        <div>
          <label htmlFor="max" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('max_value', 'validation')}
          </label>
          <input
            type="number"
            id="max"
            name="max"
            value={validation.max === undefined ? '' : validation.max}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.max ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white`}
            placeholder={t('max_value_placeholder', 'validation')}
          />
          {errors.max ? (
            <p className="mt-1 text-xs text-red-500">{errors.max}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('max_value_help', 'validation')}
            </p>
          )}
        </div>
      </div>
      
      {/* Sayı Tipi Kısıtlamaları */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-2">{t('number_type_constraints', 'validation')}</h4>
        
        <div className="space-y-3">
          {/* Tam Sayı */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isInteger"
              name="isInteger"
              checked={validation.isInteger || false}
              onChange={handleChange}
              className="h-4 w-4 text-primary-light dark:text-primary-dark rounded border-gray-300 dark:border-gray-600 focus:ring-primary-light dark:focus:ring-primary-dark"
            />
            <label htmlFor="isInteger" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {t('only_integers', 'validation')}
            </label>
          </div>
          
          {/* Pozitif/Negatif/Sıfır */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPositive"
                name="isPositive"
                checked={validation.isPositive || false}
                onChange={handleChange}
                className="h-4 w-4 text-primary-light dark:text-primary-dark rounded border-gray-300 dark:border-gray-600 focus:ring-primary-light dark:focus:ring-primary-dark"
              />
              <label htmlFor="isPositive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {t('only_positive', 'validation')}
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isNegative"
                name="isNegative"
                checked={validation.isNegative || false}
                onChange={handleChange}
                className="h-4 w-4 text-primary-light dark:text-primary-dark rounded border-gray-300 dark:border-gray-600 focus:ring-primary-light dark:focus:ring-primary-dark"
              />
              <label htmlFor="isNegative" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {t('only_negative', 'validation')}
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isZero"
                name="isZero"
                checked={validation.isZero || false}
                onChange={handleChange}
                className="h-4 w-4 text-primary-light dark:text-primary-dark rounded border-gray-300 dark:border-gray-600 focus:ring-primary-light dark:focus:ring-primary-dark"
              />
              <label htmlFor="isZero" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {t('allow_zero', 'validation')}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberValidation; 