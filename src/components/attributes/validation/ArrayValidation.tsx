import React from 'react';
import { AttributeValidation } from '../../../types/attribute';
import { useTranslation } from '../../../context/i18nContext';

interface ArrayValidationProps {
  validation: Partial<AttributeValidation>;
  onChange: (validation: Partial<AttributeValidation>) => void;
}

const ArrayValidation: React.FC<ArrayValidationProps> = ({ validation, onChange }) => {
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      if (value === '') {
        processedValue = undefined;
      } else {
        const numValue = parseInt(value);
        processedValue = isNaN(numValue) ? undefined : numValue;
      }
    }
    
    onChange({
      ...validation,
      [name]: processedValue
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
        Dizi Validasyon Kuralları
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Minimum Öğe Sayısı */}
        <div>
          <label htmlFor="minItems" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Minimum Öğe Sayısı
          </label>
          <input
            type="number"
            id="minItems"
            name="minItems"
            value={validation.minItems === undefined ? '' : validation.minItems}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
            placeholder="0"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Dizide bulunması gereken en az öğe sayısı
          </p>
        </div>
        
        {/* Maksimum Öğe Sayısı */}
        <div>
          <label htmlFor="maxItems" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Maksimum Öğe Sayısı
          </label>
          <input
            type="number"
            id="maxItems"
            name="maxItems"
            value={validation.maxItems === undefined ? '' : validation.maxItems}
            onChange={handleChange}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
            placeholder="100"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Dizide bulunabilecek en fazla öğe sayısı
          </p>
        </div>
      </div>
      
      {/* Dizi Öğe Türü */}
      <div>
        <label htmlFor="itemType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Dizi Öğe Türü
        </label>
        <select
          id="itemType"
          name="itemType"
          value={validation.itemType || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
        >
          <option value="">Tür seçin</option>
          <option value="string">Metin (String)</option>
          <option value="number">Sayı (Number)</option>
          <option value="boolean">Doğru/Yanlış (Boolean)</option>
          <option value="object">Nesne (Object)</option>
          <option value="mixed">Karışık (Mixed)</option>
        </select>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Dizi içindeki öğelerin veri türü
        </p>
      </div>
      
      {/* Validasyon Seçenekleri */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-2">
          Dizi Seçenekleri
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="uniqueItems"
              name="uniqueItems"
              checked={validation.uniqueItems || false}
              onChange={handleChange}
              className="h-4 w-4 text-primary-light dark:text-primary-dark rounded border-gray-300 dark:border-gray-600 focus:ring-primary-light dark:focus:ring-primary-dark"
            />
            <label htmlFor="uniqueItems" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Tekrar eden öğelere izin verme
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowEmpty"
              name="allowEmpty"
              checked={validation.allowEmpty || false}
              onChange={handleChange}
              className="h-4 w-4 text-primary-light dark:text-primary-dark rounded border-gray-300 dark:border-gray-600 focus:ring-primary-light dark:focus:ring-primary-dark"
            />
            <label htmlFor="allowEmpty" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Boş diziye izin ver
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArrayValidation; 