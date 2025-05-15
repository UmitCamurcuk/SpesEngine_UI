import React from 'react';
import { AttributeType } from '../../../types/attribute';
import { AttributeValidation } from '../../../services/api/attributeService';
import { useTranslation } from '../../../context/i18nContext';

import TextValidation from './TextValidation';
import NumberValidation from './NumberValidation';
import DateValidation from './DateValidation';
import SelectValidation from './SelectValidation';

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
      case AttributeType.TEXT:
        return <TextValidation validation={validation} onChange={onChange} />;
        
      case AttributeType.NUMBER:
        return <NumberValidation validation={validation} onChange={onChange} />;
        
      case AttributeType.DATE:
        return <DateValidation validation={validation} onChange={onChange} />;
        
      case AttributeType.SELECT:
        return <SelectValidation validation={validation} onChange={onChange} isMultiSelect={false} />;
        
      case AttributeType.MULTISELECT:
        return <SelectValidation validation={validation} onChange={onChange} isMultiSelect={true} />;
        
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