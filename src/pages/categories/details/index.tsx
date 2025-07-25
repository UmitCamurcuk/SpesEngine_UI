import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Breadcrumb from '../../../components/common/Breadcrumb';
import EntityHistoryList from '../../../components/common/EntityHistoryList';
import { UnifiedTreeView } from '../../../components/ui';
import TabView from '../../../components/ui/TabView';

import AttributeGroupsTab from '../../../components/common/AttributeGroupsTab';
import AttributesTab from '../../../components/common/AttributesTab';
import categoryService from '../../../services/api/categoryService';
import attributeService from '../../../services/api/attributeService';
import attributeGroupService from '../../../services/api/attributeGroupService';
import familyService from '../../../services/api/familyService';
import type { Category } from '../../../types/category';
import { toast } from 'react-hot-toast';
import 'dayjs/locale/tr';
import { useTranslation } from '../../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../../utils/translationUtils';
import { useNotification } from '../../../components/notifications';

interface TreeNode {
  id: string;
  name: string;
  label?: string;
  children?: TreeNode[];
  data?: any;
}

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

// Yardımcı fonksiyon: Category veya Family objelerinden ID'yi almak için
const getId = (item: any): string => {
  return typeof item === 'object' && item !== null ? item._id || item.id || '' : item || '';
};

// Entity ID alma utility fonksiyonu
const getEntityId = (entity: any): string | undefined => {
  if (!entity) return undefined;
  
  if (typeof entity === 'string') {
    return entity;
  }
  
  if (typeof entity === 'object') {
    return entity._id || entity.id;
  }
  
  return undefined;
};

