import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../context/i18nContext';
import attributeGroupService from '../../../services/api/attributeGroupService';
import attributeService from '../../../services/api/attributeService';
import Breadcrumb from '../../../components/common/Breadcrumb';
import Button from '../../../components/ui/Button';
// Removed AlertModal - replaced with new notification system
import Stepper from '../../../components/ui/Stepper';
import TranslationFields from '../../../components/common/TranslationFields';
import { useTranslationForm } from '../../../hooks/useTranslationForm';
import { Attribute } from '../../../types/attribute';
import { getEntityName, getEntityDescription } from '../../../utils/translationUtils';
import AttributesSelect from '../../../components/attributes/AttributesSelect';

// INTERFACES
interface CreateAttributeGroupDto {
  name: string;
  code: string;
  description: string;
  attributes?: string[];
  isActive?: boolean;
}

// MAIN COMPONENT
const AttributeGroupCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  
  // Translation hook'unu kullan
  const {
    supportedLanguages,
    translationData,
    handleTranslationChange,
    createTranslations
  } = useTranslationForm();

  // STATE VARIABLES
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const [formData, setFormData] = useState<CreateAttributeGroupDto>({
    name: '',
    code: '',
    description: '',
    attributes: [],
    isActive: true
  });

  const [availableAttributes, setAvailableAttributes] = useState<Attribute[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Alert modal state'leri
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Stepper adımları
  const steps = useMemo(() => [
    { title: t('general_info', 'attribute_groups'), description: t('name_code_description', 'attribute_groups') },
    { title: t('select_attributes', 'attribute_groups'), description: t('choose_attributes_for_group', 'attribute_groups') },
    { title: t('review_and_create', 'attribute_groups'), description: t('review_before_creating', 'attribute_groups') },
  ], [t, currentLanguage]);

  // HELPER FUNCTIONS
  const generateCode = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Kod otomatik oluşturma
    if (name === 'name') {
      const generatedCode = generateCode(value);
      setFormData(prev => ({ ...prev, code: generatedCode }));
    }
    
    // Hata temizleme
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // VALIDATION FUNCTIONS
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Name translations kontrolü
    const currentLanguageName = translationData.nameTranslations[currentLanguage];
    if (!currentLanguageName || !currentLanguageName.trim()) {
      errors.nameTranslations = t('name_required', 'attribute_groups');
    }
    
    // Code kontrolü
    if (!formData.code.trim()) {
      errors.code = t('code_required', 'attribute_groups');
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.code)) {
      errors.code = t('code_invalid_format', 'attribute_groups');
    }
    
    // Description translations kontrolü
    const currentLanguageDescription = translationData.descriptionTranslations[currentLanguage];
    if (!currentLanguageDescription || !currentLanguageDescription.trim()) {
      errors.descriptionTranslations = t('description_required', 'common');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    // Attribute seçimi opsiyonel, her zaman geçerli
    return true;
  };

  // STEP NAVIGATION
  const handleNextStep = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 0:
        isValid = validateStep1();
        break;
      case 1:
        isValid = validateStep2();
        break;
      default:
        return;
    }
    
    if (isValid) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // ATTRIBUTE SELECTION
  const handleAttributeToggle = (attributeId: string) => {
    setSelectedAttributes(prev => {
      if (prev.includes(attributeId)) {
        return prev.filter(id => id !== attributeId);
      } else {
        return [...prev, attributeId];
      }
    });
  };

  const handleSelectAllAttributes = () => {
    setSelectedAttributes(availableAttributes.map(attr => attr._id));
  };

  const handleDeselectAllAttributes = () => {
    setSelectedAttributes([]);
  };

  // FORM SUBMISSION
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Çevirileri oluştur
      const { nameId, descriptionId } = await createTranslations(formData.code, 'attribute_groups');

      // AttributeGroup oluştur
      const attributeGroupData: CreateAttributeGroupDto = {
        name: nameId,
        code: formData.code.trim(),
        description: descriptionId || '',
        attributes: selectedAttributes,
        isActive: formData.isActive
      };
      
      await attributeGroupService.createAttributeGroup(attributeGroupData);
      
      // Başarılı oluşturma alert'ı
      showAlert('success', 'Öznitelik Grubu Oluşturuldu', 'Öznitelik grubu başarıyla oluşturuldu. Liste sayfasına yönlendiriliyorsunuz...');
      
      // 2 saniye sonra yönlendir
      setTimeout(() => {
        navigate('/attributeGroups/list');
      }, 2000);
      
    } catch (err: any) {
      showAlert('error', 'Oluşturma Hatası', err.message || t('attribute_group_create_error', 'attribute_groups'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // EFFECTS
  useEffect(() => {
    const fetchAvailableAttributes = async () => {
      try {
        const response = await attributeService.getAttributes({ isActive: true });
        setAvailableAttributes(response.attributes);
      } catch (err: any) {
        console.error('Attributes fetch error:', err);
      }
    };

    fetchAvailableAttributes();
  }, []);

  // STEP CONTENT RENDERER
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">{t('general_info', 'attribute_groups')}</h3>
            
            {/* NAME TRANSLATIONS */}
            <TranslationFields
              label={t('group_name', 'attribute_groups')}
              fieldType="input"
              translations={translationData.nameTranslations}
              supportedLanguages={supportedLanguages}
              currentLanguage={currentLanguage}
              onChange={(language, value) => handleTranslationChange('nameTranslations', language, value)}
              error={formErrors.nameTranslations}
              placeholder={t('enter_group_name', 'attribute_groups')}
              required
            />

            {/* CODE */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('group_code', 'attribute_groups')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                className={`w-full px-3 py-2 border ${formErrors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white`}
                placeholder={t('enter_group_code', 'attribute_groups')}
                required
              />
              {formErrors.code && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.code}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('code_help', 'attribute_groups')}</p>
            </div>

            {/* DESCRIPTION TRANSLATIONS */}
            <TranslationFields
              label={t('description', 'attribute_groups')}
              fieldType="textarea"
              translations={translationData.descriptionTranslations}
              supportedLanguages={supportedLanguages}
              currentLanguage={currentLanguage}
              onChange={(language, value) => handleTranslationChange('descriptionTranslations', language, value)}
              error={formErrors.descriptionTranslations}
              placeholder={t('enter_description', 'attribute_groups')}
              required
            />
            
            {/* Aktif */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Öznitelik Grubu Aktif
                </label>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 ml-6">
                Öznitelik grubunun aktif olup olmadığını belirler. Pasif gruplar kullanıcı arayüzünde gösterilmez.
              </p>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">{t('select_attributes', 'attribute_groups')}</h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('select_attributes_description', 'attribute_groups')}
            </p>

            <AttributesSelect
              selectedAttributeIds={selectedAttributes}
              onSelectionChange={setSelectedAttributes}
              title="Öznitelik Seçimi"
              emptyMessage="Henüz öznitelik bulunmuyor. Önce öznitelik oluşturun."
              searchPlaceholder="Öznitelik adı veya kodu ile ara..."
              maxHeight="max-h-96"
              isMultiple={true}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">{t('review_and_create', 'attribute_groups')}</h3>
            
            {/* Genel Bilgiler */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
              
              {/* Name Translations */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('group_name', 'attribute_groups')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {supportedLanguages.map((language) => (
                    <div key={language} className="bg-white dark:bg-gray-700 p-3 rounded border">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-400 uppercase">{language}</span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {translationData.nameTranslations[language] || '-'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Code */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t('group_code', 'attribute_groups')}</h4>
                <p className="text-sm text-gray-900 dark:text-white font-mono bg-white dark:bg-gray-700 p-2 rounded border">{formData.code}</p>
              </div>
              
              {/* Description Translations */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('description_label', 'common')}</h4>
                <div className="space-y-3">
                  {supportedLanguages.map((language) => (
                    <div key={language} className="bg-white dark:bg-gray-700 p-3 rounded border">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-400 uppercase">{language}</span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {translationData.descriptionTranslations[language] || '-'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Selected Attributes */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('selected_attributes', 'attribute_groups')}</h4>
                {selectedAttributes.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('no_attributes_selected', 'attribute_groups')}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedAttributes.map((attrId) => {
                      const attribute = availableAttributes.find(attr => attr._id === attrId);
                      return attribute ? (
                        <span
                          key={attrId}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                        >
                          {getEntityName(attribute, currentLanguage)}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Alert modal helper fonksiyonları
  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertModal({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closeAlert = () => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));
  };

  // MAIN RENDER
  return (
    <div className="space-y-6">
      {/* BREADCRUMB */}
      <div className="flex items-center justify-between">
        <Breadcrumb 
          items={[
            { label: t('attribute_groups_title', 'attribute_groups'), path: '/attributeGroups/list' },
            { label: t('new_attribute_group', 'attribute_groups') }
          ]} 
        />
      </div>

      {/* HEADER */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {t('new_attribute_group', 'attribute_groups')}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {t('create_attribute_group_description', 'attribute_groups')}
            </p>
          </div>
          
          <Button
            variant="outline"
            className="flex items-center mt-4 md:mt-0"
            onClick={() => navigate('/attributeGroups/list')}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>{t('back_to_list', 'common')}</span>
          </Button>
        </div>
      </div>

      {/* STEPPER */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <Stepper 
            steps={steps} 
            activeStep={currentStep} 
            completedSteps={completedSteps} 
          />
        </div>
        
        {/* FORM CONTENT */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 mb-6 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {renderStepContent()}
            
            {/* NAVIGATION BUTTONS */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                type="button"
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                className={`${currentStep === 0 ? 'invisible' : ''}`}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t('previous_step', 'attributes')}
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  variant="primary"
                  type="button"
                  onClick={handleNextStep}
                >
                  {t('next_step', 'attributes')}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                  }}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('create_attribute_group', 'attribute_groups')}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
      />
    </div>
  );
};

export default AttributeGroupCreatePage; 