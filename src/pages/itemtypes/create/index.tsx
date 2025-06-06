import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Breadcrumb from '../../../components/common/Breadcrumb';
import Stepper from '../../../components/ui/Stepper';
import TranslationFields from '../../../components/common/TranslationFields';
import itemTypeService from '../../../services/api/itemTypeService';
import attributeService from '../../../services/api/attributeService';
import attributeGroupService from '../../../services/api/attributeGroupService';
import familyService from '../../../services/api/familyService';
import { useTranslation } from '../../../context/i18nContext';
import { useTranslationForm } from '../../../hooks/useTranslationForm';
import type { CreateItemTypeDto } from '../../../types/itemType';

interface AttributeOption {
  _id: string;
  name: string;
  code: string;
}

interface AttributeGroupOption {
  _id: string;
  name: string;
  code: string;
}

interface FamilyOption {
  _id: string;
  name: string;
  code: string;
}

const ItemTypeCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  
  // Translation hook'unu kullan
  const {
    supportedLanguages,
    translationData,
    handleTranslationChange,
    createTranslations
  } = useTranslationForm();

  // Form state
  const [formData, setFormData] = useState<CreateItemTypeDto>({
    name: '',
    code: '',
    description: '',
    family: '',
    attributeGroups: [],
    attributes: [],
    isActive: true
  });
  
  // Seçenekler
  const [attributeOptions, setAttributeOptions] = useState<AttributeOption[]>([]);
  const [attributeGroupOptions, setAttributeGroupOptions] = useState<AttributeGroupOption[]>([]);
  const [familyOptions, setFamilyOptions] = useState<FamilyOption[]>([]);
  
  // Seçili öğeler
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [selectedAttributeGroups, setSelectedAttributeGroups] = useState<string[]>([]);
  
  // Loading ve error state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Stepper state
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Stepper adımları
  const steps = useMemo(() => [
    { title: t('general_info', 'itemTypes'), description: t('name_code_description', 'itemTypes') },
    { title: t('family_selection', 'itemTypes'), description: t('select_family_for_item_type', 'itemTypes') },
    { title: t('attribute_groups', 'itemTypes'), description: t('select_attribute_groups', 'itemTypes') },
    { title: t('attributes', 'itemTypes'), description: t('select_attributes', 'itemTypes') },
    { title: t('review_and_create', 'itemTypes'), description: t('review_before_creating', 'itemTypes') },
  ], [t, currentLanguage]);

  // Breadcrumb verisi
  const breadcrumbItems = [
    { label: t('home', 'common'), path: '/' },
    { label: t('item_types', 'itemTypes'), path: '/itemtypes/list' },
    { label: t('create_item_type', 'itemTypes') },
  ];
  
  // Form data'yı translation data ile senkronize et
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      name: translationData.nameTranslations[currentLanguage] || '',
      description: translationData.descriptionTranslations[currentLanguage] || ''
    }));
  }, [translationData, currentLanguage]);
  
  // Öznitelik ve öznitelik gruplarını yükle
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Öznitelikleri getir
        const attributesResult = await attributeService.getAttributes({ limit: 100 });
        setAttributeOptions(attributesResult.attributes.map(attr => ({
          _id: attr._id,
          name: attr.name,
          code: attr.code
        })));
        
        // Öznitelik gruplarını getir
        const groupsResult = await attributeGroupService.getAttributeGroups({ limit: 100 });
        setAttributeGroupOptions(groupsResult.attributeGroups.map(group => ({
          _id: group._id,
          name: group.name,
          code: group.code
        })));

        // Aileleri getir
        const familiesResult = await familyService.getFamilies({ limit: 100 });
        setFamilyOptions(familiesResult.families.map(family => ({
          _id: family._id,
          name: family.name,
          code: family.code
        })));
      } catch (err) {
        console.error('Seçenekler yüklenirken hata oluştu:', err);
      }
    };
    
    fetchOptions();
  }, []);
  
  // Form input değişiklik handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Checkbox için özel işlem
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: CreateItemTypeDto) => ({ ...prev, [name]: checked }));
      return;
    }
    
    setFormData((prev: CreateItemTypeDto) => ({ ...prev, [name]: value }));
    
    // Formda hata varsa temizle
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Öznitelik seçimi değişiklik handler
  const handleAttributeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedValues: string[] = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    
    setSelectedAttributes(selectedValues);
    setFormData((prev: CreateItemTypeDto) => ({ ...prev, attributes: selectedValues }));
  };
  
  // Öznitelik grubu seçimi değişiklik handler
  const handleAttributeGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedValues: string[] = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    
    setSelectedAttributeGroups(selectedValues);
    setFormData((prev: CreateItemTypeDto) => ({ ...prev, attributeGroups: selectedValues }));
  };
  
  // Form gönderme handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Translation verilerini oluştur
      const nameTranslations = await createTranslations(formData.code, 'itemTypes');
      const descriptionTranslations = await createTranslations(formData.code, 'itemTypes');
      
      // Form verisini hazırla
      const payload: CreateItemTypeDto = {
        ...formData,
        name: nameTranslations.nameId,
        description: descriptionTranslations.descriptionId || nameTranslations.nameId,
        attributes: selectedAttributes,
        attributeGroups: selectedAttributeGroups
      };
      
      // API'ye gönder
      await itemTypeService.createItemType(payload);
      
      setSuccess(true);
      
      // Başarılı olduğunda listeye yönlendir
      setTimeout(() => {
        navigate('/itemtypes/list');
      }, 1500);
    } catch (err: any) {
      setError(err.message || t('item_type_create_error', 'itemTypes'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Adımları doğrulama ve ilerleme
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!translationData.nameTranslations[currentLanguage]) {
      errors.name = t('name_required', 'itemTypes');
    }
    
    if (!formData.code.trim()) {
      errors.code = t('code_required', 'itemTypes');
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.code)) {
      errors.code = t('code_invalid_format', 'itemTypes');
    }
    
    if (!translationData.descriptionTranslations[currentLanguage]) {
      errors.description = t('description_required', 'itemTypes');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.family) {
      errors.family = t('family_required', 'itemTypes');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateStep3 = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (selectedAttributeGroups.length === 0) {
      errors.attributeGroups = t('attribute_groups_required', 'itemTypes');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep4 = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (selectedAttributes.length === 0) {
      errors.attributes = t('attributes_required', 'itemTypes');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleNextStep = () => {
    let isValid = false;
    
    // Adıma göre validasyon yap
    if (currentStep === 0) {
      isValid = validateStep1();
    } else if (currentStep === 1) {
      isValid = validateStep2();
    } else if (currentStep === 2) {
      isValid = validateStep3();
    } else if (currentStep === 3) {
      isValid = validateStep4();
    }
    
    if (isValid) {
      // Bu adımı tamamlandı olarak işaretle
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps((prev) => [...prev, currentStep]);
      }
      
      // Son adımda değilse sonraki adıma geç
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('general_info', 'itemTypes')}
            </h3>
            
            {/* Name - Translation Format */}
            <TranslationFields
              label={t('name', 'itemTypes')}
              fieldType="input"
              translations={translationData.nameTranslations}
              supportedLanguages={supportedLanguages}
              currentLanguage={currentLanguage}
              onChange={(language, value) => handleTranslationChange('nameTranslations', language, value)}
              error={formErrors.name}
              required={true}
              placeholder={t('enter_item_type_name', 'itemTypes')}
            />
            
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('code', 'itemTypes')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  formErrors.code
                    ? 'border-red-300 focus:ring-red-500 dark:border-red-700'
                    : 'border-gray-300 focus:ring-blue-500 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-white`}
                placeholder={t('enter_code', 'itemTypes')}
              />
              {formErrors.code && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.code}</p>
              )}
            </div>
            
            {/* Description - Translation Format */}
            <TranslationFields
              label={t('description', 'itemTypes')}
              fieldType="textarea"
              translations={translationData.descriptionTranslations}
              supportedLanguages={supportedLanguages}
              currentLanguage={currentLanguage}
              onChange={(language, value) => handleTranslationChange('descriptionTranslations', language, value)}
              error={formErrors.description}
              required={true}
              placeholder={t('enter_item_type_description', 'itemTypes')}
              rows={4}
            />
          </div>
        );
        
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('family_selection', 'itemTypes')}
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('family', 'itemTypes')} <span className="text-red-500">*</span>
              </label>
              <select
                name="family"
                value={formData.family}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  formErrors.family
                    ? 'border-red-300 focus:ring-red-500 dark:border-red-700'
                    : 'border-gray-300 focus:ring-blue-500 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-white`}
              >
                <option value="">{t('select_family', 'itemTypes')}</option>
                {familyOptions.map((family) => (
                  <option key={family._id} value={family._id}>
                    {family.name} ({family.code})
                  </option>
                ))}
              </select>
              {formErrors.family && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.family}</p>
              )}
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('attribute_groups', 'itemTypes')}
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('attribute_groups', 'itemTypes')} <span className="text-red-500">*</span>
              </label>
              <select
                multiple
                size={8}
                value={selectedAttributeGroups}
                onChange={handleAttributeGroupChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  formErrors.attributeGroups
                    ? 'border-red-300 focus:ring-red-500 dark:border-red-700'
                    : 'border-gray-300 focus:ring-blue-500 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-white`}
              >
                {attributeGroupOptions.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name} ({group.code})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('multiple_selection_help', 'itemTypes')}
              </p>
              {formErrors.attributeGroups && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.attributeGroups}</p>
              )}
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('attributes', 'itemTypes')}
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('attributes', 'itemTypes')} <span className="text-red-500">*</span>
              </label>
              <select
                multiple
                size={10}
                value={selectedAttributes}
                onChange={handleAttributeChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  formErrors.attributes
                    ? 'border-red-300 focus:ring-red-500 dark:border-red-700'
                    : 'border-gray-300 focus:ring-blue-500 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-white`}
              >
                {attributeOptions.map((attr) => (
                  <option key={attr._id} value={attr._id}>
                    {attr.name} ({attr.code})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('multiple_selection_help', 'itemTypes')}
              </p>
              {formErrors.attributes && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.attributes}</p>
              )}
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('review_and_create', 'itemTypes')}
            </h3>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('name', 'itemTypes')}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {translationData.nameTranslations[currentLanguage] || '-'}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('code', 'itemTypes')}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formData.code || '-'}
                  </dd>
                </div>
                
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('description', 'itemTypes')}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {translationData.descriptionTranslations[currentLanguage] || '-'}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('family', 'itemTypes')}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {familyOptions.find(f => f._id === formData.family)?.name || '-'}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('attribute_groups', 'itemTypes')} ({selectedAttributeGroups.length})
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedAttributeGroups.length > 0 
                      ? selectedAttributeGroups.map(id => 
                          attributeGroupOptions.find(g => g._id === id)?.name
                        ).filter(Boolean).join(', ')
                      : '-'
                    }
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('attributes', 'itemTypes')} ({selectedAttributes.length})
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedAttributes.length > 0 
                      ? selectedAttributes.map(id => 
                          attributeOptions.find(a => a._id === id)?.name
                        ).filter(Boolean).join(', ')
                      : '-'
                    }
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-7 h-7 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('create_item_type', 'itemTypes')}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {t('create_new_item_type_desc', 'itemTypes')}
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => navigate('/itemtypes/list')}
            className="flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('back_to_list', 'itemTypes')}
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-6 py-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{t('success', 'common')}!</span>
            <span className="ml-2">{t('item_type_created_successfully', 'itemTypes')}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-semibold">{t('error', 'common')}:</span>
            <span className="ml-2">{error}</span>
          </div>
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <Stepper
            steps={steps}
            activeStep={currentStep}
            completedSteps={completedSteps}
          />
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {renderStepContent()}
            
            {/* Action Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                className="flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t('previous', 'common')}
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNextStep}
                  className="flex items-center"
                >
                  {t('next', 'common')}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  className="flex items-center"
                >
                  {isLoading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {t('create_item_type', 'itemTypes')}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ItemTypeCreatePageWrapper: React.FC = () => {
  return <ItemTypeCreatePage />;
};

export default ItemTypeCreatePageWrapper; 