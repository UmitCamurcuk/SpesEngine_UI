import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Breadcrumb from '../../../components/common/Breadcrumb';
import EntityHistoryList from '../../../components/common/EntityHistoryList';
import AttributeGroupsTab from '../../../components/common/AttributeGroupsTab';
import DocumentationTab from '../../../components/common/DocumentationTab';
import PermissionsTab from '../../../components/common/PermissionsTab';
import RelationshipsTab from '../../../components/common/RelationshipsTab';
import APITab from '../../../components/common/APITab';
import StatisticsTab from '../../../components/common/StatisticsTab';
import itemTypeService from '../../../services/api/itemTypeService';
import attributeService from '../../../services/api/attributeService';
import attributeGroupService from '../../../services/api/attributeGroupService';
import categoryService from '../../../services/api/categoryService';
import type { ItemType } from '../../../types/itemType';
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
const ItemTypeDetailsPage: React.FC = () => {
  // HOOKS
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  
  // STATE VARIABLES
  const [itemType, setItemType] = useState<ItemType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  
  // Edit state'leri
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Edit form data
  const [editableFields, setEditableFields] = useState({
    code: '',
    isActive: true,
    category: ''
  });

  // Attributes, AttributeGroups and Category state
  const [attributes, setAttributes] = useState<{id: string, name: string, type?: string}[]>([]);
  const [attributeGroups, setAttributeGroups] = useState<{
    id: string, 
    name: string, 
    code: string, 
    description?: string, 
    attributes?: any[]
  }[]>([]);
  const [category, setCategory] = useState<{id: string, name: string, code: string} | null>(null);
  const [availableCategories, setAvailableCategories] = useState<{id: string, name: string, code: string}[]>([]);
  const [availableAttributeGroups, setAvailableAttributeGroups] = useState<{id: string, name: string, code: string}[]>([]);
  const [availableAttributes, setAvailableAttributes] = useState<{id: string, name: string, type: string}[]>([]);

  // HELPER FUNCTIONS
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return dayjs(dateString).locale('tr').format('DD MMMM YYYY HH:mm:ss');
  };

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
  
  // Load available categories for edit mode
  const fetchAvailableCategories = async () => {
    try {
      const categoriesData = await categoryService.getCategories();
      if (categoriesData && categoriesData.categories) {
        const categoryOptions = categoriesData.categories.map((cat: any) => ({
          id: cat._id,
          name: getEntityName(cat, currentLanguage),
          code: cat.code
        }));
        setAvailableCategories(categoryOptions);
      }
    } catch (err) {
      console.error('Kategoriler yüklenirken hata oluştu:', err);
    }
  };

  // Load available attribute groups for edit mode
  const fetchAvailableAttributeGroups = async () => {
    try {
      const attributeGroupsData = await attributeGroupService.getAttributeGroups();
      if (attributeGroupsData && attributeGroupsData.attributeGroups) {
        const groupOptions = attributeGroupsData.attributeGroups.map((group: any) => ({
          id: group._id,
          name: getEntityName(group, currentLanguage),
          code: group.code || ''
        }));
        setAvailableAttributeGroups(groupOptions);
      }
    } catch (err) {
      console.error('Öznitelik grupları yüklenirken hata oluştu:', err);
    }
  };

  // Load available attributes for edit mode
  const fetchAvailableAttributes = async () => {
    try {
      const attributesData = await attributeService.getAttributes();
      if (attributesData && attributesData.attributes) {
        const attributeOptions = attributesData.attributes.map((attr: any) => ({
          id: attr._id,
          name: getEntityName(attr, currentLanguage),
          type: attr.type || 'text'
        }));
        setAvailableAttributes(attributeOptions);
      }
    } catch (err) {
      console.error('Öznitelikler yüklenirken hata oluştu:', err);
    }
  };

  // EFFECTS
  useEffect(() => {
    let isMounted = true;
    
    const fetchItemTypeDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await itemTypeService.getItemTypeById(id);
        if (isMounted) {
          setItemType(data);
          
          // Initialize editable fields
          setEditableFields({
            code: data.code || '',
            isActive: data.isActive ?? true,
            category: (data.category && typeof data.category === 'object') ? (data.category as any)._id : (data.category || '')
          });

          // İlişkili kategoriyi set et - Backend'den populate olmuş halde geliyor
          if (data.category && typeof data.category === 'object') {
            setCategory({ 
              id: data.category._id, 
              name: getEntityName(data.category, currentLanguage),
              code: data.category.code
            });
          }
          
          // İlişkili öznitelik gruplarını set et - Backend'den populate olmuş halde geliyor
          if (data.attributeGroups && data.attributeGroups.length > 0) {
            const fetchedGroups = data.attributeGroups.map((group: any) => ({
              id: group._id, 
              name: getEntityName(group, currentLanguage),
              code: group.code || '',
              description: getEntityDescription(group, currentLanguage) || '',
              attributes: group.attributes || []
            }));
              setAttributeGroups(fetchedGroups);
          }
          
          // İlişkili öznitelikleri set et - Backend'den populate olmuş halde geliyor
          if (data.attributes && data.attributes.length > 0) {
            const fetchedAttributes = data.attributes.map((attribute: any) => ({
              id: attribute._id, 
              name: getEntityName(attribute, currentLanguage),
              type: attribute.type || 'text'
            }));
              setAttributes(fetchedAttributes);
            }
          }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Öğe tipi bulunamadı');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchItemTypeDetails();
    
    return () => {
      isMounted = false;
    };
  }, [id, t, currentLanguage]);

  // Load available data when entering edit mode
  useEffect(() => {
    if (isEditing) {
      fetchAvailableCategories();
      fetchAvailableAttributeGroups();
      fetchAvailableAttributes();
    }
  }, [isEditing, currentLanguage]);

  // Form input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Sadece editable olan alanları güncelle
    if (['code', 'isActive', 'category'].includes(name)) {
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
      
      // Clear error when user starts typing
      if (formErrors[name]) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!editableFields.code.trim()) {
      errors.code = 'Kod gereklidir';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save changes
  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      // Update data oluştur
      const updateData = {
        ...editableFields,
        attributeGroups: attributeGroups.map(g => g.id),
        attributes: attributes.map(a => a.id)
      };
      
      const updatedItemType = await itemTypeService.updateItemType(id!, updateData);
      setItemType(updatedItemType);
      setIsEditing(false);
      setFormErrors({});
      
      toast.success(`"${getEntityName(updatedItemType, currentLanguage)}" öğe tipi başarıyla güncellendi.`);
      
    } catch (err: any) {
      toast.error(err.message || 'Öğe tipi güncellenirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    if (!itemType) return;
    
    // Reset form to original values
    setEditableFields({
      code: itemType.code || '',
      isActive: itemType.isActive ?? true,
      category: (itemType.category && typeof itemType.category === 'object') ? (itemType.category as any)._id : (itemType.category || '')
    });
    
    setFormErrors({});
    setIsEditing(false);
  };

  // Start editing
  const handleStartEdit = () => {
    if (!itemType) return;
    
    setEditableFields({
      code: itemType.code || '',
      isActive: itemType.isActive ?? true,
      category: (itemType.category && typeof itemType.category === 'object') ? (itemType.category as any)._id : (itemType.category || '')
    });
    
    setIsEditing(true);
  };

  // Delete itemType
  const handleDelete = async () => {
    if (!id || !itemType) return;
    
    if (window.confirm(`"${getEntityName(itemType, currentLanguage)}" öğe tipini silmek istediğinize emin misiniz?`)) {
      try {
        await itemTypeService.deleteItemType(id);
        toast.success('Öğe tipi başarıyla silindi.');
        navigate('/itemtypes/list');
      } catch (err: any) {
        toast.error(err.message || 'Öğe tipi silinirken bir hata oluştu.');
      }
    }
  };

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
          onClick={() => navigate('/itemtypes/list')}
          className="mt-2"
        >
          Listeye Dön
        </Button>
      </div>
    );
  }
  
  // NOT FOUND STATE
  if (!itemType) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 px-6 py-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-2">
          <svg className="w-6 h-6 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold">Bulunamadı</h3>
        </div>
        <p className="mb-3">Öğe tipi bulunamadı</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/itemtypes/list')}
          className="mt-2"
        >
          Listeye Dön
        </Button>
      </div>
    );
  }

  // MAIN RENDER
  return (
    <div className="space-y-6">
      {/* BREADCRUMB */}
      <div className="flex items-center justify-between">
        <Breadcrumb 
          items={[
            { label: 'Öğe Tipleri', path: '/itemtypes/list' },
            { label: getEntityName(itemType, currentLanguage) }
          ]} 
        />
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Link to="/itemtypes/list" className="mr-4">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getEntityName(itemType, currentLanguage)}
              </h1>
              {itemType.name && typeof itemType.name === 'object' && itemType.name._id && (
                <Link 
                  to={`/localizations/details/${itemType.name._id}`}
                  className="ml-2 p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900"
                  title="Çeviriyi düzenle"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </Link>
              )}
            </div>
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
                  placeholder="Öğe tipi kodu"
                />
              ) : (
                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                  {itemType.code}
                </span>
              )}
              {formErrors.code && (
                <p className="ml-2 text-sm text-red-500 dark:text-red-400">{formErrors.code}</p>
              )}
              <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
              <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                (isEditing ? editableFields.isActive : itemType.isActive)
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
                  itemType.isActive ? 'Aktif' : 'Pasif'
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
                disabled={isSaving}
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
                JSON Göster
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
               activeTab === 'attribute-groups'
                 ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                 : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
             }`}
             onClick={() => setActiveTab('attribute-groups')}
           >
             <div className="flex items-center">
               <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
               </svg>
               Öznitelik Grupları
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
               activeTab === 'relations'
                 ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                 : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
             }`}
             onClick={() => setActiveTab('relations')}
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
               activeTab === 'documents'
                 ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                 : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
             }`}
             onClick={() => setActiveTab('documents')}
           >
             <div className="flex items-center">
               <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
               </svg>
               Dokümantasyon
             </div>
           </button>
           <button
             className={`py-4 px-1 border-b-2 font-medium text-sm ${
               activeTab === 'api'
                 ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                 : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
             }`}
             onClick={() => setActiveTab('api')}
           >
             <div className="flex items-center">
               <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
               </svg>
               API
             </div>
           </button>
           <button
             className={`py-4 px-1 border-b-2 font-medium text-sm ${
               activeTab === 'statistics'
                 ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                 : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
             }`}
             onClick={() => setActiveTab('statistics')}
           >
             <div className="flex items-center">
               <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
               </svg>
               İstatistikler
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
             <h2 className="text-lg font-medium text-gray-900 dark:text-white">JSON Önizleme</h2>
             <Button 
               variant="outline" 
               size="sm"
               className="flex items-center"
               onClick={() => navigator.clipboard.writeText(JSON.stringify(itemType, null, 2))}
             >
               <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
               </svg>
               Kopyala
             </Button>
           </CardHeader>
           <CardBody>
             <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
               <code>{JSON.stringify(itemType, null, 2)}</code>
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
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Açıklama</h3>
                        {itemType.description && typeof itemType.description === 'object' && itemType.description._id && (
                          <Link 
                            to={`/localizations/details/${itemType.description._id}`}
                            className="ml-2 p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900"
                            title="Çeviriyi düzenle"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                            </svg>
                          </Link>
                        )}
                      </div>
                      <p className="mt-2 text-gray-900 dark:text-gray-100">
                        {getEntityDescription(itemType, currentLanguage) || 'Açıklama yok'}
                      </p>
            </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Durum</h3>
                        <div className="mt-2 flex items-center">
                          {getStatusIcon(itemType.isActive)}
                          <span className="ml-2 text-gray-900 dark:text-gray-100">
                            {itemType.isActive ? 'Aktif' : 'Pasif'}
                </span>
            </div>
                      </div>
            <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Kategori</h3>
                        <div className="mt-2">
                          {isEditing ? (
                            <select
                              name="category"
                              value={editableFields.category}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                            >
                              <option value="">Kategori Seçin</option>
                              {availableCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name} ({cat.code})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <>
                              {category ? (
                  <Link
                                  to={`/categories/details/${category.id}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                                  {category.name} ({category.code})
                  </Link>
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400">Kategori yok</span>
                              )}
                            </>
                          )}
            </div>
                      </div>
            <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Oluşturulma Tarihi</h3>
                        <p className="mt-2 text-gray-900 dark:text-gray-100">{formatDate(itemType.createdAt)}</p>
            </div>
            <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Güncellenme Tarihi</h3>
                        <p className="mt-2 text-gray-900 dark:text-gray-100">{formatDate(itemType.updatedAt)}</p>
            </div>
      </div>
                  </div>
                </CardBody>
              </Card>

      {/* Attribute Groups */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Öznitelik Grupları ({attributeGroups.length})</h2>
                    {isEditing && (
                    <div className="flex space-x-2">
                      <select
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        onChange={(e) => {
                          if (e.target.value) {
                            const selectedGroup = availableAttributeGroups.find(g => g.id === e.target.value);
                            if (selectedGroup && !attributeGroups.find(g => g.id === selectedGroup.id)) {
                              setAttributeGroups(prev => [...prev, {
                                ...selectedGroup,
                                description: '',
                                attributes: []
                              }]);
                            }
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="">Grup Ekle</option>
                        {availableAttributeGroups
                          .filter(group => !attributeGroups.find(g => g.id === group.id))
                          .map((group) => (
                            <option key={group.id} value={group.id}>
                              {group.name} ({group.code})
                            </option>
                          ))}
                                             </select>
                     </div>
                   )}
                  </div>
                </CardHeader>
                <CardBody>
        {attributeGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attributeGroups.map((group) => (
              <div
                key={group.id}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg relative"
                        >
                          {isEditing && (
                            <button
                              onClick={() => {
                                setAttributeGroups(prev => prev.filter(g => g.id !== group.id));
                              }}
                              className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                <Link
                  to={`/attributegroups/details/${group.id}`}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  {group.name}
                </Link>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {group.code}
                          </p>
                          {group.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {group.description}
                            </p>
                          )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Öznitelik grubu yok
          </p>
        )}
                </CardBody>
              </Card>

      {/* Attributes */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Öznitelikler ({attributes.length})</h2>
                    {isEditing && (
                    <div className="flex space-x-2">
                      <select
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        onChange={(e) => {
                          if (e.target.value) {
                            const selectedAttribute = availableAttributes.find(a => a.id === e.target.value);
                            if (selectedAttribute && !attributes.find(a => a.id === selectedAttribute.id)) {
                              setAttributes(prev => [...prev, selectedAttribute]);
                            }
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="">Öznitelik Ekle</option>
                        {availableAttributes
                          .filter(attr => !attributes.find(a => a.id === attr.id))
                          .map((attr) => (
                            <option key={attr.id} value={attr.id}>
                              {attr.name} ({attr.type})
                            </option>
                          ))}
                                             </select>
                     </div>
                   )}
                  </div>
                </CardHeader>
                <CardBody>
        {attributes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attributes.map((attribute) => (
              <div
                key={attribute.id}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg relative"
                        >
                          {isEditing && (
                            <button
                              onClick={() => {
                                setAttributes(prev => prev.filter(a => a.id !== attribute.id));
                              }}
                              className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                <Link
                  to={`/attributes/details/${attribute.id}`}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  {attribute.name}
                </Link>
                          {attribute.type && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {attribute.type}
                            </p>
                          )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Öznitelik yok
          </p>
        )}
                </CardBody>
              </Card>
      </div>
    </div>
        )}

        {/* TAB CONTENT - ATTRIBUTE GROUPS */}
        {activeTab === 'attribute-groups' && (
          <AttributeGroupsTab 
            attributeGroups={attributeGroups.map(group => ({
              _id: group.id,
              name: group.name,
              code: group.code,
              description: group.description,
              attributes: group.attributes || []
            }))}
            isEditing={isEditing}
            onAdd={(groupId) => {
              // Add logic here if needed
              console.log('Adding group:', groupId);
            }}
            onRemove={(groupId) => {
              // Remove logic here if needed
              console.log('Removing group:', groupId);
            }}
          />
        )}

        {/* TAB CONTENT - PERMISSIONS */}
        {activeTab === 'permissions' && (
          <PermissionsTab 
            entityId={id!}
            entityType="itemType"
          />
        )}

        {/* TAB CONTENT - RELATIONS */}
        {activeTab === 'relations' && (
          <RelationshipsTab 
            entityId={id!}
            entityType="itemType"
          />
        )}

        {/* TAB CONTENT - DOCUMENTS */}
        {activeTab === 'documents' && (
          <DocumentationTab 
            entityType="itemType"
            entityName={getEntityName(itemType, currentLanguage)}
          />
        )}

        {/* TAB CONTENT - API */}
        {activeTab === 'api' && (
          <APITab 
            entityId={id!}
            entityType="itemType"
          />
        )}

        {/* TAB CONTENT - STATISTICS */}
        {activeTab === 'statistics' && (
          <StatisticsTab 
            entityId={id!}
            entityType="itemType"
          />
        )}

        {/* TAB CONTENT - HISTORY */}
        {activeTab === 'history' && (
      <Card>
        <CardHeader>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Geçmiş</h2>
        </CardHeader>
        <CardBody>
              <EntityHistoryList entityId={id!} />
        </CardBody>
      </Card>
        )}
    </div>
  );
};

export default ItemTypeDetailsPage; 