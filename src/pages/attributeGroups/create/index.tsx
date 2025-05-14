import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import attributeGroupService from '../../../services/api/attributeGroupService';
import type { CreateAttributeGroupDto } from '../../../services/api/attributeGroupService';

const AttributeGroupCreatePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Form durumu
  const [formData, setFormData] = useState<CreateAttributeGroupDto>({
    name: '',
    code: '',
    description: '',
    attributes: []
  });
  
  // Form işleme durumu
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

    // Eğer ad değişirse, otomatik olarak kod alanını güncelle
    if (name === 'name' && !formData.code) {
      const generatedCode = value
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_') // Sadece geçerli karakterleri koru
        .replace(/_{2,}/g, '_'); // Ardışık alt çizgileri tek alt çizgiye dönüştür
      
      setFormData(prev => ({ ...prev, code: generatedCode }));
    }
  };
  
  // Form doğrulama
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Öznitelik grup adı zorunludur';
    }
    
    if (!formData.code.trim()) {
      errors.code = 'Öznitelik grup kodu zorunludur';
    } else if (!/^[a-z0-9_]+$/.test(formData.code)) {
      errors.code = 'Kod yalnızca küçük harfler, sayılar ve alt çizgi içerebilir';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Açıklama zorunludur';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Form gönderim işleyicisi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // API'ye gönderilecek veriyi hazırla
      const attributeGroupData: CreateAttributeGroupDto = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim(),
        attributes: [] // Başlangıçta boş bir dizi
      };
      
      // API isteği gönder
      await attributeGroupService.createAttributeGroup(attributeGroupData);
      
      // Başarılı oluşturma sonrası listeye dön
      navigate('/attributeGroups/list');
    } catch (err: any) {
      setError(err.message || 'Öznitelik grubu oluşturulurken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Başlık Kartı */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-6 h-6 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yeni Öznitelik Grubu Oluştur
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Ürün ve hizmetleriniz için yeni bir öznitelik grubu tanımlayın
            </p>
          </div>
          
          <Button
            variant="outline"
            className="flex items-center mt-4 md:mt-0"
            onClick={() => navigate('/attributeGroups/list')}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Listeye Dön</span>
          </Button>
        </div>
      </div>
      
      {/* Form Kartı */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 border-b border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6">
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
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    formErrors.name
                      ? 'border-red-300 focus:ring-red-500 dark:border-red-700'
                      : 'border-gray-300 focus:ring-primary-light dark:border-gray-700 dark:focus:ring-primary-dark'
                  } dark:bg-gray-800 dark:text-white`}
                  placeholder="Örn: Temel Bilgiler"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
                )}
              </div>
              
              {/* Grup Kodu */}
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Grup Kodu <span className="text-red-500">*</span>
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
                  placeholder="Örn: temel_bilgiler"
                />
                {formErrors.code && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.code}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Yalnızca küçük harfler, sayılar ve alt çizgi kullanın. Boşluk olmamalıdır.
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
                  placeholder="Bu grup hakkında kısa bir açıklama yazın..."
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
                  checked={formData.isActive !== false} // undefined veya true ise checked olsun
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
              onClick={() => navigate('/attributeGroups/list')}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Oluştur
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttributeGroupCreatePage; 