import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import { useNotification } from '../../../components/notifications';
import Breadcrumb from '../../../components/common/Breadcrumb';
import Stepper from '../../../components/ui/Stepper';
import attributeService from '../../../services/api/attributeService';

import { CreateAttributeDto, AttributeValidation, Attribute } from '../../../types/attribute';
import attributeGroupService from '../../../services/api/attributeGroupService';
import { AttributeGroup } from '../../../types/attributeGroup';
import { AttributeType, AttributeTypeLabels } from '../../../types/attribute';
import AttributeBadge from '../../../components/attributes/AttributeBadge';
import ValidationFactory from '../../../components/attributes/validation/ValidationFactory';
import { useTranslation } from '../../../context/i18nContext';
import TranslationFields from '../../../components/common/TranslationFields';
import { useTranslationForm } from '../../../hooks/useTranslationForm';
import { getEntityName } from '../../../utils/translationUtils';

// Adım 1: Genel bilgiler
interface Step1FormData {
  nameTranslations: Record<string, string>;
  code: string;
  descriptionTranslations: Record<string, string>;
  attributeGroup?: string;
}

// Adım 2: Tip seçimi
interface Step2FormData {
  type: AttributeType;
  isRequired: boolean;
}

// Adım 3: Tip özelliklerine göre
interface Step3FormData {
  options: string[]; // Sadece SELECT ve MULTISELECT tipleri için
}

// Adım 4: Validasyonlar
interface Step4FormData {
  validations: Partial<AttributeValidation>;
}

// Tüm adımların verilerini birleştiren ana form verisi
interface FormData extends Step1FormData, Step2FormData, Step3FormData, Step4FormData {}

const initialFormData: FormData = {
  nameTranslations: {},
  code: '',
  descriptionTranslations: {},
  attributeGroup: undefined,
  type: AttributeType.TEXT,
  isRequired: false,
  options: [],
  validations: {}
};

const AttributeCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  const { showToast, showModal } = useNotification();
  
  // Translation hook'unu kullan
  const {
    supportedLanguages,
    translationData,
    handleTranslationChange,
    createTranslations
  } = useTranslationForm();

  // Form durumu
  const [formData, setFormData] = useState<FormData>(initialFormData);
  
  // Adım durumu
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // AttributeGroup durumu
  const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>([]);
  
  // Loading state for attribute groups
  const [isLoadingGroups, setIsLoadingGroups] = useState<boolean>(true);
  
  // Form işleme durumu
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // SELECT/MULTISELECT için READONLY attribute'ları getir
  const [readonlyAttributes, setReadonlyAttributes] = useState<Attribute[]>([]);

  // Stepper adımları
  const steps = useMemo(() => [
    { title: t('general_info', 'attributes'), description: t('name_code_description', 'attributes') },
    { title: t('type_selection', 'attributes'), description: t('attribute_type_and_requirement', 'attributes') },
    { title: t('type_properties', 'attributes'), description: t('type_specific_info', 'attributes') },
    { title: t('validation_rules', 'attributes'), description: t('validation_rules_desc', 'attributes') },
    { title: t('review_and_create', 'attributes'), description: t('review_before_creating', 'attributes') },
  ], [t, currentLanguage]);
  
  // Öznitelik gruplarını yükle
  useEffect(() => {
    const fetchAttributeGroups = async () => {
      console.log('AttributeGroups yükleniyor...');
      setIsLoadingGroups(true);
      try {
        const response = await attributeGroupService.getAttributeGroups({ isActive: true });
        console.log('AttributeGroups yanıtı:', response);
        
        // Güvenli erişim - response yapısını kontrol et
        const groups = response?.attributeGroups || [];
        setAttributeGroups(groups);
        console.log('AttributeGroups state güncellendi:', groups);
        console.log('Groups array length:', groups.length);
      } catch (err: any) {
        console.error(t('attribute_groups_fetch_error', 'attribute_groups'), err);
        setAttributeGroups([]); // Hata durumunda boş array
      } finally {
        setIsLoadingGroups(false);
      }
    };
    
    fetchAttributeGroups();
  }, [t]);
  
  // Form data'yı translation data ile senkronize et
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      nameTranslations: translationData.nameTranslations,
      descriptionTranslations: translationData.descriptionTranslations
    }));
  }, [translationData]);
  
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
    
    if (!formData.nameTranslations[currentLanguage]) {
      errors.nameTranslations = t('name_required', 'attributes');
    }
    
    if (!formData.code.trim()) {
      errors.code = t('code_required', 'attributes');
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.code)) {
      errors.code = t('code_invalid_format', 'attributes');
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
      formData.options.length === 0
    ) {
      errors.options = t('options_required', 'attributes');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Adım 4 için doğrulama (validation rules)
  const validateStep4 = (): boolean => {
    // Validasyon kuralları opsiyonel
    return true;
  };
  
  // Sadece form gönderiminde çalışacak validasyon
  const validateFormBeforeSubmit = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Sayısal öznitelikler için validasyon zorunlu
    if (formData.type === AttributeType.NUMBER) {
      if (!formData.validations || Object.keys(formData.validations).length === 0) {
        showToast({
          type: 'error',
          title: 'Validasyon Gerekli',
          message: t('number_validation_required', 'attributes'),
          duration: 5000
        });
        return false;
      }
    }
    
    // TEXT tipi için validasyon kontrolü
    if (formData.type === AttributeType.TEXT) {
      // Kullanıcıya bir uyarı göster ama engelleme - TEXT tipi için isteğe bağlı
      if (!formData.validations || Object.keys(formData.validations).length === 0) {
        showToast({
          type: 'warning',
          title: 'Validasyon Uyarısı',
          message: t('text_no_validation_confirm', 'attributes'),
          duration: 5000
        });
        return false; // Modal'dan sonra devam etmek için ayrı bir state gerekebilir
      }
    }
    
    // DATE tipi için validasyon kontrolü
    if (formData.type === AttributeType.DATE) {
      // Kullanıcıya bir uyarı göster ama engelleme - DATE tipi için isteğe bağlı
      if (!formData.validations || Object.keys(formData.validations).length === 0) {
        showToast({
          type: 'warning',
          title: 'Validasyon Uyarısı',
          message: t('date_no_validation_confirm', 'attributes'),
          duration: 5000
        });
        return false;
      }
    }
    
    // SELECT/MULTISELECT tipi için validasyon kontrolü
    if (formData.type === AttributeType.SELECT || formData.type === AttributeType.MULTISELECT) {
      // MULTISELECT için minSelections/maxSelections önemli olabilir
      if (formData.type === AttributeType.MULTISELECT && 
          (!formData.validations || 
           (formData.validations.minSelections === undefined && 
            formData.validations.maxSelections === undefined))) {
        showToast({
          type: 'warning',
          title: 'Validasyon Uyarısı',
          message: t('multiselect_no_validation_confirm', 'attributes'),
          duration: 5000
        });
        return false;
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
        isValid = validateStep4();
        break;
      case 4:
        // 5. adımda bir sonraki adım yok, bu adımda sadece submit butonu var.
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
  
  // Type seçimi değiştiğinde options'ları sıfırla
  const handleTypeChange = (newType: AttributeType) => {
    setFormData(prev => ({
      ...prev,
      type: newType,
      options: [], // Options'ları sıfırla
      validations: {} // Validasyonları da sıfırla
    }));
  };

  // Options seçimi için yeni handler
  const handleOptionsChange = (selectedOptions: string[]) => {
    setFormData(prev => ({
      ...prev,
      options: selectedOptions
    }));
  };
  
  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form gönderilmeden önce doğrula
    if (!validateFormBeforeSubmit()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Çevirileri oluştur
      const { nameId, descriptionId } = await createTranslations(formData.code, 'attributes');

      // API'ye gönderilecek veriyi hazırla
      const attributeData: CreateAttributeDto = {
        name: nameId,
        code: formData.code.trim(),
        type: formData.type,
        description: descriptionId,
        isRequired: formData.isRequired,
        options: formData.type === AttributeType.SELECT || formData.type === AttributeType.MULTISELECT 
          ? formData.options 
          : undefined,
        validations: formData.validations && Object.keys(formData.validations).length > 0 
          ? formData.validations 
          : undefined
      };
      

      
      // Öznitelik grubu varsa ekle
      if (formData.attributeGroup) {
        attributeData.attributeGroup = formData.attributeGroup;
      }
      
      const createdAttribute = await attributeService.createAttribute(attributeData);
      
      showToast({
        type: 'success',
        title: 'Başarılı',
        message: 'Attribute başarıyla oluşturuldu',
        duration: 3000
      });
      
      showModal({
        type: 'success',
        title: 'Attribute Oluşturuldu',
        message: 'Yeni attribute başarıyla oluşturuldu.',
        primaryButton: {
          text: 'Attribute\'a Git',
          onClick: () => navigate(`/attributes/${createdAttribute._id}`)
        },
        secondaryButton: {
          text: 'Liste\'ye Dön',
          onClick: () => navigate('/attributes/list')
        }
      });
      
    } catch (err: any) {
      console.error('Attribute create hatası:', err);
      setError(err.message || t('attribute_create_error', 'attributes'));
      showToast({
        type: 'error',
        title: 'Hata',
        message: err.message || 'Attribute oluşturulurken bir hata oluştu',
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Adım içeriğini render et
  const renderStepContent = () => {
    // Type descriptions
    const typeDescriptions: Record<AttributeType, string> = {
      // Basic Types
      [AttributeType.TEXT]: 'Metin değerleri için kullanılır. Örnek: İsim, açıklama, adres',
      [AttributeType.NUMBER]: 'Sayısal değerler için kullanılır. Örnek: Fiyat, miktar, yaş',
      [AttributeType.BOOLEAN]: 'Doğru/yanlış değerleri için kullanılır. Örnek: Aktif/pasif, var/yok',
      [AttributeType.DATE]: 'Tarih değerleri için kullanılır. Örnek: Doğum tarihi, son güncelleme',
      [AttributeType.DATETIME]: 'Tarih ve saat değerleri için kullanılır. Örnek: Oluşturulma zamanı',
      [AttributeType.TIME]: 'Sadece saat değerleri için kullanılır. Örnek: Çalışma saatleri',
      
      // Contact Types
      [AttributeType.EMAIL]: 'E-posta adresleri için kullanılır. Örnek: info@example.com',
      [AttributeType.PHONE]: 'Telefon numaraları için kullanılır. Örnek: +90 555 123 4567',
      [AttributeType.URL]: 'Web adresleri için kullanılır. Örnek: https://example.com',
      
      // Enum Types
      [AttributeType.SELECT]: 'Önceden tanımlı seçeneklerden biri seçilir. Örnek: Durum, kategori',
      [AttributeType.MULTISELECT]: 'Önceden tanımlı seçeneklerden birden fazla seçilebilir. Örnek: Etiketler, özellikler',
      
      // File Types
      [AttributeType.FILE]: 'Tekli dosya yükleme için kullanılır. Örnek: PDF, DOCX',
      [AttributeType.IMAGE]: 'Görsel yükleme için kullanılır. Örnek: Ürün fotoğrafı, logo',
      [AttributeType.ATTACHMENT]: 'Birden fazla dosya yükleme için kullanılır. Örnek: Belgeler, resimler',
      
      // Composite Types
      [AttributeType.OBJECT]: 'İç içe veri nesneleri için kullanılır. Örnek: Adres bilgileri',
      [AttributeType.ARRAY]: 'Tek tip dizi değerleri için kullanılır. Örnek: Telefon numaraları',
      [AttributeType.JSON]: 'Serbest yapılandırılmış veri için kullanılır. Örnek: Ayarlar, metadata',
      [AttributeType.FORMULA]: 'Dinamik hesaplama için kullanılır. Örnek: Toplam fiyat = fiyat * miktar',
      [AttributeType.EXPRESSION]: 'Koşullu yapılar için kullanılır. Örnek: IF(durum == "aktif", "Yeşil", "Gri")',
      [AttributeType.TABLE]: 'Tablo formatında veri için kullanılır. Örnek: Sipariş ölçüleri, en boy tablosu',
      
      // UI Types
      [AttributeType.COLOR]: 'Renk seçici için kullanılır. Örnek: Tema rengi, kategori rengi',
      [AttributeType.RICH_TEXT]: 'HTML destekli metin için kullanılır. Örnek: Açıklama, içerik',
      [AttributeType.RATING]: 'Derecelendirme için kullanılır. Örnek: Ürün puanı, kalite değerlendirmesi',
      [AttributeType.BARCODE]: 'Barkod görselleştirme için kullanılır. Örnek: Ürün barkodu',
      [AttributeType.QR]: 'QR kod için kullanılır. Örnek: Ürün bilgisi, link',
      
      // Special Types
      [AttributeType.READONLY]: 'Sadece okunabilir değerler için kullanılır. Oluşturulurken set edilir, sonra değiştirilemez'
    };
    
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">{t('general_info', 'attributes')}</h3>
            
            {/* Name Translations */}
            <TranslationFields
              label={t('attribute_name', 'attributes')}
              fieldType="input"
              translations={translationData.nameTranslations}
              supportedLanguages={supportedLanguages}
              currentLanguage={currentLanguage}
              onChange={(language, value) => handleTranslationChange('nameTranslations', language, value)}
              error={formErrors.nameTranslations}
              placeholder={`${t('attribute_name', 'attributes')} girin`}
              required
            />
            
            {/* Kod */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('attribute_code', 'attributes')} <span className="text-red-500">*</span>
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
                <p className="text-sm text-red-500 mt-1">{formErrors.code}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('code_help', 'attributes')}
              </p>
            </div>

            {/* Description Translations */}
            <TranslationFields
              label={t('description', 'attributes')}
              fieldType="textarea"
              translations={translationData.descriptionTranslations}
              supportedLanguages={supportedLanguages}
              currentLanguage={currentLanguage}
              onChange={(language, value) => handleTranslationChange('descriptionTranslations', language, value)}
              placeholder={t('description_placeholder', 'attributes')}
              rows={2}
            />
            
            {/* Öznitelik Grubu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('attribute_group', 'attributes')}
              </label>
              
              {isLoadingGroups ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="inline-flex items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      Öznitelik grupları yükleniyor...
                    </span>
                  </div>
                </div>
              ) : (!attributeGroups || attributeGroups.length === 0) ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {t('no_groups', 'attributes')}
                  </p>
                </div>
              ) : (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto max-h-64">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Seçim
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Grup Adı
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Kod
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Açıklama
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {attributeGroups.map((group) => (
                          <tr 
                            key={group._id} 
                            className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                              formData.attributeGroup === group._id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                            }`}
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                attributeGroup: prev.attributeGroup === group._id ? undefined : group._id
                              }));
                            }}
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="radio"
                                name="attributeGroup"
                                value={group._id}
                                checked={formData.attributeGroup === group._id}
                                onChange={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    attributeGroup: group._id
                                  }));
                                }}
                                className="h-4 w-4 text-primary-light focus:ring-primary-light border-gray-300"
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {getEntityName(group, currentLanguage)}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                                {group.code}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-600 dark:text-gray-300">
                                {getEntityName(group, currentLanguage, 'description') || '-'}
                              </div>
                            </td>
                          </tr>
                        ))}
                        <tr 
                          className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                            !formData.attributeGroup ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                          }`}
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              attributeGroup: undefined
                            }));
                          }}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input
                              type="radio"
                              name="attributeGroup"
                              value=""
                              checked={!formData.attributeGroup}
                              onChange={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  attributeGroup: undefined
                                }));
                              }}
                              className="h-4 w-4 text-primary-light focus:ring-primary-light border-gray-300"
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 italic">
                              Grup seçilmedi
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-xs text-gray-400">-</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-400">
                              Bu attribute hiçbir gruba bağlı olmayacak
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {t('group_help', 'attributes')}
              </p>
            </div>
          </div>
        );
        
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              {t('type_selection', 'attributes')}
            </h3>
            
            {/* Tip seçimi */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(AttributeType).map((type) => (
                <div
                  key={type}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.type === type
                      ? 'border-primary-light bg-primary-50 dark:border-primary-dark dark:bg-primary-900/20'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                  }`}
                  onClick={() => handleTypeChange(type)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <AttributeBadge type={type} />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {t(AttributeTypeLabels[type].key, AttributeTypeLabels[type].namespace, { use: true })}
                      </h4>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {typeDescriptions[type]}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Zorunluluk */}
            <div className="mt-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={formData.isRequired}
                  onChange={(e) => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
                  className="h-4 w-4 text-primary-light focus:ring-primary-light border-gray-300 rounded dark:border-gray-600"
                />
                <label htmlFor="isRequired" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  {t('is_required', 'attributes')}
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('is_required_help', 'attributes')}
              </p>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              {t('type_properties', 'attributes')}
            </h3>
            
            {(formData.type === AttributeType.SELECT || formData.type === AttributeType.MULTISELECT) ? (
              <div>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('select_options', 'attributes')}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    {t('select_readonly_options', 'attributes')}
                  </p>
                  
                  {readonlyAttributes.length > 0 ? (
                    <div className="space-y-3">
                      {readonlyAttributes.map((attr) => (
                        <div 
                          key={attr._id}
                          className={`flex items-center p-3 rounded-lg border ${
                            formData.options.includes(attr._id)
                              ? 'border-primary-light bg-primary-50 dark:border-primary-dark dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            id={`option-${attr._id}`}
                            checked={formData.options.includes(attr._id)}
                            onChange={() => {
                              const newOptions = formData.options.includes(attr._id)
                                ? formData.options.filter(id => id !== attr._id)
                                : [...formData.options, attr._id];
                              handleOptionsChange(newOptions);
                            }}
                            className="h-4 w-4 text-primary-light focus:ring-primary-light border-gray-300 rounded"
                          />
                          <label 
                            htmlFor={`option-${attr._id}`}
                            className="ml-3 flex-1 cursor-pointer"
                          >
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {getEntityName(attr, currentLanguage)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {attr.code}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-500 dark:text-gray-400">
                        {t('no_readonly_attributes', 'attributes')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>{t(AttributeTypeLabels[formData.type].key, AttributeTypeLabels[formData.type].namespace, { use: true })}</strong> {t('type_no_extra_properties', 'attributes')}
                      {t('proceed_to_validation', 'attributes')}
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
      
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">{t('review_and_create', 'attributes')}</h3>
            
            {/* Genel Bilgiler */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">{t('general_info', 'attributes')}</h4>
              
              {/* Name Translations */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{t('attribute_name', 'attributes')}</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {supportedLanguages.map((language) => (
                    <div key={language} className="bg-white dark:bg-gray-700 p-3 rounded border">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-400 uppercase">{language}</span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {translationData.nameTranslations[language] || '-'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Code */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('attribute_code', 'attributes')}</label>
                <p className="text-sm text-gray-900 dark:text-white font-mono bg-white dark:bg-gray-700 p-2 rounded border">
                  {formData.code || '-'}
                </p>
              </div>
              
              {/* Description Translations */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{t('description', 'attributes')}</label>
                <div className="space-y-3">
                  {supportedLanguages.map((language) => (
                    <div key={language} className="bg-white dark:bg-gray-700 p-3 rounded border">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-400 uppercase">{language}</span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {translationData.descriptionTranslations[language] || '-'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Attribute Group */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('attribute_group', 'attributes')}</label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formData.attributeGroup 
                    ? getEntityName(attributeGroups.find(group => group._id === formData.attributeGroup), currentLanguage) || 'Bilinmiyor'
                    : 'Grup seçilmedi'
                  }
                </p>
              </div>
            </div>
            
            {/* Tip ve Ayarlar */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">{t('type_and_settings', 'attributes')}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('attribute_type', 'attributes')}</label>
                  <div className="flex items-center space-x-2">
                    <AttributeBadge type={formData.type} />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {t(AttributeTypeLabels[formData.type].key, AttributeTypeLabels[formData.type].namespace, { use: true })}
                    </span>
                  </div>
                </div>
                
                {/* Required */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('is_required', 'attributes')}</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    formData.isRequired 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {formData.isRequired ? t('required', 'attributes') : t('optional', 'attributes')}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Seçenekler (SELECT/MULTISELECT için) */}
            {(formData.type === AttributeType.SELECT || formData.type === AttributeType.MULTISELECT) && formData.options && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">{t('options', 'attributes')}</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.options
                    .map(option => option.trim())
                    .filter(option => option.length > 0)
                    .map((option, index) => (
                      <span
                        key={`review-option-${index}-${option}`}
                        className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                      >
                        {option}
                      </span>
                    ))
                  }
                </div>
              </div>
            )}
            
            {/* Validasyon Kuralları */}
            {formData.validations && Object.keys(formData.validations).length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">{t('validation_rules', 'attributes')}</h4>
                <div className="space-y-2">
                  {Object.entries(formData.validations).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {typeof value === 'boolean' ? (value ? 'Evet' : 'Hayır') : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // READONLY attributes yükle
  useEffect(() => {
    const fetchReadonlyAttributes = async () => {
      if (formData.type === AttributeType.SELECT || formData.type === AttributeType.MULTISELECT) {
        try {
          const result = await attributeService.getAttributes({ 
            type: AttributeType.READONLY,
            isActive: true
          });
          setReadonlyAttributes(result.attributes || []);
        } catch (error) {
          console.error('READONLY attributes yüklenirken hata:', error);
          showToast({
            type: 'error',
            title: 'Hata',
            message: 'Seçenekler yüklenirken bir hata oluştu',
            duration: 5000
          });
        }
      }
    };

    fetchReadonlyAttributes();
  }, [formData.type]);
  
  return (
    <div className="space-y-6">
      {/* BREADCRUMB */}
      <div className="flex items-center justify-between">
        <Breadcrumb 
          items={[
            { label: t('attributes_title', 'attributes'), path: '/attributes/list' },
            { label: t('create_new_attribute', 'attributes') }
          ]} 
        />
      </div>

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
                {t('previous_step', 'attributes')}
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  variant="primary"
                  type="button"
                  onClick={handleNextStep}
                >
                  {t('next_step', 'attributes')}
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
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('create_attribute', 'attributes')}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>


    </div>
  );
};

export default AttributeCreatePage; 