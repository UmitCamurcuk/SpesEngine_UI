import React from 'react';
import { AttributeValidation } from '../../../types/attribute';
import { useTranslation } from '../../../context/i18nContext';

interface ObjectValidationProps {
  validation: Partial<AttributeValidation>;
  onChange: (validation: Partial<AttributeValidation>) => void;
}

const ObjectValidation: React.FC<ObjectValidationProps> = ({ validation, onChange }) => {
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'requiredProperties') {
      // Virgülle ayrılmış string'i array'e çevir
      processedValue = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
      if (processedValue.length === 0) {
        processedValue = undefined;
      }
    }
    
    onChange({
      ...validation,
      [name]: processedValue === '' ? undefined : processedValue
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
        Nesne Validasyon Kuralları
      </h3>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Zorunlu Özellikler */}
        <div>
          <label htmlFor="requiredProperties" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Zorunlu Özellikler
          </label>
          <input
            type="text"
            id="requiredProperties"
            name="requiredProperties"
            value={validation.requiredProperties?.join(', ') || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
            placeholder="ad, soyad, eposta, telefon"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Nesnede bulunması zorunlu özellik isimlerini virgülle ayırın
          </p>
        </div>
        
        {/* JSON Schema */}
        <div>
          <label htmlFor="jsonSchema" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            JSON Schema
          </label>
          <textarea
            id="jsonSchema"
            name="jsonSchema"
            value={validation.jsonSchema || ''}
            onChange={handleChange}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white font-mono text-sm"
            placeholder={`{
  "type": "object",
  "properties": {
    "ad": { "type": "string" },
    "yas": { "type": "number" }
  }
}`}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Nesne yapısını tanımlamak için JSON Schema kullanın
          </p>
        </div>
        
        {/* Validasyon Seçenekleri */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-2">
            Nesne Seçenekleri
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="strictMode"
                name="strictMode"
                checked={validation.strictMode || false}
                onChange={handleChange}
                className="h-4 w-4 text-primary-light dark:text-primary-dark rounded border-gray-300 dark:border-gray-600 focus:ring-primary-light dark:focus:ring-primary-dark"
              />
              <label htmlFor="strictMode" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Katı mod (Tanımlanmamış özelliklere izin verme)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowEmptyObject"
                name="allowEmptyObject"
                checked={validation.allowEmptyObject || false}
                onChange={handleChange}
                className="h-4 w-4 text-primary-light dark:text-primary-dark rounded border-gray-300 dark:border-gray-600 focus:ring-primary-light dark:focus:ring-primary-dark"
              />
              <label htmlFor="allowEmptyObject" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Boş nesneye izin ver
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObjectValidation; 