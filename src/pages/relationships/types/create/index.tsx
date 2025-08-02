import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import { useNotification } from '../../../../components/notifications';
import Breadcrumb from '../../../../components/common/Breadcrumb';
import Stepper from '../../../../components/ui/Stepper';
import relationshipService from '../../../../services/api/relationshipService';
import itemTypeService from '../../../../services/api/itemTypeService';
import { IRelationshipType } from '../../../../types/relationship';
import { useTranslation } from '../../../../context/i18nContext';
import { getEntityName } from '../../../../utils/translationUtils';

// Form data interfaces
interface Step1FormData {
  name: string;
  code: string;
  description: string;
}

interface Step2FormData {
  isDirectional: boolean;
}

interface Step3FormData {
  allowedSourceTypes: string[];
  allowedTargetTypes: string[];
}

interface FormData extends Step1FormData, Step2FormData, Step3FormData {
  metadata: Record<string, any>;
}

const initialFormData: FormData = {
  name: '',
  code: '',
  description: '',
  isDirectional: true,
  allowedSourceTypes: [],
  allowedTargetTypes: [],
  metadata: {}
};

const RelationshipTypeCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  const { showToast } = useNotification();
  
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
    { title: 'Genel Bilgiler', description: 'İsim, kod ve açıklama' },
    { title: 'Yönlülük', description: 'İlişkinin yönlü olup olmadığı' },
    { title: 'İzin Verilen Tipler', description: 'Kaynak ve hedef varlık tipleri' },
    { title: 'Önizleme', description: 'Bilgileri kontrol edin' },
  ], []);
  
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
        if (!formData.name.trim()) {
          errors.name = 'İsim gereklidir';
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
      
      const relationshipTypeData: Partial<IRelationshipType> = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        isDirectional: formData.isDirectional,
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
      
      navigate('/relationships');
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
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Genel Bilgiler</h3>
              <p className="text-gray-600 dark:text-gray-400">İlişki tipinin temel bilgilerini girin</p>
      </div>
      
            <div className="max-w-2xl mx-auto space-y-6">
          <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  İsim *
              </label>
              <input
                type="text"
                value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="İlişki tipinin ismini girin"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
            </div>
            
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kod *
              </label>
              <input
                type="text"
                value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    formErrors.code ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="unique_code"
                />
                {formErrors.code && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.code}</p>
                )}
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Kod sadece harf, rakam, _ ve - karakterlerini içerebilir
              </p>
            </div>
            
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Açıklama
              </label>
              <textarea
                value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="İlişki tipinin açıklamasını girin"
              />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Yönlülük</h3>
              <p className="text-gray-600 dark:text-gray-400">İlişkinin yönlü olup olmadığını belirleyin</p>
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
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Yönlü İlişki</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      A → B şeklinde tek yönlü ilişki. Kaynak ve hedef bellidir.
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
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Çift Yönlü İlişki</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      A ↔ B şeklinde çift yönlü ilişki. Her iki varlık da eşit seviyededir.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">İzin Verilen Tipler</h3>
              <p className="text-gray-600 dark:text-gray-400">Bu ilişkide hangi varlık tiplerinin kullanılabileceğini seçin</p>
            </div>
        
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Source Types */}
          <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Kaynak Varlık Tipleri *
                  {formData.isDirectional && (
                    <span className="text-xs text-gray-500 ml-2">(İlişkiyi başlatan taraf)</span>
                  )}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {itemTypes.map((itemType) => (
                    <div
                      key={itemType._id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.allowedSourceTypes.includes(itemType.code)
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                      }`}
                      onClick={() => {
                        console.log('Clicked itemType:', itemType);
                        const currentTypes = formData.allowedSourceTypes;
                        const newTypes = currentTypes.includes(itemType.code)
                          ? currentTypes.filter(t => t !== itemType.code)
                          : [...currentTypes, itemType.code];
                        console.log('New types:', newTypes);
                        handleMultiSelectChange('allowedSourceTypes', newTypes);
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 border rounded ${
                          formData.allowedSourceTypes.includes(itemType.code)
                            ? 'bg-primary-500 border-primary-500'
                            : 'border-gray-300'
                        }`}>
                          {formData.allowedSourceTypes.includes(itemType.code) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {getEntityName(itemType, currentLanguage)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {itemType.code}
                      </p>
                  </div>
                ))}
              </div>
                {formErrors.allowedSourceTypes && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.allowedSourceTypes}</p>
              )}
            </div>
            
              {/* Target Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Hedef Varlık Tipleri *
            {formData.isDirectional && (
                    <span className="text-xs text-gray-500 ml-2">(İlişkinin hedeflediği taraf)</span>
                  )}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {itemTypes.map((itemType) => (
                    <div
                      key={itemType._id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.allowedTargetTypes.includes(itemType.code)
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                      }`}
                      onClick={() => {
                        console.log('Clicked itemType:', itemType);
                        const currentTypes = formData.allowedTargetTypes;
                        const newTypes = currentTypes.includes(itemType.code)
                          ? currentTypes.filter(t => t !== itemType.code)
                          : [...currentTypes, itemType.code];
                        console.log('New types:', newTypes);
                        handleMultiSelectChange('allowedTargetTypes', newTypes);
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 border rounded ${
                          formData.allowedTargetTypes.includes(itemType.code)
                            ? 'bg-primary-500 border-primary-500'
                            : 'border-gray-300'
                        }`}>
                          {formData.allowedTargetTypes.includes(itemType.code) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {getEntityName(itemType, currentLanguage)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {itemType.code}
                      </p>
                    </div>
                  ))}
                </div>
                {formErrors.allowedTargetTypes && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.allowedTargetTypes}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Önizleme</h3>
              <p className="text-gray-600 dark:text-gray-400">İlişki tipi bilgilerini kontrol edin ve oluşturun</p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* General Info */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Genel Bilgiler</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">İsim:</span>
                        <p className="text-sm text-gray-900 dark:text-white">{formData.name}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Kod:</span>
                        <p className="text-sm text-gray-900 dark:text-white">{formData.code}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Açıklama:</span>
                        <p className="text-sm text-gray-900 dark:text-white">{formData.description || '-'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Yönlülük:</span>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formData.isDirectional ? 'Yönlü' : 'Çift Yönlü'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Allowed Types */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">İzin Verilen Tipler</h4>
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Kaynak Tipler:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.allowedSourceTypes.map(type => (
                            <span key={type} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Hedef Tipler:</span>
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
                { label: 'Ana Sayfa', path: '/' },
                { label: 'İlişkiler', path: '/relationships' },
                { label: 'Yeni İlişki Tipi Oluştur' }
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
                onClick={() => navigate('/relationships')}
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
              onClick={() => navigate('/relationships')}
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

export default RelationshipTypeCreatePage;