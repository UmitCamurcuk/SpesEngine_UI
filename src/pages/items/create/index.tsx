import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Stepper from '../../../components/ui/Stepper';
import Breadcrumb from '../../../components/common/Breadcrumb';
import UnifiedTreeView, { TreeNode } from '../../../components/ui/UnifiedTreeView';
import { AttributeInput, AttributeGroupSection } from '../../../components/attributes/inputs';
import itemService from '../../../services/api/itemService';
import itemTypeService from '../../../services/api/itemTypeService';
import categoryService from '../../../services/api/categoryService';
import familyService from '../../../services/api/familyService';
import type { CreateItemDto } from '../../../types/item';
import { useTranslation } from '../../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../../utils/translationUtils';
import { toast } from 'react-hot-toast';

// Types
interface ItemTypeOption {
  _id: string;
  name: any;
  code?: string;
  description?: any;
  categories?: any[];
  families?: any[];
  attributeGroups?: any[];
}

interface CategoryOption {
  _id: string;
  name: any;
  code?: string;
  parent?: string;
  families?: any[];
}

interface FamilyOption {
  _id: string;
  name: any;
  code?: string;
  category?: any;
  parent?: any;
  attributeGroups?: any[];
}

interface AttributeGroup {
  _id: string;
  name: any;
  code: string;
  description?: any;
  attributes: any[];
  source: 'itemType' | 'category' | 'family';
  sourceName?: string;
}

const ItemCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentLanguage } = useTranslation();
  
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<CreateItemDto>({
    itemType: '',
    category: '',
    family: '',
    attributes: {}
  });
  
  // Validation errors
  const [attributeErrors, setAttributeErrors] = useState<Record<string, string>>({});
  
  // Data states
  const [itemTypes, setItemTypes] = useState<ItemTypeOption[]>([]);
  const [selectedItemTypeData, setSelectedItemTypeData] = useState<any>(null);
  const [categoryTree, setCategoryTree] = useState<TreeNode[]>([]);
  const [familyTree, setFamilyTree] = useState<TreeNode[]>([]);
  const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>([]);
  
  // Selected entities
  const [selectedItemType, setSelectedItemType] = useState<ItemTypeOption | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<FamilyOption | null>(null);

  // Steps configuration
  const steps = [
    { title: 'Öğe Tipi', description: 'Öğe tipini seçin' },
    { title: 'Kategori', description: 'Kategorinizi seçin' },
    { title: 'Aile', description: 'Aileyi seçin' },
    { title: 'Öznitelikler', description: 'Öznitelikleri doldurun' },
    { title: 'Önizleme', description: 'Bilgileri kontrol edin' }
  ];

  // Load initial data
  useEffect(() => {
    loadItemTypes();
  }, []);

  const loadItemTypes = async () => {
    try {
      setLoading(true);
      const response = await itemTypeService.getItemTypes();
      setItemTypes(response.itemTypes || response);
    } catch (error) {
      console.error('ItemType\'lar yüklenirken hata:', error);
      toast.error('Öğe tipleri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: ItemType selection
  const handleItemTypeSelect = async (itemTypeId: string) => {
    try {
      const selectedType = itemTypes.find(t => t._id === itemTypeId);
      if (!selectedType) return;

      setSelectedItemType(selectedType);
      setFormData(prev => ({
        itemType: itemTypeId,
        category: '',
        family: '',
        attributes: {}
      }));

      // Reset subsequent selections
      setSelectedCategory(null);
      setSelectedFamily(null);
      setCategoryTree([]);
      setFamilyTree([]);
      setAttributeGroups([]);
      setAttributeErrors({});

      // Load ItemType with available options (backend needs to be updated to support full hierarchy)
      const itemTypeData = await itemTypeService.getItemTypeById(itemTypeId, {
        includeAttributeGroups: true,
        populateAttributeGroupsAttributes: true
      } as any);

      setSelectedItemTypeData(itemTypeData);
      
      // Build categories from itemType's category and its children
      if (itemTypeData.category) {
        const buildCategoryOptions = (category: any): any[] => {
          const options = [category];
          
          // Add subcategories if they exist
          if (category.subcategories && category.subcategories.length > 0) {
            category.subcategories.forEach((subcat: any) => {
              options.push(...buildCategoryOptions(subcat));
            });
          }
          
          return options;
        };

        const categoryOptions = buildCategoryOptions(itemTypeData.category);
        
        // Convert to tree format for display
        const buildCategoryTree = (parentId: string | null = null): TreeNode[] => {
          return categoryOptions
            .filter((cat: any) => {
              const catParent = typeof cat.parent === 'string' ? cat.parent : cat.parent?._id;
              return catParent === parentId;
            })
            .map((cat: any) => ({
              id: cat._id,
              name: getEntityName(cat, currentLanguage) || 'İsimsiz Kategori',
              data: cat,
              children: buildCategoryTree(cat._id)
            }));
        };

        setCategoryTree(buildCategoryTree());
      }

      toast.success('Öğe tipi seçildi. Sonraki adıma geçebilirsiniz.');
    } catch (error) {
      console.error('ItemType seçiminde hata:', error);
      toast.error('Öğe tipi seçiminde hata oluştu');
    }
  };



  // Load families for step 3
  const loadFamiliesForStep3 = async (categoryId: string) => {
    try {
      setLoading(true);
      const familiesResponse = await familyService.getFamilies();
      const allFamilies = familiesResponse.families || familiesResponse;
      
      // Filter families that belong to this category and itemType
      const categoryFamilies = allFamilies.filter((family: any) => {
        const familyCategory = typeof family.category === 'string' ? family.category : family.category?._id;
        const familyItemType = typeof family.itemType === 'string' ? family.itemType : family.itemType?._id;
        return familyCategory === categoryId && familyItemType === formData.itemType;
      });

      // Build family tree
      const buildFamilyTree = (parentId: string | null = null): TreeNode[] => {
        return categoryFamilies
          .filter((family: any) => {
            const familyParent = typeof family.parent === 'string' ? family.parent : family.parent?._id;
            return familyParent === parentId;
          })
          .map((family: any) => ({
            id: family._id,
            name: getEntityName(family, currentLanguage) || 'İsimsiz Aile',
            data: family,
            children: buildFamilyTree(family._id)
          }));
      };

      setFamilyTree(buildFamilyTree());
    } catch (error) {
      console.error('Aileler yüklenirken hata:', error);
      toast.error('Aileler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Category selection
  const handleCategorySelect = async (categoryNode: TreeNode) => {
    try {
      const category = categoryNode.data as CategoryOption;
      setSelectedCategory(category);
      
      setFormData(prev => ({
        ...prev,
        category: category._id,
        family: '',
        attributes: {}
      }));

      // Reset subsequent selections
      setSelectedFamily(null);
      setFamilyTree([]);
      setAttributeGroups([]);
      setAttributeErrors({});

      // Load families for this category
      await loadFamiliesForStep3(category._id);
      
      toast.success('Kategori seçildi. Aile seçimi için sonraki adıma geçebilirsiniz.');
    } catch (error) {
      console.error('Kategori seçiminde hata:', error);
      toast.error('Kategori seçiminde hata oluştu');
    }
  };

  // Step 3: Family selection  
  const handleFamilySelect = async (familyNode: TreeNode) => {
    try {
      const family = familyNode.data as FamilyOption;
      setSelectedFamily(family);
      
      setFormData(prev => ({
        ...prev,
        family: family._id,
        attributes: {}
      }));

      setAttributeErrors({});

      // Collect all attribute groups from hierarchy
      const groups: AttributeGroup[] = [];

      // 1. ItemType attribute groups
      if (selectedItemTypeData?.attributeGroups) {
        selectedItemTypeData.attributeGroups.forEach((group: any) => {
          if (group.attributes && group.attributes.length > 0) {
            groups.push({
              _id: group._id,
              name: group.name,
              code: group.code,
              description: group.description,
              attributes: group.attributes,
              source: 'itemType',
              sourceName: getEntityName(selectedItemType, currentLanguage)
            });
          }
        });
      }

      // 2. Category hierarchy attribute groups
      const categoryHierarchy = getCategoryHierarchy(selectedCategory!);
      categoryHierarchy.forEach(cat => {
        if (cat.attributeGroups) {
          cat.attributeGroups.forEach((group: any) => {
            if (group.attributes && group.attributes.length > 0 && !groups.find(g => g._id === group._id)) {
              groups.push({
                _id: group._id,
                name: group.name,
                code: group.code,
                description: group.description,
                attributes: group.attributes,
                source: 'category',
                sourceName: getEntityName(cat, currentLanguage)
              });
            }
          });
        }
      });

      // 3. Family hierarchy attribute groups
      const familyHierarchy = getFamilyHierarchy(family);
      familyHierarchy.forEach(fam => {
        if (fam.attributeGroups) {
          fam.attributeGroups.forEach((group: any) => {
            if (group.attributes && group.attributes.length > 0 && !groups.find(g => g._id === group._id)) {
              groups.push({
                _id: group._id,
                name: group.name,
                code: group.code,
                description: group.description,
                attributes: group.attributes,
                source: 'family',
                sourceName: getEntityName(fam, currentLanguage)
              });
            }
          });
        }
      });

      setAttributeGroups(groups);
      
      toast.success('Aile seçildi. Öznitelik doldurma için sonraki adıma geçebilirsiniz.');
    } catch (error) {
      console.error('Aile seçiminde hata:', error);
      toast.error('Aile seçiminde hata oluştu');
    }
  };

  const getCategoryHierarchy = (category: CategoryOption): any[] => {
    // For now, just return the single category until backend provides full hierarchy
    return [category];
  };

  const getFamilyHierarchy = (family: FamilyOption): any[] => {
    // For now, just return the single family until backend provides full hierarchy
    return [family];
  };

  // Attribute management
  const handleAttributeChange = (attributeId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attributeId]: value
      }
    }));

    // Clear error for this attribute
    if (attributeErrors[attributeId]) {
      setAttributeErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[attributeId];
        return newErrors;
      });
    }
  };

  // Validation
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.itemType;
      case 2:
        return !!formData.category;
      case 3:
        return !!formData.family;
      case 4:
        return validateAttributes();
      default:
        return true;
    }
  };

  const validateAttributes = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    attributeGroups.forEach(group => {
      group.attributes.forEach(attribute => {
        if (attribute.isRequired) {
          const value = formData.attributes?.[attribute._id];
          if (value === undefined || value === null || value === '') {
            errors[attribute._id] = `${getEntityName(attribute, currentLanguage)} zorunludur`;
            isValid = false;
          }
        }
      });
    });

    setAttributeErrors(errors);
    return isValid;
  };

  // Navigation
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Submit
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setIsSubmitting(true);
      
      const itemData: CreateItemDto = {
        itemType: formData.itemType!,
        category: formData.category!,
        family: formData.family!,
        attributes: formData.attributes || {}
      };
      
      await itemService.createItem(itemData);
      toast.success('Öğe başarıyla oluşturuldu');
      navigate('/items');
    } catch (error: any) {
      console.error('Item oluşturulurken hata:', error);
      toast.error(error.message || 'Öğe oluşturulurken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Öğe Tipi Seçin</h3>
              <p className="text-gray-600 dark:text-gray-400">Oluşturacağınız öğenin tipini belirleyin</p>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Öğe tipleri yükleniyor...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {itemTypes.map(itemType => (
                  <div
                    key={itemType._id}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      formData.itemType === itemType._id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg ring-2 ring-primary-200 dark:ring-primary-800'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => handleItemTypeSelect(itemType._id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 relative">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          formData.itemType === itemType._id
                            ? 'bg-primary-500 text-white transform scale-110'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        {formData.itemType === itemType._id && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-medium truncate ${
                          formData.itemType === itemType._id
                            ? 'text-primary-900 dark:text-primary-100 font-semibold'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {getEntityName(itemType, currentLanguage) || 'İsimsiz Öğe Tipi'}
                        </h4>
                        {itemType.code && (
                          <p className={`text-xs mt-1 ${
                            formData.itemType === itemType._id
                              ? 'text-primary-700 dark:text-primary-300'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            Kod: {itemType.code}
                          </p>
                        )}
                        {getEntityDescription(itemType, currentLanguage) && (
                          <p className={`text-xs mt-1 line-clamp-2 ${
                            formData.itemType === itemType._id
                              ? 'text-primary-600 dark:text-primary-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {getEntityDescription(itemType, currentLanguage)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Kategori Seçin</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Seçili Öğe Tipi: <strong>{getEntityName(selectedItemType, currentLanguage)}</strong>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Bu öğe tipinin kategori ve alt kategorilerinden birini seçin
              </p>
            </div>
            
            {selectedItemTypeData?.category ? (
              <div className="space-y-4">
                {/* Ana kategori */}
                <div
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    formData.category === selectedItemTypeData.category._id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg ring-2 ring-primary-200 dark:ring-primary-800'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handleCategorySelect({ 
                    id: selectedItemTypeData.category._id, 
                    name: getEntityName(selectedItemTypeData.category, currentLanguage),
                    data: selectedItemTypeData.category 
                  })}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 relative">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 ${
                        formData.category === selectedItemTypeData.category._id
                          ? 'bg-primary-500 text-white transform scale-110'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      </div>
                      {formData.category === selectedItemTypeData.category._id && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-lg font-medium ${
                        formData.category === selectedItemTypeData.category._id
                          ? 'text-primary-900 dark:text-primary-100 font-semibold'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {getEntityName(selectedItemTypeData.category, currentLanguage) || 'İsimsiz Kategori'}
                      </h4>
                      <p className={`text-sm mt-1 ${
                        formData.category === selectedItemTypeData.category._id
                          ? 'text-primary-700 dark:text-primary-300'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        Ana Kategori • Kod: {selectedItemTypeData.category.code}
                      </p>
                      {getEntityDescription(selectedItemTypeData.category, currentLanguage) && (
                        <p className={`text-sm mt-1 ${
                          formData.category === selectedItemTypeData.category._id
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {getEntityDescription(selectedItemTypeData.category, currentLanguage)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Alt kategoriler */}
                {selectedItemTypeData.category.subcategories && selectedItemTypeData.category.subcategories.length > 0 && (
                  <div className="ml-8 space-y-3">
                    <h5 className="text-md font-medium text-gray-700 dark:text-gray-300">Alt Kategoriler:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedItemTypeData.category.subcategories.map((subcat: any) => (
                        <div
                          key={subcat._id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${
                            formData.category === subcat._id
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg ring-2 ring-primary-200 dark:ring-primary-800'
                              : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                          onClick={() => handleCategorySelect({ 
                            id: subcat._id, 
                            name: getEntityName(subcat, currentLanguage),
                            data: subcat 
                          })}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 relative">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                formData.category === subcat._id
                                  ? 'bg-primary-500 text-white transform scale-110'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                              }`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                              </div>
                              {formData.category === subcat._id && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center">
                                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className={`text-sm font-medium truncate ${
                                formData.category === subcat._id
                                  ? 'text-primary-900 dark:text-primary-100 font-semibold'
                                  : 'text-gray-900 dark:text-white'
                              }`}>
                                {getEntityName(subcat, currentLanguage) || 'İsimsiz Alt Kategori'}
                              </h5>
                              <p className={`text-xs mt-1 ${
                                formData.category === subcat._id
                                  ? 'text-primary-700 dark:text-primary-300'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                Alt Kategori • Kod: {subcat.code}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <p>Bu öğe tipi için kategori bulunamadı</p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Aile Seçin</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Seçili Kategori: <strong>{getEntityName(selectedCategory, currentLanguage)}</strong>
              </p>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Aileler yükleniyor...</p>
              </div>
            ) : familyTree.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <UnifiedTreeView
                  data={familyTree}
                  onNodeClick={handleFamilySelect}
                  activeNodeId={formData.family}
                  mode="view"
                  headerTitle="Aileler"
                  maxHeight="500px"
                  expandAll={true}
                  showRelationLines={true}
                  variant="spectrum"
                />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>Bu kategori için aile bulunamadı</p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Öznitelikler</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Seçili Aile: <strong>{getEntityName(selectedFamily, currentLanguage)}</strong>
              </p>
            </div>
            
            {attributeGroups.length > 0 ? (
              <div className="space-y-8">
                {attributeGroups.map(group => (
                  <div key={group._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <AttributeGroupSection
                      attributeGroup={group}
                      attributes={group.attributes}
                      values={formData.attributes || {}}
                      errors={attributeErrors}
                      onChange={handleAttributeChange}
                      disabled={loading}
                    />
                    
                    {/* Source indicator */}
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        group.source === 'itemType' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        group.source === 'category' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}>
                        {group.source === 'itemType' ? 'Öğe Tipi' :
                         group.source === 'category' ? 'Kategori' : 'Aile'}: {group.sourceName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Bu aile için öznitelik bulunamadı</p>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Önizleme</h3>
              <p className="text-gray-600 dark:text-gray-400">Öğe bilgilerini kontrol edin ve oluşturun</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Hierarchy Summary */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Hiyerarşi
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Öğe Tipi:</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {selectedItemType ? getEntityName(selectedItemType, currentLanguage) : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kategori:</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {selectedCategory ? getEntityName(selectedCategory, currentLanguage) : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Aile:</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {selectedFamily ? getEntityName(selectedFamily, currentLanguage) : '-'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Attributes Summary */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Öznitelikler
                  </h4>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {attributeGroups.flatMap(group => group.attributes).map(attribute => (
                      <div key={attribute._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {getEntityName(attribute, currentLanguage)}:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-gray-100 max-w-32 truncate">
                          {formData.attributes?.[attribute._id] || '-'}
                        </span>
                      </div>
                    ))}
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
                { label: 'Öğeler', path: '/items' },
                { label: 'Yeni Öğe Oluştur' }
              ]} 
            />
          </div>

          {/* Başlık Kartı */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <svg className="w-6 h-6 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Yeni Öğe Oluştur
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Sistem hiyerarşisini takip ederek yeni bir öğe oluşturun
                </p>
              </div>
              
              <Button
                variant="outline"
                className="flex items-center mt-4 md:mt-0"
                onClick={() => navigate('/items')}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                activeStep={currentStep - 1} 
                completedSteps={Array.from({ length: currentStep - 1 }, (_, i) => i)} 
              />
            </div>
            
            {/* Form Content */}
            <div className="p-6">
              <div className="min-h-[500px]">
                {renderStepContent()}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
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
                    onClick={() => navigate('/items')}
                    variant="outline"
                  >
                    İptal
                  </Button>

                  {currentStep < steps.length ? (
                    <Button
                      onClick={handleNextStep}
                      disabled={!validateStep(currentStep) || loading}
                      className="flex items-center"
                    >
                      {loading ? 'Yükleniyor...' : 'Sonraki'}
                      {!loading && (
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={!validateStep(currentStep) || isSubmitting}
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
                          Öğeyi Oluştur
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

export default ItemCreatePage;
