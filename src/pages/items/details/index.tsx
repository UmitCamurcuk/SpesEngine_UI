import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import itemService from '../../../services/api/itemService';
import itemTypeService from '../../../services/api/itemTypeService';
import familyService from '../../../services/api/familyService';
import attributeService from '../../../services/api/attributeService';
import attributeGroupService from '../../../services/api/attributeGroupService';
import type { Item, AttributeValue } from '../../../types/item';
import type { Attribute } from '../../../types/attribute';
import type { AttributeGroup } from '../../../types/attributeGroup';

const ItemDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // Tab state'i
  const [activeTab, setActiveTab] = useState<string>('general');
  
  // Veri state'i
  const [item, setItem] = useState<Item | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // İlişkili veriler
  const [itemTypeName, setItemTypeName] = useState<string>('');
  const [familyName, setFamilyName] = useState<string>('');
  const [attributesMap, setAttributesMap] = useState<Record<string, Attribute>>({});
  const [attributeGroupsMap, setAttributeGroupsMap] = useState<Record<string, AttributeGroup>>({});
  
  // Form state
  const [formData, setFormData] = useState<Partial<Item>>({
    itemType: '',
    family: '',
    category: '',
    attributes: {},
    isActive: true
  });
  
  // Loading ve error state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // itemType ve family detaylarını state olarak tut
  const [itemTypeData, setItemTypeData] = useState<any>(null);
  const [familyData, setFamilyData] = useState<any>(null);
  
  // Itemı yükle
  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const itemData = await itemService.getItemById(id);
        setItem(itemData);
        setFormData({
          itemType: itemData.itemType,
          family: itemData.family,
          category: itemData.category,
          attributes: itemData.attributes,
          isActive: itemData.isActive
        });
        
        // İlişkili verileri getir
        if (itemData.itemType) {
          try {
            const itemTypeId = typeof itemData.itemType === 'string' ? itemData.itemType : itemData.itemType._id;
            const itemTypeData = await itemTypeService.getItemTypeById(itemTypeId);
            setItemTypeData(itemTypeData);
            setItemTypeName(itemTypeData.name);
          } catch (err) {
            console.error('Öğe tipi bilgisi getirilirken hata oluştu:', err);
          }
        }
        
        if (itemData.family) {
          try {
            const familyId = typeof itemData.family === 'string' ? itemData.family : itemData.family._id;
            const familyData = await familyService.getFamilyById(familyId);
            setFamilyData(familyData);
            setFamilyName(familyData.name);
          } catch (err) {
            console.error('Aile bilgisi getirilirken hata oluştu:', err);
          }
        }
        
        // Attributeları yükle
        if (itemData.attributes && Object.keys(itemData.attributes).length > 0) {
          const attributeIds = Object.keys(itemData.attributes);
          
          try {
            const attributesData: Record<string, Attribute> = {};
            
            // Her bir attribute için detay bilgi al
            for (const attrId of attributeIds) {
              const attributeData = await attributeService.getAttributeById(attrId);
              attributesData[attrId] = attributeData;
            }
            
            setAttributesMap(attributesData);
            
            // Attribute gruplarını yükle
            const attributeGroupIds = new Set<string>();
            Object.values(attributesData).forEach(attr => {
              if (attr.attributeGroup) {
                attributeGroupIds.add(typeof attr.attributeGroup === 'string' ? attr.attributeGroup : attr.attributeGroup._id);
              }
            });
            
            const attributeGroupsData: Record<string, AttributeGroup> = {};
            for (const groupId of attributeGroupIds) {
              const groupData = await attributeGroupService.getAttributeGroupById(groupId);
              attributeGroupsData[groupId] = groupData;
            }
            
            setAttributeGroupsMap(attributeGroupsData);
          } catch (err) {
            console.error('Öznitelik bilgileri getirilirken hata oluştu:', err);
          }
        }
        
      } catch (err: any) {
        setError('Öğe verileri yüklenirken bir hata oluştu: ' + (err.message || err));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchItemDetails();
  }, [id]);
  
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
      await itemService.updateItem(id, formData);
      
      // Güncel veriyi yeniden yükle
      const updatedItem = await itemService.getItemById(id);
      setItem(updatedItem);
      
      setSuccess(true);
      setIsEditing(false);
      
      // Başarı mesajını belirli bir süre sonra kaldır
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'Öğe güncellenirken bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Öğeyi silme handler
  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm('Bu öğeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      setIsLoading(true);
      setError(null);
      
      try {
        await itemService.deleteItem(id);
        navigate('/items/list');
      } catch (err: any) {
        setError(err.message || 'Öğe silinirken bir hata oluştu');
        setIsLoading(false);
      }
    }
  };

  // Tab değiştirme handler
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };
  
  // Attribute'ları gruplarına göre organize et
  const getAttributesByGroup = () => {
    if (!item?.attributeValues || item.attributeValues.length === 0) return {};
    
    const attributesByGroup: Record<string, AttributeValue[]> = {
      'nogroup': []
    };
    
    item.attributeValues.forEach(attrValue => {
      const attribute = attributesMap[attrValue.attributeId];
      if (attribute && attribute.attributeGroup) {
        if (!attributesByGroup[attribute.attributeGroup]) {
          attributesByGroup[attribute.attributeGroup] = [];
        }
        attributesByGroup[attribute.attributeGroup].push(attrValue);
      } else {
        attributesByGroup['nogroup'].push(attrValue);
      }
    });
    
    return attributesByGroup;
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
  
  if (error && !item) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
        <h3 className="text-lg font-semibold mb-2">Hata Oluştu</h3>
        <p>{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/items/list')}
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-7 h-7 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Öğe Detayları
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {item?.name} öğesinin detaylı bilgileri
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate('/items/list')}
              className="flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Listeye Dön
            </Button>
            
            {isEditing ? (
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Düzenlemeyi İptal Et
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => setIsEditing(true)}
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
      
      {/* Tab Bar */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => handleTabChange('general')}
            className={`relative flex items-center px-4 py-3 text-sm font-medium border-b-2 focus:outline-none transition-colors ${
              activeTab === 'general'
                ? 'border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Genel Bilgiler
          </button>
          
          <button
            onClick={() => handleTabChange('attributes')}
            className={`relative flex items-center px-4 py-3 text-sm font-medium border-b-2 focus:outline-none transition-colors ${
              activeTab === 'attributes'
                ? 'border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            Öznitelikler
          </button>
          
          <button
            onClick={() => handleTabChange('relationships')}
            className={`relative flex items-center px-4 py-3 text-sm font-medium border-b-2 focus:outline-none transition-colors ${
              activeTab === 'relationships'
                ? 'border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
            </svg>
            İlişkiler
          </button>
        </div>
        
        {/* Tab İçerikleri */}
        <div className="p-6">
          {/* Genel Bilgiler Tab */}
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Temel Bilgiler */}
              <div className="col-span-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 h-fit">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Temel Bilgiler</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Adı</span>
                    <div className="font-semibold text-gray-900 dark:text-white">{item?.name || '-'}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Kod</span>
                    <div className="font-mono text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{item?.code || '-'}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Durum</span>
                    <div className="mt-1">
                      {item?.isActive ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">Aktif</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500">Pasif</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Oluşturulma Tarihi</span>
                    <div className="text-sm text-gray-900 dark:text-white">{item?.createdAt ? new Date(item.createdAt).toLocaleString('tr-TR') : '-'}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Açıklama</span>
                    <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{item?.description || '-'}</div>
                  </div>
                </div>
              </div>

              {/* ItemType Detayları */}
              <div className="col-span-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 h-fit">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Öğe Tipi
                </h3>
                {itemTypeData ? (
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Adı</span>
                      <div className="font-semibold text-gray-900 dark:text-white">{itemTypeData.name || '-'}</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Kod</span>
                      <div className="font-mono text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{itemTypeData.code || '-'}</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Açıklama</span>
                      <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{itemTypeData.description || '-'}</div>
                    </div>
                    {itemTypeData.parent && (
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Üst Tip</span>
                        <div className="text-sm text-gray-900 dark:text-white">{typeof itemTypeData.parent === 'object' ? itemTypeData.parent.name : itemTypeData.parent}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-400 italic">Tip bilgisi yok</div>
                )}
              </div>

              {/* Family Detayları */}
              <div className="col-span-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 h-fit">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Aile
                </h3>
                {familyData ? (
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Adı</span>
                      <div className="font-semibold text-gray-900 dark:text-white">{familyData.name || '-'}</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Kod</span>
                      <div className="font-mono text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{familyData.code || '-'}</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Açıklama</span>
                      <div className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{familyData.description || '-'}</div>
                    </div>
                    {familyData.parent && (
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Üst Aile</span>
                        <div className="text-sm text-gray-900 dark:text-white">{typeof familyData.parent === 'object' ? familyData.parent.name : familyData.parent}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-400 italic">Aile bilgisi yok</div>
                )}
              </div>
            </div>
          )}
          
          {/* Öznitelikler Tab */}
          {activeTab === 'attributes' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Öznitelikler</h3>
              
              {item?.attributeValues && item.attributeValues.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(getAttributesByGroup()).map(([groupId, attrs]) => {
                    if (attrs.length === 0) return null;
                    
                    const groupName = groupId === 'nogroup' 
                      ? 'Gruplanmamış Öznitelikler' 
                      : attributeGroupsMap[groupId]?.name || 'Bilinmeyen Grup';
                      
                    return (
                      <div key={groupId} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <h4 className="font-medium text-gray-800 dark:text-gray-200">{groupName}</h4>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                          {attrs.map((attrValue) => {
                            const attribute = attributesMap[attrValue.attributeId];
                            return (
                              <div key={attrValue.attributeId} className="grid grid-cols-3 px-4 py-3">
                                <div className="col-span-1 text-gray-600 dark:text-gray-400 font-medium">
                                  {attribute?.name || 'Bilinmeyen Öznitelik'}
                                </div>
                                <div className="col-span-2 text-gray-900 dark:text-white">
                                  {Array.isArray(attrValue.value) 
                                    ? attrValue.value.join(', ') 
                                    : typeof attrValue.value === 'boolean'
                                      ? (attrValue.value ? 'Evet' : 'Hayır')
                                      : attrValue.value?.toString() || '-'}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-gray-500 dark:text-gray-400 text-center">
                  Bu öğeye tanımlanmış öznitelik değeri bulunmamaktadır.
                </div>
              )}
            </div>
          )}
          
          {/* İlişkiler Tab */}
          {activeTab === 'relationships' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">İlişkiler</h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-gray-500 dark:text-gray-400 text-center">
                Bu öğe için ilişki tanımı bulunmamaktadır.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsPage; 