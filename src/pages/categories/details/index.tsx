import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import { TabView, TreeView, TreeViewWithCheckbox } from '../../../components/ui';
import categoryService from '../../../services/api/categoryService';
import attributeService from '../../../services/api/attributeService';
import attributeGroupService from '../../../services/api/attributeGroupService';
import familyService from '../../../services/api/familyService';
import type { Category } from '../../../types/category';
import type { TreeNode } from '../../../components/ui/TreeView';
import { toast } from 'react-hot-toast';

// Yardımcı fonksiyon: Category veya Family objelerinden ID'yi almak için
const getEntityId = (entity: any): string | undefined => {
  if (!entity) return undefined;
  
  // String ise direkt döndür
  if (typeof entity === 'string') return entity;
  
  // Obje ise _id veya id özelliğini döndür
  if (typeof entity === 'object') {
    // TypeScript'in any kullanımı nedeniyle as operatörü kullanıyoruz
    const record = entity as Record<string, any>;
    
    if (record._id) return String(record._id);
    if (record.id) return String(record.id);
  }
  
  return undefined;
};

const CategoryDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // Veri state'i
  const [category, setCategory] = useState<Category | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // İlişkili veriler
  const [parentCategoryName, setParentCategoryName] = useState<string>('');
  const [categoryTree, setCategoryTree] = useState<TreeNode[]>([]);
  const [familyTree, setFamilyTree] = useState<TreeNode[]>([]);
  const [familyName, setFamilyName] = useState<string>('');
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
  const [activeTab, setActiveTab] = useState<string>('general');
  
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
              getEntityId(attr.attributeGroup) === getEntityId(group._id) ||
              getEntityId(attr.attributeGroup) === getEntityId(group)
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
        
        // Parent veya ParentCategory değerini formData'ya uygun şekilde atar
        const parentValue = getEntityId(categoryData.parentCategory) || getEntityId(categoryData.parent) || '';
        
        setFormData({
          name: categoryData.name,
          code: categoryData.code,
          description: categoryData.description,
          isActive: categoryData.isActive,
          parentId: getEntityId(categoryData.parentCategory) || getEntityId(categoryData.parent) || null
        });
        
        // Üst kategoriyi getir
        if (categoryData.parentCategory) {
          try {
            console.log("Üst kategori bilgisi:", categoryData.parentCategory);
            let parentCategoryId = getEntityId(categoryData.parentCategory);
            
            if (parentCategoryId) {
              console.log("Üst kategori ID:", parentCategoryId);
              const parentCategoryData = await categoryService.getCategoryById(parentCategoryId);
              console.log("Üst kategori verisi:", parentCategoryData);
              setParentCategoryName(parentCategoryData.name);
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
            let parentId = getEntityId(categoryData.parent);
            
            if (parentId) {
              console.log("Parent ID:", parentId);
              const parentData = await categoryService.getCategoryById(parentId);
              console.log("Parent verisi:", parentData);
              setParentCategoryName(parentData.name);
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
            setFamilyName(familyData.name);
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
                name: attributeData.name,
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
                name: groupData.name,
                code: groupData.code,
                description: groupData.description,
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
              name: cat.name,
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
              name: family.name,
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
    
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      // API'ye gönder
      await categoryService.updateCategory(id, formData);
      
      // Güncel veriyi yeniden yükle
      const updatedCategory = await categoryService.getCategoryById(id, {
        includeAttributes: true,
        includeAttributeGroups: true
      });
      setCategory(updatedCategory);
      
      setSuccess(true);
      setIsEditing(false);
      
      // Başarı mesajını belirli bir süre sonra kaldır
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'Kategori güncellenirken bir hata oluştu');
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
          id: 'general',
          title: 'Genel Bilgiler',
          content: renderGeneralInfo()
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
          content: renderAttributeGroups()
        },
        {
          id: 'attributes',
          title: 'Öznitelikler',
          badge: attributes.length || undefined,
          content: renderAttributes()
        }
      ]);
    }
  }, [category, isEditing, categoryTree, familyTree, attributeGroups, attributes, activeTab]);
  
  // Tab içerikleri
  const renderGeneralInfo = () => (
    <div className="space-y-6" key="general-info-content">
      {/* Bilgi görüntüleme */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temel Bilgiler Başlığı */}
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Temel Bilgiler</h3>
        </div>
        
        {/* İsim */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Kategori Adı</h4>
          <p className="mt-1 text-gray-900 dark:text-white">{category?.name}</p>
        </div>
        
        {/* Kod */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Kod</h4>
          <p className="mt-1 text-gray-900 dark:text-white">{category?.code}</p>
        </div>
        
        {/* Üst Kategori */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Üst Kategori</h4>
          {isEditing ? (
            <TreeViewWithCheckbox
              data={categoryTree.map(cat => ({
                id: cat.id,
                name: cat.name,
                label: cat.name,
                children: cat.children
              }))}
              onSelectionChange={(selectedIds) => {
                console.log("Seçilen üst kategori ID:", selectedIds[0] || undefined);
                setFormData(prev => ({ ...prev, parentId: selectedIds[0] || undefined }));
              }}
              defaultSelectedIds={formData.parentId ? [formData.parentId] : []}
              variant="spectrum"
              maxHeight="200px"
            />
          ) : (
            <p className="text-gray-900 dark:text-white">
              {category?.parentId ? categoryTree.find(c => c.id === category.parentId)?.name : 'Ana Kategori'}
            </p>
          )}
        </div>
        
        {/* Aile */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Aile</h4>
          <p className="mt-1 text-gray-900 dark:text-white">
            {familyName || <span className="text-gray-500 italic">Atanmamış</span>}
          </p>
        </div>
        
        {/* Durum */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Durum</h4>
          <div className="mt-1">
            {category?.isActive ? (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">
                Aktif
              </span>
            ) : (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500">
                Pasif
              </span>
            )}
          </div>
        </div>
        
        {/* Açıklama */}
        <div className="col-span-1 md:col-span-2">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Açıklama</h4>
          <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-wrap">{category?.description || '-'}</p>
        </div>
        
        {/* Oluşturulma Tarihi */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Oluşturulma Tarihi</h4>
          <p className="mt-1 text-gray-900 dark:text-white">
            {new Date(category?.createdAt || '').toLocaleString('tr-TR')}
          </p>
        </div>
        
        {/* Son Güncelleme */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Son Güncelleme</h4>
          <p className="mt-1 text-gray-900 dark:text-white">
            {new Date(category?.updatedAt || '').toLocaleString('tr-TR')}
          </p>
        </div>
      </div>
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
                  <TreeViewWithCheckbox 
                    data={categoryTree} 
                    defaultSelectedIds={id ? [id] : []}
                    expandAll={true}
                    maxHeight="300px"
                    showRelationLines={true}
                    variant="spectrum"
                    onSelectionChange={(selectedIds) => {
                      if (selectedIds.length > 0 && selectedIds[0] !== id) {
                        // Düzenleme modunda seçilen kategoriyi üst kategori olarak ayarla
                        setFormData(prev => ({ ...prev, parentId: selectedIds[0] || undefined }));
                      }
                    }}
                    className="shadow-sm"
                    key={`category-tree-edit-${id}`}
                  />
                ) : (
                  <TreeView 
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
            Aile Hiyerarşisi
          </h4>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            {familyTree.length > 0 ? (
              <div>
                {isEditing ? (
                  <TreeViewWithCheckbox
                    data={familyTree.map(fam => ({
                      id: fam.id,
                      name: fam.name,
                      label: fam.name,
                      children: fam.children
                    }))}
                    onSelectionChange={(selectedIds) => {
                      setFormData({ ...formData, family: selectedIds[0] || undefined });
                    }}
                    defaultSelectedIds={getEntityId(category?.family) ? [getEntityId(category?.family)!] : []}
                    variant="spectrum"
                    maxHeight="200px"
                  />
                ) : (
                  <TreeView 
                    data={familyTree} 
                    activeNodeId={getEntityId(category?.family)}
                    expandAll={true}
                    maxHeight="300px"
                    showRelationLines={true}
                    variant="spectrum"
                    onNodeClick={() => {}}
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
          {category?.family && (
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
        </div>
      </div>
    </div>
  );
  
  const renderAttributeGroups = () => (
    <div className="space-y-4" key="attribute-groups-content">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Öznitelik Grupları</h3>
      
      {attributeGroups.length > 0 ? (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 overflow-hidden">
          <div className="grid grid-cols-1 gap-4">
            {attributeGroups.map(group => (
              <div 
                key={group.id} 
                className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{group.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{group.code}</p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {/* Öznitelik grubunu kaldır */}}
                    className="flex items-center"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Kaldır
                  </Button>
                </div>
                
                {/* Grup açıklaması */}
                {group.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 border-t border-gray-100 dark:border-gray-700 pt-3">
                    {group.description}
                  </p>
                )}
                
                {/* Gruba ait öznitelikler */}
                {group.attributes && group.attributes.length > 0 ? (
                  <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-3">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Grup Öznitelikleri ({group.attributes.length})
                    </h5>
                    <ul className="ml-2 space-y-1">
                      {group.attributes.map((attr: any) => (
                        <li key={attr._id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary-light dark:bg-primary-dark mr-2"></span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{attr.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({attr.type})</span>
                          </div>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {/* Özniteliği gruptan kaldır */}}
                            className="flex items-center"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Kaldır
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                    Bu gruba atanmış öznitelik bulunmamaktadır.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">Bu kategoriye atanmış öznitelik grubu bulunmamaktadır.</p>
          <Button
            variant="outline"
            onClick={() => {/* Öznitelik grubu ekleme modalını aç */}}
            className="mt-4 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Grup Ekle
          </Button>
        </div>
      )}
    </div>
  );
  
  const renderAttributes = () => (
    <div className="space-y-4" key="attributes-content">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Öznitelikler</h3>
      
      {attributes.length > 0 ? (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Öznitelik Adı
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Tip
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {attributes.map(attr => (
                <tr key={attr.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {attr.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {attr.type}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {/* Özniteliği kaldır */}}
                      className="flex items-center"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Kaldır
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">Bu kategoriye atanmış öznitelik bulunmamaktadır.</p>
          <Button
            variant="outline"
            onClick={() => {/* Öznitelik ekleme modalını aç */}}
            className="mt-4 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Öznitelik Ekle
          </Button>
        </div>
      )}
    </div>
  );
  
  const handleEdit = () => {
    setIsEditing(true);
    
    // parentId'yi doğru şekilde ayarla
    const parentId = getEntityId(category?.parentCategory) || getEntityId(category?.parent);
    
    setFormData({
      name: category?.name || '',
      code: category?.code || '',
      description: category?.description || '',
      isActive: category?.isActive || true,
      parentId: parentId || undefined,
      family: getEntityId(category?.family) || undefined
    });
    
    console.log("Edit modu başlatıldı. Parent ID:", parentId);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: category?.name || '',
      code: category?.code || '',
      description: category?.description || '',
      isActive: category?.isActive || true,
      parentId: category?.parentId || undefined
    });
  };
  
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
      {/* Başlık */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-7 h-7 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {isEditing ? 'Kategori Düzenle' : 'Kategori Detayları'}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {category?.name} kategorisinin detaylı bilgileri
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate('/categories/list')}
              className="flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Listeye Dön
            </Button>
            
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex items-center"
                  disabled={isSaving}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  İptal
                </Button>
                <Button
                  onClick={handleSubmit}
                  variant="primary"
                  className="flex items-center"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Kaydet
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                onClick={handleEdit}
                className="flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Düzenle
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Ana İçerik */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
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
          <div className="space-y-6">
            <TabView 
              tabs={[
                {
                  id: 'general',
                  title: 'Genel Bilgiler',
                  content: (
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
                  )
                },
                {
                  id: 'hierarchy',
                  title: 'Hiyerarşi',
                  content: (
                    <div className="space-y-6">
                      {/* Üst Kategori Seçimi */}
                      <div>
                        <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Üst Kategori
                        </label>
                        <TreeViewWithCheckbox
                          data={categoryTree.map(cat => ({
                            id: cat.id,
                            name: cat.name,
                            label: cat.name,
                            children: cat.children
                          }))}
                          onSelectionChange={(selectedIds) => {
                            console.log("Seçilen üst kategori ID:", selectedIds[0] || undefined);
                            setFormData(prev => ({ ...prev, parentId: selectedIds[0] || undefined }));
                          }}
                          defaultSelectedIds={formData.parentId ? [formData.parentId] : []}
                          variant="spectrum"
                          maxHeight="200px"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Bu kategorinin üst kategorisini seçin. Boş bırakırsanız ana kategori olarak ayarlanır.
                        </p>
                      </div>
                      
                      {/* Aile Seçimi */}
                      <div>
                        <label htmlFor="family" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Aile
                        </label>
                        <TreeViewWithCheckbox
                          data={familyTree.map(fam => ({
                            id: fam.id,
                            name: fam.name,
                            label: fam.name,
                            children: fam.children
                          }))}
                          onSelectionChange={(selectedIds) => {
                            setFormData({ ...formData, family: selectedIds[0] || undefined });
                          }}
                          defaultSelectedIds={getEntityId(category?.family) ? [getEntityId(category?.family)!] : []}
                          variant="spectrum"
                          maxHeight="200px"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Bu kategorinin bağlı olduğu aileyi seçin.
                        </p>
                      </div>
                    </div>
                  )
                },
                {
                  id: 'attributeGroups',
                  title: 'Öznitelik Grupları',
                  badge: attributeGroups.length || undefined,
                  content: (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Öznitelik Grupları</h3>
                        <Button
                          variant="outline"
                          onClick={() => {/* Öznitelik grubu ekleme modalını aç */}}
                          className="flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Grup Ekle
                        </Button>
                      </div>
                      
                      {attributeGroups.length > 0 ? (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 overflow-hidden">
                          <div className="grid grid-cols-1 gap-4">
                            {attributeGroups.map(group => (
                              <div 
                                key={group.id} 
                                className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">{group.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{group.code}</p>
                                  </div>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => {/* Öznitelik grubunu kaldır */}}
                                    className="flex items-center"
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Kaldır
                                  </Button>
                                </div>
                                
                                {/* Grup açıklaması */}
                                {group.description && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 border-t border-gray-100 dark:border-gray-700 pt-3">
                                    {group.description}
                                  </p>
                                )}
                                
                                {/* Gruba ait öznitelikler */}
                                {group.attributes && group.attributes.length > 0 ? (
                                  <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-3">
                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      Grup Öznitelikleri ({group.attributes.length})
                                    </h5>
                                    <ul className="ml-2 space-y-1">
                                      {group.attributes.map((attr: any) => (
                                        <li key={attr._id} className="flex items-center justify-between">
                                          <div className="flex items-center">
                                            <span className="h-1.5 w-1.5 rounded-full bg-primary-light dark:bg-primary-dark mr-2"></span>
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{attr.name}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({attr.type})</span>
                                          </div>
                                          <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => {/* Özniteliği gruptan kaldır */}}
                                            className="flex items-center"
                                          >
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Kaldır
                                          </Button>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ) : (
                                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                                    Bu gruba atanmış öznitelik bulunmamaktadır.
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p className="text-gray-500 dark:text-gray-400">Bu kategoriye atanmış öznitelik grubu bulunmamaktadır.</p>
                          <Button
                            variant="outline"
                            onClick={() => {/* Öznitelik grubu ekleme modalını aç */}}
                            className="mt-4 flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Grup Ekle
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                },
                {
                  id: 'attributes',
                  title: 'Öznitelikler',
                  badge: attributes.length || undefined,
                  content: (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Öznitelikler</h3>
                        <Button
                          variant="outline"
                          onClick={() => {/* Öznitelik ekleme modalını aç */}}
                          className="flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Öznitelik Ekle
                        </Button>
                      </div>
                      
                      {attributes.length > 0 ? (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                              <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                                  Öznitelik Adı
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                                  Tip
                                </th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                                  İşlemler
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                              {attributes.map(attr => (
                                <tr key={attr.id}>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {attr.name}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {attr.type}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => {/* Özniteliği kaldır */}}
                                      className="flex items-center"
                                    >
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                      Kaldır
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-gray-500 dark:text-gray-400">Bu kategoriye atanmış öznitelik bulunmamaktadır.</p>
                          <Button
                            variant="outline"
                            onClick={() => {/* Öznitelik ekleme modalını aç */}}
                            className="mt-4 flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Öznitelik Ekle
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                }
              ]}
              defaultActiveTab="general"
              onTabChange={(tabId) => {
                setActiveTab(tabId);
              }}
            />
          </div>
        ) : (
          <TabView 
            tabs={tabContents} 
            key={`tabs-${category?._id || 'loading'}-${activeTab}-${tabRefreshCounter}`}
            defaultActiveTab={activeTab}
            onTabChange={(tabId) => {
              setActiveTab(tabId);
              setTabRefreshCounter(prev => prev + 1);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CategoryDetailsPage; 