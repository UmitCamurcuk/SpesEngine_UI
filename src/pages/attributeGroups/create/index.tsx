import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../context/i18nContext';
import attributeGroupService from '../../../services/api/attributeGroupService';
import Breadcrumb from '../../../components/common/Breadcrumb';
import Button from '../../../components/ui/Button';
import TranslationFields from '../../../components/common/TranslationFields';
import { useTranslationForm } from '../../../hooks/useTranslationForm';

// INTERFACES
interface CreateAttributeGroupDto {
  name: string;
  code: string;
  description: string;
  attributes?: string[];
}

// UTILITY COMPONENTS
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

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
  const [formData, setFormData] = useState<CreateAttributeGroupDto>({
    name: '',
    code: '',
    description: '',
    attributes: []
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Name translations kontrolü
    const currentLanguageName = translationData.nameTranslations[currentLanguage];
    if (!currentLanguageName || !currentLanguageName.trim()) {
      errors.nameTranslations = t('name_required', 'attribute_groups');
    }
    
    // Code kontrolü
    if (!formData.code.trim()) {
      errors.code = t('code_required', 'attribute_groups');
    } else if (!/^[a-z0-9_]+$/.test(formData.code)) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
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
        attributes: []
      };
      
      await attributeGroupService.createAttributeGroup(attributeGroupData);
      
      navigate('/attributeGroups/list');
    } catch (err: any) {
      setError(err.message || t('attribute_group_create_error', 'attribute_groups'));
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 
                         flex items-center justify-center mr-3">
            <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('new_attribute_group', 'attribute_groups')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('create_attribute_group_description', 'attribute_groups')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="flex items-center"
            onClick={() => navigate('/attributeGroups/list')}
          >
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('back_to_list', 'common')}
          </Button>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-start">
          <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* BASIC INFORMATION */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('basic_information', 'common')}</h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
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
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 font-mono ${
                        formErrors.code
                          ? 'border-red-300 focus:ring-red-500 dark:border-red-700'
                          : 'border-gray-300 focus:ring-blue-500 dark:border-gray-600'
                      } dark:bg-gray-700 dark:text-white`}
                      placeholder={t('enter_group_code', 'attribute_groups')}
                    />
                    {formErrors.code && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.code}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {t('code_format_info', 'common')}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* DESCRIPTION */}
          <div>
            <Card>
              <CardHeader className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('description_label', 'common')}</h2>
                </div>
              </CardHeader>
              <CardBody>
                <TranslationFields
                  label=""
                  fieldType="textarea"
                  translations={translationData.descriptionTranslations}
                  supportedLanguages={supportedLanguages}
                  currentLanguage={currentLanguage}
                  onChange={(language, value) => handleTranslationChange('descriptionTranslations', language, value)}
                  error={formErrors.descriptionTranslations}
                  placeholder={t('enter_description', 'common')}
                  required
                  rows={3}
                />
              </CardBody>
            </Card>
          </div>
        </div>

        {/* SUBMIT BUTTONS */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/attributeGroups/list')}
            disabled={isSubmitting}
          >
            {t('cancel', 'common')}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('saving', 'common')}
              </>
            ) : (
              t('create', 'common')
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AttributeGroupCreatePage; 