import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Breadcrumb from '../../../components/common/Breadcrumb';
import AttributeHistoryList from '../../../components/attributes/AttributeHistoryList';
import attributeGroupService from '../../../services/api/attributeGroupService';
import attributeService from '../../../services/api/attributeService';
import { AttributeGroup } from '../../../types/attributeGroup';
import { Attribute } from '../../../types/attribute';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { useTranslation } from '../../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../../utils/translationUtils';

interface EditableAttributeGroupFields {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

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

const AttributeGroupDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  
  const [attributeGroup, setAttributeGroup] = useState<AttributeGroup | null>(null);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Available attributes for selection
  const [availableAttributes, setAvailableAttributes] = useState<Attribute[]>([]);
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<string[]>([]);
  const [showAttributeSelector, setShowAttributeSelector] = useState<boolean>(false);
  
  const [editableFields, setEditableFields] = useState<EditableAttributeGroupFields>({
    name: '',
    code: '',
    description: '',
    isActive: true
  });
  
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
    
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!editableFields.name.trim()) {
      errors.name = t('group_name_required', 'attribute_groups');
    }
    
    if (!editableFields.description.trim()) {
      errors.description = t('description_required', 'common');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getAttributeGroupName = (group: AttributeGroup | null) => {
    if (!group) return '';
    return getEntityName(group, currentLanguage);
  };

  const getAttributeGroupDescription = (group: AttributeGroup | null) => {
    if (!group) return '';
    return getEntityDescription(group, currentLanguage);
  };

  const handleSave = async () => {
    if (!id || !attributeGroup) return;
    
    if (!validateForm()) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const updatedData = {
        name: editableFields.name.trim(),
        description: editableFields.description.trim(),
        isActive: editableFields.isActive
      };
      
      const updatedAttributeGroup = await attributeGroupService.updateAttributeGroup(id, updatedData);
      setAttributeGroup(updatedAttributeGroup);
      setIsEditing(false);
      
      alert(t('attribute_group_updated_success', 'attribute_groups'));
    } catch (err: any) {
      setError(err.message || t('attribute_group_update_error', 'attribute_groups'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (!attributeGroup) return;
    
    setEditableFields({
      name: getAttributeGroupName(attributeGroup),
      code: attributeGroup.code || '',
      description: getAttributeGroupDescription(attributeGroup),
      isActive: attributeGroup.isActive
    });
    
    setFormErrors({});
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!id || !attributeGroup) return;
    
    if (window.confirm(t('confirm_delete_attribute_group', 'attribute_groups').replace('{{name}}', getAttributeGroupName(attributeGroup)))) {
      try {
        await attributeGroupService.deleteAttributeGroup(id);
        navigate('/attributeGroups/list');
      } catch (err: any) {
        setError(err.message || t('attribute_group_delete_error', 'attribute_groups'));
      }
    }
  };
  
  // Fetch available attributes
  const fetchAvailableAttributes = async () => {
    try {
      const response = await attributeService.getAttributes({ isActive: true });
      setAvailableAttributes(response.attributes);
    } catch (err: any) {
      console.error('Available attributes fetch error:', err);
    }
  };

  // Handle attribute selection
  const handleAttributeToggle = (attributeId: string) => {
    setSelectedAttributeIds(prev => {
      if (prev.includes(attributeId)) {
        return prev.filter(id => id !== attributeId);
      } else {
        return [...prev, attributeId];
      }
    });
  };

  // Add selected attributes to group
  const handleAddAttributes = async () => {
    if (!id || selectedAttributeIds.length === 0) return;
    
    try {
      const currentAttributeIds = attributes.map(attr => attr._id);
      const newAttributeIds = [...new Set([...currentAttributeIds, ...selectedAttributeIds])];
      
      const updatedData = {
        attributes: newAttributeIds
      };
      
      const updatedAttributeGroup = await attributeGroupService.updateAttributeGroup(id, updatedData);
      setAttributeGroup(updatedAttributeGroup);
      
      // Refresh attributes
      if (Array.isArray(updatedAttributeGroup.attributes) && updatedAttributeGroup.attributes.length > 0) {
        setAttributes(updatedAttributeGroup.attributes as unknown as Attribute[]);
      }
      
      setSelectedAttributeIds([]);
      setShowAttributeSelector(false);
      
      alert(t('attributes_added_success', 'attribute_groups'));
    } catch (err: any) {
      setError(err.message || t('attributes_add_error', 'attribute_groups'));
    }
  };

  // Remove attribute from group
  const handleRemoveAttribute = async (attributeId: string) => {
    if (!id) return;
    
    if (window.confirm(t('confirm_remove_attribute', 'attribute_groups'))) {
      try {
        const currentAttributeIds = attributes.map(attr => attr._id);
        const newAttributeIds = currentAttributeIds.filter(id => id !== attributeId);
        
        const updatedData = {
          attributes: newAttributeIds
        };
        
        const updatedAttributeGroup = await attributeGroupService.updateAttributeGroup(id, updatedData);
        setAttributeGroup(updatedAttributeGroup);
        
        // Refresh attributes
        if (Array.isArray(updatedAttributeGroup.attributes) && updatedAttributeGroup.attributes.length > 0) {
          setAttributes(updatedAttributeGroup.attributes as unknown as Attribute[]);
        } else {
          setAttributes([]);
        }
        
        alert(t('attribute_removed_success', 'attribute_groups'));
      } catch (err: any) {
        setError(err.message || t('attribute_remove_error', 'attribute_groups'));
      }
    }
  };
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchAttributeGroupDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await attributeGroupService.getAttributeGroupById(id);
        if (isMounted) {
          setAttributeGroup(data);
          
          setEditableFields({
            name: getEntityName(data, currentLanguage),
            code: data.code || '',
            description: getEntityDescription(data, currentLanguage),
            isActive: data.isActive
          });
          
          if (Array.isArray(data.attributes) && data.attributes.length > 0) {
            setAttributes(data.attributes as unknown as Attribute[]);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || t('attribute_group_not_found', 'attribute_groups'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchAttributeGroupDetails();
    fetchAvailableAttributes();
    
    return () => {
      isMounted = false;
    };
  }, [id, t, currentLanguage]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-light border-t-transparent dark:border-primary-dark dark:border-t-transparent"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-2">
          <svg className="w-6 h-6 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold">{t('error', 'common')}</h3>
        </div>
        <p className="mb-3">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/attributeGroups/list')}
          className="mt-2"
        >
          {t('back_to_list', 'common')}
        </Button>
      </div>
    );
  }
  
  if (!attributeGroup) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 px-6 py-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-2">
          <svg className="w-6 h-6 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold">{t('not_found', 'common')}</h3>
        </div>
        <p className="mb-3">{t('attribute_group_not_found', 'attribute_groups')}</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/attributeGroups/list')}
          className="mt-2"
        >
          {t('back_to_list', 'common')}
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumb 
          items={[
            { label: t('attribute_groups_title', 'attribute_groups'), path: '/attributeGroups/list' },
            { label: getAttributeGroupName(attributeGroup) }
          ]} 
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Link to="/attributeGroups/list" className="mr-4">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
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
                  placeholder={t('attribute_group_name', 'attribute_groups')}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.name}</p>
                )}
              </div>
            ) : (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{getAttributeGroupName(attributeGroup)}</h1>
            )}
            <div className="flex items-center mt-1">
              <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                {attributeGroup.code}
              </span>
              <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
              <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                attributeGroup.isActive 
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
                  attributeGroup.isActive ? t('active', 'common') : t('inactive', 'common')
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
                onClick={() => setIsEditing(true)}
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                {t('edit', 'common')}
              </Button>
              <Button
                variant="secondary"
                className="flex items-center text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
                onClick={handleDelete}
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
              {t('details', 'common')}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {t('attributes', 'common')} ({attributes.length})
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

      {showJsonPreview && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('json_preview_title', 'attributes')}</h2>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center"
              onClick={() => navigator.clipboard.writeText(JSON.stringify(attributeGroup, null, 2))}
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              {t('copy_button', 'common')}
            </Button>
          </CardHeader>
          <CardBody>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{JSON.stringify(attributeGroup, null, 2)}</code>
            </pre>
          </CardBody>
        </Card>
      )}

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
                        {getAttributeGroupDescription(attributeGroup) || t('no_description', 'common')}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('status_label', 'common')}</h3>
                      <div className="mt-2 flex items-center">
                        {getStatusIcon(attributeGroup.isActive)}
                        <span className="ml-2 text-gray-900 dark:text-gray-100">
                          {attributeGroup.isActive ? t('active_status', 'common') : t('inactive_status', 'common')}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('attributes_count', 'attribute_groups')}</h3>
                      <p className="mt-2 text-gray-900 dark:text-gray-100">{attributes.length} {t('attributes', 'common')}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('created_at', 'common')}</h3>
                      <p className="mt-2 text-gray-900 dark:text-gray-100">{formatDate(attributeGroup.createdAt)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('updated_at', 'common')}</h3>
                      <p className="mt-2 text-gray-900 dark:text-gray-100">{formatDate(attributeGroup.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
          
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('metadata', 'common')}
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-750 p-4">
                    <div className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      ID
                    </div>
                    <div className="text-gray-800 dark:text-gray-200 font-mono text-sm break-all">
                      {attributeGroup._id}
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-750 p-4">
                    <div className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      {t('code', 'common')}
                    </div>
                    <div className="text-gray-800 dark:text-gray-200 font-mono text-sm">
                      {attributeGroup.code || '-'}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
      
      {activeTab === 'attributes' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {t('attributes', 'common')}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm px-3 py-1 rounded-full">
                  {attributes.length} {attributes.length === 1 ? t('attribute', 'attributes') : t('attributes', 'attributes')}
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAttributeSelector(true)}
                  className="flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {t('add_attributes', 'attribute_groups')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            {attributes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attributes.map(attribute => (
                  <div 
                    key={attribute._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-150"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{attribute.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">{attribute.code}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                            attribute.isActive 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {attribute.isActive ? t('active', 'common') : t('inactive', 'common')}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveAttribute(attribute._id)}
                            className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900 p-1"
                            title={t('remove_attribute', 'attribute_groups')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                      {attribute.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                          {attribute.description}
                        </p>
                      )}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-750 p-3 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => navigate(`/attributes/${attribute._id}`)}
                      >
                        {t('view', 'attributes')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 mb-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h4 className="text-gray-700 dark:text-gray-300 font-medium mb-2">{t('no_attributes_found', 'attributes')}</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mb-4">
                  {t('no_related_attributes_description', 'attribute_groups')}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/attributes/create')}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {t('create_attribute', 'attributes')}
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      )}
      
      {/* Attribute Selector Modal */}
      {showAttributeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('select_attributes_to_add', 'attribute_groups')}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAttributeSelector(false);
                    setSelectedAttributeIds([]);
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {availableAttributes.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{t('no_attributes_available', 'attribute_groups')}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('create_attributes_first', 'attribute_groups')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableAttributes
                    .filter(attr => !attributes.some(existingAttr => existingAttr._id === attr._id))
                    .map((attribute) => (
                      <div
                        key={attribute._id}
                        className={`relative rounded-lg border p-4 cursor-pointer transition-colors ${
                          selectedAttributeIds.includes(attribute._id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                        onClick={() => handleAttributeToggle(attribute._id)}
                      >
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              type="checkbox"
                              checked={selectedAttributeIds.includes(attribute._id)}
                              onChange={() => handleAttributeToggle(attribute._id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {getEntityName(attribute, currentLanguage)}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {attribute.code}
                            </p>
                            {getEntityDescription(attribute, currentLanguage) && (
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                                {getEntityDescription(attribute, currentLanguage)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedAttributeIds.length > 0 && (
                  <span>{t('selected_count', 'attribute_groups').replace('{{count}}', selectedAttributeIds.length.toString())}</span>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAttributeSelector(false);
                    setSelectedAttributeIds([]);
                  }}
                >
                  {t('cancel', 'common')}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAddAttributes}
                  disabled={selectedAttributeIds.length === 0}
                >
                  {t('add_selected', 'attribute_groups')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* TAB CONTENT - HISTORY */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('change_history_title', 'attribute_groups')}</h2>
          </CardHeader>
          <CardBody>
            <AttributeHistoryList attributeId={id!} />
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default AttributeGroupDetailsPage; 