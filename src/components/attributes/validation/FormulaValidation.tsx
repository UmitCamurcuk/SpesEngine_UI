import React from 'react';
import { AttributeValidation } from '../../../types/attribute';
import { useTranslation } from '../../../context/i18nContext';

interface FormulaValidationProps {
  validation: Partial<AttributeValidation>;
  onChange: (validation: Partial<AttributeValidation>) => void;
}

const FormulaValidation: React.FC<FormulaValidationProps> = ({ validation, onChange }) => {
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'variables' || name === 'functions') {
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
        Formül Validasyon Kuralları
      </h3>
      
      <div className="grid grid-cols-1 gap-4">
        {/* İzin Verilen Değişkenler */}
        <div>
          <label htmlFor="variables" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            İzin Verilen Değişkenler
          </label>
          <input
            type="text"
            id="variables"
            name="variables"
            value={validation.variables?.join(', ') || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
            placeholder="genişlik, yükseklik, adet, fiyat"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Formülde kullanılabilecek değişken isimlerini virgülle ayırın
          </p>
        </div>
        
        {/* İzin Verilen Fonksiyonlar */}
        <div>
          <label htmlFor="functions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            İzin Verilen Fonksiyonlar
          </label>
          <input
            type="text"
            id="functions"
            name="functions"
            value={validation.functions?.join(', ') || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
            placeholder="SUM, MULTIPLY, DIVIDE, SUBTRACT, AVERAGE, MIN, MAX"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Formülde kullanılabilecek fonksiyon isimlerini virgülle ayırın
          </p>
        </div>
        
        {/* Varsayılan Formül */}
        <div>
          <label htmlFor="defaultFormula" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Varsayılan Formül
          </label>
          <textarea
            id="defaultFormula"
            name="defaultFormula"
            value={validation.defaultFormula || ''}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
            placeholder="SUM(genişlik * yükseklik * adet)"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Öğe oluşturulurken varsayılan olarak kullanılacak formül
          </p>
        </div>
        
        {/* Validasyon Seçenekleri */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-2">
            Validasyon Seçenekleri
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireValidSyntax"
                name="requireValidSyntax"
                checked={validation.requireValidSyntax || false}
                onChange={handleChange}
                className="h-4 w-4 text-primary-light dark:text-primary-dark rounded border-gray-300 dark:border-gray-600 focus:ring-primary-light dark:focus:ring-primary-dark"
              />
              <label htmlFor="requireValidSyntax" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Geçerli formül sözdizimi zorunlu
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowEmptyFormula"
                name="allowEmptyFormula"
                checked={validation.allowEmptyFormula || false}
                onChange={handleChange}
                className="h-4 w-4 text-primary-light dark:text-primary-dark rounded border-gray-300 dark:border-gray-600 focus:ring-primary-light dark:focus:ring-primary-dark"
              />
              <label htmlFor="allowEmptyFormula" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Boş formüle izin ver
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormulaValidation; 