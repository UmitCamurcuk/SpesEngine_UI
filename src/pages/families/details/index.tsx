import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import { Card, TabView, TreeView, TreeViewWithCheckbox } from '../../../components/ui';
import familyService from '../../../services/api/familyService';
import categoryService from '../../../services/api/categoryService';
import attributeService from '../../../services/api/attributeService';
import attributeGroupService from '../../../services/api/attributeGroupService';
import type { Family, CreateFamilyDto } from '../../../types/family';
import type { Category } from '../../../types/category';
import Modal from '../../../components/ui/Modal';
import { toast } from 'react-hot-toast';
import PaginatedAttributeSelector from '../../../components/attributes/PaginatedAttributeSelector';
import AttributeGroupSelector from '../../../components/attributes/AttributeGroupSelector';

// Yardımcı fonksiyon: Family objelerinden ID'yi almak için
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

const FamilyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State tanımlamaları
  const [family, setFamily] = useState<Family | null>(null);
  const [parentFamily, setParentFamily] = useState<Family | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState<CreateFamilyDto>({
    name: '',
    code: '',
    description: '',
    attributes: []
  });
  
  // Üst aileler listesi
  const [parentFamilies, setParentFamilies] = useState<Family[]>([]);
  
  // Form hataları
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // İşlem durumu
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Tab state için
  const [activeTab, setActiveTab] = useState<string>('general');
  const [tabRefreshCounter, setTabRefreshCounter] = useState<number>(0);
  
  // Öznitelik ve öznitelik grupları için state'ler
  const [attributes, setAttributes] = useState<{id: string, name: string, type: string}[]>([]);
  const [attributeGroups, setAttributeGroups] = useState<{
    id: string, 
    name: string, 
    code: string, 
    description?: string, 
    attributes?: any[]
  }[]>([]);
  
  // Hiyerarşi görünümü için
  const [familyTree, setFamilyTree] = useState<{
    id: string,
    name: string,
    data?: any,
    children?: any[]
  }[]>([]);
  
  // Modal state'leri
  const [showAttributeModal, setShowAttributeModal] = useState<boolean>(false);
  const [showAttributeGroupModal, setShowAttributeGroupModal] = useState<boolean>(false);
  
  // Öznitelik seçici modal için state'ler
  const [selectedAttributeIdsForModal, setSelectedAttributeIdsForModal] = useState<string[]>([]);
  const [selectedGroupIdsForModal, setSelectedGroupIdsForModal] = useState<string[]>([]);
  
  // TabItems için state
  const [tabContents, setTabContents] = useState<any[]>([]);
  
  // Veriler yüklendiğinde
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Aileyi getir
        const familyData = await familyService.getFamilyById(id, {
          includeAttributes: true,
          includeAttributeGroups: true
        });
        setFamily(familyData);
        
        // Form datayı güncelle
        setFormData({
          name: familyData.name,
          code: familyData.code,
          description: familyData.description,
          parentFamily: familyData.parentFamily,
          attributes: familyData.attributes || [],
          isActive: familyData.isActive
        });
        
        // Üst aileyi getir
        if (familyData.parentFamily) {
          try {
            const parentFamilyData = await familyService.getFamilyById(familyData.parentFamily);
            setParentFamily(parentFamilyData);
          } catch (err) {
            console.error('Üst aile getirilirken hata oluştu:', err);
          }
        }
        
        // Tüm aileleri getir (üst aile seçimi için)
        try {
          const result = await familyService.getFamilies({
            isActive: true,
            limit: 100
          });
          // Kendisini üst aile listesinden çıkar
          setParentFamilies(result.families.filter(f => f._id !== id));
          
          // Aile ağacını oluştur
          await fetchFamilyTree();
        } catch (err) {
          console.error('Aileler getirilirken hata oluştu:', err);
        }
        
        // İlişkili öznitelikleri getir
        if (familyData.attributes && familyData.attributes.length > 0) {
          try {
            const fetchedAttributes = [];
            for (const attributeId of familyData.attributes) {
              const attributeData = await attributeService.getAttributeById(attributeId._id);
              fetchedAttributes.push({ 
                id: attributeData._id, 
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
        if (familyData.attributeGroups && familyData.attributeGroups.length > 0) {
          try {
            const fetchedGroups = [];
            for (const groupData of familyData.attributeGroups) {
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
        setError(err.message || 'Aile bilgileri getirilirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Family ağacını getir
  const fetchFamilyTree = async () => {
    try {
      // Tüm aileleri getir
      const { families } = await familyService.getFamilies({ limit: 500 });
      
      // Ağaç yapısını oluştur
      const buildFamilyTree = (parentId: string | null = null): any[] => {
        const nodes = families
          .filter(family => {
            // Ailenin parent değeri (string veya obje olabilir)
            let parentValue = null;
            
            if (family.parentFamily) {
              // Eğer string ise direkt kullan
              if (typeof family.parentFamily === 'string') {
                parentValue = family.parentFamily;
              } 
              // Obje ise ve id özelliği varsa
              else if (typeof family.parentFamily === 'object') {
                const parentObj = family.parentFamily as any;
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
  
  // Form değişiklik işleyicisi
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Checkbox kontrolü için
    if (type === 'checkbox') {
      const checkboxValue = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev as CreateFamilyDto, [name]: checkboxValue }));
    } else {
      setFormData(prev => ({ ...prev as CreateFamilyDto, [name]: value }));
    }
    
    // Hata varsa temizle
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
    
    if (!formData.name.trim()) {
      errors.name = 'Aile adı zorunludur';
    }
    
    if (!formData.code.trim()) {
      errors.code = 'Aile kodu zorunludur';
    } else if (!/^[a-z0-9_]+$/.test(formData.code)) {
      errors.code = 'Kod yalnızca küçük harfler, sayılar ve alt çizgi içerebilir';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Açıklama zorunludur';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Güncelleme işlemi
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !validateForm()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // API'ye gönderilecek veriyi hazırla
      const familyData: Partial<CreateFamilyDto> = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim(),
        parentFamily: formData.parentFamily || undefined,
        isActive: formData.isActive,
        attributes: attributes.map(a => a.id),
        attributeGroups: attributeGroups.map(g => g.id)
      };
      
      // API isteği gönder
      const updatedFamily = await familyService.updateFamily(id, familyData);
      
      // State'i güncelle
      setFamily(updatedFamily);
      setIsEditing(false);
      setSuccess(true);
      
      // Üst aile değiştiyse, üst aileyi güncelle
      if (updatedFamily.parentFamily !== family?.parentFamily) {
        if (updatedFamily.parentFamily) {
          try {
            const parentFamilyData = await familyService.getFamilyById(updatedFamily.parentFamily);
            setParentFamily(parentFamilyData);
          } catch (err) {
            console.error('Üst aile getirilirken hata oluştu:', err);
          }
        } else {
          setParentFamily(null);
        }
      }
      
      toast.success('Aile başarıyla güncellendi');
    } catch (err: any) {
      setError(err.message || 'Aile güncellenirken bir hata oluştu');
      toast.error('Aile güncellenirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }

    // Başarı mesajını birkaç saniye sonra gizle
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };
  
  // Silme işlemi
  const handleDelete = async () => {
    if (!id || !family) return;
    
    if (window.confirm(`"${family.name}" ailesini silmek istediğinize emin misiniz?`)) {
      try {
        await familyService.deleteFamily(id);
        toast.success('Aile başarıyla silindi');
        navigate('/families/list');
      } catch (err: any) {
        setError(err.message || 'Aile silinirken bir hata oluştu');
        toast.error('Aile silinirken bir hata oluştu');
      }
    }
  };
  
  // Edit moduna geç
  const handleEdit = () => {
    setIsEditing(true);
    
    // Parent ailesini doğru şekilde ayarla
    const parentFamilyId = getEntityId(family?.parentFamily);
    
    setFormData({
      name: family?.name || '',
      code: family?.code || '',
      description: family?.description || '',
      parentFamily: parentFamilyId || undefined,
      attributes: family?.attributes || [],
      isActive: family?.isActive || true
    });
  };
  
  // Edit modundan çık
  const handleCancel = () => {
    if (family) {
      // Form veriyi orijinal hale getir
      setFormData({
        name: family.name,
        code: family.code,
        description: family.description,
        parentFamily: family.parentFamily,
        attributes: family.attributes || [],
        isActive: family.isActive
      });
    }
    setFormErrors({});
    setIsEditing(false);
  };
  
  // Tab içeriklerini render et
  useEffect(() => {
    if (family) {
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
  }, [family, isEditing, attributeGroups, attributes, activeTab, familyTree]);
  
  // Tab içeriklerini render et
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
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Aile Adı</h4>
          <p className="mt-1 text-gray-900 dark:text-white">{family?.name}</p>
        </div>
        
        {/* Kod */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Kod</h4>
          <p className="mt-1 text-gray-900 dark:text-white">{family?.code}</p>
        </div>
        
        {/* Üst Aile */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Üst Aile</h4>
          <p className="mt-1 text-gray-900 dark:text-white">
            {parentFamily ? parentFamily.name : 'Ana Aile'}
          </p>
        </div>
        
        {/* Durum */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Durum</h4>
          <div className="mt-1">
            {family?.isActive ? (
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
          <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-wrap">{family?.description || '-'}</p>
        </div>
        
        {/* Oluşturulma Tarihi */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Oluşturulma Tarihi</h4>
          <p className="mt-1 text-gray-900 dark:text-white">
            {new Date(family?.createdAt || '').toLocaleString('tr-TR')}
          </p>
        </div>
        
        {/* Son Güncelleme */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Son Güncelleme</h4>
          <p className="mt-1 text-gray-900 dark:text-white">
            {new Date(family?.updatedAt || '').toLocaleString('tr-TR')}
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
      
      <div className="grid grid-cols-1 gap-6">
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
                    key={`hierarchy-family-tree-${tabRefreshCounter}-${formData.parentFamily || 'none'}`}
                    data={familyTree} 
                    defaultSelectedIds={formData.parentFamily ? [formData.parentFamily] : []}
                    expandAll={true}
                    maxHeight="300px"
                    showRelationLines={true}
                    variant="spectrum"
                    onSelectionChange={(selectedIds) => {
                      if (selectedIds.length > 0 && selectedIds[0] !== id) {
                        // Düzenleme modunda seçilen aileyi üst aile olarak ayarla
                        const newParentId = selectedIds[0] || undefined;
                        console.log("Hiyerarşi tab - Üst aile değişti:", newParentId);
                        setFormData(prev => {
                          const updated = { ...prev, parentFamily: newParentId };
                          console.log("Hiyerarşi tab - formData güncellendi:", updated);
                          return updated;
                        });
                      }
                    }}
                    className="shadow-sm"
                  />
                ) : (
                  <TreeView 
                    data={familyTree} 
                    activeNodeId={id}
                    expandAll={true}
                    maxHeight="300px"
                    showRelationLines={true}
                    variant="spectrum"
                    onNodeClick={(node) => {
                      if (node.id !== id) {
                        navigate(`/families/details/${node.id}`);
                      }
                    }}
                    className="shadow-sm"
                    key={`family-tree-view-${id}`}
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
          
          {/* Seçili Üst Aile Bilgisi */}
          {parentFamily && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">Üst Aile Bilgisi</h4>
                  <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                    Bu aile, <strong>{parentFamily.name}</strong> ailesinin alt ailesidir.
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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Öznitelik Grupları</h3>
        <Button
          variant="outline"
          onClick={() => isEditing && setShowAttributeGroupModal(true)}
          className={`flex items-center ${!isEditing && 'opacity-50 cursor-not-allowed'}`}
          disabled={!isEditing}
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
                    onClick={() => isEditing && handleRemoveAttributeGroup(group.id)}
                    className={`flex items-center ${!isEditing && 'opacity-50 cursor-not-allowed'}`}
                    disabled={!isEditing}
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
                            onClick={() => isEditing && handleRemoveAttributeFromGroup(attr._id, group.id)}
                            className={`flex items-center ${!isEditing && 'opacity-50 cursor-not-allowed'}`}
                            disabled={!isEditing}
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
          <p className="text-gray-500 dark:text-gray-400">Bu aileye atanmış öznitelik grubu bulunmamaktadır.</p>
          <Button
            variant="outline"
            onClick={() => isEditing && setShowAttributeGroupModal(true)}
            className={`mt-4 flex items-center ${!isEditing && 'opacity-50 cursor-not-allowed'}`}
            disabled={!isEditing}
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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Öznitelikler</h3>
        <Button
          variant="outline"
          onClick={() => isEditing && setShowAttributeModal(true)}
          className={`flex items-center ${!isEditing && 'opacity-50 cursor-not-allowed'}`}
          disabled={!isEditing}
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
                      onClick={() => isEditing && handleRemoveAttribute(attr.id)}
                      className={`flex items-center ${!isEditing && 'opacity-50 cursor-not-allowed'}`}
                      disabled={!isEditing}
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
          <p className="text-gray-500 dark:text-gray-400">Bu aileye atanmış öznitelik bulunmamaktadır.</p>
          <Button
            variant="outline"
            onClick={() => isEditing && setShowAttributeModal(true)}
            className={`mt-4 flex items-center ${!isEditing && 'opacity-50 cursor-not-allowed'}`}
            disabled={!isEditing}
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
  const handleAddAttributeGroup = (selectedGroupIds: string[]) => {
    if (!isEditing || !selectedGroupIds.length) return;
    
    // Öznitelik gruplarını getir ve state'e ekle
    const fetchAndAddGroups = async () => {
      try {
        for (const groupId of selectedGroupIds) {
          // Grup zaten ekli mi kontrol et
          if (attributeGroups.some(g => g.id === groupId)) continue;
          
          const groupData = await attributeGroupService.getAttributeGroupById(groupId, {
            includeAttributes: true
          });
          
          setAttributeGroups(prev => [...prev, {
            id: groupData._id,
            name: groupData.name,
            code: groupData.code,
            description: groupData.description,
            attributes: groupData.attributes || []
          }]);
        }
        
        toast.success("Öznitelik grupları başarıyla eklendi");
        setShowAttributeGroupModal(false);
      } catch (err) {
        toast.error("Öznitelik grupları eklenirken hata oluştu");
        console.error('Öznitelik grupları eklenirken hata:', err);
      }
    };
    
    fetchAndAddGroups();
  };
  
  // Öznitelik ekleme handler'ı
  const handleAddAttribute = (selectedAttributeIds: string[]) => {
    if (!isEditing || !selectedAttributeIds.length) return;
    
    // Öznitelikleri getir ve state'e ekle
    const fetchAndAddAttributes = async () => {
      try {
        for (const attrId of selectedAttributeIds) {
          // Öznitelik zaten ekli mi kontrol et
          if (attributes.some(a => a.id === attrId)) continue;
          
          const attrData = await attributeService.getAttributeById(attrId);
          
          setAttributes(prev => [...prev, {
            id: attrData._id,
            name: attrData.name,
            type: attrData.type
          }]);
        }
        
        toast.success("Öznitelikler başarıyla eklendi");
        setShowAttributeModal(false);
      } catch (err) {
        toast.error("Öznitelikler eklenirken hata oluştu");
        console.error('Öznitelikler eklenirken hata:', err);
      }
    };
    
    fetchAndAddAttributes();
  };
  
  // Öznitelik seçici modal
  const renderAttributeModal = () => (
    <Modal
      title="Öznitelik Ekle"
      isOpen={showAttributeModal}
      onClose={() => setShowAttributeModal(false)}
      size="lg"
    >
      <div className="p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Bu aileye eklemek istediğiniz öznitelikleri seçin.
        </p>
        
        <PaginatedAttributeSelector 
          selectedAttributes={selectedAttributeIdsForModal}
          onChange={setSelectedAttributeIdsForModal}
          excludeIds={attributes.map(a => typeof a.id === 'string' ? a.id : '')}
        />
        
        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedAttributeIdsForModal([]);
              setShowAttributeModal(false);
            }}
          >
            İptal
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              handleAddAttribute(selectedAttributeIdsForModal);
              setSelectedAttributeIdsForModal([]);
            }}
          >
            Ekle
          </Button>
        </div>
      </div>
    </Modal>
  );

  // Öznitelik grubu seçici modal
  const renderAttributeGroupModal = () => (
    <Modal
      title="Öznitelik Grubu Ekle"
      isOpen={showAttributeGroupModal}
      onClose={() => setShowAttributeGroupModal(false)}
      size="lg"
    >
      <div className="p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Bu aileye eklemek istediğiniz öznitelik gruplarını seçin.
        </p>
        
        <AttributeGroupSelector
          selectedAttributeGroups={selectedGroupIdsForModal}
          onChange={setSelectedGroupIdsForModal}
        />
        
        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedGroupIdsForModal([]);
              setShowAttributeGroupModal(false);
            }}
          >
            İptal
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              handleAddAttributeGroup(selectedGroupIdsForModal);
              setSelectedGroupIdsForModal([]);
            }}
          >
            Ekle
          </Button>
        </div>
      </div>
    </Modal>
  );
  
  // Düzenleme modu değiştiğinde form verilerini doğru gösterilmesini sağla
  useEffect(() => {
    if (isEditing && family) {
      const parentFamilyId = getEntityId(family.parentFamily);
      
      console.log("Düzenleme modu değişti. Parent Family ID:", parentFamilyId);
      
      // TreeView bileşenlerinin yeniden render edilmesi için tabRefreshCounter'ı artır
      setTabRefreshCounter(prev => prev + 1);
    }
  }, [isEditing, family]);
  
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
  
  if (error || !family) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
        <h3 className="text-lg font-semibold mb-2">Hata Oluştu</h3>
        <p>{error || 'Bilinmeyen bir hata oluştu'}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/families/list')}
        >
          Listeye Dön
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <div className="space-y-6">
        {/* Başlık */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <svg className="w-7 h-7 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                {isEditing ? 'Aile Düzenle' : 'Aile Detayları'}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {family.name} ailesinin detaylı bilgileri
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate('/families/list')}
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
                    disabled={isSubmitting}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    İptal
                  </Button>
                  <Button
                    onClick={handleUpdate}
                    variant="primary"
                    className="flex items-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
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
                <>
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
                  <Button
                    variant="danger"
                    className="flex items-center"
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
              <span>Aile başarıyla güncellendi!</span>
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
                              Aile Adı <span className="text-red-500">*</span>
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
                            {formErrors.name && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
                            )}
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
                            {formErrors.code && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.code}</p>
                            )}
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
                            {formErrors.description && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.description}</p>
                            )}
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
                              Ailenin aktif olup olmadığını belirler. Pasif aileler kullanıcı arayüzünde gösterilmez.
                            </p>
                          </div>
                        </div>
                      </div>
                    )
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
              key={`tabs-${family?._id || 'loading'}-${activeTab}-${tabRefreshCounter}`}
              defaultActiveTab={activeTab}
              onTabChange={(tabId) => {
                setActiveTab(tabId);
                setTabRefreshCounter(prev => prev + 1);
              }}
            />
          )}
        </div>
      </div>
      
      {/* Modallar */}
      {renderAttributeModal()}
      {renderAttributeGroupModal()}
    </>
  );
};

export default FamilyDetailsPage; 