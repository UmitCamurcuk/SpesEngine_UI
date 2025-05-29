import React, { useState, useEffect } from 'react';
import { AttributeValidation } from '../../../types/attribute';

interface SelectValidationProps {
  validation: Partial<AttributeValidation>;
  onChange: (validation: Partial<AttributeValidation>) => void;
  isMultiSelect: boolean;
}

const SelectValidation: React.FC<SelectValidationProps> = ({ validation, onChange, isMultiSelect }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || undefined;
    
    const newValidation = {
      ...validation,
      [name]: numValue
    };
    
    // Cross-validation kontrolü
    validateFields(newValidation);
    
    onChange(newValidation);
  };
  
  const validateFields = (currentValidation: Partial<AttributeValidation>) => {
    const newErrors: Record<string, string> = {};
    
    // Min/Max selections cross-validation
    if (currentValidation.minSelections !== undefined && 
        currentValidation.maxSelections !== undefined && 
        currentValidation.minSelections > currentValidation.maxSelections) {
      newErrors.minSelections = 'Minimum seçim sayısı maksimum seçim sayısından büyük olamaz';
      newErrors.maxSelections = 'Maksimum seçim sayısı minimum seçim sayısından küçük olamaz';
    }
    
    // Negatif değer kontrolü
    if (currentValidation.minSelections !== undefined && currentValidation.minSelections < 0) {
      newErrors.minSelections = 'Minimum seçim sayısı negatif olamaz';
    }
    
    if (currentValidation.maxSelections !== undefined && currentValidation.maxSelections < 0) {
      newErrors.maxSelections = 'Maksimum seçim sayısı negatif olamaz';
    }
    
    setErrors(newErrors);
  };
  
  // Component mount olduğunda mevcut validation'ı kontrol et
  useEffect(() => {
    validateFields(validation);
  }, [validation]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
        {isMultiSelect ? 'Çoklu Seçim Doğrulama Kuralları' : 'Seçim Doğrulama Kuralları'}
      </h3>
      
      {isMultiSelect && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Minimum Seçim */}
          <div>
            <label htmlFor="minSelections" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Minimum Seçim Sayısı
            </label>
            <input
              type="number"
              id="minSelections"
              name="minSelections"
              min="0"
              value={validation.minSelections || ''}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.minSelections ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white`}
              placeholder="Örn: 1"
            />
            {errors.minSelections ? (
              <p className="mt-1 text-xs text-red-500">{errors.minSelections}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                En az kaç seçim yapılmalı (doldurmayın: sınır yok)
              </p>
            )}
          </div>
          
          {/* Maximum Seçim */}
          <div>
            <label htmlFor="maxSelections" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Maksimum Seçim Sayısı
            </label>
            <input
              type="number"
              id="maxSelections"
              name="maxSelections"
              min="0"
              value={validation.maxSelections || ''}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.maxSelections ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white`}
              placeholder="Örn: 3"
            />
            {errors.maxSelections ? (
              <p className="mt-1 text-xs text-red-500">{errors.maxSelections}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                En fazla kaç seçim yapılabilir (doldurmayın: sınır yok)
              </p>
            )}
          </div>
        </div>
      )}
      
      {!isMultiSelect && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Tekli seçim (Select) tipi için özel doğrulama kuralları gerekmez. Bu tip, kullanıcının tek bir seçim yapmasını sağlar.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectValidation; 