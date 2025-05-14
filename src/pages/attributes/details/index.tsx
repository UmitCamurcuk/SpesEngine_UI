import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import AttributeBadge from '../../../components/attributes/AttributeBadge';
import attributeService from '../../../services/api/attributeService';
import attributeGroupService from '../../../services/api/attributeGroupService';
import type { Attribute } from '../../../services/api/attributeService';
import type { AttributeGroup } from '../../../services/api/attributeGroupService';
import { AttributeType, AttributeTypeLabels } from '../../../types/attribute';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import AttributeHistoryList from '../../../components/attributes/AttributeHistoryList';

interface EditableAttributeFields {
  name: string;
  code: string;
  type: AttributeType;
  description: string;
  isRequired: boolean;
  options: string; // Düzenlenebilir string olarak tutulur, kayıt sırasında array'e dönüştürülür
  attributeGroup?: string;
}

const AttributeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State tanımlamaları
  const [attribute, setAttribute] = useState<Attribute | null>(null);
  const [attributeGroup, setAttributeGroup] = useState<AttributeGroup | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Düzenlenebilir alanlar için form state
  const [editableFields, setEditableFields] = useState<EditableAttributeFields>({
    name: '',
    code: '',
    type: AttributeType.TEXT,
    description: '',
    isRequired: false,
    options: '',
    attributeGroup: undefined
  });
  
  // Öznitelik detaylarını getir
  useEffect(() => {
    const fetchAttributeDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await attributeService.getAttributeById(id);
        setAttribute(data);
        
        // Form alanlarını başlat
        setEditableFields({
          name: data.name,
          code: data.code || '',
          type: data.type || AttributeType.TEXT,
          description: data.description || '',
          isRequired: data.isRequired,
          options: data.options ? data.options.join(', ') : '',
          attributeGroup: data.attributeGroup
        });
        
        // Eğer attributeGroup varsa, o bilgileri de getir
        if (data.attributeGroup) {
          try {
            const groupId = typeof data.attributeGroup === "string" ? data.attributeGroup : (data.attributeGroup as any)._id;
            const groupData = await attributeGroupService.getAttributeGroupById(groupId);
            setAttributeGroup(groupData);
          } catch (err) {
            console.error('Öznitelik grubu getirilirken hata oluştu:', err);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Öznitelik bilgileri getirilirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAttributeDetails();
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
      errors.name = 'Öznitelik adı zorunludur';
    }
    
    if (
      attribute && 
      (attribute.type === AttributeType.SELECT || attribute.type === AttributeType.MULTISELECT) && 
      !editableFields.options.trim()
    ) {
      errors.options = 'Seçim tipi için en az bir seçenek belirtmelisiniz';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Kaydetme işlemi
  const handleSave = async () => {
    if (!id || !attribute) return;
    
    if (!validateForm()) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const updatedData = {
        name: editableFields.name.trim(),
        description: editableFields.description.trim(),
        isRequired: editableFields.isRequired
      };
      
      // Select veya MultiSelect için options'ı güncelle
      if (attribute.type === AttributeType.SELECT || attribute.type === AttributeType.MULTISELECT) {
        const options = editableFields.options
          .split(',')
          .map(option => option.trim())
          .filter(option => option.length > 0);
          
        Object.assign(updatedData, { options });
      }
      
      // API'ye gönder
      const updatedAttribute = await attributeService.updateAttribute(id, updatedData);
      
      // State'i güncelle
      setAttribute(updatedAttribute);
      setIsEditing(false);
      
      // Başarı bildirimi göster
      alert('Öznitelik başarıyla güncellendi');
    } catch (err: any) {
      setError(err.message || 'Öznitelik güncellenirken bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Düzenleme modunu iptal et
  const handleCancelEdit = () => {
    if (!attribute) return;
    
    // Form alanlarını orijinal değerlere sıfırla
    setEditableFields({
      name: attribute.name,
      code: attribute.code || '',
      type: attribute.type || AttributeType.TEXT,
      description: attribute.description || '',
      isRequired: attribute.isRequired,
      options: attribute.options ? attribute.options.join(', ') : '',
      attributeGroup: attribute.attributeGroup
    });
    
    setFormErrors({});
    setIsEditing(false);
  };
  
  // Silme işlemi
  const handleDelete = async () => {
    if (!id || !attribute) return;
    
    if (window.confirm(`"${attribute.name}" özniteliğini silmek istediğinize emin misiniz?`)) {
      try {
        await attributeService.deleteAttribute(id);
        navigate('/attributes/list');
      } catch (err: any) {
        setError(err.message || 'Öznitelik silinirken bir hata oluştu');
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
          onClick={() => navigate('/attributes/list')}
          className="mt-2"
        >
          Listeye Dön
        </Button>
      </div>
    );
  }
  
  if (!attribute) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 px-6 py-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-2">
          <svg className="w-6 h-6 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <h3 className="text-lg font-semibold">Bulunamadı</h3>
        </div>
        <p className="mb-3">İstenen öznitelik bulunamadı.</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/attributes/list')}
          className="mt-2"
        >
          Listeye Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="relative">
        {/* Üst renk çubuğu */}
        <div 
          className="h-24 bg-gradient-to-r from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark"
        ></div>
        
        {/* Meta Bilgileri */}
        <div className="absolute top-2 right-4 flex flex-col items-end">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-md px-3 py-2 text-xs text-gray-600 dark:text-gray-300 font-mono shadow-sm">
            <div>ID: <span className="font-semibold">{attribute._id}</span></div>
            <div className="mt-1">Oluşturulma: <span className="font-semibold">{formatDate(attribute.createdAt)}</span></div>
            <div className="mt-1">Son Güncelleme: <span className="font-semibold">{formatDate(attribute.updatedAt)}</span></div>
          </div>
        </div>
        
        {/* Bilgi kartı */}
        <div className="px-6 pb-4 relative">
          <div className="flex flex-col md:flex-row justify-between -mt-10">
            <div className="mb-4 md:mb-0">
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4 inline-block">
                <AttributeBadge type={attribute.type} size="md" />
              </div>
              {isEditing ? (
                <div className="mt-4">
                  <input
                    type="text"
                    name="name"
                    value={editableFields.name}
                    onChange={handleInputChange}
                    className={`w-full md:w-auto px-4 py-2 text-xl font-semibold border ${
                      formErrors.name ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark`}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.name}</p>
                  )}
                </div>
              ) : (
                <h1 className="text-xl md:text-2xl font-semibold mt-4 text-gray-800 dark:text-white">
                  {attribute.name}
                </h1>
              )}
              <p className="text-sm font-mono mt-1 text-gray-500 dark:text-gray-400">
                {attribute.code}
              </p>
            </div>
            
            <div className="flex items-start md:items-center space-x-2">
              {isEditing ? (
                <>
                  <Button
                    variant="primary"
                    className="flex items-center"
                    onClick={handleSave}
                    isLoading={isSaving}
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
                    onClick={handleCancelEdit}
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
                    onClick={() => navigate('/attributes/list')}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Listeye Dön</span>
                  </Button>
                  <Button
                    variant="primary"
                    className="flex items-center"
                    onClick={() => setIsEditing(true)}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Düzenle</span>
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex items-center text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
                    onClick={handleDelete}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Sil</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* İçerik */}
      <div className="p-6">
        {/* Bilgi Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Temel Bilgiler */}
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Temel Bilgiler
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Kod</div>
                <div className="text-gray-800 dark:text-gray-200 font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md">
                  {attribute.code}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tip</div>
                <div className="text-gray-800 dark:text-gray-200">
                  {AttributeTypeLabels[attribute.type]}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Zorunlu</div>
                {isEditing ? (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isRequired"
                      name="isRequired"
                      checked={editableFields.isRequired}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded border-gray-300 dark:border-gray-600"
                    />
                    <label htmlFor="isRequired" className="ml-2 text-gray-800 dark:text-gray-200">
                      {editableFields.isRequired ? 'Evet' : 'Hayır'}
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className={`flex h-6 items-center ${attribute.isRequired ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        {attribute.isRequired ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        )}
                      </svg>
                      {attribute.isRequired ? 'Evet' : 'Hayır'}
                    </span>
                  </div>
                )}
              </div>
              
              {attributeGroup && (
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Öznitelik Grubu</div>
                  <div className="text-gray-800 dark:text-gray-200 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    {attributeGroup.name}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Detaylar */}
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-secondary-light dark:text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Detaylar
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Açıklama</div>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={editableFields.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                  ></textarea>
                ) : (
                  <div className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 p-3 rounded-md min-h-[5rem]">
                    {attribute.description || <span className="text-gray-400 italic">Açıklama yok</span>}
                  </div>
                )}
              </div>
              
              {(attribute.type === AttributeType.SELECT || attribute.type === AttributeType.MULTISELECT) && (
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Seçenekler</div>
                  {isEditing ? (
                    <div>
                      <textarea
                        name="options"
                        value={editableFields.options}
                        onChange={handleInputChange}
                        placeholder="Seçenekleri virgülle ayırarak yazın"
                        rows={3}
                        className={`w-full px-3 py-2 border ${
                          formErrors.options ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                        } rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark`}
                      ></textarea>
                      {formErrors.options && (
                        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.options}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Seçenekleri virgülle ayırın (örn: Kırmızı, Mavi, Yeşil)
                      </p>
                    </div>
                  ) : (
                    attribute.options && attribute.options.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {attribute.options.map((option, index) => (
                          <span 
                            key={index} 
                            className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          >
                            {option}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Seçenek yok</span>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Sistem Bilgileri ve Geçmiş */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-medium mb-6 text-gray-800 dark:text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Sistem Bilgileri ve İşlem Geçmişi
          </h3>
          
          <div className="mb-6">
            <AttributeHistoryList attributeId={id || ''} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttributeDetailsPage; 