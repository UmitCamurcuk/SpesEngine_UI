import React, { useEffect, useState } from 'react';
import AssociationSelector from './AssociationSelector';
import { IAssociationRule, AssociationValidationResult } from './types';
import { useTranslation } from '../../context/i18nContext';

interface AssociationSectionProps {
  itemTypeCode: string;
  associations: Record<string, any>;
  onAssociationsChange: (associations: Record<string, any>) => void;
  associationRules?: IAssociationRule[];
  onRulesLoaded?: (rules: IAssociationRule[]) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  displayConfigs?: Record<string, any>; // RelationshipType displayConfigs
}

const AssociationSection: React.FC<AssociationSectionProps> = ({
  itemTypeCode,
  associations,
  onAssociationsChange,
  associationRules = [],
  onRulesLoaded,
  errors = {},
  disabled = false,
  displayConfigs = {}
}) => {
  const { currentLanguage } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<AssociationValidationResult | null>(null);

  // Generate association key
  const getAssociationKey = (rule: IAssociationRule): string => {
    return `${rule.targetItemTypeCode}_${rule.association}`;
  };

  // Handle individual association change
  const handleAssociationChange = (rule: IAssociationRule, value: string | string[] | null) => {
    const key = getAssociationKey(rule);
    const newAssociations = { ...associations };
    
    if (value === null || (Array.isArray(value) && value.length === 0)) {
      delete newAssociations[key];
    } else {
      newAssociations[key] = value;
    }
    
    onAssociationsChange(newAssociations);
  };

  // Get association value for a rule
  const getAssociationValue = (rule: IAssociationRule): string | string[] | null => {
    const key = getAssociationKey(rule);
    return associations[key] || null;
  };

  // Real-time validation
  useEffect(() => {
    validateAssociations();
  }, [associations, associationRules]);

  const validateAssociations = () => {
    const errors: Array<{ associationKey: string; rule: IAssociationRule; message: string }> = [];
    const warnings: Array<{ associationKey: string; rule: IAssociationRule; message: string }> = [];

    associationRules.forEach(rule => {
      const key = getAssociationKey(rule);
      const value = associations[key];
      
      // Check required associations
      if (rule.isRequired && (!value || (Array.isArray(value) && value.length === 0))) {
        errors.push({
          associationKey: key,
          rule,
          message: `${rule.targetItemTypeName || rule.targetItemTypeCode} seçimi zorunludur`
        });
      }

      // Check cardinality
      if (value) {
        const count = Array.isArray(value) ? value.length : 1;
        
        // Min check
        if (rule.cardinality.min && count < rule.cardinality.min) {
          errors.push({
            associationKey: key,
            rule,
            message: `En az ${rule.cardinality.min} ${rule.targetItemTypeName || rule.targetItemTypeCode} seçmelisiniz`
          });
        }

        // Max check
        if (rule.cardinality.max && count > rule.cardinality.max) {
          errors.push({
            associationKey: key,
            rule,
            message: `En fazla ${rule.cardinality.max} ${rule.targetItemTypeName || rule.targetItemTypeCode} seçebilirsiniz`
          });
        }
      }
    });

    setValidationResult({
      isValid: errors.length === 0,
      errors,
      warnings
    });
  };

  // Group rules by category if needed
  const requiredRules = associationRules.filter(rule => rule.isRequired);
  const optionalRules = associationRules.filter(rule => !rule.isRequired);

  if (associationRules.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <p>Bu öğe tipi için tanımlanmış ilişki yoktur</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          İlişkili Öğeler
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Bu öğe ile ilişkili diğer öğeleri seçin
        </p>
      </div>

      {/* Validation Summary */}
      {validationResult && !validationResult.isValid && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                İlişki Validation Hataları
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <ul className="list-disc pl-5 space-y-1">
                  {validationResult.errors.map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Required Associations */}
      {requiredRules.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Zorunlu İlişkiler
          </h4>
          <div className="space-y-4">
            {requiredRules.map((rule, index) => {
              const key = getAssociationKey(rule);
              // DisplayConfig'i bul (association key ile)
              const displayConfig = displayConfigs[key];
              
              
              return (
                <AssociationSelector
                  key={key}
                  rule={rule}
                  value={getAssociationValue(rule)}
                  onChange={(value) => handleAssociationChange(rule, value)}
                  error={errors[key]}
                  disabled={disabled}
                  displayConfig={displayConfig}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Optional Associations */}
      {optionalRules.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            İsteğe Bağlı İlişkiler
          </h4>
          <div className="space-y-4">
            {optionalRules.map((rule, index) => {
              const key = getAssociationKey(rule);
              // DisplayConfig'i bul (association key ile)
              const displayConfig = displayConfigs[key];
              
           
              
              return (
                <AssociationSelector
                  key={key}
                  rule={rule}
                  value={getAssociationValue(rule)}
                  onChange={(value) => handleAssociationChange(rule, value)}
                  error={errors[key]}
                  disabled={disabled}
                  displayConfig={displayConfig}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Statistics */}
      {associationRules.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Toplam ilişki: {associationRules.length}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Seçilen: {Object.keys(associations).length}
            </span>
            <span className={`font-medium ${
              validationResult?.isValid 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {validationResult?.isValid ? '✓ Geçerli' : '✗ Hatalı'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssociationSection;