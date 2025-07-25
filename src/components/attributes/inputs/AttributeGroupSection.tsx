import React from 'react';
import { useTranslation } from '../../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../../utils/translationUtils';
import AttributeInput from './AttributeInput';

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

  return (
    <div className="space-y-6">
      {/* Attribute Group Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full">
            <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getEntityName(attributeGroup, currentLanguage) || 'Öznitelik Grubu'}
            </h3>
            {getEntityDescription(attributeGroup, currentLanguage) && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {getEntityDescription(attributeGroup, currentLanguage)}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {attributes.length} öznitelik
            </p>
          </div>
        </div>
      </div>

      {/* Attributes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {attributes.map((attribute) => (
          <div 
            key={attribute._id}
            className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors ${
              attribute.isRequired 
                ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50' 
                : 'bg-gray-50 dark:bg-gray-800/50'
            }`}
          >
            <AttributeInput
              attribute={attribute}
              value={values[attribute._id]}
              onChange={(value) => onChange(attribute._id, value)}
              error={errors[attribute._id]}
              disabled={disabled}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

export default AttributeGroupSection; 