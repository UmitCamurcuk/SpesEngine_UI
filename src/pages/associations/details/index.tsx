import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useNotification } from '../../../components/notifications';
import { IAssociation } from '../../../types/association';
import Breadcrumb from '../../../components/common/Breadcrumb';
import associationService from '../../../services/api/associationService';
import itemTypeService from '../../../services/api/itemTypeService';
import categoryService from '../../../services/api/categoryService';
import familyService from '../../../services/api/familyService';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { useTranslation } from '../../../context/i18nContext';
import { getEntityName } from '../../../utils/translationUtils';
import UserInfoCell from '../../../components/common/UserInfoCell';
import { APITab, DocumentationTab, PermissionsTab, StatisticsTab } from '../../../components/common';
import Modal from '../../../components/ui/Modal';
import DragDropColumn from '../../../components/ui/DragDropColumn';

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

const AssociationDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t, currentLanguage } = useTranslation();
  const { showModal, showToast } = useNotification();
  
  // State management
  const [activeTab, setActiveTab] = useState<string>('details');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showJsonPreview, setShowJsonPreview] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showCommentModal, setShowCommentModal] = useState<boolean>(false);
  const [comment, setComment] = useState<string>('');
  
  // Data state
  const [association, setRelationshipType] = useState<IAssociation | null>(null);
  const [editableFields, setEditableFields] = useState<Partial<IAssociation>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Display config state
  const [sourceItemTypeAttributes, setSourceItemTypeAttributes] = useState<any[]>([]);
  const [targetItemTypeAttributes, setTargetItemTypeAttributes] = useState<any[]>([]);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [editableDisplayConfig, setEditableDisplayConfig] = useState<any>(null);

  // Fetch attributes for ItemTypes
  const fetchItemTypeAttributes = async (associationData: IAssociation) => {
    setIsLoadingAttributes(true);
    try {
      // allowedSourceTypes ve allowedTargetTypes artık populate edilmiş objeler içeriyor
      // Bu objelerden ID'leri çıkarmamız gerekiyor
      const sourceTypeId = typeof associationData.allowedSourceTypes[0] === 'string' 
        ? associationData.allowedSourceTypes[0] 
        : (associationData.allowedSourceTypes[0] as any)?._id;
      const targetTypeId = typeof associationData.allowedTargetTypes[0] === 'string' 
        ? associationData.allowedTargetTypes[0] 
        : (associationData.allowedTargetTypes[0] as any)?._id;
      

      
      // Helper function to fetch all attributes for an ItemType (including category and family attributes)
      const fetchAllAttributes = async (itemType: any) => {
        const allAttrs = [];
        
        // Add default attributes
        allAttrs.push(
          { id: 'category', name: 'Kategori', type: 'text', group: 'default' },
          { id: 'family', name: 'Aile', type: 'text', group: 'default' },
          { id: 'createdAt', name: 'Oluşturulma Tarihi', type: 'date', group: 'default' }
        );
        
        // Add ItemType's own attributes
        if (itemType.attributeGroups) {
          itemType.attributeGroups.forEach((group: any) => {
            if (group.attributes) {
              group.attributes.forEach((attr: any) => {
                allAttrs.push({
                  id: (attr as any)._id,
                  name: attr.name?.translations?.tr || attr.name?.translations?.en || attr.code,
                  type: attr.type || 'text',
                  group: 'itemType'
                });
              });
            }
          });
        }
        
        // Add Category attributes if ItemType has a category
        if (itemType.category) {
          try {
            // itemType.category artık populate edilmiş bir obje, ID değil
            const category = typeof itemType.category === 'string' 
              ? await categoryService.getCategoryById(itemType.category)
              : itemType.category;
            
            // Helper function to extract attributes from category and its subcategories
            const extractCategoryAttributes = (cat: any, prefix: string = '') => {
              // Add main category attributes
              if (cat.attributeGroups) {
                cat.attributeGroups.forEach((group: any) => {
                  if (group.attributes) {
                    group.attributes.forEach((attr: any) => {
                      allAttrs.push({
                        id: (attr as any)._id,
                        name: `${prefix}[Kategori] ${attr.name?.translations?.tr || attr.name?.translations?.en || attr.code}`,
                        type: attr.type || 'text',
                        group: 'category'
                      });
                    });
                  }
                });
              }
              
              // Add subcategory attributes
              if (cat.subcategories) {
                cat.subcategories.forEach((subcat: any) => {
                  if (subcat.attributeGroups) {
                    subcat.attributeGroups.forEach((group: any) => {
                      if (group.attributes) {
                        group.attributes.forEach((attr: any) => {
                          allAttrs.push({
                            id: (attr as any)._id,
                            name: `${prefix}[Kategori - ${subcat.name?.translations?.tr || subcat.name?.translations?.en || subcat.code}] ${attr.name?.translations?.tr || attr.name?.translations?.en || attr.code}`,
                            type: attr.type || 'text',
                            group: 'category'
                          });
                        });
                      }
                    });
                  }
                  
                  // Recursively check subcategories of subcategories
                  if (subcat.subcategories) {
                    extractCategoryAttributes(subcat, `${prefix}  `);
                  }
                });
              }
            };
            
            extractCategoryAttributes(category);
          } catch (error) {
            console.error('❌ Error fetching category attributes:', error);
          }
        }
        
        // Note: ItemType model'inde family alanı yok, sadece category var
        // Family attribute'ları için ayrı bir implementasyon gerekebilir
        
        return allAttrs;
      };
      
      // Fetch source ItemType attributes
      if (sourceTypeId) {
        try {
          const sourceItemType = await itemTypeService.getItemTypeById(sourceTypeId);
          const sourceAttrs = await fetchAllAttributes(sourceItemType);
          setSourceItemTypeAttributes(sourceAttrs);
        } catch (error) {
          console.error('❌ Error fetching source attributes:', error);
        }
      }
      
      // Fetch target ItemType attributes
      if (targetTypeId) {
        try {
          const targetItemType = await itemTypeService.getItemTypeById(targetTypeId);
          const targetAttrs = await fetchAllAttributes(targetItemType);
          setTargetItemTypeAttributes(targetAttrs);
        } catch (error) {
          console.error('❌ Error fetching target attributes:', error);
        }
      }
    } catch (error) {
      console.error('❌ Error in fetchItemTypeAttributes:', error);
    } finally {
      setIsLoadingAttributes(false);
    }
  };

  // Update display config and mark as changed
  const updateDisplayConfig = (newDisplayConfig: any) => {
    setEditableDisplayConfig(newDisplayConfig);
    setEditableFields(prev => ({
      ...prev,
      displayConfig: newDisplayConfig
    }));
  };

  // Move columns (drag and drop)
  const moveColumn = (direction: 'sourceToTarget' | 'targetToSource', fromIndex: number, toIndex: number) => {
    const newDisplayConfig = { ...editableDisplayConfig };
    const columns = [...newDisplayConfig[direction].columns];
    const [moved] = columns.splice(fromIndex, 1);
    columns.splice(toIndex, 0, moved);
    
    // Update order numbers
    columns.forEach((col, index) => {
      col.order = index + 1;
    });
    
    newDisplayConfig[direction] = {
      ...newDisplayConfig[direction],
      columns
    };
    
    updateDisplayConfig(newDisplayConfig);
  };



  // Load relationship type data
  useEffect(() => {
    const fetchRelationshipTypeDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await associationService.getAssociationById(id);
        
        setRelationshipType(data);
        
        // Initialize display config
        const defaultDisplayConfig = {
          sourceToTarget: {
            enabled: false,
            columns: [],
            defaultSortBy: 'createdAt',
            defaultSortOrder: 'desc',
            pageSize: 10,
            showSearch: true,
            searchableColumns: []
          },
          targetToSource: {
            enabled: false,
            columns: [],
            defaultSortBy: 'createdAt',
            defaultSortOrder: 'desc',
            pageSize: 10,
            showSearch: true,
            searchableColumns: []
          }
        };
        
        const displayConfig = data.displayConfig || defaultDisplayConfig;
        setEditableDisplayConfig(displayConfig);
        
        // Initialize editable fields including displayConfig
        setEditableFields({
          code: data.code || '',
          name: data.name || '',
          description: data.description || '',
          isDirectional: data.isDirectional ?? true,
          association: data.association || 'one-to-many',
          allowedSourceTypes: data.allowedSourceTypes || [],
          allowedTargetTypes: data.allowedTargetTypes || [],
          displayConfig: displayConfig
        });
        
        // Fetch attributes for both ItemTypes
        await fetchItemTypeAttributes(data);
      } catch (err: any) {
        console.error('❌ Error fetching relationship type:', err);
        setError('İlişki tipi verileri yüklenirken bir hata oluştu: ' + (err.message || err));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRelationshipTypeDetails();
  }, [id]);

  // Handle delete with confirmation
  const handleDeleteWithConfirmation = () => {
    showModal({
      type: 'error',
      title: 'İlişki Tipini Sil',
      message: 'Bu ilişki tipini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm ilgili ilişkiler de silinecektir.',
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

  // Handle delete
  const handleDelete = async () => {
    if (!association) return;
    
    try {
      await associationService.deleteAssociation(association._id);
      showToast({
        title: 'Başarılı!',
        message: 'İlişki tipi başarıyla silindi',
        type: 'success'
      });
      navigate('/associations');
    } catch (err: any) {
      console.error('❌ Error deleting relationship type:', err);
      const errorMessage = err.response?.data?.message || err.message || 'İlişki tipi silinirken bir hata oluştu';
      showToast({
        title: 'Hata!',
        message: errorMessage,
        type: 'error'
      });
    }
  };

  // Edit functions
  const hasChanges = () => {
    if (!association) return false;
    return (
      editableFields.name !== association.name ||
      editableFields.description !== association.description ||
      editableFields.isDirectional !== association.isDirectional ||
      editableFields.association !== association.association ||
      JSON.stringify(editableFields.displayConfig) !== JSON.stringify(association.displayConfig)
    );
  };

  const getChangeDetails = () => {
    if (!association) return [];
    const changes = [];
    
    if (editableFields.name !== association.name) {
      changes.push(`İsim: "${getEntityName(association, currentLanguage)}" → "${editableFields.name}"`);
    }
    if (editableFields.description !== association.description) {
      changes.push(`Açıklama değiştirildi`);
    }
    if (editableFields.isDirectional !== association.isDirectional) {
      changes.push(`Yönlülük: ${association.isDirectional ? 'Yönlü' : 'Çift Yönlü'} → ${editableFields.isDirectional ? 'Yönlü' : 'Çift Yönlü'}`);
    }
    if (editableFields.association !== association.association) {
      changes.push(`İlişki Tipi: ${association.association} → ${editableFields.association}`);
    }
    
    // Display config changes
    const currentDisplayConfig = JSON.stringify(association.displayConfig || {});
    const newDisplayConfig = JSON.stringify(editableFields.displayConfig || {});
    if (currentDisplayConfig !== newDisplayConfig) {
      const sourceChanges = editableFields.displayConfig?.sourceToTarget?.columns?.length || 0;
      const targetChanges = editableFields.displayConfig?.targetToSource?.columns?.length || 0;
      
      if (sourceChanges > 0 || targetChanges > 0) {
        changes.push(`Görünüm ayarları güncellendi:`);
        if (sourceChanges > 0) {
          const sourceType = typeof association.allowedSourceTypes?.[0] === 'string' 
            ? association.allowedSourceTypes[0] 
            : (association.allowedSourceTypes[0] as any)?.code || (association.allowedSourceTypes[0] as any)?.name || association.allowedSourceTypes[0]?._id;
          const targetType = typeof association.allowedTargetTypes?.[0] === 'string' 
            ? association.allowedTargetTypes[0] 
            : (association.allowedTargetTypes[0] as any)?.code || (association.allowedTargetTypes[0] as any)?.name || association.allowedTargetTypes[0]?._id;
          changes.push(`  • ${sourceType} → ${targetType}: ${sourceChanges} sütun`);
        }
        if (targetChanges > 0) {
          const targetType = typeof association.allowedTargetTypes?.[0] === 'string' 
            ? association.allowedTargetTypes[0] 
            : (association.allowedTargetTypes[0] as any)?.code || (association.allowedTargetTypes[0] as any)?.name || association.allowedTargetTypes[0]?._id;
          const sourceType = typeof association.allowedSourceTypes?.[0] === 'string' 
            ? association.allowedSourceTypes[0] 
            : (association.allowedSourceTypes[0] as any)?.code || (association.allowedSourceTypes[0] as any)?.name || association.allowedSourceTypes[0]?._id;
          changes.push(`  • ${targetType} → ${sourceType}: ${targetChanges} sütun`);
        }
      } else {
        changes.push(`Görünüm ayarları sıfırlandı`);
      }
    }
    
    return changes;
  };

  const handleEditClick = () => {
    if (!association) return;
    
    setEditableFields({
      name: association.name,
      description: association.description,
      isDirectional: association.isDirectional,
      association: association.association,
      displayConfig: association.displayConfig || editableDisplayConfig
    });
    setFormErrors({});
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!association || !hasChanges()) return;
    
    setShowCommentModal(true);
  };

  const handleSaveWithComment = async () => {
    if (!association) return;
    
    setIsSaving(true);
    try {
      const updatedData = await associationService.updateAssociation(association._id, {
        ...editableFields
      });
      
      setRelationshipType(updatedData);
      setIsEditing(false);
      setShowCommentModal(false);
      setComment('');
      setFormErrors({});
      
      showToast({
        title: 'Başarılı!',
        message: 'İlişki tipi başarıyla güncellendi',
        type: 'success'
      });
    } catch (err: any) {
      console.error('❌ Error updating relationship type:', err);
      const errorMessage = err.response?.data?.message || err.message || 'İlişki tipi güncellenirken bir hata oluştu';
      showToast({
        title: 'Hata!',
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setEditableFields(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!editableFields.name) {
      errors.name = 'İsim gereklidir';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">İlişki tipi yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !association) {
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
            <Button onClick={() => navigate('/associations')} variant="secondary">
              Listeye Dön
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!association) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">İlişki Tipi Bulunamadı</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Aradığınız ilişki tipi mevcut değil veya silinmiş olabilir.</p>
                      <Button onClick={() => navigate('/associations')} variant="primary">
              Listeye Dön
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* BREADCRUMB */}
        <div className="mb-6">
          <Breadcrumb 
            items={[
              { label: t('home'), path: '/' },
              { label: t('relationships'), path: '/associations' },
              { label: getEntityName(association, currentLanguage) || 'İlişki Tipi Detayı' }
            ]} 
          />
        </div>

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center">
            <Link to="/associations" className="mr-4">
              <Button variant="outline" size="sm" className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t('back_button', 'common')}
              </Button>
            </Link>
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-3 ${
              association.isDirectional
                ? 'bg-green-100 dark:bg-green-900/50'
                : 'bg-purple-100 dark:bg-purple-900/50'
            }`}>
              {association.isDirectional ? (
                <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              )}
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
                    placeholder={t('name')}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.name}</p>
                  )}
                </div>
              ) : (
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getEntityName(association, currentLanguage)}
                </h1>
              )}
              <div className="flex items-center mt-1">
                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                  {association.code}
                </span>
                <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                <Badge color={association.isDirectional ? 'success' : 'secondary'}>
                  {association.isDirectional ? t('directional') : t('bidirectional')}
                </Badge>
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
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{t('save', 'common')}</span>
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
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  {t('view_json')}
                </Button>
                <Button
                  variant="primary"
                  className="flex items-center"
                  onClick={handleEditClick}
                >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  {t('edit', 'common')}
                </Button>
                <Button
                  variant="secondary"
                  className="flex items-center text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
                  onClick={handleDeleteWithConfirmation}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {t('general_info')}
              </div>
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'configuration'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveTab('configuration')}
            >
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t('configuration')}
              </div>
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'display'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveTab('display')}
            >
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7zm16 0v1H5V7m14 0V6a1 1 0 00-1-1h-1m1 2v1M5 7V6a1 1 0 011-1h1m-2 2v1" />
                </svg>
                Görünüm Ayarları
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
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                API
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
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t('documentation')}
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
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {t('permissions')}
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
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {t('statistics')}
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
                        {getEntityName({ name: association.description }, currentLanguage) || 'Bu ilişki tipi için açıklama bulunmuyor.'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Yönlülük</h3>
                        <div className="mt-2 flex items-center">
                          <div className={`h-4 w-4 rounded-full mr-2 ${
                            association.isDirectional 
                              ? 'bg-green-500' 
                              : 'bg-purple-500'
                          }`}></div>
                          <span className="text-gray-900 dark:text-gray-100">
                            {association.isDirectional ? 'Yönlü İlişki' : 'Çift Yönlü İlişki'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Oluşturulma</h3>
                        <p className="mt-2 text-gray-900 dark:text-gray-100">
                          {dayjs(association.createdAt).format('DD MMMM YYYY')}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Son Güncelleme</h3>
                        <p className="mt-2 text-gray-900 dark:text-gray-100">
                          {dayjs(association.updatedAt).format('DD MMMM YYYY')}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Oluşturan</h3>
                        <div className="mt-2">
                          <UserInfoCell 
                            user={association.createdBy} 
                            date={association.createdAt} 
                            type="created" 
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Güncelleyen</h3>
                        <div className="mt-2">
                          <UserInfoCell 
                            user={association.updatedBy} 
                            date={association.updatedAt} 
                            type="updated" 
                          />
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
                        {association.code}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tip</h3>
                      <div className="mt-1">
                        <Badge color={association.isDirectional ? 'success' : 'secondary'}>
                          {association.isDirectional ? 'Yönlü' : 'Çift Yönlü'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Oluşturulma</h3>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {dayjs(association.createdAt).format('DD MMMM YYYY')}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Son Güncelleme</h3>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {dayjs(association.updatedAt).format('DD MMMM YYYY')}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* JSON Preview */}
              {showJsonPreview && (
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">JSON Önizleme</h2>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center"
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(association, null, 2))}
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Kopyala
                    </Button>
                  </CardHeader>
                  <CardBody>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <code>{JSON.stringify(association, null, 2)}</code>
                    </pre>
                  </CardBody>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT - CONFIGURATION */}
        {activeTab === 'configuration' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Allowed Source Types */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Kaynak Varlık Tipleri
                    {association.isDirectional && (
                      <span className="text-sm text-gray-500 ml-2">(İlişkiyi başlatan)</span>
                    )}
                  </h3>
                </CardHeader>
                <CardBody>
                  {association.allowedSourceTypes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {association.allowedSourceTypes.map((type, index) => (
                        <Badge key={index} color="light">
                          {typeof type === 'string' ? type : (type as any).code || (type as any).name || type._id}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      Hiç kaynak tip tanımlanmamış
                    </p>
                  )}
                </CardBody>
              </Card>

              {/* Allowed Target Types */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Hedef Varlık Tipleri
                    {association.isDirectional && (
                      <span className="text-sm text-gray-500 ml-2">(İlişkinin hedefi)</span>
                    )}
                  </h3>
                </CardHeader>
                <CardBody>
                  {association.allowedTargetTypes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {association.allowedTargetTypes.map((type, index) => (
                        <Badge key={index} color="light">
                          {typeof type === 'string' ? type : (type as any).code || (type as any).name || type._id}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      Hiç hedef tip tanımlanmamış
                    </p>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Metadata */}
            {association.metadata && Object.keys(association.metadata).length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Metadata</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {Object.entries(association.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{key}:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Relationship Direction Visualization */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">İlişki Görselleştirmesi</h3>
              </CardHeader>
              <CardBody>
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Kaynak</span>
                    </div>
                    
                    <div className="flex items-center">
                      {association.isDirectional ? (
                        <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      )}
                    </div>
                    
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">Hedef</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {association.isDirectional 
                      ? 'Bu ilişki yönlüdür - sadece kaynaktan hedefe doğru çalışır'
                      : 'Bu ilişki çift yönlüdür - her iki yönde de çalışır'
                    }
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* TAB CONTENT - DISPLAY CONFIG */}
        {activeTab === 'display' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Görünüm Ayarları
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  İlişki seçimlerinde gösterilecek sütunları ve görünüm ayarlarını yapılandırın.
                </p>
              </CardHeader>
              <CardBody>
                {isLoadingAttributes ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-sm text-gray-500">Öznitelikler yükleniyor...</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Source to Target Configuration */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-medium text-gray-900 dark:text-white">
                            {typeof association.allowedSourceTypes?.[0] === 'string' 
                              ? association.allowedSourceTypes[0] 
                              : (association.allowedSourceTypes[0] as any)?.code || (association.allowedSourceTypes[0] as any)?.name || association.allowedSourceTypes[0]?._id
                            } → {typeof association.allowedTargetTypes?.[0] === 'string' 
                              ? association.allowedTargetTypes[0] 
                              : (association.allowedTargetTypes[0] as any)?.code || (association.allowedTargetTypes[0] as any)?.name || association.allowedTargetTypes[0]?._id
                            }
                          </h3>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editableDisplayConfig?.sourceToTarget?.enabled || false}
                              disabled={!isEditing}
                              onChange={(e) => updateDisplayConfig({
                                ...editableDisplayConfig,
                                sourceToTarget: {
                                  ...editableDisplayConfig.sourceToTarget,
                                  enabled: e.target.checked
                                }
                              })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Etkinleştir</span>
                          </label>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {typeof association.allowedSourceTypes?.[0] === 'string' 
                              ? association.allowedSourceTypes[0] 
                              : (association.allowedSourceTypes[0] as any)?.code || (association.allowedSourceTypes[0] as any)?.name || association.allowedSourceTypes[0]?._id
                            } seçerken gösterilecek {typeof association.allowedTargetTypes?.[0] === 'string' 
                              ? association.allowedTargetTypes[0] 
                              : (association.allowedTargetTypes[0] as any)?.code || (association.allowedTargetTypes[0] as any)?.name || association.allowedTargetTypes[0]?._id
                            } sütunları:
                          </p>
                          
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              Mevcut Öznitelikler ({targetItemTypeAttributes.length})
                            </h4>
                            
                            {targetItemTypeAttributes.map((attr, index) => {
                              const isSelected = editableDisplayConfig?.sourceToTarget?.columns?.some(col => col.attributeId === attr.id);
                              return (
                                <label key={attr.id} className={`flex items-center p-2 rounded border ${
                                  !isEditing 
                                    ? 'bg-gray-50 dark:bg-gray-800 opacity-60' 
                                    : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                                }`}>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={!isEditing}
                                    onChange={(e) => {
                                      if (!isEditing) return;
                                      
                                      const currentColumns = editableDisplayConfig?.sourceToTarget?.columns || [];
                                      let newColumns;
                                      
                                      if (e.target.checked) {
                                        // Add column with order
                                        newColumns = [...currentColumns, {
                                          attributeId: attr.id,
                                          displayName: attr.name,
                                          width: 150,
                                          sortable: true,
                                          filterable: true,
                                          isRequired: false,
                                          formatType: attr.type === 'date' ? 'date' : 'text',
                                          order: currentColumns.length + 1
                                        }];
                                      } else {
                                        // Remove column
                                        newColumns = currentColumns.filter(col => col.attributeId !== attr.id);
                                        // Re-order remaining columns
                                        newColumns.forEach((col, index) => {
                                          col.order = index + 1;
                                        });
                                      }
                                      
                                      updateDisplayConfig({
                                        ...editableDisplayConfig,
                                        sourceToTarget: {
                                          ...editableDisplayConfig.sourceToTarget,
                                          columns: newColumns
                                        }
                                      });
                                    }}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                                  />
                                  <div className="ml-3">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{attr.name}</span>
                                    <span className="text-xs text-gray-500 ml-2">({attr.type})</span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                          
                          {/* Selected Columns - Drag & Drop Area */}
                          {editableDisplayConfig?.sourceToTarget?.columns && editableDisplayConfig.sourceToTarget.columns.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                Seçili Sütunlar ({editableDisplayConfig.sourceToTarget.columns.length})
                              </h4>
                              <div className="space-y-2">
                                {editableDisplayConfig.sourceToTarget.columns
                                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                                  .map((column, index) => (
                                    <DragDropColumn
                                      key={column.attributeId}
                                      column={column}
                                      index={index}
                                      onMove={(fromIndex, toIndex) => moveColumn('sourceToTarget', fromIndex, toIndex)}
                                      onRemove={(index) => {
                                        const newColumns = editableDisplayConfig.sourceToTarget.columns.filter((_, i) => i !== index);
                                        // Re-order remaining columns
                                        newColumns.forEach((col, i) => {
                                          col.order = i + 1;
                                        });
                                        updateDisplayConfig({
                                          ...editableDisplayConfig,
                                          sourceToTarget: {
                                            ...editableDisplayConfig.sourceToTarget,
                                            columns: newColumns
                                          }
                                        });
                                      }}
                                      disabled={!isEditing}
                                    />
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Target to Source Configuration */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-medium text-gray-900 dark:text-white">
                            {typeof association.allowedTargetTypes?.[0] === 'string' 
                              ? association.allowedTargetTypes[0] 
                              : (association.allowedTargetTypes[0] as any)?.code || (association.allowedTargetTypes[0] as any)?.name || association.allowedTargetTypes[0]?._id
                            } → {typeof association.allowedSourceTypes?.[0] === 'string' 
                              ? association.allowedSourceTypes[0] 
                              : (association.allowedSourceTypes[0] as any)?.code || (association.allowedSourceTypes[0] as any)?.name || association.allowedSourceTypes[0]?._id
                            }
                          </h3>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editableDisplayConfig?.targetToSource?.enabled || false}
                              disabled={!isEditing}
                              onChange={(e) => updateDisplayConfig({
                                ...editableDisplayConfig,
                                targetToSource: {
                                  ...editableDisplayConfig.targetToSource,
                                  enabled: e.target.checked
                                }
                              })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Etkinleştir</span>
                          </label>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {typeof association.allowedTargetTypes?.[0] === 'string' 
                              ? association.allowedTargetTypes[0] 
                              : (association.allowedTargetTypes[0] as any)?.code || (association.allowedTargetTypes[0] as any)?.name || association.allowedTargetTypes[0]?._id
                            } seçerken gösterilecek {typeof association.allowedSourceTypes?.[0] === 'string' 
                              ? association.allowedSourceTypes[0] 
                              : (association.allowedSourceTypes[0] as any)?.code || (association.allowedSourceTypes[0] as any)?.name || association.allowedSourceTypes[0]?._id
                            } sütunları:
                          </p>
                          
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              Mevcut Öznitelikler ({sourceItemTypeAttributes.length})
                            </h4>
                            
                            {sourceItemTypeAttributes.map((attr, index) => {
                              const isSelected = editableDisplayConfig?.targetToSource?.columns?.some(col => col.attributeId === attr.id);
                              return (
                                <label key={attr.id} className={`flex items-center p-2 rounded border ${
                                  !isEditing 
                                    ? 'bg-gray-50 dark:bg-gray-800 opacity-60' 
                                    : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                                }`}>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={!isEditing}
                                    onChange={(e) => {
                                      if (!isEditing) return;
                                      
                                      const currentColumns = editableDisplayConfig?.targetToSource?.columns || [];
                                      let newColumns;
                                      
                                      if (e.target.checked) {
                                        // Add column with order
                                        newColumns = [...currentColumns, {
                                          attributeId: attr.id,
                                          displayName: attr.name,
                                          width: 150,
                                          sortable: true,
                                          filterable: true,
                                          isRequired: false,
                                          formatType: attr.type === 'date' ? 'date' : 'text',
                                          order: currentColumns.length + 1
                                        }];
                                      } else {
                                        // Remove column
                                        newColumns = currentColumns.filter(col => col.attributeId !== attr.id);
                                        // Re-order remaining columns
                                        newColumns.forEach((col, index) => {
                                          col.order = index + 1;
                                        });
                                      }
                                      
                                      updateDisplayConfig({
                                        ...editableDisplayConfig,
                                        targetToSource: {
                                          ...editableDisplayConfig.targetToSource,
                                          columns: newColumns
                                        }
                                      });
                                    }}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                                  />
                                  <div className="ml-3">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{attr.name}</span>
                                    <span className="text-xs text-gray-500 ml-2">({attr.type})</span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                          
                          {/* Selected Columns - Drag & Drop Area */}
                          {editableDisplayConfig?.targetToSource?.columns && editableDisplayConfig.targetToSource.columns.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                Seçili Sütunlar ({editableDisplayConfig.targetToSource.columns.length})
                              </h4>
                              <div className="space-y-2">
                                {editableDisplayConfig.targetToSource.columns
                                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                                  .map((column, index) => (
                                    <DragDropColumn
                                      key={column.attributeId}
                                      column={column}
                                      index={index}
                                      onMove={(fromIndex, toIndex) => moveColumn('targetToSource', fromIndex, toIndex)}
                                      onRemove={(index) => {
                                        const newColumns = editableDisplayConfig.targetToSource.columns.filter((_, i) => i !== index);
                                        // Re-order remaining columns
                                        newColumns.forEach((col, i) => {
                                          col.order = i + 1;
                                        });
                                        updateDisplayConfig({
                                          ...editableDisplayConfig,
                                          targetToSource: {
                                            ...editableDisplayConfig.targetToSource,
                                            columns: newColumns
                                          }
                                        });
                                      }}
                                      disabled={!isEditing}
                                    />
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {!isEditing && (
                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          💡 Görünüm ayarlarını değiştirmek için <strong>Düzenle</strong> butonuna tıklayın.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* JSON Preview */}
                {association.displayConfig && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Display Config JSON:
                    </h4>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-xs overflow-auto">
                      {JSON.stringify(association.displayConfig, null, 2)}
                    </pre>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}

        {/* TAB CONTENT - API */}
        {activeTab === 'api' && (
          <APITab
            entityType="relationship_type"
            entityId={association._id}
          />
        )}

        {/* TAB CONTENT - DOCUMENTATION */}
        {activeTab === 'documentation' && (
          <DocumentationTab
            entityType="relationship_type"
            entityName={getEntityName(association, currentLanguage)}
          />
        )}

        {/* TAB CONTENT - PERMISSIONS */}
        {activeTab === 'permissions' && (
          <PermissionsTab
            entityType="relationship_type"
            entityId={association._id}
          />
        )}

        {/* TAB CONTENT - STATISTICS */}
        {activeTab === 'statistics' && (
          <StatisticsTab
            entityType="relationship_type"
            entityId={association._id}
          />
        )}

        {/* COMMENT MODAL */}
        <Modal
          isOpen={showCommentModal}
          onClose={() => setShowCommentModal(false)}
          title={t('change_comment_title')}
        >
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('changes_made')}
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {getChangeDetails().map((change, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('change_comment_label')}
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder={t('change_comment_placeholder')}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowCommentModal(false)}
                disabled={isSaving}
              >
                İptal
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveWithComment}
                loading={isSaving}
                disabled={isSaving}
              >
                Kaydet
              </Button>
            </div>
          </div>
        </Modal>
    </div>
  );
};

export default AssociationDetailsPage;