import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import attributeService from '../../../services/api/attributeService';
import type { CreateAttributeDto } from '../../../services/api/attributeService';
import attributeGroupService from '../../../services/api/attributeGroupService';
import type { AttributeGroup } from '../../../services/api/attributeGroupService';
import { AttributeType, AttributeTypeLabels } from '../../../types/attribute';
import AttributeBadge from '../../../components/attributes/AttributeBadge';
import { useTranslation } from '../../../context/i18nContext';

interface FormData {
  name: string;
  code: string;
  type: AttributeType;
  description: string;
  isRequired: boolean;
  attributeGroup?: string;
  options: string; // Burada options string olarak tutulacak ve gönderilmeden önce dönüştürülecek
}

const AttributeCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  
  // Form durumu
  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    type: AttributeType.TEXT,
    description: '',
    isRequired: false,
    options: ''
  });
  
  // AttributeGroup durumu
  const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>([]);
  
  // Form işleme durumu
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Seçilen tip için gösterilecek açıklama
  const typeDescriptions = useMemo(() => ({
    [AttributeType.TEXT]: t('text_type_description', 'attribute_types'),
    [AttributeType.NUMBER]: t('number_type_description', 'attribute_types'),
    [AttributeType.DATE]: t('date_type_description', 'attribute_types'),
    [AttributeType.BOOLEAN]: t('boolean_type_description', 'attribute_types'),
    [AttributeType.SELECT]: t('select_type_description', 'attribute_types'),
    [AttributeType.MULTISELECT]: t('multiselect_type_description', 'attribute_types')
  }), [t, currentLanguage]);
  
  // Dil değiştiğinde formda gösterilen default içerikleri güncelle
  useEffect(() => {
    // Eğer formda SELECT veya MULTISELECT tipi seçiliyse ve options değeri varsa, butonların çevirisini güncelle
    if ((formData.type === AttributeType.SELECT || formData.type === AttributeType.MULTISELECT) && formData.options) {
      // Eğer options varsayılan değerleri içeriyorsa (Option 1, Option 2, Option 3) bunları çevir
      if (/Option \d+/.test(formData.options)) {
        setFormData(prev => ({ 
          ...prev, 
          options: `${t('option', 'attributes')} 1, ${t('option', 'attributes')} 2, ${t('option', 'attributes')} 3`
        }));
      }
    }
  }, [currentLanguage, t]);
  
  // Öznitelik gruplarını yükle
  useEffect(() => {
    const fetchAttributeGroups = async () => {
      try {
        const response = await attributeGroupService.getAttributeGroups({ isActive: true });
        setAttributeGroups(response.attributeGroups);
      } catch (err: any) {
        console.error(t('attribute_groups_fetch_error', 'attribute_groups'), err);
      }
    };
    
    fetchAttributeGroups();
  }, [t, currentLanguage]);
  
  // Form değişiklik işleyicisi
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Checkbox kontrolü için
    if (type === 'checkbox') {
      const checkboxValue = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checkboxValue }));
    } else {
      // Eğer bu bir tip değişimi ise ve SELECT veya MULTISELECT'e geçiliyorsa
      // ve options boşsa, örnek bir değer oluştur
      if (name === 'type' && (value === AttributeType.SELECT || value === AttributeType.MULTISELECT) && !formData.options) {
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          options: `${t('option', 'attributes')} 1, ${t('option', 'attributes')} 2, ${t('option', 'attributes')} 3`
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
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
      errors.name = t('name_required', 'attributes');
    }
    
    if (!formData.code.trim()) {
      errors.code = t('code_required', 'attributes');
    } else if (!/^[a-z0-9_]+$/.test(formData.code)) {
      errors.code = t('code_invalid_format', 'attributes');
    }
    
    if (
      (formData.type === AttributeType.SELECT || formData.type === AttributeType.MULTISELECT) &&
      !formData.options.trim()
    ) {
      errors.options = t('options_required', 'attributes');
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
      const attributeData: CreateAttributeDto = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        type: formData.type,
        description: formData.description ? formData.description.trim() : '',
        isRequired: formData.isRequired
      };
      
      // Select/MultiSelect durumunda options ekle
      if (formData.type === AttributeType.SELECT || formData.type === AttributeType.MULTISELECT) {
        attributeData.options = formData.options
          .split(',')
          .map(option => option.trim())
          .filter(option => option.length > 0);
      }
      
      // AttributeGroup ekle (seçilmişse)
      if (formData.attributeGroup) {
        attributeData.attributeGroup = formData.attributeGroup;
      }
      
      // API isteği gönder
      await attributeService.createAttribute(attributeData);
      
      // Başarılı oluşturma sonrası listeye dön
      navigate('/attributes/list');
    } catch (err: any) {
      setError(err.message || t('attribute_create_error', 'attributes'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const typeLabels = useMemo(() => {
    return Object.values(AttributeType).map(type => ({
      type,
      label: t(AttributeTypeLabels[type].key, AttributeTypeLabels[type].namespace, { use: true })
    }));
  }, [t, currentLanguage]);
  
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
              {t('create_new_attribute', 'attributes')}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {t('define_new_attribute', 'attributes')}
            </p>
          </div>
          
          <Button
            variant="outline"
            className="flex items-center mt-4 md:mt-0"
            onClick={() => navigate('/attributes/list')}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>{t('return_to_list', 'attributes')}</span>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sol Kolon - Temel Bilgiler */}
            <div className="space-y-4 md:col-span-1">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-1.5 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t('basic_info', 'attributes')}
              </h3>
              
              {/* Öznitelik Tipi - Önce seçilir */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('type', 'attributes')} <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {typeLabels.map(({ type, label }) => (
                    <div 
                      key={`${type}-${currentLanguage}`}
                      className={`flex flex-col items-center p-2 rounded-lg border-2 cursor-pointer transition-colors
                        ${formData.type === type 
                          ? 'border-primary-light dark:border-primary-dark bg-primary-light/10 dark:bg-primary-dark/10' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }
                      `}
                      onClick={() => handleChange({ target: { name: 'type', value: type } } as React.ChangeEvent<HTMLSelectElement>)}
                    >
                      <AttributeBadge type={type} showLabel={false} />
                      <span className="mt-1 text-xs font-medium text-center">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {typeDescriptions[formData.type]}
                </p>
              </div>
              
              {/* Zorunlu mu? */}
              <div className="pt-4">
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id="isRequired"
                      name="isRequired"
                      checked={formData.isRequired}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-light focus:ring-primary-light border-gray-300 rounded dark:border-gray-600"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="isRequired" className="font-medium text-gray-700 dark:text-gray-300">
                      {t('is_required', 'attributes')}
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">
                      {t('is_required_help', 'attributes')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Orta ve Sağ Kolon */}
            <div className="space-y-6 md:col-span-2">
              {/* Ad ve Kod */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-1.5 text-secondary-light dark:text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('detail_info', 'attributes')}
                </h3>
                
                {/* Ad */}
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('name', 'attributes')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.name ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white`}
                    placeholder={t('name_placeholder', 'attributes')}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>
                
                {/* Kod */}
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('code', 'attributes')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.code ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white font-mono`}
                    placeholder={t('code_placeholder', 'attributes')}
                  />
                  {formErrors.code && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.code}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t('code_help', 'attributes')}
                  </p>
                </div>
              </div>
              
              {/* Açıklama */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('description', 'attributes')}
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
                  placeholder={t('description_placeholder', 'attributes')}
                ></textarea>
              </div>
              
              {/* Öznitelik Grubu */}
              <div>
                <label htmlFor="attributeGroup" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('attribute_group', 'attributes')}
                </label>
                <select
                  id="attributeGroup"
                  name="attributeGroup"
                  value={formData.attributeGroup || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t('select_group', 'attributes')}</option>
                  {attributeGroups.length > 0 ? (
                    attributeGroups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>{t('no_groups', 'attributes')}</option>
                  )}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t('group_help', 'attributes')}
                </p>
              </div>
              
              {/* Seçenekler (SELECT veya MULTISELECT tipi için) */}
              {(formData.type === AttributeType.SELECT || formData.type === AttributeType.MULTISELECT) && (
                <div>
                  <label htmlFor="options" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('options', 'attributes')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="options"
                    name="options"
                    value={formData.options}
                    onChange={handleChange}
                    rows={3}
                    placeholder={t('options_placeholder', 'attributes')}
                    className={`w-full px-3 py-2 border ${
                      formErrors.options ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white`}
                  ></textarea>
                  {formErrors.options && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.options}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t('options_info', 'attributes')}
                  </p>
                  
                  {/* Önizleme */}
                  {formData.options && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('preview', 'attributes')}:</p>
                      <div className="flex flex-wrap gap-2 p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                        {formData.options
                          .split(',')
                          .map(option => option.trim())
                          .filter(option => option.length > 0)
                          .map((option, index) => (
                            <span 
                              key={`option-${index}-${option}-${currentLanguage}`}
                              className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            >
                              {option}
                            </span>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Butonlar */}
          <div className="mt-8 pt-5 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate('/attributes/list')}
            >
              {t('cancel', 'attributes')}
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className="px-8"
            >
              {isSubmitting ? t('saving', 'attributes') : t('save', 'attributes')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Dil değiştiğinde bileşeni zorla yeniden oluşturmak için key prop kullanıyoruz
const AttributeCreatePageWrapper: React.FC = () => {
  const { currentLanguage } = useTranslation();
  return <AttributeCreatePage key={`attribute-create-${currentLanguage}`} />;
};

export default AttributeCreatePageWrapper; 