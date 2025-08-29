import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { useTranslation } from '../context/i18nContext';
import { useNotification } from './notifications';
import associationService from '../services/api/associationService';
import itemTypeService from '../services/api/itemTypeService';
import categoryService from '../services/api/categoryService';
import familyService from '../services/api/familyService';

interface ItemType {
  _id: string;
  code: string;
  name: any;
  description?: any;
}

interface Category {
  _id: string;
  code: string;
  name: any;
}

interface Family {
  _id: string;
  code: string;
  name: any;
}

interface FilterCriteria {
  allowedTargetCategories?: string[];
  allowedTargetFamilies?: string[];
  allowedSourceCategories?: string[];
  allowedSourceFamilies?: string[];
  targetAttributeFilters?: {
    attributeCode: string;
    operator: string;
    value: any;
    description?: string;
  }[];
  sourceAttributeFilters?: {
    attributeCode: string;
    operator: string;
    value: any;
    description?: string;
  }[];
}

interface AssociationFormData {
  nameTranslations: Record<string, string>;
  code: string;
  descriptionTranslations: Record<string, string>;
  isDirectional: boolean;
  association: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  allowedSourceTypes: string[];
  allowedTargetTypes: string[];
  filterCriteria?: FilterCriteria;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAssociationCreated: (association: any) => void;
}

