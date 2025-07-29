import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Breadcrumb from '../../../components/common/Breadcrumb';
import Stepper from '../../../components/ui/Stepper';
import TranslationFields from '../../../components/common/TranslationFields';
import AttributeGroupsSelector from '../../../components/attributes/AttributeGroupSelector';
import itemTypeService from '../../../services/api/itemTypeService';
import attributeGroupService from '../../../services/api/attributeGroupService';
import categoryService from '../../../services/api/categoryService';
import { useTranslation } from '../../../context/i18nContext';
import { useTranslationForm } from '../../../hooks/useTranslationForm';
import { getEntityName, getEntityDescription } from '../../../utils/translationUtils';
import { useNotification } from '../../../components/notifications';
import type { CreateItemTypeDto } from '../../../types/itemType';

interface AttributeGroupOption {
  _id: string;
  name: any;
  code: string;
  description?: any;
}

interface CategoryOption {
  _id: string;
  name: any;
  code: string;
  description?: any;
}

const ItemTypeCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  const { showToast, showModal } = useNotification();
  
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
    category: '',
    attributeGroups: [],
    isActive: true
  });
  
  // Settings state
  const [settingsData, setSettingsData] = useState({
    navigation: {
      showInNavbar: false,
      navbarLabel: '',
      navbarIcon: 'cube',
      navbarOrder: 1,
      menuGroup: ''
    },
    display: {
      listTitle: '',
      listDescription: '',
      itemsPerPage: 10,
      defaultSortField: 'createdAt',
      defaultSortOrder: 'desc' as 'asc' | 'desc',
      showAdvancedFilters: false,
      showExportButton: false,
      showImportButton: false
    }
  });
  
  // Seçenekler
  const [attributeGroupOptions, setAttributeGroupOptions] = useState<AttributeGroupOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  
  // Seçili öğeler
  const [selectedAttributeGroups, setSelectedAttributeGroups] = useState<string[]>([]);
  
  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Stepper state
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Stepper adımları
  const steps = useMemo(() => [
    { title: t('general_info', 'itemTypes'), description: t('name_code_description', 'itemTypes') },
    { title: t('category_selection', 'itemTypes'), description: t('select_category_for_item_type', 'itemTypes') },
    { title: t('attribute_groups', 'itemTypes'), description: t('select_attribute_groups', 'itemTypes') },
    { title: t('settings', 'itemTypes'), description: t('navigation_and_display_settings', 'itemTypes') },
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
  
  // Öznitelik grupları ve kategorileri yükle
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Öznitelik gruplarını getir
        const groupsResult = await attributeGroupService.getAttributeGroups({ limit: 100 });
        setAttributeGroupOptions(groupsResult.attributeGroups.map(group => ({
          _id: group._id,
          name: group.name,
          code: group.code,
          description: group.description
        })));

        // Kategorileri getir
        const categoriesResult = await categoryService.getCategories({ limit: 100 });
        setCategoryOptions(categoriesResult.categories.map(category => ({
          _id: category._id,
          name: category.name,
          code: category.code,
          description: category.description
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
  
  // Settings değişiklik handler
  const handleSettingsChange = (section: 'navigation' | 'display', field: string, value: any) => {
    setSettingsData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };
  

  
  // Form gönderme handler
  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Translation verilerini oluştur
      const nameTranslations = await createTranslations(formData.code, 'itemTypes');
      const descriptionTranslations = await createTranslations(formData.code, 'itemTypes');
      
      // Form verisini hazırla
      const payload: CreateItemTypeDto = {
        ...formData,
        name: nameTranslations.nameId,
        description: descriptionTranslations.descriptionId || nameTranslations.nameId,
        attributeGroups: selectedAttributeGroups,
        settings: settingsData
      };
      
      // API'ye gönder
      const createdItemType = await itemTypeService.createItemType(payload);
      
      // Success toast göster
      showToast({
        type: 'success',
        title: t('item_type_created_successfully', 'itemTypes'),
        message: `${getEntityName(createdItemType, currentLanguage)} başarıyla oluşturuldu`,
        duration: 3000
      });

      // Success modal göster
      showModal({
        type: 'success',
        title: t('item_type_created_successfully', 'itemTypes'),
        message: `${getEntityName(createdItemType, currentLanguage)} adlı öğe türü başarıyla oluşturuldu.`,
        icon: (
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        primaryButton: {
          text: 'Öğe Türüne Git',
          onClick: () => {
            navigate(`/itemtypes/details/${createdItemType._id}`);
          }
        },
        secondaryButton: {
          text: 'Kapat',
          onClick: () => {
            navigate('/itemtypes/list');
          }
        }
      });
      
    } catch (err: any) {
      // Error toast göster
      showToast({
        type: 'error',
        title: t('item_type_create_error', 'itemTypes'),
        message: err.message || 'Beklenmeyen bir hata oluştu',
        duration: 5000
      });
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
    
    if (!formData.category) {
      errors.category = t('category_required', 'itemTypes');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateStep3 = (): boolean => {
    const errors: Record<string, string> = {};
    
    // AttributeGroups opsiyonel yap
    // if (selectedAttributeGroups.length === 0) {
    //   errors.attributeGroups = t('attribute_groups_required', 'itemTypes');
    // }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateStep4 = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Settings validasyonu opsiyonel - özellikle navigation için
    if (settingsData.navigation.showInNavbar && !settingsData.navigation.navbarLabel.trim()) {
      errors.navbarLabel = t('navbar_label_required_when_show_in_navbar', 'itemTypes');
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
              {t('category_selection', 'itemTypes')}
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('category', 'itemTypes')} <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  formErrors.category
                    ? 'border-red-300 focus:ring-red-500 dark:border-red-700'
                    : 'border-gray-300 focus:ring-blue-500 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-white`}
              >
                <option value="">{t('select_category', 'itemTypes')}</option>
                {categoryOptions.map((category) => (
                  <option key={category._id} value={category._id}>
                    {getEntityName(category, currentLanguage)} ({category.code})
                  </option>
                ))}
              </select>
              {formErrors.category && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.category}</p>
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
                {t('attribute_groups', 'itemTypes')} <span className="text-gray-400">({t('optional', 'common')})</span>
              </label>
              <AttributeGroupsSelector
                selectedAttributeGroups={selectedAttributeGroups}
                onChange={setSelectedAttributeGroups}
              />
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
              {t('settings', 'itemTypes')}
            </h3>
            
            {/* Navigation Settings */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                {t('navigation_settings', 'itemTypes')}
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showInNavbar"
                    checked={settingsData.navigation.showInNavbar}
                    onChange={(e) => handleSettingsChange('navigation', 'showInNavbar', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showInNavbar" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    {t('show_in_navbar', 'itemTypes')}
                  </label>
                </div>
                
                {settingsData.navigation.showInNavbar && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('navbar_label', 'itemTypes')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={settingsData.navigation.navbarLabel}
                        onChange={(e) => handleSettingsChange('navigation', 'navbarLabel', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                          formErrors.navbarLabel
                            ? 'border-red-300 focus:ring-red-500 dark:border-red-700'
                            : 'border-gray-300 focus:ring-blue-500 dark:border-gray-600'
                        } dark:bg-gray-700 dark:text-white`}
                        placeholder={t('enter_navbar_label', 'itemTypes')}
                      />
                      {formErrors.navbarLabel && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.navbarLabel}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('navbar_order', 'itemTypes')}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={settingsData.navigation.navbarOrder}
                        onChange={(e) => handleSettingsChange('navigation', 'navbarOrder', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Display Settings */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                {t('display_settings', 'itemTypes')}
              </h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('list_title', 'itemTypes')}
                    </label>
                    <input
                      type="text"
                      value={settingsData.display.listTitle}
                      onChange={(e) => handleSettingsChange('display', 'listTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder={t('enter_list_title', 'itemTypes')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('items_per_page', 'itemTypes')}
                    </label>
                    <select
                      value={settingsData.display.itemsPerPage}
                      onChange={(e) => handleSettingsChange('display', 'itemsPerPage', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('list_description', 'itemTypes')}
                  </label>
                  <textarea
                    rows={3}
                    value={settingsData.display.listDescription}
                    onChange={(e) => handleSettingsChange('display', 'listDescription', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder={t('enter_list_description', 'itemTypes')}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showAdvancedFilters"
                      checked={settingsData.display.showAdvancedFilters}
                      onChange={(e) => handleSettingsChange('display', 'showAdvancedFilters', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="showAdvancedFilters" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      {t('show_advanced_filters', 'itemTypes')}
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showExportButton"
                      checked={settingsData.display.showExportButton}
                      onChange={(e) => handleSettingsChange('display', 'showExportButton', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="showExportButton" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      {t('show_export_button', 'itemTypes')}
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showImportButton"
                      checked={settingsData.display.showImportButton}
                      onChange={(e) => handleSettingsChange('display', 'showImportButton', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="showImportButton" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      {t('show_import_button', 'itemTypes')}
                    </label>
                  </div>
                </div>
              </div>
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
                    {t('category', 'itemTypes')}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formData.category ? getEntityName(categoryOptions.find(c => c._id === formData.category), currentLanguage) || '-' : '-'}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('attribute_groups', 'itemTypes')} ({selectedAttributeGroups.length})
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedAttributeGroups.length > 0 
                      ? selectedAttributeGroups.map(id => {
                          const group = attributeGroupOptions.find(g => g._id === id);
                          return group ? getEntityName(group, currentLanguage) : null;
                        }).filter(Boolean).join(', ')
                      : '-'
                    }
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('navigation_settings', 'itemTypes')}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {settingsData.navigation.showInNavbar 
                      ? `${t('show_in_navbar', 'itemTypes')}: ${settingsData.navigation.navbarLabel || '-'}`
                      : t('not_shown_in_navbar', 'itemTypes')
                    }
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('display_settings', 'itemTypes')}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {settingsData.display.listTitle || t('default_list_title', 'itemTypes')} 
                    ({settingsData.display.itemsPerPage} {t('items_per_page', 'itemTypes')})
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
          <div>
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
                  type="button"
                  variant="primary"
                  disabled={isLoading}
                  onClick={handleSubmit}
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
          </div>
        </div>
      </div>
    </div>
  );
};

const ItemTypeCreatePageWrapper: React.FC = () => {
  return <ItemTypeCreatePage />;
};

export default ItemTypeCreatePageWrapper; 