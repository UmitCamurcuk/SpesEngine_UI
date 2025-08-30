import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { AttributeDetailDisplay } from '../../../components/attributes';
import itemService from '../../../services/api/itemService';
import { useTranslation } from '../../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../../utils/translationUtils';
import { toast } from 'react-hot-toast';
import { useNotification } from '../../../components/notifications';

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

const ItemDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentLanguage } = useTranslation();
  const { showModal } = useNotification();
  
  // State management
  const [activeTab, setActiveTab] = useState<string>('details');
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
        const itemData = await itemService.getItemById(id);
        
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
    
    // 2. Category attribute groups (including parent categories)
    if (item.categoryHierarchy) {
      item.categoryHierarchy.forEach((category: any) => {
        if (category.attributeGroups) {
          category.attributeGroups.forEach((group: any) => {
            if (group.attributes && group.attributes.length > 0) {
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
    
    // 3. Family attribute groups (including parent families)
    if (item.familyHierarchy) {
      item.familyHierarchy.forEach((family: any) => {
        if (family.attributeGroups) {
          family.attributeGroups.forEach((group: any) => {
            if (group.attributes && group.attributes.length > 0) {
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

  const attributeGroups = getAllAttributeGroups();

  // Handle attribute changes
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
      setAttributeErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[attributeId];
        return newErrors;
      });
    }
  };

  // Handle delete with confirmation
  const handleDeleteWithConfirmation = () => {
    showModal({
      type: 'error',
      title: 'Öğeyi Sil',
      message: 'Bu öğeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
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
    if (!item) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      console.log('💾 Saving item with data:', formData);
      await itemService.updateItem(item._id, formData);
      
      toast.success('Öğe başarıyla güncellendi');
      setIsEditing(false);
      
      // Refresh data
      const updatedItem = await itemService.getItemById(item._id);
      setItem(updatedItem);
      setFormData({
        ...updatedItem,
        attributes: updatedItem.attributes || {}
      });
    } catch (err: any) {
      console.error('❌ Error updating item:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Öğe güncellenirken bir hata oluştu';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!item) return;
    
    try {
      await itemService.deleteItem(item._id);
      toast.success('Öğe başarıyla silindi');
      navigate('/items/list');
    } catch (err: any) {
      console.error('❌ Error deleting item:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Öğe silinirken bir hata oluştu';
      toast.error(errorMessage);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Öğe yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !item) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Hata Oluştu</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <div className="space-x-3">
            <Button onClick={() => window.location.reload()} variant="primary">
              Tekrar Dene
            </Button>
            <Button onClick={() => navigate('/items/list')} variant="secondary">
              Listeye Dön
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Öğe Bulunamadı</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Aradığınız öğe mevcut değil veya silinmiş olabilir.</p>
          <Button onClick={() => navigate('/items/list')} variant="primary">
            Listeye Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="container mx-auto px-4">
        {/* BREADCRUMB */}
        <div className="flex items-center justify-between">
          <Breadcrumb 
            items={[
              { label: 'Öğeler', path: '/items/list' },
              { label: getEntityName(item.itemType, currentLanguage) || 'Öğe Detayı' }
            ]} 
          />
        </div>

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <Link to="/items/list" className="mr-4">
              <Button variant="outline" size="sm" className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Geri
              </Button>
            </Link>
            <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/50 
                           flex items-center justify-center mr-3">
              <svg className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getEntityName(item.itemType, currentLanguage)}
              </h1>
              <div className="flex items-center mt-1">
                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                  {item.code}
                </span>
                <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                  item.isActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {item.isActive ? 'Aktif' : 'Pasif'}
                </div>
                {item?.itemType && (
                  <>
                    <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {getEntityName(item.itemType, currentLanguage)}
                    </span>
                  </>
                )}
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
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{isSaving ? 'Kaydediliyor...' : 'Kaydet'}</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  JSON Görüntüle
                </Button>
                <Button
                  variant="primary"
                  className="flex items-center"
                  onClick={() => setIsEditing(true)}
                >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Düzenle
                </Button>
                <Button
                  variant="secondary"
                  className="flex items-center text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
                  onClick={handleDeleteWithConfirmation}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">JSON Önizleme</h2>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center"
              onClick={() => navigator.clipboard.writeText(JSON.stringify(item, null, 2))}
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Kopyala
            </Button>
          </CardHeader>
          <CardBody>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{JSON.stringify(item, null, 2)}</code>
            </pre>
          </CardBody>
        </Card>
      )}

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
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Genel Bilgiler
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
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Öznitelikler
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
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Hiyerarşi
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
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Geçmiş
              </div>
            </button>
          </nav>
        </div>

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
                      <p className="mt-2 text-gray-900 dark:text-gray-100">
                        {item.description || 'Bu öğe için açıklama bulunmuyor.'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Durum</h3>
                        <div className="mt-2 flex items-center">
                          <div className={`h-4 w-4 rounded-full mr-2 ${
                            item.isActive 
                              ? 'bg-green-500' 
                              : 'bg-red-500'
                          }`}></div>
                          <span className="text-gray-900 dark:text-gray-100">
                            {item.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Öğe Tipi</h3>
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                            {item?.itemType ? getEntityName(item.itemType, currentLanguage) : 'Belirtilmemiş'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Oluşturulma</h3>
                        <p className="mt-2 text-gray-900 dark:text-gray-100">
                          {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Son Güncelleme</h3>
                        <p className="mt-2 text-gray-900 dark:text-gray-100">
                          {new Date(item.updatedAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Hiyerarşi Bilgileri</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {item?.itemType ? getEntityName(item.itemType, currentLanguage) : 'Öğe Tipi Belirtilmemiş'}
                          </span>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {item?.category ? getEntityName(item.category, currentLanguage) : 'Kategori Belirtilmemiş'}
                          </span>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <svg className="h-4 w-4 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {item?.family ? getEntityName(item.family, currentLanguage) : 'Aile Belirtilmemiş'}
                          </span>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <svg className="h-4 w-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {attributeGroups.reduce((total, group) => total + group.attributes.length, 0)} Öznitelik
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Temel Bilgiler</h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Kod</h3>
                      <p className="mt-1 text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {item.code}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Durum</h3>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        }`}>
                          {item.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Oluşturulma</h3>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Son Güncelleme</h3>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {new Date(item.updatedAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'attributes' && (
          <div className="space-y-6">

            <div>
              {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                  </div>
                </div>
              )}

              {attributeGroups.length > 0 ? (
                <div className="space-y-6">
                  {/* Group by source */}
                  {['itemType', 'category', 'family'].map(source => {
                    const sourceGroups = attributeGroups.filter(group => group.source === source);
                    if (sourceGroups.length === 0) return null;

                    return (
                      <div key={source} className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {source === 'itemType' ? 'Öğe Tipi Öznitelikleri' : 
                             source === 'category' ? 'Kategori Öznitelikleri' : 
                             'Aile Öznitelikleri'}
                          </h3>
                        </div>
                        <div className="p-6">
                          <div className="space-y-6">
                            {sourceGroups.map(group => (
                              <div key={group._id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                {/* Group Header */}
                                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="text-base font-medium text-gray-900 dark:text-white">
                                        {getEntityName(group, currentLanguage)}
                                      </h4>
                                      {getEntityDescription(group, currentLanguage) && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                          {getEntityDescription(group, currentLanguage)}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300">
                                        {group.attributes.length} öznitelik
                                      </span>
                                      <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                        {group.code}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Attributes */}
                                <div className="p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {group.attributes.map((attribute: any) => {
                                      const value = formData.attributes?.[attribute._id];
                                      const error = attributeErrors[attribute._id];

                                      return (
                                        <AttributeDetailDisplay
                                          key={attribute._id}
                                          attribute={attribute}
                                          value={value}
                                          isEditing={isEditing}
                                          onChange={(newValue: any) => handleAttributeChange(attribute._id, newValue)}
                                          error={error}
                                          disabled={isSaving}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                  <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Henüz öznitelik yok</h3>
                    <p className="text-gray-500 dark:text-gray-400">Bu öğe için tanımlanmış öznitelik bulunmuyor.</p>
                  </div>
                </div>
              )}
            </div>
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

        {activeTab === 'history' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Geçmiş</h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <p className="text-gray-500 dark:text-gray-400">Geçmiş bilgileri burada gösterilecek.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetailsPage; 