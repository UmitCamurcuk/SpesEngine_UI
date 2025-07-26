import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { AttributeInput } from '../../../components/attributes/inputs';
import itemService from '../../../services/api/itemService';
import { useTranslation } from '../../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../../utils/translationUtils';
import { toast } from 'react-hot-toast';
import { useNotification } from '../../../components/notifications';

const ItemDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentLanguage } = useTranslation();
  const { showModal } = useNotification();
  
  // State management
  const [activeTab, setActiveTab] = useState<string>('general');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showJsonPreview, setShowJsonPreview] = useState<boolean>(false);
  
  // Data state
  const [item, setItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    attributes: {}
  });
  const [attributeErrors, setAttributeErrors] = useState<Record<string, string>>({});

  // Load item data
  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('🔍 Fetching item details for ID:', id);
        const itemData = await itemService.getItemById(id);
        console.log('✅ Item data received:', itemData);
        
        setItem(itemData);
        setFormData({
          ...itemData,
          attributes: itemData.attributes || {}
        });
      } catch (err: any) {
        console.error('❌ Error fetching item:', err);
        setError('Öğe verileri yüklenirken bir hata oluştu: ' + (err.message || err));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchItemDetails();
  }, [id]);

  // Collect all attributes from hierarchy
  const getAllAttributeGroups = () => {
    if (!item) return [];
    
    const groups: any[] = [];
    
    // 1. ItemType attribute groups
    if (item.itemType?.attributeGroups) {
      item.itemType.attributeGroups.forEach((group: any) => {
        if (group.attributes && group.attributes.length > 0) {
          groups.push({
            ...group,
            source: 'itemType',
            sourceName: getEntityName(item.itemType, currentLanguage),
            sourceIcon: '📦'
          });
        }
      });
    }
    
    // 2. Category hierarchy attribute groups
    if (item.categoryHierarchy) {
      item.categoryHierarchy.forEach((category: any) => {
        if (category.attributeGroups) {
          category.attributeGroups.forEach((group: any) => {
            if (group.attributes && group.attributes.length > 0 && !groups.find(g => g._id === group._id)) {
              groups.push({
                ...group,
                source: 'category',
                sourceName: getEntityName(category, currentLanguage),
                sourceIcon: '📁'
              });
            }
          });
        }
      });
    }
    
    // 3. Family hierarchy attribute groups
    if (item.familyHierarchy) {
      item.familyHierarchy.forEach((family: any) => {
        if (family.attributeGroups) {
          family.attributeGroups.forEach((group: any) => {
            if (group.attributes && group.attributes.length > 0 && !groups.find(g => g._id === group._id)) {
              groups.push({
                ...group,
                source: 'family',
                sourceName: getEntityName(family, currentLanguage),
                sourceIcon: '👥'
              });
            }
          });
        }
      });
    }
    
    return groups;
  };

  // Handle attribute change
  const handleAttributeChange = (attributeId: string, value: any) => {
    setFormData((prev: any) => ({
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

  // Handle delete with confirmation
  const handleDeleteWithConfirmation = () => {
    if (!id) return;
    
    showModal({
      type: 'error',
      title: 'Öğe Silme Onayı',
      message: `Bu öğeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      primaryButton: {
        text: 'Sil',
        onClick: handleDelete,
        variant: 'error'
      },
      secondaryButton: {
        text: 'İptal',
        onClick: () => {}
      }
    });
  };

  // Handle save
  const handleSave = async () => {
    if (!id) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      await itemService.updateItem(id, {
        attributes: formData.attributes,
        isActive: formData.isActive
      });
      
      // Refresh data
      const updatedItem = await itemService.getItemById(id);
      setItem(updatedItem);
      setFormData({
        ...updatedItem,
        attributes: updatedItem.attributes || {}
      });
      
      setIsEditing(false);
      toast.success('Öğe başarıyla güncellendi');
    } catch (err: any) {
      console.error('❌ Error updating item:', err);
      setError(err.message || 'Öğe güncellenirken bir hata oluştu');
      toast.error(err.message || 'Öğe güncellenirken bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await itemService.deleteItem(id);
      toast.success('Öğe başarıyla silindi');
      navigate('/items');
    } catch (err: any) {
      console.error('❌ Error deleting item:', err);
      toast.error(err.message || 'Öğe silinirken bir hata oluştu');
    }
  };

  // Render attribute value
  const renderAttributeValue = (attribute: any, value: any) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic">-</span>;
    }

    switch (attribute.type) {
      case 'boolean':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {value ? 'Evet' : 'Hayır'}
          </span>
        );
      case 'select':
        if (attribute.options && Array.isArray(attribute.options)) {
          const option = attribute.options.find((opt: any) => opt._id === value);
          return option ? getEntityName(option, currentLanguage) : value;
        }
        return value;
      case 'date':
        return new Date(value).toLocaleDateString('tr-TR');
      case 'datetime':
        return new Date(value).toLocaleString('tr-TR');
      default:
        return String(value);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Öğe detayları yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
            <h3 className="text-lg font-semibold mb-2">Hata Oluştu</h3>
            <p>{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/items')}>
              Listeye Dön
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const attributeGroups = getAllAttributeGroups();

  return (
    <div className="space-y-6">
      {/* BREADCRUMB */}
      <div className="flex items-center justify-between">
        <Breadcrumb 
          items={[
            { label: 'Öğeler', path: '/items' },
            { label: 'Detaylar' }
          ]} 
        />
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Link to="/items" className="mr-4">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Öğe Detayları</h1>
            <div className="flex items-center mt-1">
              <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                #{item?._id?.slice(-8)}
              </span>
              <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
              <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                item?.isActive
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              }`}>
                {item?.isActive ? 'Aktif' : 'Pasif'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                İptal
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
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
                JSON Görüntüle
              </Button>
              <Button
                variant="primary"
                className="flex items-center"
                onClick={() => setIsEditing(true)}
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Düzenle
              </Button>
              <Button
                variant="secondary"
                className="flex items-center text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
                onClick={handleDeleteWithConfirmation}
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

      {/* JSON PREVIEW */}
      {showJsonPreview && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">JSON Önizleme</h2>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center"
              onClick={() => navigator.clipboard.writeText(JSON.stringify(item, null, 2))}
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Kopyala
            </Button>
          </div>
          <div className="p-6">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{JSON.stringify(item, null, 2)}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Content Card */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'general', name: 'Genel Bilgiler', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { id: 'attributes', name: 'Öznitelikler', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
              { id: 'hierarchy', name: 'Hiyerarşi', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Item Type */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-2">📦</span>
                  Öğe Tipi
                </h3>
                {item?.itemType ? (
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ad</span>
                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                        {getEntityName(item.itemType, currentLanguage)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Kod</span>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 font-mono bg-white dark:bg-gray-600 px-2 py-1 rounded">
                        {item.itemType.code}
                      </p>
                    </div>
                    {getEntityDescription(item.itemType, currentLanguage) && (
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Açıklama</span>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          {getEntityDescription(item.itemType, currentLanguage)}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">Bilgi bulunamadı</p>
                )}
              </div>

              {/* Category */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-2">📁</span>
                  Kategori
                </h3>
                {item?.category ? (
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ad</span>
                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                        {getEntityName(item.category, currentLanguage)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Kod</span>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 font-mono bg-white dark:bg-gray-600 px-2 py-1 rounded">
                        {item.category.code}
                      </p>
                    </div>
                    {getEntityDescription(item.category, currentLanguage) && (
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Açıklama</span>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          {getEntityDescription(item.category, currentLanguage)}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">Bilgi bulunamadı</p>
                )}
              </div>

              {/* Family */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-2">👥</span>
                  Aile
                </h3>
                {item?.family ? (
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ad</span>
                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                        {getEntityName(item.family, currentLanguage)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Kod</span>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 font-mono bg-white dark:bg-gray-600 px-2 py-1 rounded">
                        {item.family.code}
                      </p>
                    </div>
                    {getEntityDescription(item.family, currentLanguage) && (
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Açıklama</span>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          {getEntityDescription(item.family, currentLanguage)}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">Bilgi bulunamadı</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'attributes' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Öznitelikler
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {attributeGroups.reduce((total, group) => total + group.attributes.length, 0)} öznitelik
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              {attributeGroups.length > 0 ? (
                <div className="space-y-8">
                  {/* Group by source */}
                  {['itemType', 'category', 'family'].map(source => {
                    const sourceGroups = attributeGroups.filter(group => group.source === source);
                    if (sourceGroups.length === 0) return null;

                    return (
                      <div key={source} className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">
                            {source === 'itemType' ? '📦' : source === 'category' ? '📁' : '👥'}
                          </span>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {source === 'itemType' ? 'Öğe Tipi' : source === 'category' ? 'Kategori' : 'Aile'} Öznitelikleri
                          </h4>
                        </div>

                        {sourceGroups.map(group => (
                          <div key={group._id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="text-base font-medium text-gray-900 dark:text-white">
                                    {getEntityName(group, currentLanguage)}
                                  </h5>
                                  {getEntityDescription(group, currentLanguage) && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {getEntityDescription(group, currentLanguage)}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {group.sourceName}
                                  </span>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                    {group.attributes.length} öznitelik
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                              {group.attributes.map((attribute: any) => {
                                const value = formData.attributes?.[attribute._id];
                                const error = attributeErrors[attribute._id];

                                return (
                                  <div key={attribute._id} className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className="md:col-span-1">
                                        <div className="flex items-start space-x-3">
                                          <div className="flex-1">
                                            <label className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                                              {getEntityName(attribute, currentLanguage)}
                                              {attribute.isRequired && (
                                                <span className="text-red-500 ml-1">*</span>
                                              )}
                                            </label>
                                            {getEntityDescription(attribute, currentLanguage) && (
                                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {getEntityDescription(attribute, currentLanguage)}
                                              </p>
                                            )}
                                            <div className="flex items-center space-x-2 mt-2">
                                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                {attribute.type}
                                              </span>
                                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {attribute.code}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="md:col-span-2">
                                        {isEditing ? (
                                          <AttributeInput
                                            attribute={attribute}
                                            value={value}
                                            onChange={(newValue: any) => handleAttributeChange(attribute._id, newValue)}
                                            error={error}
                                            disabled={isSaving}
                                          />
                                        ) : (
                                          <div className="py-2">
                                            {renderAttributeValue(attribute, value)}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Öznitelik bulunamadı</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Bu öğe için tanımlanmış öznitelik bulunmuyor.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'hierarchy' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Hiyerarşi Bilgileri</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Hierarchy */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <span className="text-xl mr-2">📁</span>
                    Kategori Hiyerarşisi
                  </h4>
                  {item?.categoryHierarchy && item.categoryHierarchy.length > 0 ? (
                    <div className="space-y-2">
                      {item.categoryHierarchy.map((category: any, index: number) => (
                        <div key={category._id} className="flex items-center space-x-2">
                          <span className="text-gray-400">{index > 0 ? '└─' : ''}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {getEntityName(category, currentLanguage)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({category.code})
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">Hiyerarşi bilgisi yok</p>
                  )}
                </div>

                {/* Family Hierarchy */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <span className="text-xl mr-2">👥</span>
                    Aile Hiyerarşisi
                  </h4>
                  {item?.familyHierarchy && item.familyHierarchy.length > 0 ? (
                    <div className="space-y-2">
                      {item.familyHierarchy.map((family: any, index: number) => (
                        <div key={family._id} className="flex items-center space-x-2">
                          <span className="text-gray-400">{index > 0 ? '└─' : ''}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {getEntityName(family, currentLanguage)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({family.code})
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">Hiyerarşi bilgisi yok</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsPage; 