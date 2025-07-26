import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Breadcrumb from '../../../components/common/Breadcrumb';
import AttributeDisplay from '../../../components/attributes/AttributeDisplay';
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
            { label: item ? `#${item._id?.slice(-8)}` : 'Detaylar' }
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {item?.itemType ? getEntityName(item.itemType, currentLanguage) : 'Öğe Detayları'}
            </h1>
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
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Geçmiş
            </div>
          </button>
        </nav>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'details' && (
        <div className="space-y-6">
          {/* Ana Bilgiler */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sol Taraf - Temel Bilgiler */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Temel Bilgiler
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Durum</span>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          item?.isActive ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className={`text-sm font-medium ${
                          item?.isActive ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                        }`}>
                          {item?.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Öğe ID</span>
                      <span className="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        #{item?._id?.slice(-8)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Kategori</span>
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-2">
                          <span className="text-xs">📁</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item?.category ? getEntityName(item.category, currentLanguage) : 'Belirtilmemiş'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Aile</span>
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mr-2">
                          <span className="text-xs">👥</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item?.family ? getEntityName(item.family, currentLanguage) : 'Belirtilmemiş'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Açıklama</span>
                      <span className="text-sm text-gray-900 dark:text-white max-w-xs text-right">
                        {item?.description || 'Açıklama bulunmuyor'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sağ Taraf - Tarih ve Kullanıcı Bilgileri */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Tarih ve Kullanıcı Bilgileri
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Oluşturulma</span>
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-2">
                            <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Oluşturan</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item?.createdAt ? new Date(item.createdAt).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : '-'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item?.createdAt ? new Date(item.createdAt).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '-'}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-2">
                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Sistem</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">Son Güncelleme</span>
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-2">
                            <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </div>
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">Güncelleyen</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item?.updatedAt ? new Date(item.updatedAt).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : '-'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item?.updatedAt ? new Date(item.updatedAt).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '-'}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mr-2">
                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Sistem</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hiyerarşi Bilgileri */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <svg className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Hiyerarşi Bilgileri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Öğe Tipi */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-3">
                    <span className="text-lg">📦</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Öğe Tipi</h4>
                </div>
                {item?.itemType ? (
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Ad</span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getEntityName(item.itemType, currentLanguage)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Kod</span>
                      <p className="text-sm font-mono text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-600 px-2 py-1 rounded">
                        {item.itemType.code}
                      </p>
                    </div>
                    {getEntityDescription(item.itemType, currentLanguage) && (
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Açıklama</span>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {getEntityDescription(item.itemType, currentLanguage)}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Bilgi bulunamadı</p>
                )}
              </div>

              {/* Kategori */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-3">
                    <span className="text-lg">📁</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Kategori</h4>
                </div>
                {item?.category ? (
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Ad</span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getEntityName(item.category, currentLanguage)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Kod</span>
                      <p className="text-sm font-mono text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-600 px-2 py-1 rounded">
                        {item.category.code}
                      </p>
                    </div>
                    {getEntityDescription(item.category, currentLanguage) && (
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Açıklama</span>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {getEntityDescription(item.category, currentLanguage)}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Bilgi bulunamadı</p>
                )}
              </div>

              {/* Aile */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mr-3">
                    <span className="text-lg">👥</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Aile</h4>
                </div>
                {item?.family ? (
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Ad</span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getEntityName(item.family, currentLanguage)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Kod</span>
                      <p className="text-sm font-mono text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-600 px-2 py-1 rounded">
                        {item.family.code}
                      </p>
                    </div>
                    {getEntityDescription(item.family, currentLanguage) && (
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Açıklama</span>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {getEntityDescription(item.family, currentLanguage)}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Bilgi bulunamadı</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attributes' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Öznitelikler
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {attributeGroups.reduce((total, group) => total + group.attributes.length, 0)} öznitelik • {attributeGroups.length} grup
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
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
                    <div key={source} className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">
                          {source === 'itemType' ? 'Öğe Tipi' : source === 'category' ? 'Kategori' : 'Aile'} Öznitelikleri
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({sourceGroups.length} grup)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {sourceGroups.map(group => (
                          <div key={group._id} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                              <div className="flex items-center justify-between">
                                <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                  {getEntityName(group, currentLanguage)}
                                </h5>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {group.attributes.length} öznitelik
                                </span>
                              </div>
                              {getEntityDescription(group, currentLanguage) && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  {getEntityDescription(group, currentLanguage)}
                                </p>
                              )}
                            </div>

                            <div className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {group.attributes.map((attribute: any) => {
                                  const value = formData.attributes?.[attribute._id];
                                  const error = attributeErrors[attribute._id];

                                  return (
                                    <AttributeDisplay
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
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Öznitelik bulunamadı</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Bu öğe için tanımlanmış öznitelik bulunmuyor.
                </p>
              </div>
            )}
          </CardBody>
        </Card>
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
  );
};

export default ItemDetailsPage; 