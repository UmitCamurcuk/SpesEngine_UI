import React from 'react';
import { AttributeType, AttributeValidation } from '../../../types/attribute';
import { useTranslation } from '../../../context/i18nContext';

import TextValidation from './TextValidation';
import NumberValidation from './NumberValidation';
import DateValidation from './DateValidation';
import SelectValidation from './SelectValidation';
import FormulaValidation from './FormulaValidation';
import ArrayValidation from './ArrayValidation';
import ObjectValidation from './ObjectValidation';
import TableValidation from './TableValidation';

interface ValidationFactoryProps {
  type: AttributeType;
  validation: Partial<AttributeValidation>;
  onChange: (validation: Partial<AttributeValidation>) => void;
}

const ValidationFactory: React.FC<ValidationFactoryProps> = ({ type, validation, onChange }) => {
  const { t, currentLanguage } = useTranslation();
  
  // Validasyonun boş olup olmadığını kontrol et
  const isValidationEmpty = !validation || Object.keys(validation).length === 0;
  
  const renderValidationWarning = () => {
    if (isValidationEmpty) {
      return (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mb-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                {t('no_validation_rules_yet', 'validation')}
              </p>
              <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-500">
                {t('add_validation_rules_prompt', 'validation')}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Tipe göre bileşeni belirle
  const renderValidationComponent = () => {
    switch (type) {
      // Basic Types
      case AttributeType.TEXT:
        return <TextValidation validation={validation} onChange={onChange} />;
        
      case AttributeType.EMAIL:
      case AttributeType.PHONE:
      case AttributeType.URL:
        return <TextValidation validation={validation} onChange={onChange} />;
        
      case AttributeType.NUMBER:
        return <NumberValidation validation={validation} onChange={onChange} />;
        
      case AttributeType.BOOLEAN:
        return (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <h3 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">{t('boolean_validation_rules', 'validation')}</h3>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {t('boolean_validation_info', 'validation')}
                </p>
              </div>
            </div>
          </div>
        );
        
      case AttributeType.DATE:
        return <DateValidation validation={validation} onChange={onChange} />;
        
      case AttributeType.DATETIME:
        return <DateValidation validation={validation} onChange={onChange} />;
        
      case AttributeType.TIME:
        return (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-md p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-purple-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <h3 className="text-sm font-medium text-purple-700 dark:text-purple-400 mb-1">Zaman Validasyon Kuralları</h3>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  Zaman alanları için özel validasyon kuralları henüz desteklenmiyor. Standart zaman formatı (HH:MM:SS) kullanılacak.
                </p>
              </div>
            </div>
          </div>
        );
      
      // Enum Types
      case AttributeType.SELECT:
        return <SelectValidation validation={validation} onChange={onChange} isMultiSelect={false} />;
        
      case AttributeType.MULTISELECT:
        return <SelectValidation validation={validation} onChange={onChange} isMultiSelect={true} />;
      
      // File Types
      case AttributeType.FILE:
      case AttributeType.IMAGE:
      case AttributeType.ATTACHMENT:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Dosya Validasyon Kuralları</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Max File Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maksimum Dosya Boyutu (MB)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={validation.maxFileSize ? (validation.maxFileSize / (1024 * 1024)) : ''}
                  onChange={(e) => {
                    const sizeInMB = parseFloat(e.target.value);
                    const sizeInBytes = sizeInMB ? sizeInMB * 1024 * 1024 : undefined;
                    onChange({
                      ...validation,
                      maxFileSize: sizeInBytes
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
                  placeholder="5"
                />
              </div>
              
              {/* Allowed Extensions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  İzin Verilen Dosya Uzantıları
                </label>
                <input
                  type="text"
                  value={validation.allowedExtensions?.join(', ') || ''}
                  onChange={(e) => {
                    const extensions = e.target.value
                      .split(',')
                      .map(ext => ext.trim())
                      .filter(ext => ext.length > 0);
                    onChange({
                      ...validation,
                      allowedExtensions: extensions.length > 0 ? extensions : undefined
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
                  placeholder=".pdf, .doc, .docx, .jpg, .png"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Virgülle ayırarak birden fazla uzantı belirtebilirsiniz
                </p>
              </div>
            </div>
            
            {/* Max Files (for ATTACHMENT) */}
            {type === AttributeType.ATTACHMENT && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maksimum Dosya Sayısı
                </label>
                <input
                  type="number"
                  min="1"
                  value={validation.maxFiles || ''}
                  onChange={(e) => {
                    const maxFiles = parseInt(e.target.value) || undefined;
                    onChange({
                      ...validation,
                      maxFiles
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
                  placeholder="10"
                />
              </div>
            )}
            
            {/* Image specific validations */}
            {type === AttributeType.IMAGE && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Maksimum Genişlik (px)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={validation.maxWidth || ''}
                    onChange={(e) => {
                      const maxWidth = parseInt(e.target.value) || undefined;
                      onChange({
                        ...validation,
                        maxWidth
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
                    placeholder="1920"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Maksimum Yükseklik (px)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={validation.maxHeight || ''}
                    onChange={(e) => {
                      const maxHeight = parseInt(e.target.value) || undefined;
                      onChange({
                        ...validation,
                        maxHeight
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
                    placeholder="1080"
                  />
                </div>
              </div>
            )}
          </div>
        );
      
      // Composite Types
      case AttributeType.OBJECT:
        return <ObjectValidation validation={validation} onChange={onChange} />;
      
      case AttributeType.ARRAY:
        return <ArrayValidation validation={validation} onChange={onChange} />;
      
      case AttributeType.JSON:
        return (
          <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-md p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-cyan-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <div>
                <h3 className="text-sm font-medium text-cyan-700 dark:text-cyan-400 mb-1">Yapılandırılmış Veri Validasyonu</h3>
                <p className="text-sm text-cyan-700 dark:text-cyan-400">
                  JSON türü validasyon kuralları henüz desteklenmiyor.
                </p>
              </div>
            </div>
          </div>
        );
      
      case AttributeType.FORMULA:
        return <FormulaValidation validation={validation} onChange={onChange} />;
      
      case AttributeType.EXPRESSION:
        return (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-md p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
              <div>
                <h3 className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-1">İfade Validasyonu</h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  İfade türü validasyon kuralları henüz desteklenmiyor.
                </p>
              </div>
            </div>
          </div>
        );
      
      case AttributeType.TABLE:
        return <TableValidation validation={validation} onChange={onChange} />;
      
      // UI Types
      case AttributeType.COLOR:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Renk Validasyon Kuralları</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Renk Formatı
              </label>
              <select
                value={validation.colorFormat || 'hex'}
                onChange={(e) => {
                  const colorFormat = e.target.value as 'hex' | 'rgb' | 'hsl';
                  onChange({
                    ...validation,
                    colorFormat
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
              >
                <option value="hex">HEX (#FF0000)</option>
                <option value="rgb">RGB (rgb(255, 0, 0))</option>
                <option value="hsl">HSL (hsl(0, 100%, 50%))</option>
              </select>
            </div>
          </div>
        );
      
      case AttributeType.RICH_TEXT:
        return <TextValidation validation={validation} onChange={onChange} />;
      
      case AttributeType.RATING:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Derecelendirme Validasyon Kuralları</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minimum Değer
                </label>
                <input
                  type="number"
                  min="0"
                  value={validation.minRating || ''}
                  onChange={(e) => {
                    const minRating = parseInt(e.target.value) || undefined;
                    onChange({
                      ...validation,
                      minRating
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
                  placeholder="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maksimum Değer
                </label>
                <input
                  type="number"
                  min="1"
                  value={validation.maxRating || ''}
                  onChange={(e) => {
                    const maxRating = parseInt(e.target.value) || undefined;
                    onChange({
                      ...validation,
                      maxRating
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
                  placeholder="5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Yarım Yıldız İzni
                </label>
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={validation.allowHalfStars || false}
                    onChange={(e) => {
                      onChange({
                        ...validation,
                        allowHalfStars: e.target.checked
                      });
                    }}
                    className="h-4 w-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Yarım yıldızlara izin ver
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case AttributeType.BARCODE:
      case AttributeType.QR:
        return (
          <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-md p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                  {type === AttributeType.BARCODE ? 'Barkod' : 'QR Kod'} Validasyonu
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  {type === AttributeType.BARCODE 
                    ? "Barkod türü validasyon kuralları henüz desteklenmiyor." 
                    : "QR kod türü validasyon kuralları henüz desteklenmiyor."
                  }
                </p>
              </div>
            </div>
          </div>
        );
      
      // Special Types
      case AttributeType.READONLY:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Sadece-Okunur Validasyon Kuralları</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Varsayılan Değer
              </label>
              <input
                type="text"
                value={validation.defaultValue || ''}
                onChange={(e) => {
                  onChange({
                    ...validation,
                    defaultValue: e.target.value || undefined
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
                placeholder="Varsayılan değer girin"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Bu değer öğe oluşturulurken otomatik olarak atanacak ve sonra değiştirilemeyecek
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-gray-500 dark:text-gray-400 italic p-4 text-center">
            {t('no_validation_rules_for_type', 'validation')}
          </div>
        );
    }
  };
  
  return (
    <div className="space-y-4">
      {renderValidationWarning()}
      {renderValidationComponent()}
    </div>
  );
};

export default ValidationFactory; 