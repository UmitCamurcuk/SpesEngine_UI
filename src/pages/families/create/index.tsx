import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Stepper from '../../../components/ui/Stepper';
import familyService from '../../../services/api/familyService';
import itemTypeService from '../../../services/api/itemTypeService';
import categoryService from '../../../services/api/categoryService';
import attributeGroupService from '../../../services/api/attributeGroupService';
import attributeService from '../../../services/api/attributeService';
import type { CreateFamilyDto } from '../../../types/family';
import AttributeSelector from '../../../components/attributes/AttributeSelector';
import AttributeGroupSelector from '../../../components/attributes/AttributeGroupSelector';

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

const FamilyCreatePage: React.FC = () => {
  const navigate = useNavigate();
  
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
  const handleAttributeGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedValues: string[] = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    
    setSelectedAttributeGroups(selectedValues);
    setFormData(prev => ({ ...prev, attributeGroups: selectedValues }));
  };
  
  // Öznitelik seçimi değişiklik handler
  const handleAttributeChange = (attributeIds: string[]) => {
    setSelectedAttributes(attributeIds);
    setFormData(prev => ({ ...prev, attributes: attributeIds }));
  };
  
  // Form gönderme handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Form verisini hazırla - tüm seçili öznitelik gruplarını ve öznitelikleri ekle
      const payload: CreateFamilyDto = {
        ...formData,
        parent: formData.parent || undefined,
        attributeGroups: selectedAttributeGroups,
        attributes: selectedAttributes
      };
      
      // API'ye gönder
      await familyService.createFamily(payload);
      
      setSuccess(true);
      
      // Başarılı olduğunda listeye yönlendir
      setTimeout(() => {
        navigate('/families/list');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Aile oluşturulurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Adımları doğrulama ve ilerleme
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Aile adı zorunludur';
    }
    
    if (!formData.code.trim()) {
      errors.code = 'Kod zorunludur';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Açıklama zorunludur';
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
  
  const handleNextStep = () => {
    let isValid = false;
    
    // Adıma göre validasyon yap
    if (currentStep === 0) {
      isValid = validateStep1();
    } else if (currentStep === 1) {
      isValid = validateStep2();
    } else if (currentStep === 2) {
      isValid = validateStep3();
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
          <div className="space-y-4">
            {/* İsim */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Aile Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`bg-gray-50 border ${formErrors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark`}
                placeholder="Aile adını girin"
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>
            
            {/* Kod */}
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
                required
                className={`bg-gray-50 border ${formErrors.code ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark`}
                placeholder="Benzersiz kod girin (BÜYÜK_HARF)"
              />
              {formErrors.code && (
                <p className="mt-1 text-sm text-red-500">{formErrors.code}</p>
              )}
            </div>
            
            {/* Açıklama */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Açıklama <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className={`bg-gray-50 border ${formErrors.description ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark`}
                placeholder="Aile hakkında açıklama girin"
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
              )}
            </div>
            
            {/* Üst Aile Seçimi */}
            <div>
              <label htmlFor="parent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Üst Aile
              </label>
              <select
                id="parent"
                name="parent"
                value={formData.parent}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
              >
                <option value="">Üst aile seçin (opsiyonel)</option>
                {parentOptions.map((parent) => (
                  <option key={parent._id} value={parent._id}>
                    {parent.name} ({parent.code})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Eğer bu aile başka bir ailenin alt ailesi ise, üst aileyi seçin
              </p>
            </div>
            
            {/* Aktif/Pasif */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-primary-light bg-gray-100 border-gray-300 rounded focus:ring-primary-light dark:focus:ring-primary-dark dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                Aktif
              </label>
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
              onChange={setSelectedAttributeGroups}
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
              onClick={handleNextStep}
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