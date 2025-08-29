import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Breadcrumb from '../../../components/common/Breadcrumb';
import EntityHistoryList from '../../../components/common/EntityHistoryList';
import AttributeGroupsTab from '../../../components/common/AttributeGroupsTab';
import AttributesTab from '../../../components/common/AttributesTab';
import { UnifiedTreeView } from '../../../components/ui';
import { useNotification } from '../../../components/notifications';
import familyService from '../../../services/api/familyService';
import attributeService from '../../../services/api/attributeService';
import attributeGroupService from '../../../services/api/attributeGroupService';
import categoryService from '../../../services/api/categoryService';
import type { Family, CreateFamilyDto } from '../../../types/family';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { useTranslation } from '../../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../../utils/translationUtils';
import { toast } from 'react-hot-toast';

// UTILITY COMPONENTS
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

// MAIN COMPONENT
const FamilyDetailsPage: React.FC = () => {
  // HOOKS
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  
  // STATE VARIABLES
  const [family, setFamily] = useState<Family | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  
  // Edit state'leri
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [initialFormState, setInitialFormState] = useState<any>(null);
  const [initialAttributeGroups, setInitialAttributeGroups] = useState<string[]>([]);
  const [initialAttributes, setInitialAttributes] = useState<string[]>([]);
  
  // Edit form data
  const [editableFields, setEditableFields] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true,
    parent: undefined as string | undefined,
    category: undefined as string | undefined
  });

  // Attributes and AttributeGroups state
  const [attributes, setAttributes] = useState<{
    _id: string, 
    name: any, 
    type: any,
    code?: string,
    description?: any,
    isActive?: boolean,
    isRequired?: boolean
  }[]>([]);
  const [attributeGroups, setAttributeGroups] = useState<{
    _id: string, 
    name: any, 
    code: string, 
    description?: any, 
    attributes?: any[]
  }[]>([]);
  
  // Hierarchy state
  const [familyTree, setFamilyTree] = useState<any[]>([]);
  const [categoryTree, setCategoryTree] = useState<any[]>([]);
  const [isLoadingHierarchy, setIsLoadingHierarchy] = useState(false);
  
  // Notification hook
  const { showToast, showCommentModal } = useNotification();
  
  // HELPER FUNCTIONS
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return dayjs(dateString).locale('tr').format('DD MMMM YYYY HH:mm:ss');
  };

  // Hierarchy functions
  const fetchFamilyTree = useCallback(async () => {
    setIsLoadingHierarchy(true);
    try {
      const response = await familyService.getFamilies({
        limit: 1000
      });
      const families = response.families || response;
      
      const buildFamilyTree = (parentId: string | null = null): any[] => {
        return families
          .filter((fam: any) => {
            if (parentId === null) {
              return !fam.parent || (typeof fam.parent === 'string' ? !fam.parent : !fam.parent._id);
            }
            return typeof fam.parent === 'string' ? fam.parent === parentId : fam.parent?._id === parentId;
          })
          .map((fam: any) => ({
            id: fam._id,
            name: getEntityName(fam, currentLanguage),
            type: 'family',
            level: 0,
            hasChildren: families.some((child: any) => 
              typeof child.parent === 'string' ? child.parent === fam._id : child.parent?._id === fam._id
            ),
            children: buildFamilyTree(fam._id)
          }));
      };
      
      const tree = buildFamilyTree();
      setFamilyTree(tree);
    } catch (error) {
      console.error('Family tree fetch error:', error);
    } finally {
      setIsLoadingHierarchy(false);
    }
  }, [currentLanguage]);

  const fetchCategoryTree = useCallback(async () => {
    setIsLoadingHierarchy(true);
    try {
      const response = await categoryService.getCategories();
      const categories = response.categories || response;
      
      const buildCategoryTree = (parentId: string | null = null): any[] => {
        return categories
          .filter((cat: any) => {
            if (parentId === null) {
              return !cat.parent || (typeof cat.parent === 'string' ? !cat.parent : !cat.parent._id);
            }
            return typeof cat.parent === 'string' ? cat.parent === parentId : cat.parent?._id === parentId;
          })
          .map((cat: any) => ({
            id: cat._id,
            name: getEntityName(cat, currentLanguage),
            type: 'category',
            level: 0,
            hasChildren: categories.some((child: any) => 
              typeof child.parent === 'string' ? child.parent === cat._id : child.parent?._id === cat._id
            ),
            children: buildCategoryTree(cat._id)
          }));
      };
      
      const tree = buildCategoryTree();
      setCategoryTree(tree);
    } catch (error) {
      console.error('Category tree fetch error:', error);
    } finally {
      setIsLoadingHierarchy(false);
    }
  }, [currentLanguage]);

  const getStatusIcon = (isActive?: boolean) => {
    if (isActive) {
      return (
        <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else {
      return (
        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
  };
  
  // EFFECTS
  useEffect(() => {
    let isMounted = true;
    
    const fetchFamilyDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await familyService.getFamilyById(id, {
          includeAttributes: true,
          includeAttributeGroups: true
        });
        if (isMounted) {
          setFamily(data);
          
          // Initialize editable fields
          setEditableFields({
            name: getEntityName(data, currentLanguage),
            code: data.code || '',
            description: getEntityDescription(data, currentLanguage),
            isActive: data.isActive,
            parent: data.parent ? (typeof data.parent === 'string' ? data.parent : (data.parent as any)?._id) : undefined,
            category: data.category ? (typeof data.category === 'string' ? data.category : (data.category as any)?._id) : undefined
          });
        
        // İlişkili öznitelikleri getir
          if (data.attributes && data.attributes.length > 0) {
          try {
            const fetchedAttributes = [];
              for (const attributeId of data.attributes) {
              const attributeData = await attributeService.getAttributeById(attributeId._id || attributeId);
              fetchedAttributes.push({ 
                  _id: attributeId._id || attributeId, 
                name: attributeData.name,
                type: attributeData.type,
                code: attributeData.code,
                description: attributeData.description,
                isActive: attributeData.isActive,
                isRequired: attributeData.isRequired
              });
            }
            setAttributes(fetchedAttributes);
          } catch (err) {
            console.error('Öznitelikler yüklenirken hata oluştu:', err);
          }
        }
        
        // İlişkili öznitelik gruplarını getir
          if (data.attributeGroups && data.attributeGroups.length > 0) {
          try {
            const fetchedGroups = [];
              for (const groupData of data.attributeGroups) {
              // API'den gelen grup verisi direkt olarak kullanılıyor
              fetchedGroups.push({ 
                  _id: groupData._id || groupData.id, 
                  name: groupData.name,
                  code: groupData.code,
                  description: groupData.description,
                  attributes: groupData.attributes || []
              });
            }
            setAttributeGroups(fetchedGroups);
          } catch (err) {
            console.error('Öznitelik grupları yüklenirken hata oluştu:', err);
          }
        }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Aile bulunamadı');
        }
      } finally {
        if (isMounted) {
        setIsLoading(false);
        }
      }
    };
    
    fetchFamilyDetails();
    
    // Fetch hierarchy data
    fetchFamilyTree();
    fetchCategoryTree();
    
    return () => {
      isMounted = false;
    };
  }, [id, t, currentLanguage, fetchFamilyTree, fetchCategoryTree]);
  
  // LOADING STATE
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-light border-t-transparent dark:border-primary-dark dark:border-t-transparent"></div>
      </div>
    );
  }
  
  // ERROR STATE
  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-2">
          <svg className="w-6 h-6 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold">Hata</h3>
        </div>
        <p className="mb-3">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/families/list')}
          className="mt-2"
        >
          Listeye Dön
        </Button>
      </div>
    );
  }
  
  // NOT FOUND STATE
  if (!family) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 px-6 py-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-2">
          <svg className="w-6 h-6 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold">Bulunamadı</h3>
        </div>
        <p className="mb-3">Aile bulunamadı</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/families/list')}
          className="mt-2"
        >
          Listeye Dön
        </Button>
      </div>
    );
  }

  // Form input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setEditableFields(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setEditableFields(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear errors
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!editableFields.name.trim()) {
      errors.name = 'Aile adı zorunludur';
    }
    
    if (!editableFields.code.trim()) {
      errors.code = 'Aile kodu zorunludur';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Değişiklik kontrolü
  const hasChanges = () => {
    if (!initialFormState || !editableFields) return false;
    
    const currentState = {
      name: editableFields.name,
      code: editableFields.code,
      description: editableFields.description,
      isActive: editableFields.isActive,
      parent: editableFields.parent,
      category: editableFields.category
    };

    const initialState = {
      name: initialFormState.name,
      code: initialFormState.code,
      description: initialFormState.description,
      isActive: initialFormState.isActive,
      parent: initialFormState.parent,
      category: initialFormState.category
    };

    // Form alanları değişikliği kontrolü
    const formChanged = JSON.stringify(currentState) !== JSON.stringify(initialState);
    
    // AttributeGroups değişikliği kontrolü
    const currentGroupIds = attributeGroups.map(g => g._id).sort();
    const initialGroupIds = initialAttributeGroups.sort();
    const groupsChanged = JSON.stringify(currentGroupIds) !== JSON.stringify(initialGroupIds);

    // Attributes değişikliği kontrolü
    const currentAttributeIds = attributes.map(a => a._id).sort();
    const initialAttributeIds = initialAttributes.sort();
    const attributesChanged = JSON.stringify(currentAttributeIds) !== JSON.stringify(initialAttributeIds);

    return formChanged || groupsChanged || attributesChanged;
  };

  // Değişiklik detaylarını al
  const getChangeDetails = () => {
    if (!initialFormState) return [];
    
    const changes: string[] = [];
    
    // İsim değişikliği
    if (editableFields.name !== initialFormState.name) {
      changes.push(`İsim: ${initialFormState.name} → ${editableFields.name}`);
    }
    
    // Kod değişikliği
    if (editableFields.code !== initialFormState.code) {
      changes.push(`Kod: ${initialFormState.code} → ${editableFields.code}`);
    }
    
    // Açıklama değişikliği
    if (editableFields.description !== initialFormState.description) {
      changes.push(`Açıklama: ${initialFormState.description || 'Boş'} → ${editableFields.description || 'Boş'}`);
    }
    
    // Aktif durum değişikliği
    if (editableFields.isActive !== initialFormState.isActive) {
      changes.push(`Aktif: ${initialFormState.isActive ? 'Evet' : 'Hayır'} → ${editableFields.isActive ? 'Evet' : 'Hayır'}`);
    }
    
    // Parent değişikliği
    if (editableFields.parent !== initialFormState.parent) {
      const oldParent = initialFormState.parent || 'Yok';
      const newParent = editableFields.parent || 'Yok';
      changes.push(`Üst Aile: ${oldParent} → ${newParent}`);
    }
    
    // Category değişikliği
    if (editableFields.category !== initialFormState.category) {
      const oldCategory = initialFormState.category || 'Yok';
      const newCategory = editableFields.category || 'Yok';
      changes.push(`Kategori: ${oldCategory} → ${newCategory}`);
    }

    // AttributeGroups değişikliği
    const currentGroupIds = attributeGroups.map(g => g._id).sort();
    const initialGroupIds = initialAttributeGroups.sort();
    if (JSON.stringify(currentGroupIds) !== JSON.stringify(initialGroupIds)) {
      const addedGroups = currentGroupIds.filter(id => !initialGroupIds.includes(id));
      const removedGroups = initialGroupIds.filter(id => !currentGroupIds.includes(id));
      
      if (addedGroups.length > 0) {
        const addedNames = addedGroups.map(id => {
          const group = attributeGroups.find(g => g._id === id);
          return group ? getEntityName(group, currentLanguage) : id;
        });
        changes.push(`Eklenen öznitelik grupları: ${addedNames.join(', ')}`);
      }
      
      if (removedGroups.length > 0) {
        const removedNames = removedGroups.map(id => {
          const group = attributeGroups.find(g => g._id === id);
          return group ? getEntityName(group, currentLanguage) : id;
        });
        changes.push(`Kaldırılan öznitelik grupları: ${removedNames.join(', ')}`);
      }
    }

    // Attributes değişikliği
    const currentAttributeIds = attributes.map(a => a._id).sort();
    const initialAttributeIds = initialAttributes.sort();
    if (JSON.stringify(currentAttributeIds) !== JSON.stringify(initialAttributeIds)) {
      const addedAttributes = currentAttributeIds.filter(id => !initialAttributeIds.includes(id));
      const removedAttributes = initialAttributeIds.filter(id => !currentAttributeIds.includes(id));
      
      if (addedAttributes.length > 0) {
        const addedNames = addedAttributes.map(id => {
          const attribute = attributes.find(a => a._id === id);
          return attribute ? getEntityName(attribute, currentLanguage) : id;
        });
        changes.push(`Eklenen öznitelikler: ${addedNames.join(', ')}`);
      }
      
      if (removedAttributes.length > 0) {
        const removedNames = removedAttributes.map(id => {
          const attribute = attributes.find(a => a._id === id);
          return attribute ? getEntityName(attribute, currentLanguage) : id;
        });
        changes.push(`Kaldırılan öznitelikler: ${removedNames.join(', ')}`);
      }
    }

    return changes;
  };
  
  // Save changes
  const handleSave = async () => {
    if (!id || !validateForm()) return;
    if (!hasChanges()) return; // Değişiklik yoksa kaydetme

    setIsSaving(true);

    const changes = getChangeDetails();

    // Comment modal göster
    showCommentModal({
      title: 'Değişiklik Yorumu',
      changes: changes,
      onSave: async (comment: string) => {
        try {
          // Sadece değişen alanları gönder
          const updateData: any = {};
          
          if (editableFields.name !== initialFormState.name) {
            updateData.name = editableFields.name.trim();
          }
          if (editableFields.code !== initialFormState.code) {
            updateData.code = editableFields.code.trim();
          }
          if (editableFields.description !== initialFormState.description) {
            updateData.description = editableFields.description.trim();
          }
          if (editableFields.isActive !== initialFormState.isActive) {
            updateData.isActive = editableFields.isActive;
          }
          if (editableFields.parent !== initialFormState.parent) {
            updateData.parent = editableFields.parent || undefined;
          }
          if (editableFields.category !== initialFormState.category) {
            updateData.category = editableFields.category || undefined;
          }
          
          // AttributeGroups değişikliği varsa ekle
          const currentGroupIds = attributeGroups.map(g => g._id);
          const initialGroupIds = initialAttributeGroups;
          if (JSON.stringify(currentGroupIds.sort()) !== JSON.stringify(initialGroupIds.sort())) {
            updateData.attributeGroups = currentGroupIds;
          }
          
          // Attributes değişikliği varsa ekle
          const currentAttributeIds = attributes.map(a => a._id);
          const initialAttributeIds = initialAttributes;
          if (JSON.stringify(currentAttributeIds.sort()) !== JSON.stringify(initialAttributeIds.sort())) {
            updateData.attributes = currentAttributeIds;
          }
          
          // Comment ekle
          updateData.comment = comment;
          
          const updatedFamily = await familyService.updateFamily(id, updateData);
          setFamily(updatedFamily);
          
          // Initial state'leri güncelle
          setInitialFormState({
            name: editableFields.name,
            code: editableFields.code,
            description: editableFields.description,
            isActive: editableFields.isActive
          });
          setInitialAttributeGroups(currentGroupIds);
          setInitialAttributes(currentAttributeIds);
          
          setIsEditing(false);
          
          showToast({
            type: 'success',
            title: 'Başarılı',
            message: 'Aile başarıyla güncellendi',
            duration: 3000
          });
        } catch (err: any) {
          setError(err.message || 'Aile güncellenirken bir hata oluştu');
          showToast({
            type: 'error',
            title: 'Hata',
            message: err.message || 'Aile güncellenirken bir hata oluştu',
            duration: 5000
          });
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    if (!family) return;
    
    setEditableFields({
      name: getEntityName(family, currentLanguage),
      code: family.code || '',
      description: getEntityDescription(family, currentLanguage),
      isActive: family.isActive,
      parent: family.parent ? (typeof family.parent === 'string' ? family.parent : (family.parent as any)?._id) : undefined,
      category: family.category ? (typeof family.category === 'string' ? family.category : (family.category as any)?._id) : undefined
    });
    
    setFormErrors({});
    setIsEditing(false);
  };

  // Start editing
  const handleStartEdit = () => {
    if (!family) return;
    
    const initialFields = {
      name: getEntityName(family, currentLanguage),
      code: family.code || '',
      description: getEntityDescription(family, currentLanguage),
      isActive: family.isActive,
      parent: family.parent ? (typeof family.parent === 'string' ? family.parent : (family.parent as any)?._id) : undefined,
      category: family.category ? (typeof family.category === 'string' ? family.category : (family.category as any)?._id) : undefined
    };
    
    setEditableFields(initialFields);
    setInitialFormState(initialFields);
    setInitialAttributeGroups(attributeGroups.map(g => g._id));
    setInitialAttributes(attributes.map(a => a._id));
    setIsEditing(true);
  };

  // Delete family
  const handleDelete = async () => {
    if (!id || !family) return;
    
    if (window.confirm(`"${getEntityName(family, currentLanguage)}" ailesini silmek istediğinize emin misiniz?`)) {
      try {
        await familyService.deleteFamily(id);
        navigate('/families/list');
        toast.success('Aile başarıyla silindi');
      } catch (err: any) {
        setError(err.message || 'Aile silinirken bir hata oluştu');
        toast.error('Aile silinirken bir hata oluştu');
      }
    }
  };

  // Handle attribute group operations
  const handleAddAttributeGroup = async (groupId: string) => {
    try {
      // Grup zaten ekli mi kontrol et
      if (attributeGroups.some(g => g._id === groupId)) {
        showToast({
          type: 'warning',
          title: 'Uyarı',
          message: 'Bu öznitelik grubu zaten eklenmiş',
          duration: 3000
        });
        return;
      }
      
      // AttributeGroup'u API'den getir
      const groupData = await attributeGroupService.getAttributeGroupById(groupId);
      
      // State'e ekle - sadece grup bilgilerini ekle, attributes'leri ana listeye ekleme
      const newGroup = {
        _id: groupData._id,
        name: groupData.name,
        code: groupData.code,
        description: groupData.description,
        attributes: groupData.attributes || [] // Grup içindeki attributes bilgisi (referans amaçlı)
      };
      
      setAttributeGroups(prev => [...prev, newGroup]);
      
      showToast({
        type: 'success',
        title: 'Başarılı',
        message: 'Öznitelik grubu başarıyla eklendi',
        duration: 3000
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Hata',
        message: error.message || 'Öznitelik grubu eklenirken bir hata oluştu',
        duration: 5000
      });
    }
  };

  const handleRemoveAttributeGroup = (groupId: string) => {
    setAttributeGroups(prev => prev.filter(group => group._id !== groupId));
  };

  // Handle attribute operations
  const handleAddAttribute = async (attributeId: string) => {
    try {
      // Attribute zaten ekli mi kontrol et
      if (attributes.some(a => a._id === attributeId)) {
        showToast({
          type: 'warning',
          title: 'Uyarı',
          message: 'Bu öznitelik zaten eklenmiş',
          duration: 3000
        });
        return;
      }
      
      // Attribute'u API'den getir
      const attributeData = await attributeService.getAttributeById(attributeId);
      
      // State'e ekle
      const newAttribute = {
        _id: attributeData._id,
        name: attributeData.name,
        type: attributeData.type,
        code: attributeData.code,
        description: attributeData.description,
        isActive: attributeData.isActive,
        isRequired: attributeData.isRequired
      };
      
      setAttributes(prev => [...prev, newAttribute]);
      
      showToast({
        type: 'success',
        title: 'Başarılı',
        message: 'Öznitelik başarıyla eklendi',
        duration: 3000
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Hata',
        message: error.message || 'Öznitelik eklenirken bir hata oluştu',
        duration: 5000
      });
    }
  };

  const handleRemoveAttribute = (attributeId: string) => {
    setAttributes(prev => prev.filter(attribute => attribute._id !== attributeId));
  };

    // Render hierarchy tab
  const renderHierarchy = () => (
    <div className="space-y-6" key="hierarchy-content">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
        Hiyerarşik İlişkiler
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Family Hierarchy */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Aile Hiyerarşisi {isEditing && "(Üst aile seçin)"}
          </h4>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            {familyTree.length > 0 ? (
              <div>
                {isEditing ? (
                  <UnifiedTreeView 
                    data={familyTree.filter(f => f.id !== id)} // Kendisini çıkar
                    defaultSelectedIds={family.parent ? [typeof family.parent === 'string' ? family.parent : (family.parent as any)?._id || ''] : []}
                    expandAll={true}
                    maxHeight="300px"
                    showRelationLines={true}
                    variant="spectrum"
                    mode="select"
                    selectionMode="single"
                    onSelectionChange={(selectedIds) => {
                      const newParentId = selectedIds[0] || undefined;
                      setEditableFields(prev => ({ ...prev, parent: newParentId }));
                    }}
                    className="shadow-sm"
                    key={`family-tree-edit-${id}`}
                  />
                ) : (
                  <UnifiedTreeView 
                    data={familyTree} 
                    activeNodeId={id}
                    expandAll={true}
                    maxHeight="300px"
                    showRelationLines={true}
                    variant="spectrum"
                    className="shadow-sm"
                    key={`family-tree-view-${id}`}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">Aile hiyerarşisi yüklenemedi.</p>
                <button 
                  onClick={() => fetchFamilyTree()} 
                  className="mt-3 px-3 py-1.5 bg-primary-light text-white rounded-md hover:bg-primary-light/90 dark:bg-primary-dark dark:hover:bg-primary-dark/90 transition-colors text-sm"
                >
                  Tekrar Dene
                </button>
              </div>
            )}
          </div>
          
          {/* Seçili Üst Aile Bilgisi */}
          {family.parent && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">Üst Aile Bilgisi</h4>
                  <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                    Bu aile, <strong>{typeof family.parent === 'string' ? family.parent : getEntityName(family.parent, currentLanguage)}</strong> ailesinin alt ailesidir.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Aile Yok Bilgisi */}
          {!family.parent && (
            <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Hiyerarşi Bilgisi</h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Bu aile ana seviyede yer alır, herhangi bir üst aileye bağlı değildir.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Category Selection */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Kategori Seçimi {isEditing && "(Bu ailenin kategorisini seçin)"}
          </h4>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            {categoryTree.length > 0 ? (
              <div>
                {isEditing ? (
                  <UnifiedTreeView 
                    data={categoryTree}
                    defaultSelectedIds={family.category ? [typeof family.category === 'string' ? family.category : (family.category as any)?._id || ''] : []}
                    expandAll={true}
                    maxHeight="300px"
                    showRelationLines={true}
                    variant="spectrum"
                    mode="select"
                    selectionMode="single"
                    onSelectionChange={(selectedIds) => {
                      const newCategoryId = selectedIds[0] || undefined;
                      console.log("Seçilen kategori ID:", newCategoryId);
                      setEditableFields(prev => ({ ...prev, category: newCategoryId }));
                    }}
                    className="shadow-sm"
                    key={`category-tree-edit-${id}`}
                  />
                ) : (
                  <UnifiedTreeView 
                    data={categoryTree} 
                    activeNodeId={family.category ? (typeof family.category === 'string' ? family.category : (family.category as any)?._id) : undefined}
                    expandAll={true}
                    maxHeight="300px"
                    showRelationLines={true}
                    variant="spectrum"
                    onNodeClick={(node) => {
                      navigate(`/categories/details/${node.id}`);
                    }}
                    className="shadow-sm"
                    key={`category-tree-view-${id}`}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">Kategori hiyerarşisi yüklenemedi.</p>
                <button 
                  onClick={() => fetchCategoryTree()} 
                  className="mt-3 px-3 py-1.5 bg-primary-light text-white rounded-md hover:bg-primary-light/90 dark:bg-primary-dark dark:hover:bg-primary-dark/90 transition-colors text-sm"
                >
                  Tekrar Dene
                </button>
              </div>
            )}
          </div>
          
          {/* Seçili Kategori Bilgisi */}
          {family.category && (
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-800">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 text-green-500 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-green-700 dark:text-green-300">Seçili Kategori</h4>
                  <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                    Bu aile, <strong>{typeof family.category === 'string' ? family.category : getEntityName(family.category, currentLanguage)}</strong> kategorisine bağlıdır.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Kategori Yok Bilgisi */}
          {!family.category && (
            <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Kategori Bilgisi</h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Bu aile herhangi bir kategoriye bağlı değildir.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  // MAIN RENDER
  return (
    <div className="space-y-6">
      {/* BREADCRUMB */}
      <div className="flex items-center justify-between">
        <Breadcrumb 
          items={[
            { label: 'Aileler', path: '/families/list' },
            { label: getEntityName(family, currentLanguage) }
          ]} 
        />
        </div>
        
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Link to="/families/list" className="mr-4">
            <Button variant="outline" size="sm" className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Geri
            </Button>
          </Link>
          <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/50 
                         flex items-center justify-center mr-3">
            <svg className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
        </div>
        <div>
            {isEditing ? (
        <div>
                <input
                  type="text"
                  name="name"
                  value={editableFields.name}
                  onChange={handleInputChange}
                  className={`text-2xl font-bold bg-transparent border-b-2 ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } text-gray-900 dark:text-white focus:outline-none focus:border-primary-500`}
                  placeholder="Aile adı"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.name}</p>
                )}
        </div>
            ) : (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{getEntityName(family, currentLanguage)}</h1>
            )}
            <div className="flex items-center mt-1">
              {isEditing ? (
                <input
                  type="text"
                  name="code"
                  value={editableFields.code}
                  onChange={handleInputChange}
                  className={`text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded ${
                    formErrors.code ? 'border border-red-500' : ''
                  } text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  placeholder="Aile kodu"
                />
              ) : (
                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                  {family.code}
              </span>
            )}
              {formErrors.code && (
                <p className="ml-2 text-sm text-red-500 dark:text-red-400">{formErrors.code}</p>
              )}
              <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
              <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                (isEditing ? editableFields.isActive : family.isActive)
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              }`}>
                {isEditing ? (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={editableFields.isActive}
                      onChange={handleInputChange}
                      className="h-3 w-3 text-primary-light focus:ring-primary-light border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-1 text-xs">
                      {editableFields.isActive ? 'Aktif' : 'Pasif'}
                    </label>
          </div>
                ) : (
                  family.isActive ? 'Aktif' : 'Pasif'
                )}
        </div>
        </div>
        </div>
        </div>
        
        <div className="flex items-center space-x-2">
                {isEditing ? (
            <>
              <Button
                variant="primary"
                className="flex items-center"
                onClick={handleSave}
                loading={isSaving}
                disabled={isSaving || !hasChanges()}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Kaydet</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>İptal</span>
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={() => setShowJsonPreview(!showJsonPreview)}
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                JSON Görünümü
              </Button>
              <Button
                variant="primary"
                className="flex items-center"
                onClick={handleStartEdit}
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Düzenle
              </Button>
              <Button
                variant="secondary"
                className="flex items-center text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
                onClick={handleDelete}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Sil
              </Button>
            </>
                )}
              </div>
        </div>
        
      {/* REST OF THE COMPONENT */}
      
      {/* TABS NAVIGATION */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('details')}
          >
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              Detaylar
        </div>
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'hierarchy'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('hierarchy')}
          >
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Hiyerarşi
            </div>
          </button>
                <button 
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'documentation'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('documentation')}
          >
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
                 Dökümantasyon
        
      </div></button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'relationships'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('relationships')}
          >
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              İlişkiler
    </div>
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'attributeGroups'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('attributeGroups')}
          >
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              Öznitelik Grupları
            </div>
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'attributes'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('attributes')}
          >
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Öznitelikler
            </div>
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('permissions')}
          >
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              İzinler
            </div>
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('history')}
          >
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              Geçmiş
              </div>
          </button>
        </nav>
              </div>

      {/* JSON PREVIEW */}
      {showJsonPreview && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">JSON Görünümü</h2>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center"
              onClick={() => navigator.clipboard.writeText(JSON.stringify(family, null, 2))}
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Kopyala
            </Button>
          </CardHeader>
          <CardBody>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{JSON.stringify(family, null, 2)}</code>
            </pre>
          </CardBody>
        </Card>
      )}

      {/* TAB CONTENT - DETAILS */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Genel Bakış</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
              <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Açıklama</h3>
                {isEditing ? (
                      <div className="mt-2">
                        <textarea
                          name="description"
                          value={editableFields.description}
                          onChange={handleInputChange}
                          rows={4}
                          className={`w-full px-3 py-2 border ${
                            formErrors.description ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                          } rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark`}
                          placeholder="Aile açıklaması"
                        />
                        {formErrors.description && (
                          <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.description}</p>
                )}
              </div>
            ) : (
                      <p className="mt-2 text-gray-900 dark:text-gray-100">
                        {getEntityDescription(family, currentLanguage) || 'Açıklama bulunmamaktadır.'}
                      </p>
            )}
          </div>
          
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Durum</h3>
                      <div className="mt-2 flex items-center">
                        {getStatusIcon(family.isActive)}
                        <span className="ml-2 text-gray-900 dark:text-gray-100">
                          {family.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                </div>
              </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Aile Türü</h3>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Ürün Ailesi
                        </span>
            </div>
        </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Oluşturulma Tarihi</h3>
                      <p className="mt-2 text-gray-900 dark:text-gray-100">{formatDate(family.createdAt)}</p>
      </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Son Güncelleme</h3>
                      <p className="mt-2 text-gray-900 dark:text-gray-100">{formatDate(family.updatedAt)}</p>
    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Özellikler</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <svg className="h-4 w-4 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          Öznitelik Grubu
                        </span>
                  </div>
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <svg className="h-4 w-4 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          Öznitelik Koleksiyonu
                        </span>
                </div>
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <svg className="h-4 w-4 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          Kategori Bağlantısı
                        </span>
                </div>
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <svg className="h-4 w-4 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          Hiyerarşik Yapı
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-500">
              <div className="flex items-start">
                  <svg className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-400">
                      Önemli Not
                    </h3>
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                      Bu ailenin silinmesi veya değiştirilmesi, bağlı tüm ürünleri ve alt aileleri etkileyecektir. Değişiklik yapmadan önce bağımlılıkları kontrol edin.
                </p>
              </div>
              </div>
              </CardBody>
            </Card>
        </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Kullanım İstatistikleri</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
              <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kullanılan Varlıklarda</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        1,245
                      </span>
              </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full" 
                        style={{ width: '65%' }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Referans Türleri</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Ürünler</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">856</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Alt Aileler</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">12</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Kategoriler</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">45</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">API Çağrıları</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">18.5k</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">API Referansı</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Aile ID</h3>
                    <div className="mt-2 flex items-center space-x-2">
                      <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                        {family._id}
                      </code>
                <button 
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                        onClick={() => navigator.clipboard.writeText(family._id)}
                >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                </button>
              </div>
          </div>
          
                <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">API Endpoint'leri</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          GET
                        </span>
                        <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                          /api/families/{family._id}
                        </code>
                </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          PUT
                        </span>
                        <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                          /api/families/{family._id}
                        </code>
              </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          DELETE
                        </span>
                        <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                          /api/families/{family._id}
                        </code>
            </div>
        </div>
      </div>
                  
                  <div className="pt-2">
          <Button
            variant="outline"
                      size="sm"
                      className="flex items-center"
          >
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
                      API Dokümantasyonunu Görüntüle
          </Button>
    </div>
    </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT - DOCUMENTATION */}
      {activeTab === 'documentation' && (
        <Card>
          <CardBody>
            <div className="prose dark:prose-invert max-w-none">
              <h2>Dokümantasyon</h2>
              <p>
                Bu aile "{getEntityName(family, currentLanguage)}" ile ilgili kapsamlı dokümantasyon ve kullanım kılavuzu.
              </p>
              
              <h3>Kullanım Kılavuzu</h3>
              <ul>
                <li>Bu aile ürün kategorilerinin organize edilmesi için kullanılır</li>
                <li>Alt aileler oluşturarak hiyerarşik yapı kurabilirsiniz</li>
                <li>Öznitelik grupları ile ürün özelliklerini tanımlayabilirsiniz</li>
                <li>API üzerinden programatik erişim sağlanabilir</li>
              </ul>
              
              <h3>Entegrasyon Notları</h3>
              <p>
                Bu ailenin sistemdeki diğer bileşenlerle entegrasyonu için önemli bilgiler:
              </p>
              <ul>
                <li>Ürün kategorileri bu aile üzerinden organize edilir</li>
                <li>Öznitelik grupları aile seviyesinde tanımlanır</li>
                <li>Alt aileler otomatik olarak üst ailenin özelliklerini devralır</li>
                <li>API endpoint'leri RESTful standartlarına uygun şekilde tasarlanmıştır</li>
              </ul>

              <div className="not-prose mt-6">
        <Button
          variant="outline"
                  className="flex items-center"
        >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
                  Tam Dokümantasyonu Görüntüle
        </Button>
      </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* TAB CONTENT - HIERARCHY */}
      {activeTab === 'hierarchy' && (
        <Card>
          <CardBody>
            {renderHierarchy()}
          </CardBody>
        </Card>
      )}

      {/* TAB CONTENT - RELATIONSHIPS */}
      {activeTab === 'relationships' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Varlık İlişkileri</h2>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Varlık Türü
                </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        İlişki
                </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Sayı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 
                                        flex items-center justify-center mr-3">
                            <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Ürünler
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Ana ürün varlıkları
                            </div>
                          </div>
                        </div>
                  </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                          Aile İlişkisi
                        </span>
                  </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">856</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">ürün</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button variant="outline" size="sm">Görüntüle</Button>
                  </td>
                </tr>
                    
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 
                                        flex items-center justify-center mr-3">
                            <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Alt Aileler
    </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Çocuk aile kategorileri
        </div>
      </div>
        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Hiyerarşik İlişki
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">12</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">alt aile</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button variant="outline" size="sm">Görüntüle</Button>
                      </td>
                    </tr>

                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/50 
                                        flex items-center justify-center mr-3">
                            <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Öznitelik Grupları
      </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              İlişkili öznitelik koleksiyonları
      </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Öznitelik İlişkisi
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">45</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">grup</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button variant="outline" size="sm">Görüntüle</Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB CONTENT - ATTRIBUTE GROUPS */}
      {activeTab === 'attributeGroups' && (
        <AttributeGroupsTab
          attributeGroups={attributeGroups}
          isEditing={isEditing}
          onAdd={handleAddAttributeGroup}
          onRemove={handleRemoveAttributeGroup}
          title="Öznitelik Grupları"
          emptyMessage="Bu aileye atanmış öznitelik grubu bulunmamaktadır."
          showAddButton={true}
        />
      )}

      {/* TAB CONTENT - ATTRIBUTES */}
      {activeTab === 'attributes' && (
        <AttributesTab
          attributes={attributes}
          isEditing={isEditing}
          onAdd={handleAddAttribute}
          onRemove={handleRemoveAttribute}
          title="Öznitelikler"
          emptyMessage="Bu aileye atanmış öznitelik bulunmamaktadır."
          showAddButton={true}
        />
      )}

      {/* TAB CONTENT - PERMISSIONS */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Erişim İzinleri</h2>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Okuma
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Yazma
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Silme
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/50 
                                        flex items-center justify-center mr-3">
                            <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
        </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Yönetici
      </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Tam yetki
        </div>
      </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          İzinli
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          İzinli
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          İzinli
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button variant="outline" size="sm">Düzenle</Button>
                      </td>
                    </tr>
                    
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 
                                        flex items-center justify-center mr-3">
                            <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Editör
          </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Düzenleme yetkisi
          </div>
        </div>
      </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          İzinli
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          İzinli
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          İzinsiz
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button variant="outline" size="sm">Düzenle</Button>
                      </td>
                    </tr>

                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-700 
                                        flex items-center justify-center mr-3">
                            <svg className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
      </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Görüntüleyici
        </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Sadece okuma
    </div>
                          </div>
                              </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          İzinli
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          İzinsiz
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          İzinsiz
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button variant="outline" size="sm">Düzenle</Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                            </div>
            </CardBody>
          </Card>
                          </div>
      )}

      {/* TAB CONTENT - HISTORY */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Değişiklik Geçmişi</h2>
          </CardHeader>
          <CardBody>
            <EntityHistoryList entityId={id!} entityType="family" title="Aile Geçmişi" />
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default FamilyDetailsPage; 