const SimpleAssociationCreator: React.FC<Props> = ({ open, onClose, onAssociationCreated }) => {
  const { t, currentLanguage } = useTranslation();
  const { showToast } = useNotification();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Data states
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);

  // Form state
  const [formData, setFormData] = useState<AssociationFormData>({
    nameTranslations: {},
    code: '',
    descriptionTranslations: {},
    isDirectional: true,
    association: 'one-to-many',
    allowedSourceTypes: [],
    allowedTargetTypes: [],
    filterCriteria: {
      allowedTargetCategories: [],
      allowedTargetFamilies: [],
      allowedSourceCategories: [],
      allowedSourceFamilies: [],
      targetAttributeFilters: [],
      sourceAttributeFilters: []
    }
  });

  // Load data
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemTypesRes, categoriesRes, familiesRes] = await Promise.all([
        itemTypeService.getItemTypes(),
        categoryService.getCategories(),
        familyService.getFamilies()
      ]);

      setItemTypes(itemTypesRes.itemTypes || itemTypesRes);
      setCategories(categoriesRes.categories || categoriesRes);
      setFamilies(familiesRes.families || familiesRes);
    } catch (error) {
      console.error('Data loading error:', error);
      showToast({
        title: 'Hata!',
        message: 'Veriler yüklenirken hata oluştu',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Basic validation
      if (!formData.code || !formData.nameTranslations[currentLanguage]) {
        showToast({
          title: 'Hata!',
          message: 'Kod ve isim gereklidir',
          type: 'error'
        });
        return;
      }

      if (formData.allowedSourceTypes.length === 0 || formData.allowedTargetTypes.length === 0) {
        showToast({
          title: 'Hata!',
          message: 'En az bir kaynak ve hedef tip seçmelisiniz',
          type: 'error'
        });
        return;
      }

      // Create association with filter criteria
      const associationData = {
        name: formData.nameTranslations,
        code: formData.code,
        description: formData.descriptionTranslations,
        isDirectional: formData.isDirectional,
        association: formData.association,
        allowedSourceTypes: formData.allowedSourceTypes,
        allowedTargetTypes: formData.allowedTargetTypes,
        filterCriteria: formData.filterCriteria
      };

      const result = await associationService.createAssociation(associationData);
      
      showToast({
        title: 'Başarılı!',
        message: 'Association başarıyla oluşturuldu',
        type: 'success'
      });

      onAssociationCreated(result);
      onClose();
    } catch (error: any) {
      console.error('Association creation error:', error);
      showToast({
        title: 'Hata!',
        message: error.message || 'Association oluşturulurken hata oluştu',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    'Temel Bilgiler',
    'ItemType Seçimi', 
    'Filter Criteria'
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Temel Bilgiler</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kod *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="association_code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                İsim *
              </label>
              <input
                type="text"
                value={formData.nameTranslations[currentLanguage] || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  nameTranslations: { ...prev.nameTranslations, [currentLanguage]: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Association İsmi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                İlişki Türü
              </label>
              <select
                value={formData.association}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  association: e.target.value as any
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="one-to-one">Bire Bir (1:1)</option>
                <option value="one-to-many">Bire Çok (1:N)</option>
                <option value="many-to-one">Çoka Bir (N:1)</option>
                <option value="many-to-many">Çoka Çok (N:N)</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDirectional"
                checked={formData.isDirectional}
                onChange={(e) => setFormData(prev => ({ ...prev, isDirectional: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isDirectional" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Yönlü İlişki
              </label>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">ItemType Seçimi</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kaynak ItemType'lar *
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                {itemTypes.map((itemType) => (
                  <div key={itemType._id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`source-${itemType._id}`}
                      checked={formData.allowedSourceTypes.includes(itemType._id)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...formData.allowedSourceTypes, itemType._id]
                          : formData.allowedSourceTypes.filter(id => id !== itemType._id);
                        setFormData(prev => ({ ...prev, allowedSourceTypes: newTypes }));
                      }}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`source-${itemType._id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {itemType.name?.[currentLanguage] || itemType.code}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hedef ItemType'lar *
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                {itemTypes.map((itemType) => (
                  <div key={itemType._id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`target-${itemType._id}`}
                      checked={formData.allowedTargetTypes.includes(itemType._id)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...formData.allowedTargetTypes, itemType._id]
                          : formData.allowedTargetTypes.filter(id => id !== itemType._id);
                        setFormData(prev => ({ ...prev, allowedTargetTypes: newTypes }));
                      }}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`target-${itemType._id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {itemType.name?.[currentLanguage] || itemType.code}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filter Criteria</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                İzin Verilen Hedef Kategoriler
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                {categories.map((category) => (
                  <div key={category._id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`target-cat-${category._id}`}
                      checked={formData.filterCriteria?.allowedTargetCategories?.includes(category._id) || false}
                      onChange={(e) => {
                        const current = formData.filterCriteria?.allowedTargetCategories || [];
                        const newCategories = e.target.checked
                          ? [...current, category._id]
                          : current.filter(id => id !== category._id);
                        setFormData(prev => ({ 
                          ...prev, 
                          filterCriteria: { 
                            ...prev.filterCriteria, 
                            allowedTargetCategories: newCategories 
                          }
                        }));
                      }}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`target-cat-${category._id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {category.name?.[currentLanguage] || category.code}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                İzin Verilen Hedef Aileler
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                {families.map((family) => (
                  <div key={family._id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`target-fam-${family._id}`}
                      checked={formData.filterCriteria?.allowedTargetFamilies?.includes(family._id) || false}
                      onChange={(e) => {
                        const current = formData.filterCriteria?.allowedTargetFamilies || [];
                        const newFamilies = e.target.checked
                          ? [...current, family._id]
                          : current.filter(id => id !== family._id);
                        setFormData(prev => ({ 
                          ...prev, 
                          filterCriteria: { 
                            ...prev.filterCriteria, 
                            allowedTargetFamilies: newFamilies 
                          }
                        }));
                      }}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`target-fam-${family._id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {family.name?.[currentLanguage] || family.code}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Attribute Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Attribute Filtreleri
              </label>
              <div className="space-y-2">
                {formData.filterCriteria?.targetAttributeFilters?.map((filter, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 border border-gray-200 rounded">
                    <input
                      type="text"
                      value={filter.attributeCode}
                      onChange={(e) => {
                        const newFilters = [...(formData.filterCriteria?.targetAttributeFilters || [])];
                        newFilters[index] = { ...filter, attributeCode: e.target.value };
                        setFormData(prev => ({ 
                          ...prev, 
                          filterCriteria: { 
                            ...prev.filterCriteria, 
                            targetAttributeFilters: newFilters 
                          }
                        }));
                      }}
                      placeholder="Attribute Code"
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <select
                      value={filter.operator}
                      onChange={(e) => {
                        const newFilters = [...(formData.filterCriteria?.targetAttributeFilters || [])];
                        newFilters[index] = { ...filter, operator: e.target.value };
                        setFormData(prev => ({ 
                          ...prev, 
                          filterCriteria: { 
                            ...prev.filterCriteria, 
                            targetAttributeFilters: newFilters 
                          }
                        }));
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="equals">Equals</option>
                      <option value="contains">Contains</option>
                      <option value="in">In</option>
                      <option value="exists">Exists</option>
                    </select>
                    <input
                      type="text"
                      value={filter.value}
                      onChange={(e) => {
                        const newFilters = [...(formData.filterCriteria?.targetAttributeFilters || [])];
                        newFilters[index] = { ...filter, value: e.target.value };
                        setFormData(prev => ({ 
                          ...prev, 
                          filterCriteria: { 
                            ...prev.filterCriteria, 
                            targetAttributeFilters: newFilters 
                          }
                        }));
                      }}
                      placeholder="Value"
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newFilters = formData.filterCriteria?.targetAttributeFilters?.filter((_, i) => i !== index) || [];
                        setFormData(prev => ({ 
                          ...prev, 
                          filterCriteria: { 
                            ...prev.filterCriteria, 
                            targetAttributeFilters: newFilters 
                          }
                        }));
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      Sil
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newFilter = { attributeCode: '', operator: 'equals', value: '' };
                    const currentFilters = formData.filterCriteria?.targetAttributeFilters || [];
                    setFormData(prev => ({ 
                      ...prev, 
                      filterCriteria: { 
                        ...prev.filterCriteria, 
                        targetAttributeFilters: [...currentFilters, newFilter] 
                      }
                    }));
                  }}
                >
                  + Attribute Filter Ekle
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!open) return null;

  return (
    <Modal
      title="Yeni Association Oluştur"
      isOpen={open}
      onClose={onClose}
      size="lg"
    >
      <div className="space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-center space-x-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index === currentStep 
                  ? 'bg-primary-600 text-white' 
                  : index < currentStep 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <span className={`ml-2 text-sm ${
                index === currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'
              }`}>
                {step}
              </span>
              {index < steps.length - 1 && (
                <div className="ml-4 w-8 h-0.5 bg-gray-300"></div>
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600">Yükleniyor...</span>
            </div>
          ) : (
            renderStepContent()
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0 || loading}
          >
            Önceki
          </Button>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              İptal
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                disabled={loading}
              >
                Sonraki
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Oluşturuluyor...' : 'Association Oluştur'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SimpleAssociationCreator;
