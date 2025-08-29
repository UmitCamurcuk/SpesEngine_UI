import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Breadcrumb from '../../../components/common/Breadcrumb';
import Stepper from '../../../components/ui/Stepper';
import TranslationFields from '../../../components/common/TranslationFields';
import attributeService from '../../../services/api/attributeService';
import attributeGroupService from '../../../services/api/attributeGroupService';
import familyService from '../../../services/api/familyService';
import type { CreateCategoryDto } from '../../../types/category';
import AttributeGroupSelector from '../../../components/attributes/AttributeGroupSelector';
import PaginatedAttributeSelector from '../../../components/attributes/PaginatedAttributeSelector';
import { useTranslation } from '../../../context/i18nContext';
import { useTranslationForm } from '../../../hooks/useTranslationForm';
import { getEntityName } from '../../../utils/translationUtils';

interface AttributeOption {
  _id: string;
  name: any;
  code: string;
}

interface AttributeGroupOption {
  _id: string;
  name: any;
  code: string;
}

interface FamilyOption {
  _id: string;
  name: any;
  code: string;
}

const CategoryCreatePage: React.FC = () => {
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
  const [formData, setFormData] = useState<CreateCategoryDto>({
    name: '',
    code: '',
    description: '',
    parentCategory: '',
    family: '',
    attributes: [],
    attributeGroups: [],
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
    { title: 'Temel Bilgiler', description: 'Kategori temel bilgileri' },
    { title: 'Hiyerarşi', description: 'Üst kategori seçimi' },
    { title: 'Öznitelik Grupları', description: 'Kategoriye öznitelik grupları atama' },
    { title: 'Öznitelikler', description: 'Kategoriye ait öznitelikler' },
    { title: 'Gözden Geçir ve Oluştur', description: 'Son kontrol ve kayıt' },
  ], []);
  
  // Kategori, öznitelik ve öznitelik grubu seçeneklerini yükle
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // İlk kategori oluşturulduğu için kategorileri getirmeye gerek yok
        // Sadece aileleri getir (ilk kategori için gerekli olabilir)
        const familiesResult = await familyService.getFamilies({ limit: 100 });
        setFamilyOptions(familiesResult.families.map(family => ({
          _id: family._id,
          name: family.name,
          code: family.code
        })));
        
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
      } catch (err) {
        console.error('Seçenekler yüklenirken hata oluştu:', err);
      }
    };
    
    fetchOptions();
  }, []);
  
  // İlk kategori oluşturulduğu için ağaç fonksiyonlarına gerek yok
  // Bu fonksiyonlar sadece mevcut kategoriler olduğunda kullanılır
  
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
  
  // Öznitelik seçimi değişiklik handler
  const handleAttributeChange = (attributeIds: string[]) => {
    setSelectedAttributes(attributeIds);
    setFormData(prev => ({ ...prev, attributes: attributeIds }));
  };
  
  // Öznitelik grupları seçimi değişiklik handler
  const handleAttributeGroupChange = (attributeGroupIds: string[]) => {
    setSelectedAttributeGroups(attributeGroupIds);
    setFormData(prev => ({ ...prev, attributeGroups: attributeGroupIds }));
  };
  
  // Form gönderme handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Çevirileri oluştur
      const { nameId, descriptionId } = await createTranslations(formData.code, 'categories');

      // Form verisini hazırla - tüm seçili öznitelik ID'lerini ekle
      const payload: CreateCategoryDto = {
        ...formData,
        name: nameId,
        description: descriptionId || '',
        attributes: selectedAttributes,
        attributeGroups: selectedAttributeGroups,
        parentCategory: formData.parentCategory || undefined
      };
      
      // API'ye gönder
      await categoryService.createCategory(payload);
      
      setSuccess(true);
      
      // Başarılı olduğunda listeye yönlendir
      setTimeout(() => {
        navigate('/categories/list');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Kategori oluşturulurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Adımları doğrulama ve ilerleme
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Name translations kontrolü
    const hasNameTranslation = Object.values(translationData.nameTranslations).some(name => name.trim());
    if (!hasNameTranslation) {
      errors.nameTranslations = 'En az bir dilde kategori adı zorunludur';
    }
    
    if (!formData.code.trim()) {
      errors.code = 'Kod zorunludur';
    }
    
    // Description translations kontrolü
    const hasDescriptionTranslation = Object.values(translationData.descriptionTranslations).some(desc => desc.trim());
    if (!hasDescriptionTranslation) {
      errors.descriptionTranslations = 'En az bir dilde açıklama zorunludur';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateStep2 = (): boolean => {
    // Üst kategori zorunlu değil
    return true;
  };
  
  const validateStep3 = (): boolean => {
    // Öznitelik grupları zorunlu değil
    return true;
  };
  
  const validateStep4 = (): boolean => {
    // Öznitelikler zorunlu değil
    return true;
  };

  const validateStep5 = (): boolean => {
    // Review adımında genel validasyon
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
    } else if (currentStep === 4) {
      isValid = validateStep5();
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
        handleSubmit(new Event('submit') as any);
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
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Temel Bilgiler</h3>
            
            {/* NAME TRANSLATIONS */}
            <TranslationFields
              label="Kategori Adı"
              fieldType="input"
              translations={translationData.nameTranslations}
              supportedLanguages={supportedLanguages}
              currentLanguage={currentLanguage}
              onChange={(language, value) => handleTranslationChange('nameTranslations', language, value)}
              error={formErrors.nameTranslations}
              placeholder="Kategori adını girin"
              required
            />

            {/* CODE */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kod <span className="text-red-500">*</span>
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
                placeholder="Kategori kodunu girin (örn: CAT001)"
              />
              {formErrors.code && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.code}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Kod format bilgisi: Küçük harfler, sayılar ve alt çizgi kullanın
              </p>
            </div>

            {/* DESCRIPTION TRANSLATIONS */}
            <TranslationFields
              label="Açıklama"
              fieldType="textarea"
              translations={translationData.descriptionTranslations}
              supportedLanguages={supportedLanguages}
              currentLanguage={currentLanguage}
              onChange={(language, value) => handleTranslationChange('descriptionTranslations', language, value)}
              error={formErrors.descriptionTranslations}
              placeholder="Kategori açıklamasını girin"
              required
              rows={3}
            />
            
            {/* Aktif */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive === undefined ? true : formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Kategori Aktif
                </label>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 ml-6">
                Kategorinin aktif olup olmadığını belirler. Pasif kategoriler kullanıcı arayüzünde gösterilmez.
              </p>
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Hiyerarşik İlişkiler
            </h3>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">İlk Kategori Oluşturma</h4>
                  <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                    Bu ilk kategori olduğu için üst kategori seçimi yapılamaz. Daha sonra oluşturacağınız kategoriler için üst kategori seçebilirsiniz.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Üst Kategori Seçimi */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Üst Kategori
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-center py-6">
                    <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">Henüz kategori bulunmuyor</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Bu ilk kategori olacak</p>
                  </div>
                </div>
              </div>
              
              {/* Aile Seçimi */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Aile Seçimi
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div>
                    <label htmlFor="family" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Aile Seçin (Opsiyonel)
                    </label>
                    <select
                      id="family"
                      name="family"
                      value={formData.family || ''}
                      onChange={handleChange}
                      className="bg-white dark:bg-gray-600 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                    >
                      <option value="">Aile seçin (opsiyonel)</option>
                      {familyOptions.map((family: FamilyOption) => (
                        <option key={family._id} value={family._id}>
                          {getEntityName(family, currentLanguage)} ({family.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Seçili Aile Bilgisi */}
                {formData.family && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-800">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 mr-2 mt-0.5 text-green-500 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-green-700 dark:text-green-300">Seçili Aile</h4>
                        <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                          {(() => {
                            const family = familyOptions.find(family => family._id === formData.family);
                            return family ? getEntityName(family, currentLanguage) || 'Bilinmiyor' : 'Bilinmiyor';
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
                    Öznitelik grupları, bu kategoriye ait öğeler için hangi özniteliklerin kullanılabileceğini belirlemenize yardımcı olur.
                    Seçtiğiniz öznitelik grupları, bu kategoriye ait öğelerin formlarında otomatik olarak gösterilecektir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            {/* Öznitelikler */}
            <PaginatedAttributeSelector
              key="category-create-attribute-selector"
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
                    Öznitelikler, bu kategoriye ait öğelerin hangi özelliklere sahip olabileceğini tanımlar.
                    Seçtiğiniz öznitelikler, bu kategoriye ait öğelerin formlarında otomatik olarak gösterilecektir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Gözden Geçir ve Oluştur</h3>
            
            {/* Temel Bilgiler */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Temel Bilgiler</h4>
              
              {/* Name Translations */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Kategori Adı</label>
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
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Kod</label>
                <p className="text-sm text-gray-900 dark:text-white font-mono bg-white dark:bg-gray-700 p-2 rounded border">
                  {formData.code || '-'}
                </p>
              </div>
              
              {/* Description Translations */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Açıklama</label>
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
              
              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Durum</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  formData.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {formData.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            </div>
            
            {/* Hiyerarşi Bilgileri */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Hiyerarşi</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Parent Category */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Üst Kategori</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    İlk kategori - Üst kategori yok
                  </p>
                </div>
                
                {/* Family */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Aile</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formData.family 
                      ? (() => {
                          const family = familyOptions.find(family => family._id === formData.family);
                          return family ? getEntityName(family, currentLanguage) || 'Bilinmiyor' : 'Bilinmiyor';
                        })()
                      : 'Seçilmedi'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            {/* Attribute Groups */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Öznitelik Grupları</h4>
              {selectedAttributeGroups.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedAttributeGroups.map(groupId => {
                    const group = attributeGroupOptions.find(g => g._id === groupId);
                    return (
                      <span key={groupId} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        {group ? getEntityName(group, currentLanguage) || 'Bilinmiyor' : 'Bilinmiyor'}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Hiç öznitelik grubu seçilmedi</p>
              )}
            </div>
            
            {/* Attributes */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Öznitelikler</h4>
              {selectedAttributes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedAttributes.map(attrId => {
                    const attribute = attributeOptions.find(a => a._id === attrId);
                    return (
                      <span key={attrId} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                        {attribute ? getEntityName(attribute, currentLanguage) || 'Bilinmiyor' : 'Bilinmiyor'}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Hiç öznitelik seçilmedi</p>
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
      {/* BREADCRUMB */}
      <div className="flex items-center justify-between">
        <Breadcrumb 
          items={[
            { label: 'Kategoriler', path: '/categories/list' },
            { label: 'Yeni Kategori' }
          ]} 
        />
      </div>

      {/* HEADER */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-6 h-6 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yeni Kategori Oluştur
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Yeni bir kategori oluşturmak için adımları takip edin
            </p>
          </div>
          
          <Button
            variant="outline"
            className="flex items-center mt-4 md:mt-0"
            onClick={() => navigate('/categories/list')}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Listeye Dön</span>
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
          
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 mb-6 border border-green-200 dark:border-green-800 rounded-md text-green-700 dark:text-green-400 flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Kategori başarıyla oluşturuldu! Yönlendiriliyorsunuz...</span>
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
                Önceki
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  variant="primary"
                  type="button"
                  onClick={handleNextStep}
                >
                  Sonraki
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
                  loading={isLoading}
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Kategori Oluştur
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryCreatePage; 