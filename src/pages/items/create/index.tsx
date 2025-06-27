import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Stepper from '../../../components/ui/Stepper';
import Breadcrumb from '../../../components/common/Breadcrumb';
import UnifiedTreeView, { TreeNode } from '../../../components/ui/UnifiedTreeView';
import itemService from '../../../services/api/itemService';
import itemTypeService from '../../../services/api/itemTypeService';
import familyService from '../../../services/api/familyService';
import categoryService from '../../../services/api/categoryService';
import type { CreateItemDto } from '../../../types/item';
import type { Attribute } from '../../../types/attribute';
import type { Family } from '../../../types/family';
import { useTranslation } from '../../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../../utils/translationUtils';

interface ItemTypeOption {
  _id: string;
  name: any;
  code?: string;
}

interface CategoryOption {
  _id: string;
  name: any;
  code?: string;
  parent?: string;
}

interface FamilyOption {
  _id: string;
  name: string;
  code?: string;
  category: string;
}

// Öznitelik form bileşeni
const AttributeField: React.FC<{
  attribute: Attribute;
  value: any;
  onChange: (value: any) => void;
}> = ({ attribute, value, onChange }) => {
  const { currentLanguage } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  
  const validateField = (value: any): boolean => {
    if (attribute.isRequired && (value === undefined || value === null || value === '')) {
      setError(`${getEntityName(attribute, currentLanguage)} alanı zorunludur`);
      return false;
    }
    setError(null);
    return true;
  };
  
  const handleChange = (newValue: any) => {
    onChange(newValue);
    validateField(newValue);
  };
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {getEntityName(attribute, currentLanguage)} 
        {attribute.isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {attribute.type === 'text' && (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          placeholder={getEntityDescription(attribute, currentLanguage) || `${getEntityName(attribute, currentLanguage)} girin`}
        />
      )}
      
      {attribute.type === 'number' && (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          placeholder={getEntityDescription(attribute, currentLanguage) || `${getEntityName(attribute, currentLanguage)} girin`}
        />
      )}
      
      {(String(attribute.type).includes('multiline') || String(attribute.type).includes('textarea')) && (
        <textarea
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          placeholder={getEntityDescription(attribute, currentLanguage) || `${getEntityName(attribute, currentLanguage)} girin`}
        />
      )}
      
      {attribute.type === 'select' && attribute.options && (
        <select
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">Seçiniz...</option>
          {attribute.options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
      
      {attribute.type === 'boolean' && (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => handleChange(e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            {getEntityDescription(attribute, currentLanguage) || 'Evet/Hayır'}
          </span>
        </div>
      )}
      
      {attribute.type === 'date' && (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
        />
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

const ItemCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentLanguage } = useTranslation();
  
  // Form state
  const [formData, setFormData] = useState<CreateItemDto>({
    itemType: '',
    category: '',
    family: '',
    attributes: {}
  });
  
  // UI state
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data state
  const [itemTypes, setItemTypes] = useState<ItemTypeOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  
  // Kategori ve aile tree data
  const [categoryTreeData, setCategoryTreeData] = useState<TreeNode[]>([]);
  const [familyTreeData, setFamilyTreeData] = useState<TreeNode[]>([]);
  
  // Selected entities
  const [selectedItemType, setSelectedItemType] = useState<ItemTypeOption | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);

  // Steps configuration
  const steps = [
    { title: 'Öğe Tipi Seçimi', description: 'Öğe tipini seçin' },
    { title: 'Kategori Seçimi', description: 'Kategorinizi seçin' },
    { title: 'Aile Seçimi', description: 'Aileyi seçin' },
    { title: 'Öznitelikler', description: 'Öznitelikleri doldurun' },
    { title: 'Önizleme', description: 'Bilgileri kontrol edin' }
  ];

  // ItemType'ları yükle
  useEffect(() => {
    const fetchItemTypes = async () => {
      try {
        setLoading(true);
        const response = await itemTypeService.getItemTypes();
        setItemTypes(response.itemTypes);
      } catch (error) {
        console.error('ItemType\'lar yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItemTypes();
  }, []);

  // ItemType seçildiğinde kategorileri yükle
  const handleItemTypeSelect = async (itemTypeId: string) => {
    try {
      setLoading(true);
      const selectedType = itemTypes.find(t => t._id === itemTypeId);
      setSelectedItemType(selectedType || null);
      
      // FormData'yı güncelle
      setFormData(prev => ({
        ...prev,
        itemType: itemTypeId,
        category: '',
        family: '',
        attributes: {}
      }));
      
      // Kategorileri getir ve tree formatına çevir
      const categoriesData = await categoryService.getCategoriesByItemType(itemTypeId);
      setCategories(categoriesData);
      
      // Tree formatına çevir
      const treeData: TreeNode[] = categoriesData.map(category => ({
        id: category._id,
        name: getEntityName(category, currentLanguage) || 'İsimsiz Kategori',
        data: category
      }));
      
      setCategoryTreeData(treeData);
      
      // Sonraki adımları sıfırla
      setSelectedCategory(null);
      setSelectedFamily(null);
      setFamilies([]);
      setFamilyTreeData([]);
      setAttributes([]);
      
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Kategori seçildiğinde aileleri yükle
  const handleCategorySelect = async (categoryNode: TreeNode) => {
    try {
      setLoading(true);
      const category = categoryNode.data as CategoryOption;
      setSelectedCategory(category);
      
      // FormData'yı güncelle
      setFormData(prev => ({
        ...prev,
        category: category._id,
        family: '',
        attributes: {}
      }));
      
      // Aileleri getir ve tree formatına çevir
      const familiesData = await familyService.getFamiliesByCategory(category._id);
      setFamilies(familiesData);
      
      // Tree formatına çevir
      const treeData: TreeNode[] = familiesData.map(family => ({
        id: family._id,
        name: getEntityName(family, currentLanguage) || 'İsimsiz Aile',
        data: family
      }));
      
      setFamilyTreeData(treeData);
      
      // Sonraki adımları sıfırla
      setSelectedFamily(null);
      setAttributes([]);
      
    } catch (error) {
      console.error('Aileler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Aile seçildiğinde attributeları yükle
  const handleFamilySelect = async (familyNode: TreeNode) => {
    try {
      setLoading(true);
      const family = familyNode.data as Family;
      setSelectedFamily(family);
      
      // FormData'yı güncelle
      setFormData(prev => ({
        ...prev,
        family: family._id,
        attributes: {}
      }));
      
      // Aile detayını getir ve attributeları yükle
      const familyDetail = await familyService.getFamilyById(family._id, {
        includeAttributes: true,
        includeAttributeGroups: true,
        populateAttributeGroupsAttributes: true
      });
      
      // Attributeları topla
      const allAttributes: Attribute[] = [];
      
      // Direkt attributes
      if (familyDetail.attributes) {
        allAttributes.push(...familyDetail.attributes);
      }
      
      // AttributeGroup'lardan gelen attributes
      if (familyDetail.attributeGroups) {
        familyDetail.attributeGroups.forEach((group: any) => {
          if (group.attributes) {
            allAttributes.push(...group.attributes);
          }
        });
      }
      
      // Kategori attributeları
      if (familyDetail.category && familyDetail.category.attributes) {
        allAttributes.push(...familyDetail.category.attributes);
      }
      
      // Kategori attributeGroups
      if (familyDetail.category && familyDetail.category.attributeGroups) {
        familyDetail.category.attributeGroups.forEach((group: any) => {
          if (group.attributes) {
            allAttributes.push(...group.attributes);
          }
        });
      }
      
      // Unique yap
      const uniqueAttributes = allAttributes.filter((attr, index, self) => 
        index === self.findIndex(a => a._id === attr._id)
      );
      
      setAttributes(uniqueAttributes);
      
    } catch (error) {
      console.error('Attributelar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Attribute değeri değiştiğinde
  const handleAttributeChange = (attributeId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attributeId]: value
      }
    }));
  };

  // Validasyon
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.itemType;
      case 2:
        return !!formData.category;
      case 3:
        return !!formData.family;
      case 4:
        // Required attribute kontrolü
        const requiredAttributes = attributes.filter(attr => attr.isRequired);
        return requiredAttributes.every(attr => 
          formData.attributes?.[attr._id] !== undefined && 
          formData.attributes?.[attr._id] !== null && 
          formData.attributes?.[attr._id] !== ''
        );
      default:
        return true;
    }
  };

  // Next step
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  // Previous step
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Submit
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const itemData: CreateItemDto = {
        itemType: formData.itemType!,
        category: formData.category!,
        family: formData.family!,
        attributes: formData.attributes || {}
      };
      
      await itemService.createItem(itemData);
      navigate('/items');
    } catch (error) {
      console.error('Item oluşturulurken hata:', error);
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
            <h3 className="text-lg font-medium">Öğe Tipi Seçin</h3>
            {loading ? (
              <div className="text-center py-8">Yükleniyor...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {itemTypes.map(itemType => (
                  <div
                    key={itemType._id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.itemType === itemType._id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                    }`}
                    onClick={() => handleItemTypeSelect(itemType._id)}
                  >
                    <h4 className="font-medium">{getEntityName(itemType, currentLanguage) || 'İsimsiz Öğe Tipi'}</h4>
                    {itemType.code && (
                      <p className="text-sm text-gray-500 mt-1">Kod: {itemType.code}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Kategori Seçin</h3>
            {selectedItemType && (
              <p className="text-sm text-gray-600">
                Seçili Öğe Tipi: <strong>{getEntityName(selectedItemType, currentLanguage) || 'İsimsiz'}</strong>
              </p>
            )}
            
            {loading ? (
              <div className="text-center py-8">Kategoriler yükleniyor...</div>
            ) : categoryTreeData.length > 0 ? (
              <UnifiedTreeView
                data={categoryTreeData}
                onNodeClick={handleCategorySelect}
                activeNodeId={formData.category}
                mode="view"
                headerTitle="Kategoriler"
                maxHeight="400px"
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                Bu öğe tipi için kategori bulunamadı
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Aile Seçin</h3>
            {selectedCategory && (
              <p className="text-sm text-gray-600">
                Seçili Kategori: <strong>{getEntityName(selectedCategory, currentLanguage) || 'İsimsiz'}</strong>
              </p>
            )}
            
            {loading ? (
              <div className="text-center py-8">Aileler yükleniyor...</div>
            ) : familyTreeData.length > 0 ? (
              <UnifiedTreeView
                data={familyTreeData}
                onNodeClick={handleFamilySelect}
                activeNodeId={formData.family}
                mode="view"
                headerTitle="Aileler"
                maxHeight="400px"
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                Bu kategori için aile bulunamadı
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Öznitelikler</h3>
            {selectedFamily && (
              <p className="text-sm text-gray-600">
                Seçili Aile: <strong>{getEntityName(selectedFamily, currentLanguage) || 'İsimsiz'}</strong>
              </p>
            )}
            
            {loading ? (
              <div className="text-center py-8">Öznitelikler yükleniyor...</div>
            ) : attributes.length > 0 ? (
              <div className="space-y-4">
                {attributes.map(attribute => (
                  <AttributeField
                    key={attribute._id}
                    attribute={attribute}
                    value={formData.attributes?.[attribute._id]}
                    onChange={(value) => handleAttributeChange(attribute._id, value)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Bu aile için öznitelik bulunamadı
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Önizleme</h3>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Hiyerarşi</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Öğe Tipi:</span> 
                      <span className="ml-2 font-medium">
                        {selectedItemType ? getEntityName(selectedItemType, currentLanguage) || 'İsimsiz' : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Kategori:</span> 
                      <span className="ml-2 font-medium">
                        {selectedCategory ? getEntityName(selectedCategory, currentLanguage) || 'İsimsiz' : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Aile:</span> 
                      <span className="ml-2 font-medium">
                        {selectedFamily ? getEntityName(selectedFamily, currentLanguage) || 'İsimsiz' : '-'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Öznitelikler</h4>
                  <div className="space-y-2 text-sm">
                    {attributes.map(attribute => (
                      <div key={attribute._id}>
                        <span className="text-gray-500">{getEntityName(attribute, currentLanguage) || 'İsimsiz'}:</span>
                        <span className="ml-2 font-medium">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: 'Ana Sayfa', path: '/' },
            { label: 'Öğeler', path: '/items' },
            { label: 'Yeni Öğe Oluştur' }
          ]}
        />

        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Yeni Öğe Oluştur
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Sistem hiyerarşisini takip ederek yeni bir öğe oluşturun
              </p>
            </div>

            <div className="p-6">
              <Stepper
                steps={steps}
                activeStep={currentStep - 1}
                completedSteps={Array.from({ length: currentStep - 1 }, (_, i) => i)}
              />

              <div className="min-h-[400px] mt-8">
                {renderStepContent()}
              </div>

              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                  variant="secondary"
                >
                  Önceki
                </Button>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => navigate('/items')}
                    variant="secondary"
                  >
                    İptal
                  </Button>

                  {currentStep < steps.length ? (
                    <Button
                      onClick={handleNextStep}
                      disabled={!validateStep(currentStep) || loading}
                    >
                      {loading ? 'Yükleniyor...' : 'Sonraki'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={!validateStep(currentStep) || isSubmitting}
                    >
                      {isSubmitting ? 'Oluşturuluyor...' : 'Oluştur'}
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
