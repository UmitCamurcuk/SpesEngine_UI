import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Breadcrumb from '../../../components/common/Breadcrumb';
import Stepper from '../../../components/ui/Stepper';
import TranslationFields from '../../../components/common/TranslationFields';
import familyService from '../../../services/api/familyService';
import itemTypeService from '../../../services/api/itemTypeService';
import categoryService from '../../../services/api/categoryService';
import attributeGroupService from '../../../services/api/attributeGroupService';
import attributeService from '../../../services/api/attributeService';
import type { CreateFamilyDto } from '../../../types/family';
import AttributeSelector from '../../../components/attributes/AttributeSelector';
import AttributeGroupSelector from '../../../components/attributes/AttributeGroupSelector';
import { useTranslation } from '../../../context/i18nContext';
import { useTranslationForm } from '../../../hooks/useTranslationForm';
import { getEntityName } from '../../../utils/translationUtils';

interface ItemTypeOption {
  _id: string;
  name: string;
  code: string;
}

interface CategoryOption {
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

// Card bileşenleri
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const FamilyCreatePage: React.FC = () => {
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
  const [formData, setFormData] = useState<CreateFamilyDto>({
    name: '',
    code: '',
    description: '',
    itemType: '',
    category: '',
    parent: '',
    attributeGroups: [],
    isActive: true
  });
  
  // Seçenekler
  const [itemTypeOptions, setItemTypeOptions] = useState<ItemTypeOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [parentOptions, setParentOptions] = useState<FamilyOption[]>([]);
  const [attributeGroupOptions, setAttributeGroupOptions] = useState<AttributeGroupOption[]>([]);
  
  // Seçili öğeler
  const [selectedAttributeGroups, setSelectedAttributeGroups] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  
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
    { title: 'Temel Bilgiler', description: 'Aile temel bilgileri' },
    { title: 'Hiyerarşi', description: 'Kategori ve ItemType seçimi' },
    { title: 'Öznitelik Grupları', description: 'Aileye öznitelik grupları atama' },
    { title: 'Öznitelikler', description: 'Aileye öznitelik atama' },
    { title: 'Gözden Geçir', description: 'Tüm bilgileri gözden geçir ve oluştur' },
  ], []);
  
  // Öznitelik grupları, ürün tipleri ve kategorileri yükle
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Ürün tipleri getir
        const itemTypesResult = await itemTypeService.getItemTypes({ limit: 100 });
        setItemTypeOptions(itemTypesResult.itemTypes.map(type => ({
          _id: type._id,
          name: type.name,
          code: type.code
        })));
        
        // Kategorileri getir
        const categoriesResult = await categoryService.getCategories({ limit: 100 });
        setCategoryOptions(categoriesResult.categories.map(cat => ({
          _id: cat._id,
          name: cat.name,
          code: cat.code
        })));
        
        // Ebeveyn aileleri getir
        const familiesResult = await familyService.getFamilies({ limit: 100 });
        setParentOptions(familiesResult.families.map(family => ({
          _id: family._id,
          name: family.name,
          code: family.code
        })));
        
        // Öznitelik gruplarını getir
        const groupsResult = await attributeGroupService.getAttributeGroups({ limit: 100 });
        setAttributeGroupOptions(groupsResult.attributeGroups.map(group => ({
          _id: group._id,
          name: group.name,
          code: group.code
        })));
      } catch (err) {
        console.error('Seçenekler yüklenirken hata oluştu:', err);
      }
    };
    
    fetchOptions();
  }, []);
  
  // Helper fonksiyon: Translation objesinden string değer alma
  const getTranslationValue = (translations: Record<string, string>): string => {
    return Object.values(translations).find(value => value && value.trim()) || 'Belirtilmemiş';
  };

  // Helper fonksiyon: Group name'ini güvenli şekilde alma
  const getGroupName = (group: any): string => {
    if (!group) return 'Bilinmeyen Grup';
    
    // Eğer name bir translation objesi ise
    if (typeof group.name === 'object' && group.name !== null) {
      return getEntityName(group.name, currentLanguage) || 'Bilinmeyen Grup';
    }
    
    // Eğer name bir string ise
    if (typeof group.name === 'string') {
      return group.name;
    }
    
    return 'Bilinmeyen Grup';
  };

  // Form input değişiklik handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Checkbox için özel işlem
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Formda hata varsa temizle
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Öznitelik grubu seçimi değişiklik handler
  const handleAttributeGroupChange = (attributeGroupIds: string[]) => {
    setSelectedAttributeGroups(attributeGroupIds);
    setFormData(prev => ({ ...prev, attributeGroups: attributeGroupIds }));
  };
  
  // Öznitelik seçimi değişiklik handler
  const handleAttributeChange = (attributeIds: string[]) => {
    setSelectedAttributes(attributeIds);
    setFormData(prev => ({ ...prev, attributes: attributeIds }));
  };
  
  // Form gönderme işlemi için yeni fonksiyon
  const submitForm = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Çevirileri oluştur
      const { nameId, descriptionId } = await createTranslations(formData.code, 'families');

      // Form verisini hazırla - tüm seçili öznitelik gruplarını ve öznitelikleri ekle
      const payload: CreateFamilyDto = {
        ...formData,
        name: nameId,
        description: descriptionId || '',
        parent: formData.parent || undefined,
        attributeGroups: selectedAttributeGroups,
        attributes: selectedAttributes
      };
      
      console.log('Form gönderiliyor:', payload);
      
      // API'ye gönder
      const response = await familyService.createFamily(payload);
      console.log('API yanıtı:', response);
      
      setSuccess(true);
      
      // Başarılı olduğunda listeye yönlendir
      setTimeout(() => {
        console.log('Yönlendirme yapılıyor...');
        navigate('/families/list');
      }, 1500);
    } catch (err: any) {
      console.error('Form gönderme hatası:', err);
      setError(err.message || 'Aile oluşturulurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Form gönderme handler - event için
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };
  
  // Adımları doğrulama ve ilerleme
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Name translation kontrolü - en az bir dilde dolu olmalı
    const hasNameTranslation = Object.values(translationData.nameTranslations).some(name => name.trim());
    if (!hasNameTranslation) {
      errors.name = 'Aile adı zorunludur (en az bir dilde)';
    }
    
    if (!formData.code.trim()) {
      errors.code = 'Kod zorunludur';
    }
    
    // Description translation kontrolü - en az bir dilde dolu olmalı
    const hasDescriptionTranslation = Object.values(translationData.descriptionTranslations).some(desc => desc.trim());
    if (!hasDescriptionTranslation) {
      errors.description = 'Açıklama zorunludur (en az bir dilde)';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    
    // itemType artık zorunlu değil
    
    if (!formData.category) {
      errors.category = 'Kategori seçimi zorunludur';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateStep3 = (): boolean => {
    // Bu adımda zorunlu alan olmadığı için direkt true dönüyoruz
    return true;
  };
  
  const validateStep4 = (): boolean => {
    // Son adımda sadece final kontroller yapılır
    return true;
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
      } else {
        // Son adımda ise formu gönder
        // FormEvent yerine doğrudan handleSubmit fonksiyonunu çağırıyoruz
        submitForm();
      }
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };
  
  // Adım içeriğini render etme
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            {/* Name Translations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('name')} <span className="text-red-500">*</span>
              </label>
              <TranslationFields
                label=""
                fieldType="input"
                translations={translationData.nameTranslations}
                supportedLanguages={supportedLanguages}
                currentLanguage={currentLanguage}
                onChange={(language, value) => handleTranslationChange('nameTranslations', language, value)}
                error={formErrors.name}
                placeholder={t('family_name_placeholder')}
                required
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>
            
            {/* Kod */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('code')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                className={`bg-gray-50 border ${formErrors.code ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark`}
                placeholder={t('unique_code_placeholder')}
              />
              {formErrors.code && (
                <p className="mt-1 text-sm text-red-500">{formErrors.code}</p>
              )}
            </div>
            
            {/* Description Translations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('description')} <span className="text-red-500">*</span>
              </label>
              <TranslationFields
                label=""
                fieldType="textarea"
                translations={translationData.descriptionTranslations}
                supportedLanguages={supportedLanguages}
                currentLanguage={currentLanguage}
                onChange={(language, value) => handleTranslationChange('descriptionTranslations', language, value)}
                error={formErrors.description}
                placeholder={t('family_description_placeholder')}
                required
                rows={3}
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
              )}
            </div>
            
            {/* Üst Aile Seçimi */}
            <div>
              <label htmlFor="parent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('parent_family')}
              </label>
              <select
                id="parent"
                name="parent"
                value={formData.parent}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
              >
                <option value="">{t('select_parent_family_optional')}</option>
                {parentOptions.map((parent) => (
                  <option key={parent._id} value={parent._id}>
                    {parent.name} ({parent.code})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('parent_family_description')}
              </p>
            </div>
            
            {/* Aktif */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Aile Aktif
                </label>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 ml-6">
                Ailenin aktif olup olmadığını belirler. Pasif aileler kullanıcı arayüzünde gösterilmez.
              </p>
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-4">
            {/* ItemType Seçimi */}
            <div>
              <label htmlFor="itemType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Öğe Tipi
              </label>
              <select
                id="itemType"
                name="itemType"
                value={formData.itemType}
                onChange={handleChange}
                className={`bg-gray-50 border ${formErrors.itemType ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark`}
              >
                <option value="">Öğe tipi seçin (opsiyonel)</option>
                {itemTypeOptions.map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.name} ({type.code})
                  </option>
                ))}
              </select>
              {formErrors.itemType && (
                <p className="mt-1 text-sm text-red-500">{formErrors.itemType}</p>
              )}
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Ailenin bağlı olduğu öğe tipini seçebilirsiniz. Bu, ailenin hangi öğeler için kullanılabileceğini belirler.
              </p>
            </div>
            
            {/* Kategori Seçimi */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className={`bg-gray-50 border ${formErrors.category ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark`}
              >
                <option value="">Kategori seçin</option>
                {categoryOptions.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name} ({category.code})
                  </option>
                ))}
              </select>
              {formErrors.category && (
                <p className="mt-1 text-sm text-red-500">{formErrors.category}</p>
              )}
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Ailenin bağlı olduğu kategoriyi seçin. Bu, ailenin organizasyonel yapısını belirler.
              </p>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            {/* Öznitelik Grupları */}
            <AttributeGroupSelector
              selectedAttributeGroups={selectedAttributeGroups}
              onChange={handleAttributeGroupChange}
            />
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">Bilgi</h4>
                  <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                    Öznitelik grupları, bu aileye ait öğeler için hangi özniteliklerin kullanılabileceğini belirlemenize yardımcı olur.
                    Seçtiğiniz öznitelik grupları, bu aileye ait öğelerin formlarında otomatik olarak gösterilecektir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            {/* Seçilen AttributeGroup'lara ait Attributes */}
            <AttributeSelector 
              attributeGroupIds={selectedAttributeGroups}
              selectedAttributes={selectedAttributes}
              onChange={handleAttributeChange}
            />
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">Bilgi</h4>
                  <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                    Öznitelik gruplarından özel öznitelikler seçebilirsiniz. Eğer hiçbir öznitelik seçmezseniz, 
                    seçtiğiniz tüm grupların içerdiği öznitelikler otomatik olarak aileye eklenecektir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">Gözden Geçirme</h4>
                  <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                    Lütfen girdiğiniz tüm bilgileri kontrol edin. Onayladığınızda aile oluşturulacaktır.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Temel Bilgiler Özeti */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Temel Bilgiler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Aile Adı:</span>
                  <p className="text-gray-900 dark:text-white">
                    {getTranslationValue(translationData.nameTranslations)}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Kod:</span>
                  <p className="text-gray-900 dark:text-white">{formData.code || 'Belirtilmemiş'}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Açıklama:</span>
                  <p className="text-gray-900 dark:text-white">
                    {getTranslationValue(translationData.descriptionTranslations)}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Durum:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    formData.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'
                  }`}>
                    {formData.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Hiyerarşi Özeti */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hiyerarşi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Kategori:</span>
                  <p className="text-gray-900 dark:text-white">
                    {getGroupName(categoryOptions.find(cat => cat._id === formData.category))}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Üst Aile:</span>
                  <p className="text-gray-900 dark:text-white">
                    {getGroupName(parentOptions.find(parent => parent._id === formData.parent))}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Öznitelik Grupları Özeti */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Öznitelik Grupları ({selectedAttributeGroups.length})
              </h3>
              {selectedAttributeGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedAttributeGroups.map(groupId => {
                    const group = attributeGroupOptions.find(g => g._id === groupId);
                    return (
                      <div key={groupId} className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          {getGroupName(group)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Öznitelik grubu seçilmemiş</p>
              )}
            </div>
            
            {/* Öznitelikler Özeti */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Seçili Öznitelikler ({selectedAttributes.length})
              </h3>
              {selectedAttributes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {selectedAttributes.map(attrId => (
                    <div key={attrId} className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                      <span className="text-sm text-green-700 dark:text-green-300">
                        Öznitelik ID: {attrId}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Özel öznitelik seçilmemiş (Tüm grup öznitelikleri dahil edilecek)
                </p>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-7 h-7 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yeni Aile Oluştur
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Ürün kataloğu için yeni bir aile tanımlayın
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => navigate('/families/list')}
            className="flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Listeye Dön
          </Button>
        </div>
      </div>
      
      {/* Stepper */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <Stepper 
          steps={steps}
          activeStep={currentStep}
          completedSteps={completedSteps}
        />
      </div>
      
      {/* Form */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Aile başarıyla oluşturuldu! Yönlendiriliyorsunuz...</span>
          </div>
        )}
        
        <div className="space-y-6">
          {/* Adımlı form içeriği */}
          {renderStepContent()}
          
          {/* Navigasyon butonları */}
          <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              disabled={currentStep === 0}
              onClick={handlePrevStep}
              className="flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Önceki
            </Button>
            
            <Button
              variant="primary"
              onClick={currentStep === steps.length - 1 ? submitForm : handleNextStep}
              loading={isLoading}
              className="flex items-center"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Kaydet
                </>
              ) : (
                <>
                  Sonraki
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyCreatePage; 