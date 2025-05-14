import React from 'react';
import { AttributeValidation } from '../../../services/api/attributeService';

interface TextValidationProps {
  validation: Partial<AttributeValidation>;
  onChange: (validation: Partial<AttributeValidation>) => void;
}

const TextValidation: React.FC<TextValidationProps> = ({ validation, onChange }) => {
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
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Metin Doğrulama Kuralları</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Minimum Uzunluk */}
        <div>
          <label htmlFor="minLength" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Minimum Uzunluk
          </label>
          <input
            type="number"
            id="minLength"
            name="minLength"
            min="0"
            value={validation.minLength || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
            placeholder="Örn: 3"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Minimum karakter sayısı (doldurmayın: sınır yok)
          </p>
        </div>
        
        {/* Maximum Uzunluk */}
        <div>
          <label htmlFor="maxLength" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Maksimum Uzunluk
          </label>
          <input
            type="number"
            id="maxLength"
            name="maxLength"
            min="0"
            value={validation.maxLength || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
            placeholder="Örn: 100"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Maximum karakter sayısı (doldurmayın: sınır yok)
          </p>
        </div>
      </div>
      
      {/* Regex Pattern */}
      <div>
        <label htmlFor="pattern" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Desen (Regex)
        </label>
        <input
          type="text"
          id="pattern"
          name="pattern"
          value={validation.pattern || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
          placeholder="Örn: ^[a-zA-Z0-9]+$"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Değer bu desene (regex) uygun olmalıdır (doldurmayın: serbest)
        </p>
      </div>
    </div>
  );
};

export default TextValidation; 