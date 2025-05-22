import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import attributeGroupService from '../../../services/api/attributeGroupService';
import type { AttributeGroup } from '../../../types/attributeGroup';
import attributeService from '../../../services/api/attributeService';
import type { Attribute } from '../../../types/attribute';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { useTranslation } from '../../../context/i18nContext';

interface EditableAttributeGroupFields {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

interface TabType {
  id: string;
  name: string;
}

const AttributeGroupDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // State tanımlamaları
  const [attributeGroup, setAttributeGroup] = useState<AttributeGroup | null>(null);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>('details');
  
  // Tab tanımlamaları
  const tabs: TabType[] = [
    { id: 'details', name: t('details', 'common') },
    { id: 'attributes', name: t('attributes', 'common') }
  ];
  
  // Düzenlenebilir alanlar için form state
  const [editableFields, setEditableFields] = useState<EditableAttributeGroupFields>({
    name: '',
    code: '',
    description: '',
    isActive: true
  });
  
  // Öznitelik grubu detaylarını getir
  useEffect(() => {
    const fetchAttributeGroupDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const data = await attributeGroupService.getAttributeGroupById(id);
        setAttributeGroup(data);
        
        // Form alanlarını başlat
        setEditableFields({
          name: data.name,
          code: data.code || '',
          description: data.description || '',
          isActive: data.isActive
        });
        
        // İlişkili öznitelikleri getir
        if (Array.isArray(data.attributes) && data.attributes.length > 0) {
          setAttributes(data.attributes as unknown as Attribute[]);
        }
      } catch (err: any) {
        setError(err.message || t('attribute_group_details_fetch_error', 'attribute_groups'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAttributeGroupDetails();
  }, [id, t]);
  
  // Form değişikliği handler
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
    
    // Hata mesajını temizle
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Form doğrulama
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
  
  // Kaydetme işlemi
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
      
      // API'ye gönder
      const updatedAttributeGroup = await attributeGroupService.updateAttributeGroup(id, updatedData);
      
      // State'i güncelle
      setAttributeGroup(updatedAttributeGroup);
      setIsEditing(false);
      
      // Başarı bildirimi göster
      alert(t('attribute_group_updated_success', 'attribute_groups'));
    } catch (err: any) {
      setError(err.message || t('attribute_group_update_error', 'attribute_groups'));
    } finally {
      setIsSaving(false);
    }
  };
  
  // Düzenleme modunu iptal et
  const handleCancelEdit = () => {
    if (!attributeGroup) return;
    
    // Form alanlarını orijinal değerlere sıfırla
    setEditableFields({
      name: attributeGroup.name,
      code: attributeGroup.code || '',
      description: attributeGroup.description || '',
      isActive: attributeGroup.isActive
    });
    
    setFormErrors({});
    setIsEditing(false);
  };
  
  // Silme işlemi
  const handleDelete = async () => {
    if (!id || !attributeGroup) return;
    
    if (window.confirm(t('confirm_delete_attribute_group', 'attribute_groups').replace('{{name}}', attributeGroup.name))) {
      try {
        await attributeGroupService.deleteAttributeGroup(id);
        navigate('/attributeGroups/list');
      } catch (err: any) {
        setError(err.message || t('attribute_group_delete_error', 'attribute_groups'));
      }
    }
  };
  
  // Tarih formatı helper fonksiyonu
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return dayjs(dateString).locale('tr').format('DD MMMM YYYY HH:mm:ss');
  };
  
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Üst Başlık Kartı */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        {/* Üst Bölüm */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-light/10 dark:bg-primary-dark/20 rounded-lg">
                <svg className="w-6 h-6 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                      className={`px-3 py-2 border ${
                        formErrors.name ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark w-full text-lg font-semibold`}
                      placeholder={t('attribute_group_name', 'attribute_groups')}
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.name}</p>
                    )}
                  </div>
                ) : (
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {attributeGroup.name}
                  </h1>
                )}
                
                <div className="flex mt-2 items-center space-x-2">
                  <div className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                    {attributeGroup.code}
                  </div>
                  
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
                          className="h-4 w-4 text-primary-light focus:ring-primary-light border-gray-300 rounded"
                        />
                        <label htmlFor="isActive" className="ml-2">
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
            
            <div className="flex items-start md:items-center space-x-2 mt-4 md:mt-0">
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
                    onClick={() => navigate('/attributeGroups/list')}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>{t('back_to_list', 'common')}</span>
                  </Button>
                  <Button
                    variant="primary"
                    className="flex items-center"
                    onClick={() => setIsEditing(true)}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>{t('edit', 'common')}</span>
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex items-center text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
                    onClick={handleDelete}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>{t('delete', 'common')}</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Sekmeler */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors duration-150 ease-in-out ${
                  activeTab === tab.id
                    ? 'border-primary-light text-primary-light dark:border-primary-dark dark:text-primary-dark'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Sekme İçerikleri */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sol Panel - Meta Bilgiler */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('metadata', 'common')}
              </h3>
              
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 dark:bg-gray-750 p-4">
                  <div className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    {t('created_at', 'common')}
                  </div>
                  <div className="text-gray-800 dark:text-gray-200 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(attributeGroup.createdAt)}
                  </div>
                </div>
                
                <div className="rounded-lg bg-gray-50 dark:bg-gray-750 p-4">
                  <div className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    {t('updated_at', 'common')}
                  </div>
                  <div className="text-gray-800 dark:text-gray-200 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {formatDate(attributeGroup.updatedAt)}
                  </div>
                </div>
                
                <div className="rounded-lg bg-gray-50 dark:bg-gray-750 p-4">
                  <div className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    ID
                  </div>
                  <div className="text-gray-800 dark:text-gray-200 font-mono text-sm break-all">
                    {attributeGroup._id}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sağ Panel - Açıklama */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                {t('description', 'common')}
              </h3>
              
              {isEditing ? (
                <div>
                  <textarea
                    name="description"
                    value={editableFields.description}
                    onChange={handleInputChange}
                    rows={6}
                    className={`w-full px-4 py-3 border ${
                      formErrors.description ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                    } rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark`}
                    placeholder={t('description_placeholder', 'attributes')}
                  ></textarea>
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.description}</p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {attributeGroup.description || <span className="text-gray-400 italic">{t('no_description', 'common')}</span>}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Öznitelikler Sekmesi */}
      {activeTab === 'attributes' && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {t('attributes', 'common')}
            </h3>
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm px-3 py-1 rounded-full">
              {attributes.length} {attributes.length === 1 ? t('attribute', 'attributes') : t('attributes', 'attributes')}
            </span>
          </div>
          
          {attributes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attributes.map(attribute => (
                <div 
                  key={attribute._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-150"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{attribute.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">{attribute.code}</p>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                        attribute.isActive 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {attribute.isActive ? t('active', 'common') : t('inactive', 'common')}
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
                      onClick={() => navigate(`/attributes/details/${attribute._id}`)}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {t('view_details', 'common')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : Array.isArray(attributeGroup.attributes) && attributeGroup.attributes.length > 0 ? (
            <div className="flex items-center justify-center py-8">
              <svg className="animate-spin mr-3 h-6 w-6 text-primary-light dark:text-primary-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600 dark:text-gray-400">{t('attributes_loading', 'attribute_groups')}</span>
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
        </div>
      )}
    </div>
  );
};

export default AttributeGroupDetailsPage; 