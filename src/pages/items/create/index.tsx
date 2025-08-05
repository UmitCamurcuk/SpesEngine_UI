import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Stepper from '../../../components/ui/Stepper';
import Breadcrumb from '../../../components/common/Breadcrumb';
import UnifiedTreeView, { TreeNode } from '../../../components/ui/UnifiedTreeView';
import { AttributeGroupSection } from '../../../components/attributes/inputs';
import { AssociationSection, IAssociationRule } from '../../../components/associations';
import itemService from '../../../services/api/itemService';
import itemTypeService from '../../../services/api/itemTypeService';
import familyService from '../../../services/api/familyService';
import relationshipService from '../../../services/api/associationService';
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
    attributes: {},
    associations: {}
  });
  
  // Validation errors
  const [attributeErrors, setAttributeErrors] = useState<Record<string, string>>({});
  const [associationErrors, setAssociationErrors] = useState<Record<string, string>>({});
  
  // Data states
  const [itemTypes, setItemTypes] = useState<ItemTypeOption[]>([]);
  const [selectedItemTypeData, setSelectedItemTypeData] = useState<any>(null);
  const [categoryTree, setCategoryTree] = useState<TreeNode[]>([]);
  const [familyTree, setFamilyTree] = useState<TreeNode[]>([]);
  const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>([]);
  const [associationRules, setAssociationRules] = useState<IAssociationRule[]>([]);
  const [displayConfigs, setDisplayConfigs] = useState<Record<string, any>>({});
  
  // Selected entities
  const [selectedItemType, setSelectedItemType] = useState<ItemTypeOption | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<FamilyOption | null>(null);

  // Steps configuration
  const steps = [
    { title: 'Öğe Tipi', description: 'Öğe tipini seçin' },
    { title: 'Kategori', description: 'Kategorinizi seçin' },
    { title: 'Aile', description: 'Aileyi seçin' },
    { title: 'İlişkiler', description: 'İlişkili öğeleri seçin' },
    { title: 'Öznitelikler', description: 'Öznitelikleri doldurun' },
    { title: 'Önizleme', description: 'Bilgileri kontrol edin' }
  ];

  // Load display configs for associations
  const loadDisplayConfigs = async (associationRules: IAssociationRule[]) => {
    try {
      const configs: Record<string, any> = {};
      
      // Get all relationship types and filter by our associations
      const allRelationshipTypes = await relationshipService.getAllRelationshipTypes();
      console.log('🔍 All relationship types:', allRelationshipTypes);
      
      for (const rule of associationRules) {
        console.log('🔍 Processing rule:', rule);
        
        // Find relationship type for this association
        const relationshipType = allRelationshipTypes.find(rt => {
          const sourceMatch = rt.allowedSourceTypes?.includes(selectedItemType?.code || '');
          const targetMatch = rt.allowedTargetTypes?.includes(rule.targetItemTypeCode);
          console.log('🔍 Checking relationship type:', {
            rtCode: rt.code,
            allowedSourceTypes: rt.allowedSourceTypes,
            allowedTargetTypes: rt.allowedTargetTypes,
            selectedItemTypeCode: selectedItemType?.code,
            ruleTargetItemTypeCode: rule.targetItemTypeCode,
            sourceMatch,
            targetMatch
          });
          return sourceMatch && targetMatch;
        });
        
        console.log('🔍 Found relationship type:', relationshipType);
        
        if (relationshipType?.displayConfig) {
          configs[rule.targetItemTypeCode] = relationshipType.displayConfig.sourceToTarget;
          console.log('🔍 Added display config for:', rule.targetItemTypeCode, relationshipType.displayConfig.sourceToTarget);
        } else {
          console.log('🔍 No display config found for:', rule.targetItemTypeCode);
        }
      }
      
      setDisplayConfigs(configs);
      console.log('🎨 Final display configs:', configs);
    } catch (error) {
      console.error('Display configs yüklenirken hata:', error);
    }
  };

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
      setFormData(() => ({
        itemType: itemTypeId,
        category: '',
        family: '',
        attributes: {},
        associations: {}
      }));

      // Reset subsequent selections
      setSelectedCategory(null);
      setSelectedFamily(null);
      setCategoryTree([]);
      setFamilyTree([]);
      setAttributeGroups([]);
      setAssociationRules([]);
      setAttributeErrors({});
      setAssociationErrors({});

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

      // Load association rules
      if (itemTypeData.associations && itemTypeData.associations.outgoing) {
        setAssociationRules(itemTypeData.associations.outgoing);
        console.log('🔗 Association rules loaded:', itemTypeData.associations.outgoing);
        
        // Load display configs for associations
        await loadDisplayConfigs(itemTypeData.associations.outgoing);
      } else {
        setAssociationRules([]);
        setDisplayConfigs({});
      }

      toast.success('Öğe tipi seçildi. Sonraki adıma geçebilirsiniz.');
    } catch (error) {
      console.error('ItemType seçiminde hata:', error);
      toast.error('Öğe tipi seçiminde hata oluştu');
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

      // 🚀 OPTIMAL: Use data from ItemType API response
      let families: any[] = [];
      
      if (selectedItemTypeData?.category) {
        // 1. Ana kategorinin families'lerini kontrol et
        if (selectedItemTypeData.category._id === category._id && selectedItemTypeData.category.families) {
          families = selectedItemTypeData.category.families;
        }
        
        // 2. Alt kategorilerin families'lerini kontrol et
        if (selectedItemTypeData.category.subcategories) {
          const subcat = selectedItemTypeData.category.subcategories.find((sc: any) => sc._id === category._id);
          if (subcat) {
            if (subcat.families && subcat.families.length > 0) {
              // Alt kategorinin kendi families'i varsa onu kullan
              families = subcat.families;
            } else {
              // Alt kategorinin families'i yoksa ana kategorinin families'lerini kullan
              // Bu business logic açısından mantıklı: Alt kategoriler parent'ın families'lerini kullanabilir
              families = selectedItemTypeData.category.families || [];
            }
          }
        }
        
        console.log('🔍 Selected category:', category._id);
        console.log('🔍 Available families count:', families.length);
        console.log('🔍 Family details:', families.map(f => ({ id: f._id, code: f.code, name: getEntityName(f, currentLanguage) })));
        
        // Family tree oluştur - subFamilies field'ı kullanarak
        const familyNodes = families
          .filter((family: any) => family && family._id) // Null/undefined check
          .map((family: any) => ({
            id: family._id,
            name: getEntityName(family, currentLanguage) || 'İsimsiz Aile',
            data: family,
            children: family.subFamilies && family.subFamilies.length > 0 
              ? family.subFamilies
                  .filter((subFamily: any) => subFamily && subFamily._id)
                  .map((subFamily: any) => ({
                    id: subFamily._id,
                    name: getEntityName(subFamily, currentLanguage) || 'İsimsiz Alt Aile',
                    data: subFamily,
                    children: []
                  }))
              : []
          }));

        console.log('Built family tree:', familyNodes);
        setFamilyTree(familyNodes);
      }
      
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

      console.log('🔍 Collected attribute groups:', {
        total: groups.length,
        itemType: groups.filter(g => g.source === 'itemType').length,
        category: groups.filter(g => g.source === 'category').length,
        family: groups.filter(g => g.source === 'family').length,
        groups: groups.map(g => ({
          id: g._id,
          source: g.source,
          sourceName: g.sourceName,
          attributeCount: g.attributes.length
        }))
      });
      
      console.log('🔍 Category hierarchy:', getCategoryHierarchy(selectedCategory!));
      console.log('🔍 Family hierarchy:', getFamilyHierarchy(family));
      
      setAttributeGroups(groups);
      
      toast.success('Aile seçildi. Öznitelik doldurma için sonraki adıma geçebilirsiniz.');
    } catch (error) {
      console.error('Aile seçiminde hata:', error);
      toast.error('Aile seçiminde hata oluştu');
    }
  };

  const getCategoryHierarchy = (category: CategoryOption): any[] => {
    // Get category hierarchy from selectedItemTypeData
    const hierarchy: any[] = [];
    
    if (selectedItemTypeData?.category) {
      // Add main category if it's the target or if target is a subcategory
      if (selectedItemTypeData.category._id === category._id) {
        hierarchy.push(selectedItemTypeData.category);
      } else {
        // Check if target is in subcategories, if so, add main category first
        const isInSubcategories = checkIfCategoryInSubcategories(selectedItemTypeData.category.subcategories, category._id);
        if (isInSubcategories) {
          hierarchy.push(selectedItemTypeData.category);
        }
      }
      
      // Add subcategories hierarchy
      if (selectedItemTypeData.category.subcategories) {
        const found = findCategoryInSubcategories(selectedItemTypeData.category.subcategories, category._id);
        if (found.length > 0) {
          hierarchy.push(...found);
        }
      }
    }
    
    return hierarchy.length > 0 ? hierarchy : [category];
  };

  // Helper function to check if category exists in subcategories
  const checkIfCategoryInSubcategories = (subcategories: any[], targetId: string): boolean => {
    for (const subcat of subcategories) {
      if (subcat._id === targetId) {
        return true;
      }
      if (subcat.subcategories) {
        if (checkIfCategoryInSubcategories(subcat.subcategories, targetId)) {
          return true;
        }
      }
    }
    return false;
  };

  // Helper function to find category in subcategories with full path
  const findCategoryInSubcategories = (subcategories: any[], targetId: string): any[] => {
    for (const subcat of subcategories) {
      if (subcat._id === targetId) {
        return [subcat];
      }
      if (subcat.subcategories) {
        const found = findCategoryInSubcategories(subcat.subcategories, targetId);
        if (found.length > 0) {
          return [subcat, ...found];
        }
      }
    }
    return [];
  };

  const getFamilyHierarchy = (family: FamilyOption): any[] => {
    // Get family hierarchy from selectedItemTypeData
    const hierarchy: any[] = [];
    
    if (selectedItemTypeData?.category) {
      // Search in main category families
      if (selectedItemTypeData.category.families) {
        const findFamilyInFamilies = (families: any[], targetId: string): any[] => {
          for (const fam of families) {
            if (fam._id === targetId) {
              // Found the target family, now build the hierarchy from root to target
              return buildFamilyHierarchy(families, targetId);
            }
            if (fam.subFamilies) {
              const found = findFamilyInFamilies(fam.subFamilies, targetId);
              if (found.length > 0) {
                // Found in subfamilies, add current family to hierarchy
                return [fam, ...found];
              }
            }
          }
          return [];
        };
        
        const found = findFamilyInFamilies(selectedItemTypeData.category.families, family._id);
        if (found.length > 0) {
          hierarchy.push(...found);
        }
      }
      
      // Search in subcategory families
      if (selectedItemTypeData.category.subcategories) {
        for (const subcat of selectedItemTypeData.category.subcategories) {
          if (subcat.families) {
            const findFamilyInFamilies = (families: any[], targetId: string): any[] => {
              for (const fam of families) {
                if (fam._id === targetId) {
                  // Found the target family, now build the hierarchy from root to target
                  return buildFamilyHierarchy(families, targetId);
                }
                if (fam.subFamilies) {
                  const found = findFamilyInFamilies(fam.subFamilies, targetId);
                  if (found.length > 0) {
                    // Found in subfamilies, add current family to hierarchy
                    return [fam, ...found];
                  }
                }
              }
              return [];
            };
            
            const found = findFamilyInFamilies(subcat.families, family._id);
            if (found.length > 0) {
              hierarchy.push(...found);
            }
          }
        }
      }
    }
    
    return hierarchy.length > 0 ? hierarchy : [family];
  };

  // Helper function to build family hierarchy from root to target
  const buildFamilyHierarchy = (families: any[], targetId: string): any[] => {
    const hierarchy: any[] = [];
    
    const findPath = (familyList: any[], target: string, currentPath: any[] = []): any[] | null => {
      for (const fam of familyList) {
        const newPath = [...currentPath, fam];
        
        if (fam._id === target) {
          return newPath;
        }
        
        if (fam.subFamilies && fam.subFamilies.length > 0) {
          const found = findPath(fam.subFamilies, target, newPath);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };
    
    const path = findPath(families, targetId);
    return path || [];
  };

    // Attribute management - Memoized to prevent infinite re-renders
  const handleAttributeChange = useCallback((attributeId: string, value: any) => {
    setFormData(prev => {
      // Avoid unnecessary updates if value hasn't changed
      if (prev.attributes?.[attributeId] === value) {
        return prev;
      }
      
      return {
        ...prev,
        attributes: {
          ...prev.attributes,
          [attributeId]: value
        }
      };
    });

    // Clear error for this attribute
    if (attributeErrors[attributeId]) {
      setAttributeErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[attributeId];
        return newErrors;
      });
    }
  }, [attributeErrors]);

  // Association handlers
  const handleAssociationsChange = useCallback((newAssociations: Record<string, any>) => {
    setFormData(prev => ({
      ...prev,
      associations: newAssociations
    }));
  }, []);

  const validateAssociations = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    associationRules.forEach(rule => {
      const key = `${rule.targetItemTypeCode}_${rule.relationshipType}`;
      const value = formData.associations?.[key];
      
      // Check required associations
      if (rule.isRequired && (!value || (Array.isArray(value) && value.length === 0))) {
        errors[key] = `${rule.targetItemTypeName || rule.targetItemTypeCode} seçimi zorunludur`;
        isValid = false;
      }

      // Check cardinality
      if (value) {
        const count = Array.isArray(value) ? value.length : 1;
        
        // Min check
        if (rule.cardinality.min && count < rule.cardinality.min) {
          errors[key] = `En az ${rule.cardinality.min} ${rule.targetItemTypeName || rule.targetItemTypeCode} seçmelisiniz`;
          isValid = false;
        }

        // Max check
        if (rule.cardinality.max && count > rule.cardinality.max) {
          errors[key] = `En fazla ${rule.cardinality.max} ${rule.targetItemTypeName || rule.targetItemTypeCode} seçebilirsiniz`;
          isValid = false;
        }
      }
    });

    return isValid;
  }, [formData.associations, associationRules]);

  // Separate function for setting association errors (called only when needed)
  const setAssociationErrorsWithValidation = useCallback(() => {
    const errors: Record<string, string> = {};
    let isValid = true;

    associationRules.forEach(rule => {
      const key = `${rule.targetItemTypeCode}_${rule.relationshipType}`;
      const value = formData.associations?.[key];
      
      // Check required associations
      if (rule.isRequired && (!value || (Array.isArray(value) && value.length === 0))) {
        errors[key] = `${rule.targetItemTypeName || rule.targetItemTypeCode} seçimi zorunludur`;
        isValid = false;
      }

      // Check cardinality
      if (value) {
        const count = Array.isArray(value) ? value.length : 1;
        
        // Min check
        if (rule.cardinality.min && count < rule.cardinality.min) {
          errors[key] = `En az ${rule.cardinality.min} ${rule.targetItemTypeName || rule.targetItemTypeCode} seçmelisiniz`;
          isValid = false;
        }

        // Max check
        if (rule.cardinality.max && count > rule.cardinality.max) {
          errors[key] = `En fazla ${rule.cardinality.max} ${rule.targetItemTypeName || rule.targetItemTypeCode} seçebilirsiniz`;
          isValid = false;
        }
      }
    });

    setAssociationErrors(errors);
    return isValid;
  }, [formData.associations, associationRules]);

  // Validation - Memoized to prevent infinite loops
  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.itemType;
      case 2:
        return !!formData.category;
      case 3:
        return !!formData.family;
      case 4:
        // Association validation
        return validateAssociations();
      case 5:
        // Attributes validation
        return attributeGroups.every(group => 
          group.attributes.every(attribute => 
            !attribute.isRequired || 
            (formData.attributes?.[attribute._id] !== undefined && 
             formData.attributes?.[attribute._id] !== null && 
             formData.attributes?.[attribute._id] !== '')
          )
        );
      default:
        return true;
    }
  }, [formData.itemType, formData.category, formData.family, formData.attributes, formData.associations, attributeGroups, associationRules]);

  const validateAttributes = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    attributeGroups.forEach(group => {
      group.attributes.forEach(attribute => {
        if (attribute.isRequired) {
          const value = formData.attributes?.[attribute._id];
          
          // Special handling for table type
          if (attribute.type === 'table') {
            if (!Array.isArray(value) || value.length === 0) {
              errors[attribute._id] = `${getEntityName(attribute, currentLanguage)} için en az bir satır girmelisiniz`;
              isValid = false;
            } else {
              // Check if there are any rows with actual data
              const hasValidRows = value.some(row => 
                Array.isArray(row) && row.some(cell => cell !== '' && cell != null && cell !== undefined)
              );
              if (!hasValidRows) {
                errors[attribute._id] = `${getEntityName(attribute, currentLanguage)} için veri girmelisiniz`;
                isValid = false;
              }
            }
          } else {
            // Standard validation for other types
            if (value === undefined || value === null || value === '') {
              errors[attribute._id] = `${getEntityName(attribute, currentLanguage)} zorunludur`;
              isValid = false;
            }
          }
        }
      });
    });

    setAttributeErrors(errors);
    return isValid;
  }, [attributeGroups, formData.attributes, currentLanguage]);

  // Navigation
  const handleNextStep = () => {
    if (currentStep === 4) {
      // For step 4 (associations), run full validation with error setting
      if (setAssociationErrorsWithValidation()) {
        setCurrentStep(prev => Math.min(prev + 1, steps.length));
      }
    } else if (currentStep === 5) {
      // For step 5 (attributes), run full validation with error setting
      if (validateAttributes()) {
        setCurrentStep(prev => Math.min(prev + 1, steps.length));
      }
    } else {
      if (validateStep(currentStep)) {
        setCurrentStep(prev => Math.min(prev + 1, steps.length));
      }
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
      
      // Debug: Payload'ı kontrol et
      console.log('🔍 Submitting item data:', {
        itemType: formData.itemType,
        category: formData.category,
        family: formData.family,
        attributes: formData.attributes,
        associations: formData.associations
      });
      
      // Clean up table attributes by removing empty rows
      const cleanedAttributes = { ...formData.attributes };
      
      attributeGroups.forEach(group => {
        group.attributes.forEach(attribute => {
          if (attribute.type === 'table' && cleanedAttributes[attribute._id]) {
            const tableValue = cleanedAttributes[attribute._id];
            if (Array.isArray(tableValue)) {
              // Filter out completely empty rows
              const filteredRows = tableValue.filter(row => 
                Array.isArray(row) && row.some(cell => cell !== '' && cell != null && cell !== undefined)
              );
              cleanedAttributes[attribute._id] = filteredRows;
            }
          }
        });
      });

      const itemData: CreateItemDto = {
        itemType: formData.itemType!,
        category: formData.category!,
        family: formData.family!,
        attributes: cleanedAttributes,
        associations: formData.associations
      };
      
      await itemService.createItem(itemData);
      toast.success('Öğe başarıyla oluşturuldu');
      navigate('/items/list');
    } catch (error: any) {
      console.error('Item oluşturulurken hata:', error);
      
      // Backend error response'unu daha detaylı göster
      if (error.response?.data) {
        console.error('Backend error details:', error.response.data);
        toast.error(error.response.data.message || 'Öğe oluşturulurken hata oluştu');
      } else {
        toast.error(error.message || 'Öğe oluşturulurken hata oluştu');
      }
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
                  <div className="space-y-3">
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
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <UnifiedTreeView
                    data={familyTree}
                    onNodeClick={handleFamilySelect}
                    activeNodeId={formData.family}
                    mode="view"
                    headerTitle="Aileler ve Alt Aileler"
                    maxHeight="500px"
                    expandAll={true}
                    showRelationLines={true}
                    variant="spectrum"
                  />
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Aile Seçimi</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Ana aile veya alt ailelerden birini seçebilirsiniz. Alt aile seçildiğinde, üst aileden gelen öznitelikler de dahil edilir.
                      </p>
                    </div>
                  </div>
                </div>
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
          <div className="max-w-4xl mx-auto">
            <AssociationSection
              itemTypeCode={selectedItemType?.code || ''}
              associations={formData.associations || {}}
              onAssociationsChange={handleAssociationsChange}
              associationRules={associationRules}
              errors={associationErrors}
              displayConfigs={displayConfigs}
            />
          </div>
        );

      case 5:
        // Group attributes by source for better organization
        const itemTypeGroups = attributeGroups.filter(group => group.source === 'itemType');
        const categoryGroups = attributeGroups.filter(group => group.source === 'category');
        const familyGroups = attributeGroups.filter(group => group.source === 'family');
        
        return (
          <div className="max-w-full space-y-8">
            {/* Modern Header */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-6 border border-primary-200 dark:border-primary-800">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Öznitelikler</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Seçili Aile: <strong className="text-primary-700 dark:text-primary-300">{selectedFamily ? getEntityName(selectedFamily, currentLanguage) : ''}</strong>
                </p>
                <div className="flex items-center justify-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">Öğe Tipi: {itemTypeGroups.length} grup</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">Kategori: {categoryGroups.length} grup</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">Aile: {familyGroups.length} grup</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* ItemType Attribute Groups */}
            {itemTypeGroups.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 py-3 px-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      Öğe Tipi Öznitelikleri
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {selectedItemType ? getEntityName(selectedItemType, currentLanguage) : 'Öğe Tipi'} • {itemTypeGroups.length} grup
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {itemTypeGroups.map(group => (
                    <AttributeGroupSection
                      key={group._id}
                      attributeGroup={group}
                      attributes={group.attributes}
                      values={formData.attributes || {}}
                      errors={attributeErrors}
                      onChange={handleAttributeChange}
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Category Attribute Groups */}
            {categoryGroups.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 py-3 px-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-lg shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      Kategori Öznitelikleri
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {selectedCategory ? getEntityName(selectedCategory, currentLanguage) : 'Kategori'} • {categoryGroups.length} grup
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {categoryGroups.map(group => (
                    <AttributeGroupSection
                      key={group._id}
                      attributeGroup={group}
                      attributes={group.attributes}
                      values={formData.attributes || {}}
                      errors={attributeErrors}
                      onChange={handleAttributeChange}
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Family Attribute Groups */}
            {familyGroups.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 py-3 px-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-500 rounded-lg shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      Aile Öznitelikleri
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      {selectedFamily ? getEntityName(selectedFamily, currentLanguage) : 'Aile'} • {familyGroups.length} grup
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {familyGroups.map(group => (
                    <AttributeGroupSection
                      key={group._id}
                      attributeGroup={group}
                      attributes={group.attributes}
                      values={formData.attributes || {}}
                      errors={attributeErrors}
                      onChange={handleAttributeChange}
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* No Attributes Message */}
            {attributeGroups.length === 0 && (
              <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div className="flex items-center justify-center w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Henüz öznitelik bulunamadı</h3>
                <p className="text-gray-500 dark:text-gray-400">Seçili hiyerarşi için tanımlanmış öznitelik bulunmuyor.</p>
              </div>
            )}
            
            {/* Validation Summary */}
            {Object.keys(attributeErrors).length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg p-6 shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-full">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
                      Doğrulama Hataları ({Object.keys(attributeErrors).length})
                    </h4>
                    <p className="text-red-700 dark:text-red-300">
                      Lütfen tüm zorunlu alanları doldurun ve hataları düzeltin.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 6:
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
                { label: 'Öğeler', path: '/items/list' },
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
                onClick={() => navigate('/items/list')}
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
                    onClick={() => navigate('/items/list')}
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
