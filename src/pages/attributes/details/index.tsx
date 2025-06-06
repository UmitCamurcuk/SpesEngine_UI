import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import { ConfirmationModal, ToastContainer } from '../../../components/ui';
import type { Toast } from '../../../components/ui/Toast';
import Breadcrumb from '../../../components/common/Breadcrumb';
import AttributeBadge from '../../../components/attributes/AttributeBadge';
import EntityHistoryList from '../../../components/common/EntityHistoryList';
import AttributeGroupsTab from '../../../components/common/AttributeGroupsTab';
import PermissionsTab from '../../../components/common/PermissionsTab';
import RelationshipsTab from '../../../components/common/RelationshipsTab';
import DocumentationTab from '../../../components/common/DocumentationTab';
import APITab from '../../../components/common/APITab';
import StatisticsTab from '../../../components/common/StatisticsTab';
import attributeService from '../../../services/api/attributeService';
import { Attribute } from '../../../types/attribute';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { useTranslation } from '../../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../../utils/translationUtils';

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
const AttributeDetailsPage: React.FC = () => {
  // HOOKS
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  
  // STATE VARIABLES
  const [attribute, setAttribute] = useState<Attribute | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  
  // Edit state'leri ekle
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Silme modal ve toast state'leri
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Attribute Groups state'leri
  const [attributeGroups, setAttributeGroups] = useState<any[]>([]);
  const [allAttributeGroups, setAllAttributeGroups] = useState<any[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  
  // Edit form data
  const [editableFields, setEditableFields] = useState({
    name: '',
    code: '',
    description: '',
    isRequired: false,
    isActive: true
  });
  
  // Attribute Groups fonksiyonları - useEffect'ten önce tanımla
  const fetchAttributeGroups = async () => {
    if (!id) return;
    
    try {
      const groups = await attributeService.getAttributeGroups(id);
      setAttributeGroups(groups);
      setSelectedGroupIds(groups.map((g: any) => g._id));
    } catch (err: any) {
      console.error('Attribute groups yüklenirken hata:', err);
    }
  };

  const fetchAllAttributeGroups = async () => {
    try {
      const attributeGroupService = await import('../../../services/api/attributeGroupService');
      const response = await attributeGroupService.default.getAttributeGroups({ isActive: true });
      setAllAttributeGroups(response.attributeGroups);
    } catch (err: any) {
      console.error('Tüm attribute groups yüklenirken hata:', err);
    }
  };
  
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

  const getRequiredIcon = (isRequired?: boolean) => {
    if (isRequired) {
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
    
    const fetchAttributeDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await attributeService.getAttributeById(id);
        if (isMounted) {
          setAttribute(data);
          
          // Initialize editable fields
          setEditableFields({
            name: getEntityName(data, currentLanguage),
            code: data.code || '',
            description: getEntityDescription(data, currentLanguage),
            isRequired: data.isRequired,
            isActive: data.isActive
          });
          
          // Attribute groups'ları da yükle
          fetchAttributeGroups();
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || t('attribute_not_found', 'attributes'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchAttributeDetails();
    
    return () => {
      isMounted = false;
    };
  }, [id, t, currentLanguage]);
  
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
          <h3 className="text-lg font-semibold">{t('error_title', 'common')}</h3>
        </div>
        <p className="mb-3">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/attributes')}
          className="mt-2"
        >
          {t('back_to_list', 'common')}
        </Button>
      </div>
    );
  }
  
  // NOT FOUND STATE
  if (!attribute) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 px-6 py-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-2">
          <svg className="w-6 h-6 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold">{t('not_found_title', 'common')}</h3>
        </div>
        <p className="mb-3">{t('attribute_not_found', 'attributes')}</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/attributes')}
          className="mt-2"
        >
          {t('back_to_list', 'common')}
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
    
    // Clear error when user starts typing
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
      errors.name = t('name_required', 'attributes');
    }
    
    if (!editableFields.code.trim()) {
      errors.code = t('code_required', 'attributes');
    }
    
    if (!editableFields.description.trim()) {
      errors.description = t('description_required', 'common');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save changes
  const handleSave = async () => {
    if (!id || !attribute) return;
    
    if (!validateForm()) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Sadece değişen translation'ları gönder
      const currentName = getEntityName(attribute, currentLanguage);
      const currentDescription = getEntityDescription(attribute, currentLanguage);
      
      const updatedData: any = {
        code: editableFields.code.trim(),
        isRequired: editableFields.isRequired,
        isActive: editableFields.isActive
      };
      
      // Name değişmişse translation'ı ekle
      if (editableFields.name.trim() !== currentName) {
        updatedData.nameTranslations = {
          [currentLanguage]: editableFields.name.trim()
        };
      }
      
      // Description değişmişse translation'ı ekle  
      if (editableFields.description.trim() !== currentDescription) {
        updatedData.descriptionTranslations = {
          [currentLanguage]: editableFields.description.trim()
        };
      }
      
      const updatedAttribute = await attributeService.updateAttribute(id, updatedData);
      setAttribute(updatedAttribute);
      setIsEditing(false);
      
      // Show success message
      alert(t('attribute_updated_success', 'attributes'));
    } catch (err: any) {
      setError(err.message || t('attribute_update_error', 'attributes'));
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    if (!attribute) return;
    
    // Reset form to original values
    setEditableFields({
      name: getEntityName(attribute, currentLanguage),
      code: attribute.code || '',
      description: getEntityDescription(attribute, currentLanguage),
      isRequired: attribute.isRequired,
      isActive: attribute.isActive
    });
    
    setFormErrors({});
    setIsEditing(false);
  };

  // Start editing
  const handleStartEdit = () => {
    if (!attribute) return;
    
    setEditableFields({
      name: getEntityName(attribute, currentLanguage),
      code: attribute.code || '',
      description: getEntityDescription(attribute, currentLanguage),
      isRequired: attribute.isRequired,
      isActive: attribute.isActive
    });
    
    setIsEditing(true);
  };

  // Toast helper fonksiyonları
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const newToast: Toast = {
      ...toast,
      id: Date.now().toString() + Math.random().toString(36)
    };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Delete attribute
  const handleDelete = async () => {
    if (!id || !attribute) return;
    
    setIsDeleting(true);
    try {
      await attributeService.deleteAttribute(id);
      
      // Başarılı silme toast'ı
      addToast({
        type: 'success',
        title: 'Öznitelik Silindi',
        message: `"${getEntityName(attribute, currentLanguage)}" özniteliği başarıyla silindi.`,
        duration: 5000
      });
      
      // Sayfayı attributes listesine yönlendir
      navigate('/attributes');
      
    } catch (err: any) {
      // Hata toast'ı
      addToast({
        type: 'error',
        title: 'Silme Hatası',
        message: err.message || 'Öznitelik silinirken bir hata oluştu.',
        duration: 5000
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  // MAIN RENDER
  return (
    <div className="space-y-6">
      {/* BREADCRUMB */}
      <div className="flex items-center justify-between">
        <Breadcrumb 
          items={[
            { label: t('attributes_title', 'attributes'), path: '/attributes' },
            { label: getEntityName(attribute, currentLanguage) }
          ]} 
        />
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Link to="/attributes" className="mr-4">
            <Button variant="outline" size="sm" className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('back_button', 'common')}
            </Button>
          </Link>
          <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/50 
                         flex items-center justify-center mr-3">
            <svg className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
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
                  placeholder={t('attribute_name', 'attributes')}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.name}</p>
                )}
              </div>
            ) : (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{getEntityName(attribute, currentLanguage)}</h1>
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
                  placeholder={t('attribute_code', 'attributes')}
                />
              ) : (
                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                  {attribute.code}
                </span>
              )}
              {formErrors.code && (
                <p className="ml-2 text-sm text-red-500 dark:text-red-400">{formErrors.code}</p>
              )}
              <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
              <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                (isEditing ? editableFields.isActive : attribute.isActive)
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
                      {editableFields.isActive ? t('active', 'common') : t('inactive', 'common')}
                    </label>
                  </div>
                ) : (
                  attribute.isActive ? t('active', 'common') : t('inactive', 'common')
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
                disabled={isSaving}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{t('save', 'common')}</span>
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
                <span>{t('cancel', 'common')}</span>
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
                {t('view_json', 'attributes')}
              </Button>
              <Button
                variant="primary"
                className="flex items-center"
                onClick={handleStartEdit}
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                {t('edit', 'common')}
              </Button>
              <Button
                variant="secondary"
                className="flex items-center text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
                onClick={handleDeleteClick}
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
              {t('details_tab', 'attributes')}
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
              Attribute Groups
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
              {t('permissions', 'common')}
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
              {t('history', 'common')}
            </div>
          </button>
        </nav>
      </div>

      {/* JSON PREVIEW */}
      {showJsonPreview && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('json_preview_title', 'attributes')}</h2>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center"
              onClick={() => navigator.clipboard.writeText(JSON.stringify(attribute, null, 2))}
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              {t('copy_button', 'common')}
            </Button>
          </CardHeader>
          <CardBody>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{JSON.stringify(attribute, null, 2)}</code>
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
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('overview_title', 'attributes')}</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('description', 'common')}</h3>
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
                          placeholder={t('description_placeholder', 'attributes')}
                        />
                        {formErrors.description && (
                          <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.description}</p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-2 text-gray-900 dark:text-gray-100">
                        {getEntityDescription(attribute, currentLanguage) || t('no_description', 'common')}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('status_label', 'common')}</h3>
                      <div className="mt-2 flex items-center">
                        {getStatusIcon(attribute.isActive)}
                        <span className="ml-2 text-gray-900 dark:text-gray-100">
                          {attribute.isActive ? t('active_status', 'common') : t('inactive_status', 'common')}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('data_type_label', 'attributes')}</h3>
                      <div className="mt-2">
                        <AttributeBadge type={attribute.type} size="sm" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('created_at_label', 'common')}</h3>
                      <p className="mt-2 text-gray-900 dark:text-gray-100">{formatDate(attribute.createdAt)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('updated_at_label', 'common')}</h3>
                      <p className="mt-2 text-gray-900 dark:text-gray-100">{formatDate(attribute.updatedAt)}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">{t('properties_title', 'attributes')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <svg className="h-4 w-4 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {attribute.isRequired ? t('required_property', 'attributes') : t('optional_property', 'attributes')}
                        </span>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <svg className="h-4 w-4 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {t('unique_property', 'attributes')}
                        </span>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <svg className="h-4 w-4 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {t('searchable_property', 'attributes')}
                        </span>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <svg className="h-4 w-4 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {t('filterable_property', 'attributes')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('validation_rules_title', 'attributes')}</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  {attribute.validations && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {attribute.validations.min !== undefined && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('minimum_value_label', 'attributes')}</h3>
                          <p className="mt-2 text-gray-900 dark:text-gray-100">
                            {attribute.validations.min}
                          </p>
                        </div>
                      )}
                      {attribute.validations.max !== undefined && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('maximum_value_label', 'attributes')}</h3>
                          <p className="mt-2 text-gray-900 dark:text-gray-100">
                            {attribute.validations.max}
                          </p>
                        </div>
                      )}
                      {attribute.validations.minLength !== undefined && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('minimum_length_label', 'attributes')}</h3>
                          <p className="mt-2 text-gray-900 dark:text-gray-100">
                            {attribute.validations.minLength}
                          </p>
                        </div>
                      )}
                      {attribute.validations.maxLength !== undefined && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('maximum_length_label', 'attributes')}</h3>
                          <p className="mt-2 text-gray-900 dark:text-gray-100">
                            {attribute.validations.maxLength}
                          </p>
                        </div>
                      )}
                      {attribute.validations.isInteger !== undefined && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('integer_only_label', 'attributes')}</h3>
                          <p className="mt-2 text-gray-900 dark:text-gray-100">
                            {attribute.validations.isInteger ? t('yes_label', 'common') : t('no_label', 'common')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {attribute.validations?.pattern && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('pattern_regex_label', 'attributes')}</h3>
                      <div className="mt-2">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                          {attribute.validations.pattern}
                        </code>
                      </div>
                    </div>
                  )}

                  {attribute.options && attribute.options.length > 0 && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">{t('options_label', 'attributes')}</h3>
                      <div className="flex flex-wrap gap-2">
                        {attribute.options.map((option: string, index: number) => (
                          <span 
                            key={index} 
                            className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          >
                            {option}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('usage_statistics_title', 'attributes')}</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('used_in_entities_label', 'attributes')}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {attribute.usageCount || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full" 
                        style={{ width: '65%' }}
                      ></div>
                    </div>
                  </div>
                  
                  {attribute.relationships && attribute.relationships.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('referenced_by_label', 'attributes')}</h3>
                      {attribute.relationships.map((rel, index) => (
                        <div key={index} className="flex items-center justify-between text-sm py-1">
                          <span className="text-gray-600 dark:text-gray-400">{rel.entityType}</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{rel.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('api_reference_title', 'attributes')}</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('attribute_id_label', 'attributes')}</h3>
                    <div className="mt-2 flex items-center space-x-2">
                      <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                        {attribute._id}
                      </code>
                      <button 
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                        onClick={() => navigator.clipboard.writeText(attribute._id)}
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('json_schema_label', 'attributes')}</h3>
                    <div className="mt-2 bg-gray-900 text-gray-200 p-3 rounded-md text-xs font-mono overflow-x-auto">
                      {`{
  "type": "${attribute.type}",
  "title": "${getEntityName(attribute, currentLanguage)}",
  ${attribute.validations?.min !== undefined ? `"minimum": ${attribute.validations.min},` : ''}
  ${attribute.validations?.max !== undefined ? `"maximum": ${attribute.validations.max},` : ''}
  ${attribute.validations?.minLength !== undefined ? `"minLength": ${attribute.validations.minLength},` : ''}
  ${attribute.validations?.maxLength !== undefined ? `"maxLength": ${attribute.validations.maxLength},` : ''}
  ${attribute.validations?.pattern ? `"pattern": "${attribute.validations.pattern}"` : ''}
}`}
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
                      {t('view_api_documentation', 'attributes')}
                    </Button>
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
                      {t('important_note_title', 'attributes')}
                    </h3>
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                      {t('important_note_description', 'attributes')}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT - ATTRIBUTE GROUPS */}
      {activeTab === 'attribute-groups' && (
        <AttributeGroupsTab
          attributeGroups={attributeGroups}
          isEditing={isEditing}
          onAdd={() => fetchAllAttributeGroups()}
          onRemove={(groupId) => {
            setAttributeGroups(prev => prev.filter(g => g._id !== groupId));
            setSelectedGroupIds(prev => prev.filter(id => id !== groupId));
          }}
          title="Öznitelik Grupları"
          emptyMessage="Bu öznitelik henüz hiçbir gruba bağlı değil."
          showAddButton={isEditing}
        />
      )}

      {/* TAB CONTENT - DOCUMENTATION */}
      {activeTab === 'documents' && (
        <DocumentationTab
          entityType="attribute"
          entityName={getEntityName(attribute, currentLanguage)}
        />
      )}

      {/* TAB CONTENT - PERMISSIONS */}
      {activeTab === 'permissions' && (
        <PermissionsTab
          entityId={id!}
          entityType="attribute"
        />
      )}

      {/* TAB CONTENT - RELATIONS */}
      {activeTab === 'relations' && (
        <RelationshipsTab
          entityId={id!}
          entityType="attribute"
        />
      )}

      {/* TAB CONTENT - API */}
      {activeTab === 'api' && (
        <APITab
          entityType="attribute"
          entityId={id}
        />
      )}

      {/* TAB CONTENT - STATISTICS */}
      {activeTab === 'statistics' && (
        <StatisticsTab
          entityType="attribute"
          entityId={id}
        />
      )}

      {/* TAB CONTENT - HISTORY */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('change_history_title', 'attributes')}</h2>
          </CardHeader>
          <CardBody>
            <EntityHistoryList entityId={id!} entityType="attribute" title="Öznitelik Geçmişi" />
          </CardBody>
        </Card>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        type="delete"
        title="Öznitelik Silme Onayı"
        message={`"${attribute ? getEntityName(attribute, currentLanguage) : ''}" özniteliğini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        isLoading={isDeleting}
      />

      {/* Toast Container */}
      <ToastContainer
        toasts={toasts}
        position="top-right"
        onDismiss={removeToast}
      />
    </div>
  );
};

export default AttributeDetailsPage; 