interface EditableCategoryFields {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

const CategoryDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentLanguage } = useTranslation();
  
  // Veri state'i
  const [category, setCategory] = useState<Category | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // İlişkili veriler
  const [parentCategoryName, setParentCategoryName] = useState<string>('');
  const [categoryTree, setCategoryTree] = useState<TreeNode[]>([]);
  const [familyTree, setFamilyTree] = useState<TreeNode[]>([]);
  const [familyName, setFamilyName] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [attributes, setAttributes] = useState<{id: string, name: string, type: string}[]>([]);
  const [attributeGroups, setAttributeGroups] = useState<{
    id: string, 
    name: string, 
    code: string, 
    description?: string, 
    attributes?: any[]
  }[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    code: '',
    description: '',
    isActive: true,
    parentId: undefined
  });
  
  // Loading ve error state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Tab state için unique bir değer sağlayan force-refresh mekanizması
  const [tabRefreshCounter, setTabRefreshCounter] = useState<number>(0);
  
  // Tab içeriklerini state'e taşıyalım ki her tab değişiminde yeniden render edilsin
  const [tabContents, setTabContents] = useState<any[]>([]);
  // Aktif tab'ı takip etmek için
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // JSON preview state'i
  const [showJsonPreview, setShowJsonPreview] = useState<boolean>(false);
  

  
  // Notification hook
  const { showToast, showCommentModal } = useNotification();
  
  // Veriyi getir
  useEffect(() => {
    const fetchCategoryDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const categoryData = await categoryService.getCategoryById(id, {
          includeAttributes: true,
          includeAttributeGroups: true
        });
        
        // Öznitelikleri kendi gruplarına eşleştir
        // API'den attributes ve attributeGroups farklı dizilerde geliyor
        if (categoryData.attributes && categoryData.attributes.length > 0 && 
            categoryData.attributeGroups && categoryData.attributeGroups.length > 0) {
          
          console.log("Orijinal attributeGroups:", JSON.parse(JSON.stringify(categoryData.attributeGroups)));
          console.log("Orijinal attributes:", JSON.parse(JSON.stringify(categoryData.attributes)));
          
          // Her grup için eşleşen nitelikleri bul
          const groupsWithAttributes = categoryData.attributeGroups.map((group: any) => {
            // Bu gruba ait nitelikleri bul
            const groupAttributes = categoryData.attributes.filter((attr: any) => 
              getId(attr.attributeGroup) === getId(group._id) ||
              getId(attr.attributeGroup) === getId(group)
            );
            
            // Grubu klonla ve nitelikleri ekle
            return {
              ...group,
              attributes: groupAttributes
            };
          });
          
          console.log("İşlenmiş attributeGroups:", groupsWithAttributes);
          
          // İşlenmiş grupları kategoriye ekle
          categoryData.attributeGroups = groupsWithAttributes;
        }
        
        // State'i güncelle
        setCategory(categoryData);
        
        // Parent veya ParentCategory değerini formData'yı uygun şekilde atar
        const parentId = getId(categoryData.parentCategory) || getId(categoryData.parent);
        const familyId = getId(categoryData.family);
        
        console.log("Veriden yüklenen parentId:", parentId);
        console.log("Veriden yüklenen familyId:", familyId);
        
        setFormData({
          name: getEntityName(categoryData, currentLanguage) || '',
          code: categoryData.code,
          description: getEntityDescription(categoryData, currentLanguage) || '',
          isActive: categoryData.isActive,
          parentId: parentId || undefined,
          family: familyId || undefined
        });

        // Seçili kategoriyi ayarla
        if (familyId) {
          setSelectedCategory(familyId);
        }
        
        // Üst kategoriyi getir
        if (categoryData.parentCategory) {
          try {
            console.log("Üst kategori bilgisi:", categoryData.parentCategory);
            let parentCategoryId = getId(categoryData.parentCategory);
            
            if (parentCategoryId) {
              console.log("Üst kategori ID:", parentCategoryId);
              const parentCategoryData = await categoryService.getCategoryById(parentCategoryId);
              console.log("Üst kategori verisi:", parentCategoryData);
              setParentCategoryName(getEntityName(parentCategoryData, currentLanguage) || '');
            } else {
              console.log("Üst kategori ID bulunamadı");
            }
            await fetchCategoryTree();
          } catch (err) {
            console.error('Üst kategori yüklenirken hata oluştu:', err);
          }
        } else if (categoryData.parent) {
          // Alternatif veri yapısı - bazı API yanıtlarında parent kullanılmış olabilir
          try {
            console.log("Parent bilgisi:", categoryData.parent);
            let parentId = getId(categoryData.parent);
            
            if (parentId) {
              console.log("Parent ID:", parentId);
              const parentData = await categoryService.getCategoryById(parentId);
              console.log("Parent verisi:", parentData);
              setParentCategoryName(getEntityName(parentData, currentLanguage) || '');
            } else {
              console.log("Parent ID bulunamadı");
            }
            await fetchCategoryTree();
          } catch (err) {
            console.error('Parent yüklenirken hata oluştu:', err);
          }
        } else {
          console.log("Üst kategori veya parent bilgisi bulunamadı");
          await fetchCategoryTree();
        }
        
        // Aile bilgisini getir
        if (categoryData.family) {
          try {
            const familyData = await familyService.getFamilyById(categoryData.family._id);
            setFamilyName(getEntityName(familyData, currentLanguage) || '');
            await fetchFamilyTree(categoryData.family._id);
          } catch (err) {
            console.error('Aile bilgisi yüklenirken hata oluştu:', err);
          }
        }
        
        // İlişkili öznitelikleri getir
        if (categoryData.attributes && categoryData.attributes.length > 0) {
          try {
            const fetchedAttributes = [];
            for (const attributeId of categoryData.attributes) {
              const attributeData = await attributeService.getAttributeById(attributeId._id);
              fetchedAttributes.push({ 
                id: attributeId, 
                name: getEntityName(attributeData, currentLanguage) || '',
                type: attributeData.type
              });
            }
            setAttributes(fetchedAttributes);
          } catch (err) {
            console.error('Öznitelikler yüklenirken hata oluştu:', err);
          }
        }
        
        // İlişkili öznitelik gruplarını getir
        if (categoryData.attributeGroups && categoryData.attributeGroups.length > 0) {
          try {
            const fetchedGroups = [];
            for (const groupData of categoryData.attributeGroups) {
              // API'den gelen grup verisi direkt olarak kullanılıyor
              fetchedGroups.push({ 
                id: groupData._id, 
                name: getEntityName(groupData, currentLanguage) || '',
                code: groupData.code,
                description: getEntityDescription(groupData, currentLanguage) || '',
                attributes: groupData.attributes || []
              });
            }
            setAttributeGroups(fetchedGroups);
          } catch (err) {
            console.error('Öznitelik grupları yüklenirken hata oluştu:', err);
          }
        }
        
      } catch (err: any) {
        setError('Kategori verileri yüklenirken bir hata oluştu: ' + (err.message || err));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategoryDetails();
  }, [id]);
  
  // Kategori ağacını getir
  const fetchCategoryTree = async () => {
    try {
      // Tüm kategorileri getir
      const { categories } = await categoryService.getCategories({ limit: 500 });
      
      // Ağaç yapısını oluştur
      const buildCategoryTree = (parentId: string | null = null): TreeNode[] => {
        const nodes: TreeNode[] = categories
          .filter(cat => {
            // Kategorinin parent değeri (string veya obje olabilir)
            let parentValue = null;
            
            if (cat.parent) {
              // Eğer string ise direkt kullan
              if (typeof cat.parent === 'string') {
                parentValue = cat.parent;
              } 
              // Obje ise ve id özelliği varsa
              else if (typeof cat.parent === 'object') {
                // Typescript hata vermemesi için any kullan
                const parentObj = cat.parent as any;
                if (parentObj.id) {
                  parentValue = parentObj.id;
                } else if (parentObj._id) {
                  parentValue = parentObj._id;
                }
              }
            } 
            // Eski kodlar için geriye dönük uyumluluk sağlama
            else if (cat.parentCategory) {
              // Eğer string ise direkt kullan
              if (typeof cat.parentCategory === 'string') {
                parentValue = cat.parentCategory;
              } 
              // Obje ise ve id özelliği varsa
              else if (typeof cat.parentCategory === 'object') {
                // Typescript hata vermemesi için any kullan
                const parentObj = cat.parentCategory as any;
                if (parentObj.id) {
                  parentValue = parentObj.id;
                } else if (parentObj._id) {
                  parentValue = parentObj._id;
                }
              }
            }
            
            // Parent ID ile eşleştir
            return (parentId === null && !parentValue) || (parentValue === parentId);
          })
          .map(cat => {
            const catId = cat._id;
            const children = buildCategoryTree(catId);
            return {
              id: catId,
              name: getEntityName(cat, currentLanguage) || '',
              data: cat,
              children: children.length > 0 ? children : undefined
            };
          });
        
        return nodes;
      };
      
      const tree = buildCategoryTree();
      setCategoryTree(tree);
      
      console.log('Kategori ağacı oluşturuldu:', tree);
      
    } catch (err) {
      console.error('Kategori ağacı oluşturulurken hata oluştu:', err);
    }
  };

  // Family ağacını getir
  const fetchFamilyTree = async (activeFamilyId?: string) => {
    try {
      // Tüm aileleri getir
      const { families } = await familyService.getFamilies({ limit: 500 });
      
      // Ağaç yapısını oluştur
      const buildFamilyTree = (parentId: string | null = null): TreeNode[] => {
        const nodes: TreeNode[] = families
          .filter(family => {
            // Ailenin parent değeri (string veya obje olabilir)
            let parentValue = null;
            
            if (family.parent) {
              // Eğer string ise direkt kullan
              if (typeof family.parent === 'string') {
                parentValue = family.parent;
              } 
              // Obje ise ve id özelliği varsa
              else if (typeof family.parent === 'object') {
                // Typescript hata vermemesi için any kullan
                const parentObj = family.parent as any;
                if (parentObj.id) {
                  parentValue = parentObj.id;
                } else if (parentObj._id) {
                  parentValue = parentObj._id;
                }
              }
            }
            
            // Parent ID ile eşleştir
            return (parentId === null && !parentValue) || (parentValue === parentId);
          })
          .map(family => {
            const familyId = family._id;
            const children = buildFamilyTree(familyId);
            return {
              id: familyId,
              name: getEntityName(family, currentLanguage) || '',
              data: family,
              children: children.length > 0 ? children : undefined
            };
          });
        
        return nodes;
      };
      
      const tree = buildFamilyTree();
      setFamilyTree(tree);
      
      console.log('Aile ağacı oluşturuldu:', tree);
      
    } catch (err) {
      console.error('Aile ağacı oluşturulurken hata oluştu:', err);
    }
  };
  
  // Form input değişiklik handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Checkbox için özel işlem
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Form gönderme handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !formData) return;
    
    // Değişiklikleri hesapla
    const originalData = {
      name: getEntityName(category, currentLanguage) || '',
      code: category?.code || '',
      description: getEntityDescription(category, currentLanguage) || '',
      isActive: category?.isActive || true,
      parentId: getEntityId(category?.parentCategory) || getEntityId(category?.parent) || undefined,
      family: getEntityId(category?.family) || undefined
    };
    
    const changes: string[] = [];
    
    // Değişen alanları bul
    if (formData.name !== originalData.name) {
      changes.push(`İsim: ${originalData.name} → ${formData.name}`);
    }
    if (formData.code !== originalData.code) {
      changes.push(`Kod: ${originalData.code} → ${formData.code}`);
    }
    if (formData.description !== originalData.description) {
      changes.push(`Açıklama: ${originalData.description || 'Boş'} → ${formData.description || 'Boş'}`);
    }
    if (formData.isActive !== originalData.isActive) {
      changes.push(`Aktif: ${originalData.isActive ? 'Evet' : 'Hayır'} → ${formData.isActive ? 'Evet' : 'Hayır'}`);
    }
    if (formData.parentId !== originalData.parentId) {
      changes.push(`Üst Kategori: ${originalData.parentId || 'Yok'} → ${formData.parentId || 'Yok'}`);
    }
    if (formData.family !== originalData.family) {
      changes.push(`Aile: ${originalData.family || 'Yok'} → ${formData.family || 'Yok'}`);
    }
    
    // Comment modal'ını aç
    showCommentModal({
      title: 'Kategori Değişiklik Yorumu',
      changes: changes,
      onSave: async (comment: string) => {
        await handleSaveWithComment(comment, originalData);
      }
    });
  };
  
  // Comment ile kaydetme handler
  const handleSaveWithComment = async (comment: string, originalData: any) => {
    if (!id || !formData) return;
    
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      const changedFields: any = {};
      
      // Değişen alanları bul
      if (formData.name !== originalData.name) changedFields.name = formData.name;
      if (formData.code !== originalData.code) changedFields.code = formData.code;
      if (formData.description !== originalData.description) changedFields.description = formData.description;
      if (formData.isActive !== originalData.isActive) changedFields.isActive = formData.isActive;
      if (formData.parentId !== originalData.parentId) changedFields.parent = formData.parentId;
      if (formData.family !== originalData.family) changedFields.family = formData.family;
      
      // Öznitelik ve öznitelik grubu değişikliklerini ekle
      changedFields.attributes = attributes.map(a => a.id);
      changedFields.attributeGroups = attributeGroups.map(g => g.id);
      
      // Comment'i ekle
      if (comment.trim()) {
        changedFields.comment = comment.trim();
      }
      
      console.log("API'ye gönderilecek değişiklikler:", changedFields);
      
      // API'ye gönder
      await categoryService.updateCategory(id, changedFields);
      
      // Güncel veriyi yeniden yükle
      const updatedCategory = await categoryService.getCategoryById(id, {
        includeAttributes: true,
        includeAttributeGroups: true
      });
      setCategory(updatedCategory);
      
      setSuccess(true);
      setIsEditing(false);
      
      showToast({
        type: 'success',
        title: 'Başarılı',
        message: 'Kategori başarıyla güncellendi',
        duration: 3000
      });
      
      // Başarı mesajını belirli bir süre sonra kaldır
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'Kategori güncellenirken bir hata oluştu');
      showToast({
        type: 'error',
        title: 'Hata',
        message: err.message || 'Kategori güncellenirken bir hata oluştu',
        duration: 5000
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Kategoriyi silme handler
  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      setIsLoading(true);
      setError(null);
      
      try {
        await categoryService.deleteCategory(id);
        navigate('/categories/list');
      } catch (err: any) {
        setError(err.message || 'Kategori silinirken bir hata oluştu');
        setIsLoading(false);
      }
    }
  };
  
  // TabView içeriğini dinamik olarak oluştur
  useEffect(() => {
    if (category) {
      setTabContents([
        {
          id: 'overview',
          title: 'Genel Görünüm',
          content: renderOverview()
        },
        {
          id: 'hierarchy',
          title: 'Hiyerarşi',
          content: renderHierarchy()
        },
        {
          id: 'attributeGroups',
          title: 'Öznitelik Grupları',
          badge: attributeGroups.length || undefined,
          content: null // Artık direkt component kullanılıyor
        },
        {
          id: 'attributes',
          title: 'Öznitelikler',
          badge: attributes.length || undefined,
          content: null // Artık direkt component kullanılıyor
        },
        {
          id: 'usage',
          title: 'Kullanım İstatistikleri',
          content: renderUsageStatistics()
        },
        {
          id: 'api',
          title: 'API Referansı',
          content: renderApiReference()
        },
        {
          id: 'history',
          title: 'Geçmiş',
          content: renderHistory()
        }
      ]);
    }
  }, [category, isEditing, categoryTree, familyTree, attributeGroups, attributes, activeTab]);
  
  // Genel görünüm render fonksiyonu
  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" key="overview-content">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Kategori Bilgileri</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Açıklama</h3>
                {isEditing ? (
                  <div className="mt-2">
                    <textarea
                      name="description"
                      value={formData.description || ''}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                      placeholder="Kategori açıklaması"
                    />
                  </div>
                ) : (
                  <p className="mt-2 text-gray-900 dark:text-gray-100">
                    {getEntityDescription(category, currentLanguage) || 'Açıklama bulunmuyor'}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Durum</h3>
                  <div className="mt-2 flex items-center">
                    <div className={`h-2 w-2 rounded-full mr-2 ${category?.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-gray-900 dark:text-gray-100">
                      {category?.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Oluşturulma Tarihi</h3>
                  <p className="mt-2 text-gray-900 dark:text-gray-100">
                    {new Date(category?.createdAt || '').toLocaleString('tr-TR')}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Son Güncelleme</h3>
                  <p className="mt-2 text-gray-900 dark:text-gray-100">
                    {new Date(category?.updatedAt || '').toLocaleString('tr-TR')}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Kategori ID</h3>
                  <p className="mt-2 text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {category?._id}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">İlişkili Veriler</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <svg className="h-4 w-4 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {attributeGroups.length} Öznitelik Grubu
                    </span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <svg className="h-4 w-4 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {attributes.length} Öznitelik
                    </span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <svg className="h-4 w-4 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {familyName ? '1 Aile' : '0 Aile'}
                    </span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <svg className="h-4 w-4 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {parentCategoryName ? '1 Üst Kategori' : 'Ana Kategori'}
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
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Hızlı İşlemler</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <button
                type="button"
                className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
                onClick={() => setActiveTab('attributes')}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Özniteliklere Git
              </button>
              <button
                type="button"
                className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30 dark:hover:bg-purple-900/50"
                onClick={() => setActiveTab('hierarchy')}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Hiyerarşiye Git
              </button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );

  // Kullanım istatistikleri render fonksiyonu
  const renderUsageStatistics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" key="usage-statistics-content">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Kullanım Verileri</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bu kategoride kullanılan ailelerin sayısı</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {familyName ? 1 : 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">İlişkili öznitelik grup sayısı</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {attributeGroups.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">İlişkili öznitelik sayısı</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {attributes.length}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>
      
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">İstatistik Grafiği</h2>
        </CardHeader>
        <CardBody>
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">Gelişmiş istatistikler yakında eklenecek</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  // API referansı render fonksiyonu
  const renderApiReference = () => (
    <div className="space-y-6" key="api-reference-content">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
        API Referansı
      </h3>
      
      <div className="space-y-4">
        {/* GET Endpoint */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 mr-2">
              GET
            </span>
            <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
              /api/categories/{category?._id}
            </code>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Bu kategoriyi detaylı bilgileriyle birlikte getirir
          </p>
        </div>
        
        {/* PUT Endpoint */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 mr-2">
              PUT
            </span>
            <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
              /api/categories/{category?._id}
            </code>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Bu kategoriyi günceller
          </p>
        </div>
        
        {/* DELETE Endpoint */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 mr-2">
              DELETE
            </span>
            <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
              /api/categories/{category?._id}
            </code>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Bu kategoriyi siler
          </p>
        </div>
      </div>
    </div>
  );
  
  const renderHistory = () => (
    <div className="space-y-6" key="history-content">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
        Değişiklik Geçmişi
      </h3>
      
      <EntityHistoryList entityId={id!} entityType="category" title="Kategori Geçmişi" />
    </div>
  );
  
  const renderHierarchy = () => (
    <div className="space-y-6" key="hierarchy-content">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
        Hiyerarşik İlişkiler
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kategori Hiyerarşisi */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Kategori Hiyerarşisi
          </h4>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            {categoryTree.length > 0 ? (
              <div>
                {isEditing ? (
                  <UnifiedTreeView 
                    key={`hierarchy-category-tree-${tabRefreshCounter}-${formData.parentId || 'none'}`}
                    data={categoryTree} 
                    defaultSelectedIds={formData.parentId ? [formData.parentId] : []}
                    expandAll={true}
                    maxHeight="300px"
                    showRelationLines={true}
                    variant="spectrum"
                    mode="select"
                    selectionMode="single"
                    onSelectionChange={(selectedIds) => {
                      if (selectedIds.length > 0 && selectedIds[0] !== id) {
                        // Düzenleme modunda seçilen kategoriyi üst kategori olarak ayarla
                        const newParentId = selectedIds[0] || undefined;
                        console.log("Hiyerarşi tab - Üst kategori değişti:", newParentId);
                        setFormData(prev => {
                          const updated = { ...prev, parentId: newParentId };
                          console.log("Hiyerarşi tab - formData güncellendi:", updated);
                          return updated;
                        });
                      } else if (selectedIds.length === 0) {
                        // Seçim temizlenirse parent'ı kaldır
                        setFormData(prev => ({ ...prev, parentId: undefined }));
                      }
                    }}
                    className="shadow-sm"
                  />
                ) : (
                  <UnifiedTreeView 
                    data={categoryTree} 
                    activeNodeId={id}
                    expandAll={true}
                    maxHeight="300px"
                    showRelationLines={true}
                    variant="spectrum"
                    onNodeClick={(node) => {
                      if (node.id !== id) {
                        navigate(`/categories/details/${node.id}`);
                      }
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
          
          {/* Seçili Üst Kategori Bilgisi */}
          {parentCategoryName && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">Üst Kategori Bilgisi</h4>
                  <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                    Bu kategori, <strong>{parentCategoryName}</strong> kategorisinin alt kategorisidir.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Aile Hiyerarşisi */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Aile Seçimi
          </h4>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            {familyTree.length > 0 ? (
              <div>
                {isEditing ? (
                  <UnifiedTreeView
                    key={`family-tree-${tabRefreshCounter}-${formData.family || 'none'}`}
                    data={familyTree.map(fam => ({
                      id: fam.id,
                      name: fam.name,
                      label: getEntityName(fam.data, currentLanguage) || fam.name,
                      children: fam.children
                    }))}
                    onSelectionChange={(selectedIds) => {
                      const newFamilyId = selectedIds[0] || undefined;
                      console.log("Seçilen aile ID:", newFamilyId);
                      setSelectedCategory(newFamilyId);
                      setFormData(prev => ({ ...prev, family: newFamilyId }));
                    }}
                    defaultSelectedIds={formData.family ? [formData.family] : []}
                    expandAll={true}
                    variant="spectrum"
                    mode="select"
                    selectionMode="single"
                    maxHeight="200px"
                  />
                ) : (
                  <UnifiedTreeView 
                    data={familyTree} 
                    activeNodeId={getEntityId(category?.family)}
                    expandAll={true}
                    maxHeight="300px"
                    showRelationLines={true}
                    variant="spectrum"
                    onNodeClick={(node) => {}}
                    className="shadow-sm"
                    key={`family-tree-view-${getEntityId(category?.family) || 'none'}`}
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
          
          {/* Seçili Aile Bilgisi */}
          {familyName && (
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-800">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 text-green-500 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-green-700 dark:text-green-300">Seçili Aile</h4>
                  <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                    Bu kategori, <strong>{familyName}</strong> ailesine bağlıdır.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Aile Yok Bilgisi */}
          {!familyName && (
            <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Aile Bilgisi</h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Bu kategori herhangi bir aileye bağlı değildir.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  

  
  const handleEdit = () => {
    setIsEditing(true);
    
    // parentId'yi doğru şekilde ayarla
    const parentId = getEntityId(category?.parentCategory) || getEntityId(category?.parent);
    const familyId = getEntityId(category?.family);
    
    console.log("Düzenleme başlatıldı. Parent ID:", parentId, "Family ID:", familyId);
    
    setFormData({
      name: getEntityName(category, currentLanguage) || '',
      code: category?.code || '',
      description: getEntityDescription(category, currentLanguage) || '',
      isActive: category?.isActive || true,
      parentId: parentId || undefined,
      family: familyId || undefined
    });

    // Aile seçimini de ayarla
    setSelectedCategory(familyId);
  };

  const handleCancel = () => {
    setIsEditing(false);
    
    // Kategori verilerini orijinal haline geri getir
    const parentId = getEntityId(category?.parentCategory) || getEntityId(category?.parent);
    const familyId = getEntityId(category?.family);
    
    setFormData({
      name: getEntityName(category, currentLanguage) || '',
      code: category?.code || '',
      description: getEntityDescription(category, currentLanguage) || '',
      isActive: category?.isActive || true,
      parentId: parentId || undefined,
      family: familyId || undefined
    });
    
    // Aile seçimini orijinal haline getir
    setSelectedCategory(familyId);
  };
  
  // Öznitelik grubu kaldırma handler'ı
  const handleRemoveAttributeGroup = (groupId: string) => {
    if (!isEditing) return;
    
    // Öznitelik grubunu listeden kaldır
    setAttributeGroups(prev => prev.filter(group => group.id !== groupId));
    
    toast.success("Öznitelik grubu kaldırıldı");
    console.log(`Öznitelik grubu kaldırıldı: ${groupId}`);
  };

  // Gruptan öznitelik kaldırma handler'ı
  const handleRemoveAttributeFromGroup = (attributeId: string, groupId: string) => {
    if (!isEditing) return;
    
    // Özniteliği gruptan kaldır
    setAttributeGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          attributes: group.attributes ? group.attributes.filter((attr: any) => attr._id !== attributeId) : []
        };
      }
      return group;
    }));
    
    toast.success("Öznitelik gruptan kaldırıldı");
    console.log(`Öznitelik gruptan kaldırıldı: Attribute ID ${attributeId}, Group ID: ${groupId}`);
  };

  // Öznitelik kaldırma handler'ı
  const handleRemoveAttribute = (attributeId: string) => {
    if (!isEditing) return;
    
    // Özniteliği listeden kaldır
    setAttributes(prev => prev.filter(attr => attr.id !== attributeId));
    
    toast.success("Öznitelik kaldırıldı");
    console.log(`Öznitelik kaldırıldı: ${attributeId}`);
  };

    // Öznitelik grubu ekleme handler'ı
  const handleAddAttributeGroup = async (groupId: string) => {
    try {
      // Grup zaten ekli mi kontrol et
      if (attributeGroups.some(g => g.id === groupId)) {
        toast.error("Bu öznitelik grubu zaten eklenmiş");
        return;
      }
      
      const groupData = await attributeGroupService.getAttributeGroupById(groupId, {
        includeAttributes: true
      });
      
      const newGroup = {
        id: groupData._id,
        name: getEntityName(groupData, currentLanguage) || '',
        code: groupData.code,
        description: getEntityDescription(groupData, currentLanguage) || '',
        attributes: groupData.attributes || []
      };
      
      setAttributeGroups(prev => [...prev, newGroup]);
      toast.success("Öznitelik grubu başarıyla eklendi");
      
      // Düzenleme modunda değilse direkt kaydet
      if (!isEditing && id) {
        try {
          await categoryService.updateCategory(id, {
            attributeGroups: [...attributeGroups, newGroup].map(g => g.id)
          });
          toast.success("Öznitelik grubu kaydedildi");
        } catch (err) {
          toast.error("Öznitelik grubu kaydedilirken hata oluştu");
          console.error('Öznitelik grubu kaydedilirken hata:', err);
        }
      }
    } catch (err) {
      toast.error("Öznitelik grubu eklenirken hata oluştu");
      console.error('Öznitelik grubu eklenirken hata:', err);
    }
  };
  
    // Öznitelik ekleme handler'ı
  const handleAddAttribute = async (attributeId: string) => {
    try {
      // Öznitelik zaten ekli mi kontrol et
      if (attributes.some(a => a.id === attributeId)) {
        toast.error("Bu öznitelik zaten eklenmiş");
        return;
      }
      
      const attrData = await attributeService.getAttributeById(attributeId);
      
      const newAttribute = {
        id: attrData._id,
        name: getEntityName(attrData, currentLanguage) || '',
        type: attrData.type
      };
      
      setAttributes(prev => [...prev, newAttribute]);
      toast.success("Öznitelik başarıyla eklendi");
      
      // Düzenleme modunda değilse direkt kaydet
      if (!isEditing && id) {
        try {
          await categoryService.updateCategory(id, {
            attributes: [...attributes, newAttribute].map(a => a.id)
          });
          toast.success("Öznitelik kaydedildi");
        } catch (err) {
          toast.error("Öznitelik kaydedilirken hata oluştu");
          console.error('Öznitelik kaydedilirken hata:', err);
        }
      }
    } catch (err) {
      toast.error("Öznitelik eklenirken hata oluştu");
      console.error('Öznitelik eklenirken hata:', err);
    }
  };
  

  

  
  // Düzenleme modu değiştiğinde parentId ve family ID'lerin doğru gösterilmesini sağla
  useEffect(() => {
    if (isEditing && category) {
      const parentId = getEntityId(category.parentCategory) || getEntityId(category.parent);
      const familyId = getEntityId(category.family);
      
      console.log("Düzenleme modu değişti. ParentId:", parentId, "Family ID:", familyId);
      
      // TreeView bileşenlerinin yeniden render edilmesi için tabRefreshCounter'ı artır
      setTabRefreshCounter(prev => prev + 1);
    }
  }, [isEditing, category]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-primary-light dark:text-primary-dark mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  if (error && !category) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
        <h3 className="text-lg font-semibold mb-2">Hata Oluştu</h3>
        <p>{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/categories/list')}
        >
          Listeye Dön
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* BREADCRUMB */}
      <div className="flex items-center justify-between">
        <Breadcrumb 
          items={[
            { label: 'Kategoriler', path: '/categories/list' },
            { label: category ? getEntityName(category, currentLanguage) || 'İsimsiz Kategori' : 'Kategori Detayları' }
          ]} 
        />
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center mr-4"
            onClick={() => navigate('/categories/list')}
          >
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Listeye Dön
          </Button>
          <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/50 
                         flex items-center justify-center mr-3">
            <svg className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="text-2xl font-bold bg-transparent border-b-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500"
                  placeholder="Kategori Adı"
                />
              </div>
            ) : (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {category ? getEntityName(category, currentLanguage) || 'İsimsiz Kategori' : 'Kategori Detayları'}
              </h1>
            )}
            <div className="flex items-center mt-1">
              {isEditing ? (
                <input
                  type="text"
                  name="code"
                  value={formData.code || ''}
                  onChange={handleChange}
                  className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Kategori Kodu"
                />
              ) : (
                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                  {category?.code}
                </span>
              )}
              <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
              <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                (isEditing ? formData.isActive : category?.isActive)
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              }`}>
                {isEditing ? (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive === undefined ? true : formData.isActive}
                      onChange={handleChange}
                      className="h-3 w-3 text-primary-light focus:ring-primary-light border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-1 text-xs">
                      {formData.isActive ? 'Aktif' : 'Pasif'}
                    </label>
                  </div>
                ) : (
                  category?.isActive ? 'Aktif' : 'Pasif'
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
                onClick={handleSubmit}
                loading={isSaving}
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
                onClick={handleCancel}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                </svg>
                JSON Görünümü
              </Button>
              <Button
                variant="primary"
                className="flex items-center"
                onClick={handleEdit}
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
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Genel Görünüm
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Hiyerarşi
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Öznitelik Grupları
              {attributeGroups.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                  {attributeGroups.length}
                </span>
              )}
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
              {attributes.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                  {attributes.length}
                </span>
              )}
            </div>
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'usage'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('usage')}
          >
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Kullanım İstatistikleri
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
              </svg>
              API Referansı
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">JSON Önizlemesi</h2>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center"
              onClick={() => navigator.clipboard.writeText(JSON.stringify(category, null, 2))}
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Kopyala
            </Button>
          </CardHeader>
          <CardBody>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{JSON.stringify(category, null, 2)}</code>
            </pre>
          </CardBody>
        </Card>
      )}

      {/* ERROR AND SUCCESS MESSAGES */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-start">
          <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 flex items-start">
          <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Kategori başarıyla güncellendi!</span>
        </div>
      )}

      {/* MAIN CONTENT CARD */}
      <Card>
        <CardBody>
          <div className="space-y-6">
            {/* Ana İçerik */}
            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="mb-4 bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Kategori başarıyla güncellendi!</span>
              </div>
            )}
            
            {isEditing ? (
              <div>
                {/* Düzenleme modunda da aynı tab sistemi kullan */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* İsim */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Kategori Adı <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name || ''}
                          onChange={handleChange}
                          required
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                        />
                      </div>
                      
                      {/* Kod */}
                      <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Kod <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="code"
                          name="code"
                          value={formData.code || ''}
                          onChange={handleChange}
                          required
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                        />
                      </div>
                      
                      {/* Açıklama */}
                      <div className="col-span-1 md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Açıklama
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description || ''}
                          onChange={handleChange}
                          rows={3}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                        />
                      </div>
                      
                      {/* Aktif/Pasif durumu */}
                      <div className="col-span-1 md:col-span-2">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="isActive"
                              name="isActive"
                              type="checkbox"
                              checked={formData.isActive === undefined ? true : formData.isActive}
                              onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                              className="w-4 h-4 text-primary-light bg-gray-100 border-gray-300 rounded focus:ring-primary-light dark:focus:ring-primary-dark dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                          </div>
                          <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                            Aktif
                          </label>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Kategorinin aktif olup olmadığını belirler. Pasif kategoriler kullanıcı arayüzünde gösterilmez.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'hierarchy' && renderHierarchy()}
                {activeTab === 'attributeGroups' && (
                  <AttributeGroupsTab
                    attributeGroups={attributeGroups.map(g => ({
                      _id: g.id,
                      name: g.name,
                      code: g.code,
                      description: g.description,
                      attributes: g.attributes
                    }))}
                    isEditing={isEditing}
                    onAdd={handleAddAttributeGroup}
                    onRemove={handleRemoveAttributeGroup}
                    title="Öznitelik Grupları"
                    emptyMessage="Bu kategoriye atanmış öznitelik grubu bulunmamaktadır."
                    showAddButton={true}
                  />
                )}
                {activeTab === 'attributes' && (
                  <AttributesTab
                    attributes={attributes.map(a => ({
                      _id: a.id,
                      name: { tr: a.name },
                      type: a.type,
                      code: a.name,
                      description: { tr: '' },
                      isActive: true,
                      isRequired: false
                    }))}
                    isEditing={isEditing}
                    onAdd={handleAddAttribute}
                    onRemove={handleRemoveAttribute}
                    title="Öznitelikler"
                    emptyMessage="Bu kategoriye atanmış öznitelik bulunmamaktadır."
                    showAddButton={true}
                  />
                )}
                {activeTab === 'usage' && renderUsageStatistics()}
                {activeTab === 'api' && renderApiReference()}
                {activeTab === 'history' && renderHistory()}
              </div>
            ) : (
              <div>
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'hierarchy' && renderHierarchy()}
                {activeTab === 'attributeGroups' && (
                  <AttributeGroupsTab
                    attributeGroups={attributeGroups.map(g => ({
                      _id: g.id,
                      name: g.name,
                      code: g.code,
                      description: g.description,
                      attributes: g.attributes
                    }))}
                    isEditing={isEditing}
                    onAdd={handleAddAttributeGroup}
                    onRemove={handleRemoveAttributeGroup}
                    title="Öznitelik Grupları"
                    emptyMessage="Bu kategoriye atanmış öznitelik grubu bulunmamaktadır."
                    showAddButton={true}
                  />
                )}
                {activeTab === 'attributes' && (
                  <AttributesTab
                    attributes={attributes.map(a => ({
                      _id: a.id,
                      name: { tr: a.name },
                      type: a.type,
                      code: a.name,
                      description: { tr: '' },
                      isActive: true,
                      isRequired: false
                    }))}
                    isEditing={isEditing}
                    onAdd={handleAddAttribute}
                    onRemove={handleRemoveAttribute}
                    title="Öznitelikler"
                    emptyMessage="Bu kategoriye atanmış öznitelik bulunmamaktadır."
                    showAddButton={true}
                  />
                )}
                {activeTab === 'usage' && renderUsageStatistics()}
                {activeTab === 'api' && renderApiReference()}
                {activeTab === 'history' && renderHistory()}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
      

    </div>
  );
};

export default CategoryDetailsPage; 