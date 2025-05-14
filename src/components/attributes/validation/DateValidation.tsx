import React from 'react';
import { AttributeValidation } from '../../../services/api/attributeService';

interface DateValidationProps {
  validation: Partial<AttributeValidation>;
  onChange: (validation: Partial<AttributeValidation>) => void;
}

const DateValidation: React.FC<DateValidationProps> = ({ validation, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    onChange({
      ...validation,
      [name]: value || undefined
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Tarih Doğrulama Kuralları</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Minimum Tarih */}
        <div>
          <label htmlFor="minDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Minimum Tarih
          </label>
          <input
            type="date"
            id="minDate"
            name="minDate"
            value={validation.minDate || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            İzin verilen minimum tarih (doldurmayın: sınır yok)
          </p>
        </div>
        
        {/* Maximum Tarih */}
        <div>
          <label htmlFor="maxDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Maksimum Tarih
          </label>
          <input
            type="date"
            id="maxDate"
            name="maxDate"
            value={validation.maxDate || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            İzin verilen maksimum tarih (doldurmayın: sınır yok)
          </p>
        </div>
      </div>
      
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mt-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Not: Eğer hem minimum hem de maksimum tarih belirtirseniz, girilen değer bu iki tarih arasında olmalıdır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateValidation; 