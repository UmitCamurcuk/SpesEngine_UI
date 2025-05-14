import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Stepper from '../../../components/ui/Stepper';
import attributeService from '../../../services/api/attributeService';
import type { CreateAttributeDto, AttributeValidation } from '../../../services/api/attributeService';
import attributeGroupService from '../../../services/api/attributeGroupService';
import type { AttributeGroup } from '../../../services/api/attributeGroupService';
import { AttributeType, AttributeTypeLabels } from '../../../types/attribute';
import AttributeBadge from '../../../components/attributes/AttributeBadge';
import ValidationFactory from '../../../components/attributes/validation/ValidationFactory';

// Adım 1: Genel bilgiler
interface Step1FormData {
  name: string;
  code: string;
  description: string;
  attributeGroup?: string;
}

// Adım 2: Tip seçimi
interface Step2FormData {
  type: AttributeType;
  isRequired: boolean;
}

// Adım 3: Tip özelliklerine göre
interface Step3FormData {
  options: string; // Sadece SELECT ve MULTISELECT tipleri için
}

// Adım 4: Validasyonlar
interface Step4FormData {
  validations: Partial<AttributeValidation>;
}

// Tüm adımların verilerini birleştiren ana form verisi
interface FormData extends Step1FormData, Step2FormData, Step3FormData, Step4FormData {}

const initialFormData: FormData = {
  name: '',
  code: '',
  description: '',
  attributeGroup: undefined,
  type: AttributeType.TEXT,
  isRequired: false,
  options: '',
  validations: {}
};

const StepperAttributeCreatePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Form durumu
  const [formData, setFormData] = useState<FormData>(initialFormData);
  
  // Adım durumu
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // AttributeGroup durumu
  const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>([]);
  
  // Form işleme durumu
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Seçilen tip için gösterilecek açıklama
  const typeDescriptions: Record<AttributeType, string> = {
    [AttributeType.TEXT]: 'Metin girişi için kullanılır. Ürün açıklaması, model numarası gibi bilgiler için idealdir.',
    [AttributeType.NUMBER]: 'Sayısal değerler için kullanılır. Fiyat, miktar, ağırlık gibi bilgiler için idealdir.',
    [AttributeType.DATE]: 'Tarih bilgisi için kullanılır. Üretim tarihi, son kullanma tarihi gibi bilgiler için idealdir.',
    [AttributeType.BOOLEAN]: 'Evet/Hayır tipinde bilgiler için kullanılır. Stokta var mı, aktif mi gibi bilgiler için idealdir.',
    [AttributeType.SELECT]: 'Tek seçimlik listeler için kullanılır. Renk, beden, kategori gibi bilgiler için idealdir.',
    [AttributeType.MULTISELECT]: 'Çoklu seçim gerektiren listeler için kullanılır. Özellikler, etiketler gibi bilgiler için idealdir.'
  };
  
  // Stepper adımları
  const steps = [
    { title: 'Genel Bilgiler', description: 'İsim, kod, açıklama' },
    { title: 'Tip Seçimi', description: 'Öznitelik tipi ve gerekliliği' },
    { title: 'Tip Özellikleri', description: 'Tipe özel bilgiler' },
    { title: 'Doğrulama Kuralları', description: 'Validasyon kuralları' },
  ];
  
  // Öznitelik gruplarını yükle
  useEffect(() => {
    const fetchAttributeGroups = async () => {
      try {
        const response = await attributeGroupService.getAttributeGroups({ isActive: true });
        setAttributeGroups(response.attributeGroups);
      } catch (err: any) {
        console.error('Öznitelik grupları getirilirken hata oluştu:', err);
      }
    };
    
    fetchAttributeGroups();
  }, []);
  
  // Form alanı değişikliği - genel
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
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
  
  // Validasyon değişikliği
  const handleValidationChange = (validations: Partial<AttributeValidation>) => {
    console.log('ValidationChange event alındı:', validations);
    setFormData(prev => {
      const updatedData = {
        ...prev,
        validations
      };
      console.log('Form verisi güncellendi, yeni validations:', updatedData.validations);
      return updatedData;
    });
  };
  
  // Adım 1 için doğrulama
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Öznitelik adı zorunludur';
    }
    
    if (!formData.code.trim()) {
      errors.code = 'Öznitelik kodu zorunludur';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.code)) {
      errors.code = 'Kod sadece harf, rakam ve alt çizgi içerebilir';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Adım 2 için doğrulama - tip için özel doğrulama yok, her zaman geçerli
  const validateStep2 = (): boolean => {
    return true;
  };
  
  // Adım 3 için doğrulama
  const validateStep3 = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (
      (formData.type === AttributeType.SELECT || formData.type === AttributeType.MULTISELECT) && 
      !formData.options.trim()
    ) {
      errors.options = 'Seçim tipi için en az bir seçenek belirtmelisiniz';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Sadece form gönderiminde çalışacak validasyon
  const validateFormBeforeSubmit = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Sayısal öznitelikler için validasyon zorunlu
    if (formData.type === AttributeType.NUMBER) {
      if (!formData.validations || Object.keys(formData.validations).length === 0) {
        setError("Sayısal öznitelikler için en az bir doğrulama kuralı belirtmelisiniz (min, max, vb.)");
        return false;
      }
    }
    
    // TEXT tipi için validasyon kontrolü
    if (formData.type === AttributeType.TEXT) {
      // Kullanıcıya bir uyarı göster ama engelleme - TEXT tipi için isteğe bağlı
      if (!formData.validations || Object.keys(formData.validations).length === 0) {
        if (!confirm("Metin tipi için herhangi bir doğrulama kuralı belirtmediniz. Devam etmek istiyor musunuz?")) {
          return false;
        }
      }
    }
    
    // DATE tipi için validasyon kontrolü
    if (formData.type === AttributeType.DATE) {
      // Kullanıcıya bir uyarı göster ama engelleme - DATE tipi için isteğe bağlı
      if (!formData.validations || Object.keys(formData.validations).length === 0) {
        if (!confirm("Tarih tipi için herhangi bir doğrulama kuralı belirtmediniz. Devam etmek istiyor musunuz?")) {
          return false;
        }
      }
    }
    
    // SELECT/MULTISELECT tipi için validasyon kontrolü
    if (formData.type === AttributeType.SELECT || formData.type === AttributeType.MULTISELECT) {
      // MULTISELECT için minSelections/maxSelections önemli olabilir
      if (formData.type === AttributeType.MULTISELECT && 
          (!formData.validations || 
           (formData.validations.minSelections === undefined && 
            formData.validations.maxSelections === undefined))) {
        if (!confirm("Çoklu seçim tipi için seçim sayısı sınırlaması belirtmediniz. Devam etmek istiyor musunuz?")) {
          return false;
        }
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Adımı doğrula ve ilerle
  const handleNextStep = () => {
    let isValid = false;
    
    // Mevcut adımı doğrula
    switch (currentStep) {
      case 0:
        isValid = validateStep1();
        break;
      case 1:
        isValid = validateStep2();
        break;
      case 2:
        isValid = validateStep3();
        break;
      case 3:
        // 4. adımda bir sonraki adım yok, bu adımda sadece submit butonu var.
        // Ayrıca burada validasyon yapmıyoruz, validasyon sadece form submit esnasında yapılacak
        return; // Direkt olarak fonksiyondan çıkıyoruz, bu adımda ilerleme yok
      default:
        isValid = false;
    }
    
    if (isValid) {
      // Adımı tamamlandı olarak işaretle
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      
      // Sonraki adıma geç
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };
  
  // Önceki adıma dön
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form gönderilmeden önce doğrula
    if (!validateFormBeforeSubmit()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // API'ye gönderilecek veriyi hazırla
      const attributeData: CreateAttributeDto = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        type: formData.type,
        description: formData.description.trim(),
        isRequired: formData.isRequired,
        validations: formData.validations && Object.keys(formData.validations).length > 0 
          ? formData.validations 
          : undefined
      };
      
      // TCKNO validasyon debug logu
      console.log('API\'ye gönderilecek form verisi:', JSON.stringify(formData, null, 2));
      console.log('API\'ye gönderilecek veri (attributeData):', JSON.stringify(attributeData, null, 2));
      console.log('Validasyon değerleri:', JSON.stringify(formData.validations, null, 2));
      
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
      navigate('/attributes/list', { state: { success: `${formData.name} özniteliği başarıyla oluşturuldu!` } });
    } catch (err: any) {
      setError(err.message || 'Öznitelik oluşturulurken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Adım içeriğini render et
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Genel Bilgiler</h3>
            
            {/* Ad */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Öznitelik Adı <span className="text-red-500">*</span>
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
                placeholder="Örn: Renk, Boyut, Marka, vb."
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>
            
            {/* Kod */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Öznitelik Kodu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  formErrors.code ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white`}
                placeholder="Örn: color, size, brand, vb."
              />
              {formErrors.code && (
                <p className="mt-1 text-sm text-red-500">{formErrors.code}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Öznitelik kodu sistem içinde kullanılacak benzersiz bir tanımlayıcıdır. Sadece harf, rakam ve alt çizgi içerebilir.
              </p>
            </div>
            
            {/* Açıklama */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Açıklama
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
                placeholder="Özniteliğin amacını ve kullanımını açıklayın..."
              ></textarea>
            </div>
            
            {/* Öznitelik Grubu */}
            <div>
              <label htmlFor="attributeGroup" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Öznitelik Grubu
              </label>
              <select
                id="attributeGroup"
                name="attributeGroup"
                value={formData.attributeGroup || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
              >
                <option value="">Seçiniz (İsteğe bağlı)</option>
                {attributeGroups.length > 0 ? (
                  attributeGroups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Henüz öznitelik grubu bulunmuyor</option>
                )}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Bu özniteliği bir gruba dahil etmek istiyorsanız seçebilirsiniz
              </p>
            </div>
          </div>
        );
        
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Öznitelik Tipi Seçimi</h3>
            
            {/* Öznitelik Tipi */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Öznitelik Tipi <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {Object.values(AttributeType).map((type) => (
                  <div 
                    key={type}
                    className={`flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-colors
                      ${formData.type === type 
                        ? 'border-primary-light dark:border-primary-dark bg-primary-light/10 dark:bg-primary-dark/10' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                    `}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, type }));
                      
                      // Bağımlı alanları sıfırla
                      if (type !== AttributeType.SELECT && type !== AttributeType.MULTISELECT) {
                        setFormData(prev => ({ ...prev, options: '' }));
                      }
                    }}
                  >
                    <AttributeBadge type={type} showLabel={false} />
                    <span className="mt-2 text-sm font-medium text-center">
                      {AttributeTypeLabels[type]}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                {typeDescriptions[formData.type]}
              </p>
            </div>
            
            {/* Zorunlu mu? */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRequired"
                  name="isRequired"
                  checked={formData.isRequired}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded border-gray-300 dark:border-gray-600"
                />
                <label htmlFor="isRequired" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Bu öznitelik ürün oluşturulurken zorunlu olsun
                </label>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 ml-6">
                Bu seçenek işaretlenirse, bu özniteliğe sahip ürünler oluşturulurken bir değer girilmesi zorunlu olacaktır.
              </p>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Tip Özellikleri</h3>
            
            {/* Seçenekler (SELECT veya MULTISELECT tipi için) */}
            {(formData.type === AttributeType.SELECT || formData.type === AttributeType.MULTISELECT) ? (
              <div>
                <label htmlFor="options" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Seçenekler <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="options"
                  name="options"
                  value={formData.options}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-3 py-2 border ${
                    formErrors.options ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white`}
                  placeholder="Seçenekleri virgülle ayırarak yazın. Örn: Kırmızı, Mavi, Yeşil, Sarı"
                ></textarea>
                {formErrors.options && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.options}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Seçenekleri virgülle ayırın (örn: Kırmızı, Mavi, Yeşil)
                </p>
                
                {/* Seçenek önizleme */}
                {formData.options.trim() && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Seçenek Önizleme
                    </label>
                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                      {formData.options
                        .split(',')
                        .map(option => option.trim())
                        .filter(option => option.length > 0)
                        .map((option, index) => (
                          <span
                            key={index}
                            className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          >
                            {option}
                          </span>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>{AttributeTypeLabels[formData.type]}</strong> tipi için ek özellik gerekmiyor.
                      Bir sonraki adıma geçerek doğrulama kuralları tanımlayabilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <ValidationFactory 
              type={formData.type} 
              validation={formData.validations} 
              onChange={handleValidationChange} 
            />
          </div>
        );
        
      default:
        return null;
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
              Yeni Öznitelik Oluştur
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Ürün ve hizmetleriniz için yeni bir öznitelik tanımlayın
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
            <span>Listeye Dön</span>
          </Button>
        </div>
      </div>
      
      {/* Stepper */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <Stepper 
            steps={steps} 
            activeStep={currentStep} 
            completedSteps={completedSteps} 
          />
        </div>
        
        {/* Form Kartı */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 mb-6 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                type="button"
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                className={`${currentStep === 0 ? 'invisible' : ''}`}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Önceki Adım
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  variant="primary"
                  type="button"
                  onClick={handleNextStep}
                >
                  Sonraki Adım
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                  }}
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Özniteliği Oluştur
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StepperAttributeCreatePage; 