import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import familyService from '../../../services/api/familyService';
import type { Family, CreateFamilyDto } from '../../../services/api/familyService';

const FamilyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State tanımlamaları
  const [family, setFamily] = useState<Family | null>(null);
  const [parentFamily, setParentFamily] = useState<Family | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
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
  
  // Veriler yüklendiğinde
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Aileyi getir
        const familyData = await familyService.getFamilyById(id);
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
        } catch (err) {
          console.error('Aileler getirilirken hata oluştu:', err);
        }
      } catch (err: any) {
        setError(err.message || 'Aile bilgileri getirilirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Form değişiklik işleyicisi
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Checkbox kontrolü için
    if (type === 'checkbox') {
      const checkboxValue = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checkboxValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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
        isActive: formData.isActive
      };
      
      // API isteği gönder
      const updatedFamily = await familyService.updateFamily(id, familyData);
      
      // State'i güncelle
      setFamily(updatedFamily);
      setIsEditing(false);
      
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
    } catch (err: any) {
      setError(err.message || 'Aile güncellenirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Silme işlemi
  const handleDelete = async () => {
    if (!id || !family) return;
    
    if (window.confirm(`"${family.name}" ailesini silmek istediğinize emin misiniz?`)) {
      try {
        await familyService.deleteFamily(id);
        navigate('/families/list');
      } catch (err: any) {
        setError(err.message || 'Aile silinirken bir hata oluştu');
      }
    }
  };
  
  // Edit moduna geç
  const handleEditMode = () => {
    setIsEditing(true);
  };
  
  // Edit modundan çık
  const handleCancelEdit = () => {
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
  
  // Yükleme durumu
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 flex justify-center items-center">
        <div className="flex items-center space-x-3">
          <svg className="animate-spin h-8 w-8 text-primary-light dark:text-primary-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Aile bilgileri yükleniyor...</span>
        </div>
      </div>
    );
  }
  
  // Hata durumu
  if (error || !family) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-700 dark:text-red-400 flex items-start">
          <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold">Aile bilgileri yüklenemedi</h3>
            <p className="mt-1">{error || 'Bilinmeyen bir hata oluştu'}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/families/list')}
            >
              Ailelere Dön
            </Button>
          </div>
        </div>
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
              <svg className="w-7 h-7 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              {family.name}
            </h1>
            <div className="mt-1 flex items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 mr-2">
                <code className="font-mono">{family.code}</code>
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                family.isActive 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}>
                {family.isActive ? 'Aktif' : 'Pasif'}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Button
              variant="outline"
              className="flex items-center"
              onClick={() => navigate('/families/list')}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Listeye Dön</span>
            </Button>
            
            {!isEditing && (
              <>
                <Button
                  variant="outline"
                  className="flex items-center"
                  onClick={handleEditMode}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Düzenle</span>
                </Button>
                
                <Button
                  variant="danger"
                  className="flex items-center"
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
      
      {/* Ana İçerik */}
      {isEditing ? (
        // Düzenleme Formu
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 border-b border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleUpdate} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sol Kolon */}
              <div className="space-y-6">
                {/* Aile Adı */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Aile Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      formErrors.name
                        ? 'border-red-300 focus:ring-red-500 dark:border-red-700'
                        : 'border-gray-300 focus:ring-primary-light dark:border-gray-700 dark:focus:ring-primary-dark'
                    } dark:bg-gray-800 dark:text-white`}
                    placeholder="Örn: Elektronik Ürünler"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
                  )}
                </div>
                
                {/* Aile Kodu */}
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Aile Kodu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      formErrors.code
                        ? 'border-red-300 focus:ring-red-500 dark:border-red-700'
                        : 'border-gray-300 focus:ring-primary-light dark:border-gray-700 dark:focus:ring-primary-dark'
                    } dark:bg-gray-800 dark:text-white font-mono`}
                    placeholder="Örn: elektronik_urunler"
                  />
                  {formErrors.code && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.code}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Yalnızca küçük harfler, sayılar ve alt çizgi kullanın. Boşluk olmamalıdır.
                  </p>
                </div>
                
                {/* Üst Aile */}
                <div>
                  <label htmlFor="parentFamily" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Üst Aile
                  </label>
                  <select
                    id="parentFamily"
                    name="parentFamily"
                    value={formData.parentFamily || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-primary-dark"
                  >
                    <option value="">Ana Aile (Üst aile yok)</option>
                    {parentFamilies.map(family => (
                      <option key={family._id} value={family._id}>
                        {family.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Bu aile bir üst aileye bağlı değilse boş bırakın
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
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      formErrors.description
                        ? 'border-red-300 focus:ring-red-500 dark:border-red-700'
                        : 'border-gray-300 focus:ring-primary-light dark:border-gray-700 dark:focus:ring-primary-dark'
                    } dark:bg-gray-800 dark:text-white`}
                    placeholder="Bu aile hakkında kısa bir açıklama yazın..."
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
                    checked={formData.isActive !== false}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-light focus:ring-primary-light border-gray-300 rounded dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-primary-dark"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Aktif
                  </label>
                </div>
              </div>
            </div>
            
            {/* Form Butonları */}
            <div className="mt-8 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
              >
                Güncelle
              </Button>
            </div>
          </form>
        </div>
      ) : (
        // Aile Detayları
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sol Kolon */}
            <div className="space-y-4">
              {/* Açıklama */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Açıklama</h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {family.description}
                </p>
              </div>
              
              {/* Üst Aile */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Üst Aile</h2>
                {parentFamily ? (
                  <div className="flex items-center">
                    <div className="text-primary-light dark:text-primary-dark font-medium cursor-pointer hover:underline" onClick={() => navigate(`/families/details/${parentFamily._id}`)}>
                      {parentFamily.name}
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 ml-2 text-sm">({parentFamily.code})</span>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">Bu ürün ailesi bir üst aileye bağlı değil</p>
                )}
              </div>
            </div>
            
            {/* Sağ Kolon */}
            <div className="space-y-4">
              {/* Meta Bilgiler */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Detaylar</h2>
                <div className="text-sm">
                  <div className="grid grid-cols-3 gap-2 p-2 even:bg-gray-50 even:dark:bg-gray-700/50">
                    <div className="text-gray-500 dark:text-gray-400">Oluşturulma Tarihi</div>
                    <div className="col-span-2 text-gray-900 dark:text-white">
                      {new Date(family.createdAt).toLocaleDateString('tr-TR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-2 odd:bg-gray-50 odd:dark:bg-gray-700/50">
                    <div className="text-gray-500 dark:text-gray-400">Son Güncelleme</div>
                    <div className="col-span-2 text-gray-900 dark:text-white">
                      {new Date(family.updatedAt).toLocaleDateString('tr-TR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-2 even:bg-gray-50 even:dark:bg-gray-700/50">
                    <div className="text-gray-500 dark:text-gray-400">Öznitelik Sayısı</div>
                    <div className="col-span-2 text-gray-900 dark:text-white">
                      {family.attributes ? family.attributes.length : 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyDetailsPage; 