import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import { useNotification } from '../../../components/notifications';
import Breadcrumb from '../../../components/common/Breadcrumb';
import Stepper from '../../../components/ui/Stepper';
import relationshipService from '../../../services/api/associationService';
import itemTypeService from '../../../services/api/itemTypeService';
import { IRelationshipType } from '../../../types/association';
import { useTranslation } from '../../../context/i18nContext';
import { getEntityName } from '../../../utils/translationUtils';
import TranslationFields from '../../../components/common/TranslationFields';
import { useTranslationForm } from '../../../hooks/useTranslationForm';

// Form data interfaces
interface Step1FormData {
  nameTranslations: Record<string, string>;
  code: string;
  descriptionTranslations: Record<string, string>;
}

interface Step2FormData {
  isDirectional: boolean;
}

interface Step3FormData {
  allowedSourceTypes: string[];
  allowedTargetTypes: string[];
  relationshipType: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
}

interface FormData extends Step1FormData, Step2FormData, Step3FormData {
  metadata: Record<string, any>;
}

const initialFormData: FormData = {
  nameTranslations: {},
  code: '',
  descriptionTranslations: {},
  isDirectional: true,
  allowedSourceTypes: [],
  allowedTargetTypes: [],
  relationshipType: 'one-to-many',
  metadata: {}
};

const CreateAssociationPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  const { showToast } = useNotification();
  
  // Translation hook'unu kullan
  const {
    supportedLanguages,
    translationData,
    handleTranslationChange,
    createTranslations
  } = useTranslationForm();
  
  // Form durumu
  const [formData, setFormData] = useState<FormData>(initialFormData);
  
  // Adım durumu
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // ItemTypes for source and target selection
  const [itemTypes, setItemTypes] = useState<any[]>([]);
  
  // Loading states
  const [isLoadingItemTypes, setIsLoadingItemTypes] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Stepper adımları
  const steps = useMemo(() => [
    { title: t('general_info'), description: t('name_code_description') },
    { title: t('directionality'), description: t('relationship_direction') },
    { title: t('relationship_type_and_types'), description: t('relationship_type_and_types_short') },
    { title: t('preview'), description: t('check_information') },
  ], [t]);
  
  // Load ItemTypes for dropdown
  useEffect(() => {
    loadItemTypes();
  }, []);

  const loadItemTypes = async () => {
    try {
      setIsLoadingItemTypes(true);
      const response = await itemTypeService.getItemTypes();
      setItemTypes(response.itemTypes || response);
    } catch (error) {
      console.error('ItemType\'lar yüklenirken hata:', error);
      showToast({
        title: 'Hata!',
        message: 'Öğe tipleri yüklenirken hata oluştu',
        type: 'error'
      });
    } finally {
      setIsLoadingItemTypes(false);
    }
  };

  // Form validation
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 0: // General info
        // En az bir dilde isim olmalı
        const hasName = Object.values(translationData.nameTranslations).some(name => name.trim());
        if (!hasName) {
          errors.nameTranslations = 'En az bir dilde isim gereklidir';
        }
        if (!formData.code.trim()) {
          errors.code = 'Kod gereklidir';
        } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.code)) {
          errors.code = 'Kod sadece harf, rakam, _ ve - karakterlerini içerebilir';
        }
        break;
      case 1: // Directionality
        // No validation needed
        break;
      case 2: // Allowed types
        if (!formData.relationshipType) {
          errors.relationshipType = 'İlişki tipi seçilmelidir';
        }
        if (formData.allowedSourceTypes.length === 0) {
          errors.allowedSourceTypes = 'En az bir kaynak tip seçmelisiniz';
        }
        if (formData.allowedTargetTypes.length === 0) {
          errors.allowedTargetTypes = 'En az bir hedef tip seçmelisiniz';
        }
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form changes
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleMultiSelectChange = (field: 'allowedSourceTypes' | 'allowedTargetTypes', selectedIds: string[]) => {
    handleInputChange(field, selectedIds);
  };

  // Navigation
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };



  // Submit
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      // Çevirileri oluştur
      const { nameId, descriptionId } = await createTranslations(formData.code, 'relationship_types');

      const relationshipTypeData: Partial<IRelationshipType> = {
        name: nameId,
        code: formData.code,
        description: descriptionId || '',
        isDirectional: formData.isDirectional,
        relationshipType: formData.relationshipType,
        allowedSourceTypes: formData.allowedSourceTypes,
        allowedTargetTypes: formData.allowedTargetTypes,
        metadata: formData.metadata
      };

      await relationshipService.createRelationshipType(relationshipTypeData);
      
      showToast({
        title: 'Başarılı!',
        message: 'İlişki tipi başarıyla oluşturuldu',
        type: 'success'
      });
      
      navigate('/associations');
    } catch (error: any) {
      console.error('İlişki tipi oluşturulurken hata:', error);
      setError(error.response?.data?.message || error.message || 'İlişki tipi oluşturulurken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
          return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('general_info')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('enter_basic_relationship_type_info')}</p>
            </div>
      
            <div className="max-w-2xl mx-auto space-y-6">
              {/* NAME TRANSLATIONS */}
              <TranslationFields
                label={t('relationship_type_name')}
                fieldType="input"
                translations={translationData.nameTranslations}
                supportedLanguages={supportedLanguages}
                currentLanguage={currentLanguage}
                onChange={(language, value) => handleTranslationChange('nameTranslations', language, value)}
                error={formErrors.nameTranslations}
                placeholder={t('enter_relationship_type_name')}
                required
              />
            
              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('code')} *
                </label>
              <input
                type="text"
                value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    formErrors.code ? 'border-red-500' : 'border-gray-300'
                  }`}
                                    placeholder={t('unique_code')}
                />
                {formErrors.code && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.code}</p>
                )}
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t('code_validation_message')}
                </p>
            </div>
            
              {/* DESCRIPTION TRANSLATIONS */}
              <TranslationFields
                label={t('description')}
                fieldType="textarea"
                translations={translationData.descriptionTranslations}
                supportedLanguages={supportedLanguages}
                currentLanguage={currentLanguage}
                onChange={(language, value) => handleTranslationChange('descriptionTranslations', language, value)}
                error={formErrors.descriptionTranslations}
                placeholder={t('enter_relationship_type_description')}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('directionality')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('determine_relationship_direction')}</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    formData.isDirectional
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg ring-2 ring-primary-200 dark:ring-primary-800'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handleInputChange('isDirectional', true)}
                >
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('directional_relationship')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('directional_relationship_description')}
                    </p>
                  </div>
                </div>

                <div
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    !formData.isDirectional
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg ring-2 ring-primary-200 dark:ring-primary-800'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handleInputChange('isDirectional', false)}
                >
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('bidirectional_relationship')}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('bidirectional_relationship_description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                {t('relationship_type_and_types')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('relationship_type_and_types_description')}
              </p>
            </div>

            <div className="max-w-5xl mx-auto space-y-6">
              {/* Relationship Type Selection */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-center mb-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    {t('relationship_type')} *
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('select_relationship_type_description')}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { 
                      value: 'one-to-one', 
                      label: t('one_to_one'), 
                      description: '1:1', 
                      icon: (
                        <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      )
                    },
                    { 
                      value: 'one-to-many', 
                      label: t('one_to_many'), 
                      description: '1:N', 
                      icon: (
                        <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      )
                    },
                    { 
                      value: 'many-to-one', 
                      label: t('many_to_one'), 
                      description: 'N:1', 
                      icon: (
                        <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      )
                    },
                    { 
                      value: 'many-to-many', 
                      label: t('many_to_many'), 
                      description: 'N:N', 
                      icon: (
                        <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      )
                    }
                  ].map((type) => (
                    <div
                      key={type.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                        formData.relationshipType === type.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md ring-2 ring-primary-200 dark:ring-primary-800'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => handleInputChange('relationshipType', type.value)}
                    >
                      <div className="text-center">
                        <div className="flex justify-center mb-3">
                          {type.icon}
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {type.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {type.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Source and Target Types */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Source Types */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="text-center mb-4">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                      {t('source_entity_types')} *
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formData.isDirectional ? t('relationship_initiator_side') : t('first_entity_side')}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {itemTypes.map((itemType) => (
                      <div
                        key={itemType._id}
                        className={`p-3 border rounded-md cursor-pointer transition-all duration-200 hover:shadow-sm ${
                          formData.allowedSourceTypes.includes(itemType.code)
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm ring-1 ring-primary-200 dark:ring-primary-800'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => {
                          const currentTypes = formData.allowedSourceTypes;
                          const newTypes = currentTypes.includes(itemType.code)
                            ? currentTypes.filter(t => t !== itemType.code)
                            : [...currentTypes, itemType.code];
                          handleMultiSelectChange('allowedSourceTypes', newTypes);
                        }}
                      >
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {getEntityName(itemType, currentLanguage)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {itemType.code}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {formErrors.allowedSourceTypes && (
                    <p className="mt-3 text-sm text-red-600 text-center">{formErrors.allowedSourceTypes}</p>
                  )}
                </div>

                {/* Target Types */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="text-center mb-4">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                      {t('target_entity_types')} *
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formData.isDirectional ? t('relationship_target_side') : t('second_entity_side')}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {itemTypes.map((itemType) => (
                      <div
                        key={itemType._id}
                        className={`p-3 border rounded-md cursor-pointer transition-all duration-200 hover:shadow-sm ${
                          formData.allowedTargetTypes.includes(itemType.code)
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm ring-1 ring-primary-200 dark:ring-primary-800'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => {
                          const currentTypes = formData.allowedTargetTypes;
                          const newTypes = currentTypes.includes(itemType.code)
                            ? currentTypes.filter(t => t !== itemType.code)
                            : [...currentTypes, itemType.code];
                          handleMultiSelectChange('allowedTargetTypes', newTypes);
                        }}
                      >
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {getEntityName(itemType, currentLanguage)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {itemType.code}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {formErrors.allowedTargetTypes && (
                    <p className="mt-3 text-sm text-red-600 text-center">{formErrors.allowedTargetTypes}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('preview')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('check_relationship_type_info_and_create')}</p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* General Info */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('general_info')}</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('name')}:</span>
                        <div className="mt-1">
                          {Object.entries(translationData.nameTranslations).map(([lang, value]) => (
                            <div key={lang} className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-gray-400 uppercase">{lang}:</span>
                              <span className="text-sm text-gray-900 dark:text-white">{value || '-'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('code')}:</span>
                        <p className="text-sm text-gray-900 dark:text-white">{formData.code}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('description')}:</span>
                        <div className="mt-1">
                          {Object.entries(translationData.descriptionTranslations).map(([lang, value]) => (
                            <div key={lang} className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-gray-400 uppercase">{lang}:</span>
                              <span className="text-sm text-gray-900 dark:text-white">{value || '-'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('directionality')}:</span>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formData.isDirectional ? t('directional') : t('bidirectional')}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('relationship_type')}:</span>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formData.relationshipType === 'one-to-one' && `${t('one_to_one')} (1:1)`}
                          {formData.relationshipType === 'one-to-many' && `${t('one_to_many')} (1:N)`}
                          {formData.relationshipType === 'many-to-one' && `${t('many_to_one')} (N:1)`}
                          {formData.relationshipType === 'many-to-many' && `${t('many_to_many')} (N:N)`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Allowed Types */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('allowed_types')}</h4>
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('source_types')}:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.allowedSourceTypes.map(type => (
                            <span key={type} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('target_types')}:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.allowedTargetTypes.map(type => (
                            <span key={type} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          {/* BREADCRUMB */}
          <div className="flex items-center justify-between">
                        <Breadcrumb 
              items={[
                { label: t('home'), path: '/' },
                { label: t('relationships'), path: '/associations' },
                { label: t('create_new_relationship_type') }
              ]} 
            />
                </div>

          {/* Header */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <svg className="w-6 h-6 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Yeni İlişki Tipi Oluştur
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Varlıklar arasında yeni bir ilişki tipi tanımlayın
                </p>
              </div>
              
              <Button
                variant="outline"
                className="flex items-center mt-4 md:mt-0"
                onClick={() => navigate('/associations')}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Listeye Dön</span>
              </Button>
            </div>
          </div>
          
          {/* Stepper */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <Stepper 
                steps={steps} 
                activeStep={currentStep} 
                completedSteps={completedSteps}
              />
            </div>
            
            {/* Form Content */}
            <div className="p-6">
              <div className="min-h-[500px]">
                {renderStepContent()}
                    </div>

              {error && (
                <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                    </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  variant="outline"
                  className="flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Önceki
                </Button>

                <div className="flex space-x-3">
                              <Button
              onClick={() => navigate('/associations')}
              variant="outline"
            >
              İptal
            </Button>

                  {currentStep < steps.length - 1 ? (
                    <Button
                      onClick={handleNextStep}
                      disabled={isLoadingItemTypes}
                      className="flex items-center"
                    >
                      {isLoadingItemTypes ? 'Yükleniyor...' : 'Sonraki'}
                      {!isLoadingItemTypes && (
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex items-center bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Oluşturuluyor...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          İlişki Tipini Oluştur
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
      </div>
      </div>
    </div>
  );
};

export default CreateAssociationPage;