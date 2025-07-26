import React from 'react';
import { useTranslation } from '../../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../../utils/translationUtils';
import AttributeInput from './AttributeInput';
import TableInput from './TableInput';

interface AttributeGroupSectionProps {
  attributeGroup: any;
  attributes: any[];
  values: Record<string, any>;
  errors: Record<string, string>;
  onChange: (attributeId: string, value: any) => void;
  disabled?: boolean;
}

const AttributeGroupSection: React.FC<AttributeGroupSectionProps> = React.memo(({
  attributeGroup,
  attributes,
  values,
  errors,
  onChange,
  disabled = false
}) => {
  const { currentLanguage } = useTranslation();

  if (!attributes || attributes.length === 0) {
    return null;
  }

  // Render validation rules as readable text
  const renderValidationRules = (attribute: any) => {
    if (!attribute.validations || Object.keys(attribute.validations).length === 0) {
      return null;
    }

    const rules: string[] = [];
    const validations = attribute.validations;

    // Common validations
    if (validations.minLength) rules.push(`Min ${validations.minLength} karakter`);
    if (validations.maxLength) rules.push(`Max ${validations.maxLength} karakter`);
    if (validations.min !== undefined) rules.push(`Min değer: ${validations.min}`);
    if (validations.max !== undefined) rules.push(`Max değer: ${validations.max}`);
    if (validations.pattern) rules.push('Özel format gerekli');
    if (validations.isInteger) rules.push('Tam sayı olmalı');
    if (validations.isPositive) rules.push('Pozitif olmalı');
    
    // Table specific validations
    if (attribute.type === 'table') {
      if (validations.minRows) rules.push(`Min ${validations.minRows} satır`);
      if (validations.maxRows) rules.push(`Max ${validations.maxRows} satır`);
      if (validations.columns) rules.push(`${validations.columns.length} sütun`);
    }

    return rules.length > 0 ? (
      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
        <strong>Kurallar:</strong> {rules.join(', ')}
      </div>
    ) : null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
      {/* Modern Group Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-10 h-10 bg-primary-500 rounded-lg shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getEntityName(attributeGroup, currentLanguage) || 'Öznitelik Grubu'}
            </h3>
            <div className="flex items-center space-x-4 mt-1">
              {getEntityDescription(attributeGroup, currentLanguage) && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getEntityDescription(attributeGroup, currentLanguage)}
                </p>
              )}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                {attributes.length} öznitelik
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Attributes Layout */}
      <div className="p-6 space-y-6">
        {attributes.map((attribute) => {
          const isTableType = attribute.type === 'table';
          
          return (
            <div 
              key={attribute._id}
              className={`${
                isTableType ? 'col-span-2' : ''
              } bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 transition-all duration-200 hover:shadow-md ${
                attribute.isRequired 
                  ? 'ring-2 ring-red-100 dark:ring-red-900/30 border-red-200 dark:border-red-700' 
                  : 'hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {/* Attribute Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                    attribute.isRequired 
                      ? 'bg-red-100 dark:bg-red-900/30' 
                      : 'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    {isTableType ? (
                      <svg className={`w-4 h-4 ${attribute.isRequired ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18m-7 8h7m-7 4h7M6 14h1m-1 4h1" />
                      </svg>
                    ) : (
                      <svg className={`w-4 h-4 ${attribute.isRequired ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-semibold text-gray-900 dark:text-white">
                        {getEntityName(attribute, currentLanguage)}
                        {attribute.isRequired && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      
                      {/* Description Tooltip */}
                      {getEntityDescription(attribute, currentLanguage) && (
                        <div className="relative group">
                          <button type="button" className="inline-flex items-center justify-center w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                          </button>
                          
                          {/* Tooltip Content */}
                          <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded-md shadow-lg whitespace-nowrap z-10 max-w-xs">
                            {getEntityDescription(attribute, currentLanguage)}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        isTableType 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {attribute.type}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {attribute.code}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attribute Input */}
              <div className={isTableType ? 'space-y-4' : ''}>
                {isTableType ? (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <TableInput
                      value={values[attribute._id] || []}
                      onChange={(val) => onChange(attribute._id, val)}
                      columns={attribute.validations?.columns || []}
                      minRows={attribute.validations?.minRows || 1}
                      maxRows={attribute.validations?.maxRows || 10}
                      allowAddRows={attribute.validations?.allowAddRows !== false}
                      allowDeleteRows={attribute.validations?.allowDeleteRows !== false}
                      allowEditRows={attribute.validations?.allowEditRows !== false}
                      disabled={disabled}
                      error={errors[attribute._id]}
                    />
                  </div>
                ) : (
                  <AttributeInput
                    attribute={attribute}
                    value={values[attribute._id]}
                    onChange={(value) => onChange(attribute._id, value)}
                    error={errors[attribute._id]}
                    disabled={disabled}
                  />
                )}
              </div>

              {/* Validation Rules */}
              {renderValidationRules(attribute)}

              {/* Error Display */}
              {errors[attribute._id] && (
                <div className="mt-3 flex items-start space-x-2">
                  <svg className="w-4 h-4 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                    {errors[attribute._id]}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default AttributeGroupSection; 