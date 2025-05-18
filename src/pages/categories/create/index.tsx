import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Stepper from '../../../components/ui/Stepper';
import { TreeView } from '../../../components/ui';
import categoryService from '../../../services/api/categoryService';
import attributeService from '../../../services/api/attributeService';
import attributeGroupService from '../../../services/api/attributeGroupService';
import familyService from '../../../services/api/familyService';
import type { CreateCategoryDto } from '../../../types/category';
import type { TreeNode } from '../../../components/ui/TreeView';
import AttributeGroupSelector from '../../../components/attributes/AttributeGroupSelector';
import PaginatedAttributeSelector from '../../../components/attributes/PaginatedAttributeSelector';

interface CategoryOption {
  _id: string;
  name: string;
  code: string;
}

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

const CategoryCreatePage: React.FC = () => {
  const navigate = useNavigate();
  
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
  const [parentCategoryOptions, setParentCategoryOptions] = useState<CategoryOption[]>([]);
  const [attributeOptions, setAttributeOptions] = useState<AttributeOption[]>([]);
  const [attributeGroupOptions, setAttributeGroupOptions] = useState<AttributeGroupOption[]>([]);
  const [familyOptions, setFamilyOptions] = useState<FamilyOption[]>([]);
  
  // Kategori ağacı
  const [categoryTree, setCategoryTree] = useState<TreeNode[]>([]);
  
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
  ], []);
  
  // Kategori, öznitelik ve öznitelik grubu seçeneklerini yükle
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Kategorileri getir
        const categoriesResult = await categoryService.getCategories({ limit: 100 });
        setParentCategoryOptions(categoriesResult.categories.map(category => ({
          _id: category._id,
          name: category.name,
          code: category.code
        })));
        
        // Kategori ağacını oluştur
        await fetchCategoryTree();
        
        // Aileleri getir
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
  
  // Kategori ağacını getir
  const fetchCategoryTree = async () => {
    try {
      // Tüm kategorileri getir
      const { categories } = await categoryService.getCategories({ limit: 500 });
      
      // Ağaç yapısını oluştur
      const buildCategoryTree = (parentId: string | null = null): TreeNode[] => {
        const nodes: TreeNode[] = categories
          .filter(cat => {
            // Kategorinin parent değeri (string veya obje olabilir)
            let parentValue = null;
            
            if (cat.parent) {
              // Eğer string ise direkt kullan
              if (typeof cat.parent === 'string') {
                parentValue = cat.parent;
              } 
              // Obje ise ve id özelliği varsa
              else if (typeof cat.parent === 'object') {
                // Typescript hata vermemesi için any kullan
                const parentObj = cat.parent as any;
                if (parentObj.id) {
                  parentValue = parentObj.id;
                } else if (parentObj._id) {
                  parentValue = parentObj._id;
                }
              }
            }
            // Eski kodlar için geriye dönük uyumluluk sağlama
            else if (cat.parentCategory) {
              // Eğer string ise direkt kullan
              if (typeof cat.parentCategory === 'string') {
                parentValue = cat.parentCategory;
              } 
              // Obje ise ve id özelliği varsa
              else if (typeof cat.parentCategory === 'object') {
                // Typescript hata vermemesi için any kullan
                const parentObj = cat.parentCategory as any;
                if (parentObj.id) {
                  parentValue = parentObj.id;
                } else if (parentObj._id) {
                  parentValue = parentObj._id;
                }
              }
            }
            
            // Parent ID ile eşleştir
            return (parentId === null && !parentValue) || (parentValue === parentId);
          })
          .map(cat => {
            const catId = cat._id;
            const children = buildCategoryTree(catId);
            return {
              id: catId,
              name: cat.name,
              data: cat,
              children: children.length > 0 ? children : undefined
            };
          });
        
        return nodes;
      };
      
      const tree = buildCategoryTree();
      setCategoryTree(tree);
      
    } catch (err) {
      console.error('Kategori ağacı oluşturulurken hata oluştu:', err);
    }
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
  
  // Öznitelik seçimi değişiklik handler
  const handleAttributeChange = (attributeIds: string[]) => {
    setSelectedAttributes(attributeIds);
    setFormData(prev => ({ ...prev, attributes: attributeIds }));
  };
  
  // Öznitelik grubu seçimi değişiklik handler
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
      // Form verisini hazırla - tüm seçili öznitelik ID'lerini ekle
      const payload: CreateCategoryDto = {
        ...formData,
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
    
    if (!formData.name.trim()) {
      errors.name = 'Kategori adı zorunludur';
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
                Kategori Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`bg-gray-50 border ${formErrors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark`}
                placeholder="Kategori adını girin"
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
                placeholder="Kategori kodunu girin (örn: CAT001)"
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
                rows={3}
                className={`bg-gray-50 border ${formErrors.description ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark`}
                placeholder="Kategori hakkında açıklama girin"
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
              )}
            </div>
            
            {/* Aktif/Pasif */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive === undefined ? true : formData.isActive}
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
            {/* Kategori Hiyerarşisi */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kategori Hiyerarşisi
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                {categoryTree.length > 0 ? (
                  <div className="mb-4">
                    <TreeView 
                      data={categoryTree} 
                      activeNodeId={formData.parentCategory || undefined}
                      expandAll={true}
                      maxHeight="400px"
                      showRelationLines={true}
                      variant="spectrum"
                      onNodeClick={(node) => {
                        setFormData(prev => ({ ...prev, parentCategory: node.id }));
                      }}
                      className="shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">Kategori hiyerarşisi yüklenemedi.</p>
                    <button 
                      onClick={() => fetchCategoryTree()} 
                      className="mt-4 px-4 py-2 bg-primary-light text-white rounded-md hover:bg-primary-light/90 dark:bg-primary-dark dark:hover:bg-primary-dark/90 transition-colors"
                    >
                      Tekrar Dene
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Üst Kategori */}
            <div>
              <label htmlFor="parentCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Üst Kategori
              </label>
              <select
                id="parentCategory"
                name="parentCategory"
                value={formData.parentCategory || ''}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
              >
                <option value="">Üst kategori seçin (opsiyonel)</option>
                {parentCategoryOptions.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name} ({category.code})
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Eğer bu kategori başka bir kategorinin alt kategorisi ise, üst kategoriyi seçin.
                Bu opsiyoneldir ve kategorinizi hiyerarşik olarak düzenlemenize olanak tanır.
              </p>
            </div>
            
            {/* Seçili Üst Kategori Bilgisi */}
            {formData.parentCategory && (
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-200 dark:border-blue-800">
                <div className="flex items-start">
                  <svg className="w-5 h-5 mr-2 mt-0.5 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">Seçili Üst Kategori</h4>
                    <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                      {parentCategoryOptions.find(category => category._id === formData.parentCategory)?.name || 'Seçili kategori'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Aile Seçimi */}
            <div>
              <label htmlFor="family" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Aile
              </label>
              <select
                id="family"
                name="family"
                value={formData.family || ''}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
              >
                <option value="">Aile seçin (opsiyonel)</option>
                {familyOptions.map((family: FamilyOption) => (
                  <option key={family._id} value={family._id}>
                    {family.name} ({family.code})
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Bu kategoriyi bir aile ile ilişkilendirmek isterseniz, bir aile seçebilirsiniz. Bu adım opsiyoneldir.
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
              Yeni Kategori Oluştur
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Yeni bir kategori oluşturmak için adımları takip edin
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => navigate('/categories/list')}
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
            <span>Kategori başarıyla oluşturuldu! Yönlendiriliyorsunuz...</span>
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

export default CategoryCreatePage; 