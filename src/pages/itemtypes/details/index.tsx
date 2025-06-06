import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Breadcrumb from '../../../components/common/Breadcrumb';
import itemTypeService from '../../../services/api/itemTypeService';
import attributeService from '../../../services/api/attributeService';
import attributeGroupService from '../../../services/api/attributeGroupService';
import familyService from '../../../services/api/familyService';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { useTranslation } from '../../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../../utils/translationUtils';
import type { ItemType } from '../../../types/itemType';

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

const ItemTypeDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t, currentLanguage } = useTranslation();
  
  // Veri state'i
  const [itemType, setItemType] = useState<ItemType | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('details');
  
  // İlişkili veriler
  const [attributeGroups, setAttributeGroups] = useState<{id: string, name: string}[]>([]);
  const [attributes, setAttributes] = useState<{id: string, name: string}[]>([]);
  const [family, setFamily] = useState<{id: string, name: string} | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<ItemType>>({
    name: '',
    code: '',
    description: '',
    family: '',
    attributeGroups: [],
    attributes: [],
    isActive: true
  });
  
  // Loading ve error state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Breadcrumb verisi
  const breadcrumbItems = [
    { label: t('home', 'common'), path: '/' },
    { label: t('item_types', 'itemTypes'), path: '/itemtypes/list' },
    { label: itemType ? getEntityName(itemType, currentLanguage) : t('loading', 'common') },
  ];

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
  
  // Veriyi getir
  useEffect(() => {
    let isMounted = true;
    
    const fetchItemTypeDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const itemTypeData = await itemTypeService.getItemTypeById(id);
        
        if (isMounted) {
          setItemType(itemTypeData);
          setFormData({
            name: getEntityName(itemTypeData, currentLanguage),
            code: itemTypeData.code,
            description: getEntityDescription(itemTypeData, currentLanguage),
            family: itemTypeData.family,
            attributeGroups: itemTypeData.attributeGroups,
            attributes: itemTypeData.attributes,
            isActive: itemTypeData.isActive
          });
          
          // İlişkili family'yi getir
          if (itemTypeData.family) {
            try {
              const familyData = await familyService.getFamilyById(itemTypeData.family);
              setFamily({ id: itemTypeData.family, name: getEntityName(familyData, currentLanguage) });
            } catch (err) {
              console.error('Family yüklenirken hata oluştu:', err);
            }
          }
          
          // İlişkili öznitelik gruplarını getir
          if (itemTypeData.attributeGroups && itemTypeData.attributeGroups.length > 0) {
            try {
              const fetchedGroups = [];
              for (const groupId of itemTypeData.attributeGroups) {
                const groupData = await attributeGroupService.getAttributeGroupById(groupId);
                fetchedGroups.push({ id: groupId, name: getEntityName(groupData, currentLanguage) });
              }
              setAttributeGroups(fetchedGroups);
            } catch (err) {
              console.error('Öznitelik grupları yüklenirken hata oluştu:', err);
            }
          }
          
          // İlişkili öznitelikleri getir
          if (itemTypeData.attributes && itemTypeData.attributes.length > 0) {
            try {
              const fetchedAttributes = [];
              for (const attributeId of itemTypeData.attributes) {
                const attributeData = await attributeService.getAttributeById(attributeId);
                fetchedAttributes.push({ id: attributeId, name: getEntityName(attributeData, currentLanguage) });
              }
              setAttributes(fetchedAttributes);
            } catch (err) {
              console.error('Öznitelikler yüklenirken hata oluştu:', err);
            }
          }
        }
        
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || t('item_type_not_found', 'itemTypes'));
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
  }, [id, currentLanguage, t]);
  
  // Form input değişiklik handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Hata mesajını temizle
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
    
    if (!formData.name?.trim()) {
      errors.name = t('name_required', 'itemTypes');
    }
    
    if (!formData.code?.trim()) {
      errors.code = t('code_required', 'itemTypes');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form gönderme handler
  const handleSave = async () => {
    if (!id || !formData) return;
    
    if (!validateForm()) return;
    
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      // API'ye gönder
      await itemTypeService.updateItemType(id, formData);
      
      // Güncel veriyi yeniden yükle
      const updatedItemType = await itemTypeService.getItemTypeById(id);
      setItemType(updatedItemType);
      
      setSuccess(true);
      setIsEditing(false);
      
      // Başarı mesajını belirli bir süre sonra kaldır
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || t('item_type_update_error', 'itemTypes'));
    } finally {
      setIsSaving(false);
    }
  };

  // Düzenlemeyi iptal et
  const handleCancelEdit = () => {
    if (itemType) {
      setFormData({
        name: getEntityName(itemType, currentLanguage),
        code: itemType.code,
        description: getEntityDescription(itemType, currentLanguage),
        family: itemType.family,
        attributeGroups: itemType.attributeGroups,
        attributes: itemType.attributes,
        isActive: itemType.isActive
      });
    }
    setIsEditing(false);
    setFormErrors({});
    setError(null);
  };

  // Düzenleme modunu başlat
  const handleStartEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(false);
  };

  // Öğe tipini silme handler
  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm(t('delete_item_type_confirm', 'itemTypes'))) {
      setIsLoading(true);
      setError(null);
      
      try {
        await itemTypeService.deleteItemType(id);
        navigate('/itemtypes/list');
      } catch (err: any) {
        setError(err.message || t('item_type_delete_error', 'itemTypes'));
        setIsLoading(false);
      }
    }
  };

  // Tab render functions
  const renderDetailsTab = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('basic_information', 'itemTypes')}
        </h3>
        
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('name', 'itemTypes')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  formErrors.name
                    ? 'border-red-300 focus:ring-red-500 dark:border-red-700'
                    : 'border-gray-300 focus:ring-blue-500 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-white`}
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('code', 'itemTypes')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  formErrors.code
                    ? 'border-red-300 focus:ring-red-500 dark:border-red-700'
                    : 'border-gray-300 focus:ring-blue-500 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-white`}
              />
              {formErrors.code && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.code}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('description', 'itemTypes')}
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive || false}
                  onChange={handleInputChange}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('is_active', 'itemTypes')}
                </span>
              </label>
            </div>
          </div>
        ) : (
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('name', 'itemTypes')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {itemType ? getEntityName(itemType, currentLanguage) : '-'}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('code', 'itemTypes')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {itemType?.code || '-'}
              </dd>
            </div>

            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('description', 'itemTypes')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {itemType ? getEntityDescription(itemType, currentLanguage) : '-'}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('status', 'itemTypes')}
              </dt>
              <dd className="mt-1 flex items-center">
                {getStatusIcon(itemType?.isActive)}
                <span className="ml-2 text-sm text-gray-900 dark:text-white">
                  {itemType?.isActive ? t('active', 'common') : t('passive', 'common')}
                </span>
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('family', 'itemTypes')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {family ? (
                  <Link
                    to={`/families/details/${family.id}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {family.name}
                  </Link>
                ) : '-'}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('created_at', 'common')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {formatDate(itemType?.createdAt)}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('updated_at', 'common')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {formatDate(itemType?.updatedAt)}
              </dd>
            </div>
          </dl>
        )}
      </div>

      {/* Attribute Groups */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('attribute_groups', 'itemTypes')} ({attributeGroups.length})
        </h3>
        
        {attributeGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attributeGroups.map((group) => (
              <div
                key={group.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <Link
                  to={`/attributegroups/details/${group.id}`}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  {group.name}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t('no_attribute_groups', 'itemTypes')}
          </p>
        )}
      </div>

      {/* Attributes */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('attributes', 'itemTypes')} ({attributes.length})
        </h3>
        
        {attributes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attributes.map((attribute) => (
              <div
                key={attribute.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <Link
                  to={`/attributes/details/${attribute.id}`}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  {attribute.name}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t('no_attributes', 'itemTypes')}
          </p>
        )}
      </div>
    </div>
  );

  // LOADING STATE
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-light border-t-transparent dark:border-primary-dark dark:border-t-transparent"></div>
      </div>
    );
  }
  
  // ERROR STATE
  if (error && !itemType) {
    return (
      <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-2">
          <svg className="w-6 h-6 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold">{t('error_title', 'common')}</h3>
        </div>
        <p className="mb-3">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/itemtypes/list')}
        >
          {t('back_to_list', 'itemTypes')}
        </Button>
      </div>
    );
  }
  
  if (!itemType) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">{t('item_type_not_found', 'itemTypes')}</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/itemtypes/list')}
          className="mt-4"
        >
          {t('back_to_list', 'itemTypes')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />
      
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <svg className="w-7 h-7 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {getEntityName(itemType, currentLanguage)}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {t('item_type_details_desc', 'itemTypes')}
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate('/itemtypes/list')}
                className="flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t('back_to_list', 'itemTypes')}
              </Button>
              
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {t('cancel', 'common')}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center"
                  >
                    {isSaving ? (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {t('save', 'common')}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="primary"
                    onClick={handleStartEdit}
                    className="flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    {t('edit', 'common')}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    className="flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {t('delete', 'common')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Success Message */}
      {success && (
        <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-6 py-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{t('success', 'common')}!</span>
            <span className="ml-2">{t('item_type_updated_successfully', 'itemTypes')}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-semibold">{t('error', 'common')}:</span>
            <span className="ml-2">{error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {t('details', 'common')}
              </button>
            </nav>
          </div>
        </CardHeader>
        
        <CardBody>
          {activeTab === 'details' && renderDetailsTab()}
        </CardBody>
      </Card>
    </div>
  );
};

export default ItemTypeDetailsPage; 