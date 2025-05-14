import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import attributeGroupService from '../../../services/api/attributeGroupService';
import type { AttributeGroup } from '../../../services/api/attributeGroupService';
import attributeService from '../../../services/api/attributeService';
import type { Attribute } from '../../../services/api/attributeService';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

interface EditableAttributeGroupFields {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

const AttributeGroupDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State tanımlamaları
  const [attributeGroup, setAttributeGroup] = useState<AttributeGroup | null>(null);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
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
          try {
            // Burada özniteliklerin detaylarını getirmek için ek bir API çağrısı yapılabilir
            // Örnek olarak:
            const attributePromises = data.attributes.map((attrId: string) => 
              attributeService.getAttributeById(attrId)
            );
            const attributeResults = await Promise.all(attributePromises);
            setAttributes(attributeResults);
          } catch (err) {
            console.error('İlişkili öznitelikler getirilirken hata oluştu:', err);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Öznitelik grubu bilgileri getirilirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAttributeGroupDetails();
  }, [id]);
  
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
      errors.name = 'Öznitelik grup adı zorunludur';
    }
    
    if (!editableFields.description.trim()) {
      errors.description = 'Açıklama zorunludur';
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
      alert('Öznitelik grubu başarıyla güncellendi');
    } catch (err: any) {
      setError(err.message || 'Öznitelik grubu güncellenirken bir hata oluştu');
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
    
    if (window.confirm(`"${attributeGroup.name}" öznitelik grubunu silmek istediğinize emin misiniz?`)) {
      try {
        await attributeGroupService.deleteAttributeGroup(id);
        navigate('/attributeGroups/list');
      } catch (err: any) {
        setError(err.message || 'Öznitelik grubu silinirken bir hata oluştu');
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
          <h3 className="text-lg font-semibold">Hata</h3>
        </div>
        <p className="mb-3">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/attributeGroups/list')}
          className="mt-2"
        >
          Listeye Dön
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
          <h3 className="text-lg font-semibold">Bulunamadı</h3>
        </div>
        <p className="mb-3">Öznitelik grubu bulunamadı veya silinmiş olabilir.</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/attributeGroups/list')}
          className="mt-2"
        >
          Listeye Dön
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Başlık Kartı */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-6 h-6 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {isEditing ? 'Öznitelik Grubu Düzenle' : attributeGroup.name}
            </h1>
            {!isEditing && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {attributeGroup.description}
              </p>
            )}
          </div>
          
          <div className="flex mt-4 md:mt-0 space-x-3">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  İptal
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  isLoading={isSaving}
                >
                  Kaydet
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
                  <span>Listeye Dön</span>
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setIsEditing(true)}
                >
                  <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Düzenle</span>
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                >
                  <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Sil</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* İçerik Kartı */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        {isEditing ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sol Kolon */}
              <div className="space-y-6">
                {/* Grup Adı */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Grup Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editableFields.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      formErrors.name
                        ? 'border-red-300 focus:ring-red-500 dark:border-red-700'
                        : 'border-gray-300 focus:ring-primary-light dark:border-gray-700 dark:focus:ring-primary-dark'
                    } dark:bg-gray-800 dark:text-white`}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
                  )}
                </div>
                
                {/* Grup Kodu (salt okunur) */}
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Grup Kodu
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={editableFields.code}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-mono"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Kod değiştirilemez
                  </p>
                </div>
              </div>
              
              {/* Sağ Kolon */}
              <div className="space-y-6">
                {/* Açıklama */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Açıklama <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={editableFields.description}
                    onChange={handleInputChange}
                    rows={5}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      formErrors.description
                        ? 'border-red-300 focus:ring-red-500 dark:border-red-700'
                        : 'border-gray-300 focus:ring-primary-light dark:border-gray-700 dark:focus:ring-primary-dark'
                    } dark:bg-gray-800 dark:text-white`}
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.description}</p>
                  )}
                </div>
                
                {/* Aktif/Pasif Durumu */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={editableFields.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-light focus:ring-primary-light border-gray-300 rounded dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-primary-dark"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Aktif
                  </label>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Genel Bilgiler */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Genel Bilgiler</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Grup Kodu</p>
                    <p className="mt-1 font-mono text-gray-900 dark:text-white">{attributeGroup.code}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Durum</p>
                    <p className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        attributeGroup.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {attributeGroup.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Oluşturulma Tarihi</p>
                    <p className="mt-1 text-gray-900 dark:text-white">{formatDate(attributeGroup.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Son Güncelleme</p>
                    <p className="mt-1 text-gray-900 dark:text-white">{formatDate(attributeGroup.updatedAt)}</p>
                  </div>
                </div>
              </div>
              
              {/* İlişkili Öznitelikler */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center justify-between">
                  <span>İlişkili Öznitelikler</span>
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    {Array.isArray(attributeGroup.attributes) ? attributeGroup.attributes.length : 0} öznitelik
                  </span>
                </h3>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  {Array.isArray(attributeGroup.attributes) && attributeGroup.attributes.length > 0 ? (
                    <div className="space-y-2">
                      {attributes.length > 0 ? (
                        attributes.map((attribute) => (
                          <div 
                            key={attribute._id}
                            className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md"
                          >
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{attribute.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{attribute.code}</p>
                            </div>
                            <Button
                              variant="outline"
                              className="text-sm p-1"
                              onClick={() => navigate(`/attributes/${attribute._id}`)}
                            >
                              Görüntüle
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                          </svg>
                          <p>Öznitelik detayları yükleniyor...</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>Bu gruba bağlı öznitelik bulunmuyor</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttributeGroupDetailsPage; 