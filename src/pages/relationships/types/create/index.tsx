import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { relationshipService } from '../../../../services';
import { useTranslation } from '../../../../context/i18nContext';

// Form adımları için enum
enum FormStep {
  BASIC_INFO = 0,
  DIRECTIONAL_SETTINGS = 1,
  ENTITY_TYPES = 2,
  METADATA = 3,
  REVIEW = 4
}

const CreateRelationshipTypePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.BASIC_INFO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form verileri
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    isDirectional: true,
    allowedSourceTypes: [] as string[],
    allowedTargetTypes: [] as string[],
    metadata: {} as Record<string, any>
  });
  
  // Validation state
  const [errors, setErrors] = useState({
    code: '',
    name: '',
    allowedSourceTypes: '',
    allowedTargetTypes: ''
  });

  // Entity tipleri için sabit değerler (gerçek uygulamada API'den gelebilir)
  const entityTypes = [
    { value: 'item', label: 'Öğe' },
    { value: 'itemType', label: 'Öğe Tipi' },
    { value: 'attribute', label: 'Öznitelik' },
    { value: 'category', label: 'Kategori' },
    { value: 'family', label: 'Aile' }
  ];
  
  // Form değeri değiştiğinde
  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    
    // Hata temizleme
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: '' });
    }
  };
  
  // Metadata key-value değiştirme
  const handleMetadataChange = (key: string, value: any) => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        [key]: value
      }
    });
  };
  
  // Metadata anahtarını silme
  const removeMetadataKey = (key: string) => {
    const newMetadata = { ...formData.metadata };
    delete newMetadata[key];
    setFormData({
      ...formData,
      metadata: newMetadata
    });
  };
  
  // Yeni metadata key-value çifti ekleme
  const [newMetadataKey, setNewMetadataKey] = useState('');
  const [newMetadataValue, setNewMetadataValue] = useState('');
  
  const addMetadataKeyValue = () => {
    if (!newMetadataKey.trim()) return;
    
    handleMetadataChange(newMetadataKey, newMetadataValue);
    setNewMetadataKey('');
    setNewMetadataValue('');
  };
  
  // Veri doğrulama
  const validateStep = () => {
    const newErrors = { ...errors };
    
    switch (currentStep) {
      case FormStep.BASIC_INFO:
        if (!formData.code.trim()) {
          newErrors.code = t('code_required', 'relationships') || 'Kod alanı zorunludur';
        } else if (!/^[a-z0-9_]+$/.test(formData.code)) {
          newErrors.code = t('code_format', 'relationships') || 'Kod sadece küçük harf, sayı ve alt çizgi içerebilir';
        }
        
        if (!formData.name.trim()) {
          newErrors.name = t('name_required', 'relationships') || 'İsim alanı zorunludur';
        }
        break;
        
      case FormStep.ENTITY_TYPES:
        if (formData.allowedSourceTypes.length === 0) {
          newErrors.allowedSourceTypes = t('source_types_required', 'relationships') || 'En az bir kaynak tipi seçmelisiniz';
        }
        
        if (formData.isDirectional && formData.allowedTargetTypes.length === 0) {
          newErrors.allowedTargetTypes = t('target_types_required', 'relationships') || 'En az bir hedef tipi seçmelisiniz';
        }
        break;
    }
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };
  
  // Sonraki adıma geçme
  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  // Önceki adıma dönme
  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  // Form gönderme
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // API'ye gönderilecek verileri hazırla
      const postData = { ...formData };
      
      // Eğer yönlü değilse, kaynak türleri hedef türlerine de ekleyerek iki yönlü ilişki olmasını sağla
      if (!formData.isDirectional) {
        postData.allowedTargetTypes = [...formData.allowedSourceTypes];
      }
      
      // İlişki tipini oluştur
      await relationshipService.createRelationshipType(postData);
      
      // Başarılı işlem sonrası liste sayfasına yönlendir
      navigate('/relationships/types/list');
    } catch (err: any) {
      console.error('İlişki tipi oluşturulurken hata oluştu:', err);
      setError(err.message || t('relationship_type_create_error', 'relationships') || 'İlişki tipi oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  // Adım başlıkları
  const stepTitles = [
    t('general_info', 'relationships') || 'Genel Bilgiler',
    t('directional_settings', 'relationships') || 'Yön Ayarları',
    t('entity_types', 'relationships') || 'Varlık Tipleri',
    t('metadata_settings', 'relationships') || 'Metadata Ayarları',
    t('review', 'relationships') || 'İnceleme'
  ];
  
  // Checkbox değişikliği
  const toggleCheckbox = (field: string, value: string) => {
    const array = formData[field as keyof typeof formData] as string[];
    if (array.includes(value)) {
      handleChange(field, array.filter(item => item !== value));
    } else {
      handleChange(field, [...array, value]);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('create_new_relationship_type', 'relationships')}
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {t('create_relationship_type_description', 'relationships') || 
            'Yeni bir ilişki tipi tanımlayarak varlıklar arasındaki ilişkileri yapılandırın.'}
        </p>
      </div>
      
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {stepTitles.map((title, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm
                  ${currentStep === index 
                    ? 'bg-primary-light dark:bg-primary-dark text-white' 
                    : currentStep > index 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}
              >
                {currentStep > index ? '✓' : index + 1}
              </div>
              <div className="text-xs font-medium mt-2 text-center max-w-[100px]">{title}</div>
            </div>
          ))}
        </div>
        <div className="relative mt-2">
          <div className="absolute top-0 h-1 bg-gray-200 dark:bg-gray-700 w-full"></div>
          <div 
            className="absolute top-0 h-1 bg-primary-light dark:bg-primary-dark transition-all" 
            style={{ width: `${(currentStep / (stepTitles.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Hata gösterimi */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-6">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      
      {/* Form içeriği */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        {/* Adım 1: Temel Bilgiler */}
        {currentStep === FormStep.BASIC_INFO && (
          <div>
            <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
              {t('basic_information', 'common')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t('enter_relationship_basic_info', 'relationships') || 
                'İlişki tipinin temel bilgilerini girin. Kod benzersiz olmalı ve sadece küçük harfler, sayılar ve alt çizgi içermelidir.'}
            </p>
            
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('relationship_type_name', 'relationships')} *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={t('relationship_name_placeholder', 'relationships')}
                className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600
                  ${errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('relationship_name_help', 'relationships') || 
                  'İlişki tipini tanımlayan bir isim girin. Örneğin: "Üreticisi", "Parçası" vb.'}
              </p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('relationship_type_code', 'relationships')} *
              </label>
              <input
                type="text"
                id="code"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder={t('relationship_code_placeholder', 'relationships')}
                className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600
                  ${errors.code ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('relationship_code_help', 'relationships') || 
                  'Sadece küçük harfler, sayılar ve alt çizgi kullanın. Örneğin: "manufacturer", "part_of" vb.'}
              </p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('relationship_type_description', 'relationships')}
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder={t('relationship_description_placeholder', 'relationships')}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('relationship_description_help', 'relationships') || 
                  'İlişki tipini daha detaylı açıklayan bilgiler ekleyin. Bu alan opsiyoneldir.'}
              </p>
            </div>
          </div>
        )}
        
        {/* Adım 2: Yön Ayarları */}
        {currentStep === FormStep.DIRECTIONAL_SETTINGS && (
          <div>
            <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
              {t('direction_settings', 'relationships')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t('direction_settings_description', 'relationships') || 
                'İlişkinin yönlü olup olmadığını belirleyin. Yönlü ilişkiler, kaynak ve hedef arasında belirli bir yön içerir.'}
            </p>
            
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="isDirectional"
                    type="checkbox"
                    checked={formData.isDirectional}
                    onChange={(e) => handleChange('isDirectional', e.target.checked)}
                    className="h-4 w-4 text-primary-light dark:text-primary-dark border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="isDirectional" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('is_directional', 'relationships')}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('is_directional_help', 'relationships')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                {t('direction_example', 'relationships') || 'Örnek'}
              </h3>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {formData.isDirectional ? (
                  t('directional_example', 'relationships') || 
                  'Yönlü ilişki örneği: "Telefon, Şarj Kablosu\'nun uyumlu cihazıdır" - burada yön önemlidir, ters çevrilemez.'
                ) : (
                  t('bidirectional_example', 'relationships') || 
                  'Çift yönlü ilişki örneği: "A ürünü, B ürünü ile uyumludur" - burada ilişki her iki yönde de aynıdır.'
                )}
              </p>
            </div>
          </div>
        )}
        
        {/* Adım 3: Varlık Tipleri */}
        {currentStep === FormStep.ENTITY_TYPES && (
          <div>
            <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
              {t('entity_types', 'relationships')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {formData.isDirectional
                ? t('directional_entity_types_description', 'relationships') || 
                  'Bu ilişki için izin verilen kaynak ve hedef varlık tiplerini seçin.'
                : t('bidirectional_entity_types_description', 'relationships') || 
                  'Bu ilişki için izin verilen varlık tiplerini seçin. Çift yönlü ilişkilerde kaynak ve hedef tipleri aynıdır.'}
            </p>
            
            {/* Kaynak Tipleri */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('source_entity_types', 'relationships')} *
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                {entityTypes.map((type) => (
                  <div key={type.value} className="flex items-center">
                    <input
                      id={`source-${type.value}`}
                      type="checkbox"
                      value={type.value}
                      checked={formData.allowedSourceTypes.includes(type.value)}
                      onChange={() => toggleCheckbox('allowedSourceTypes', type.value)}
                      className="h-4 w-4 text-primary-light dark:text-primary-dark border-gray-300 rounded"
                    />
                    <label htmlFor={`source-${type.value}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {type.label}
                    </label>
                  </div>
                ))}
              </div>
              {errors.allowedSourceTypes && (
                <p className="mt-1 text-sm text-red-500">{errors.allowedSourceTypes}</p>
              )}
            </div>
            
            {/* Hedef Tipleri - Sadece yönlü ilişkilerde görünür */}
            {formData.isDirectional && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('target_entity_types', 'relationships')} *
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  {entityTypes.map((type) => (
                    <div key={type.value} className="flex items-center">
                      <input
                        id={`target-${type.value}`}
                        type="checkbox"
                        value={type.value}
                        checked={formData.allowedTargetTypes.includes(type.value)}
                        onChange={() => toggleCheckbox('allowedTargetTypes', type.value)}
                        className="h-4 w-4 text-primary-light dark:text-primary-dark border-gray-300 rounded"
                      />
                      <label htmlFor={`target-${type.value}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.allowedTargetTypes && (
                  <p className="mt-1 text-sm text-red-500">{errors.allowedTargetTypes}</p>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Adım 4: Metadata */}
        {currentStep === FormStep.METADATA && (
          <div>
            <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
              {t('metadata_settings', 'relationships')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t('metadata_description', 'relationships') || 
                'Metadata, ilişki tipine eklenecek ek bilgileri içerir. Bu bilgiler isteğe bağlıdır ve gelecekte özel sorgulamalar için kullanılabilir.'}
            </p>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-6">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                {t('what_is_metadata', 'relationships') || 'Metadata nedir?'}
              </h3>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                {t('metadata_explanation', 'relationships') || 
                  'Metadata, ilişki tipini daha iyi tanımlamak için kullanılan anahtar-değer çiftleridir. Örneğin, "önem_derecesi": "yüksek" gibi.'}
              </p>
            </div>
            
            {/* Mevcut Metadata Listesi */}
            {Object.keys(formData.metadata).length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('current_metadata', 'relationships') || 'Mevcut Metadata'}
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <thead className="bg-gray-100 dark:bg-gray-600">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          {t('key', 'common')}
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          {t('value', 'common')}
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          {t('actions', 'common')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {Object.entries(formData.metadata).map(([key, value]) => (
                        <tr key={key}>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{key}</td>
                          <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">{String(value)}</td>
                          <td className="px-4 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => removeMetadataKey(key)}
                              className="text-red-600 dark:text-red-400 text-sm"
                            >
                              {t('remove', 'common') || 'Kaldır'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Yeni Metadata Ekleme */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('add_new_metadata', 'relationships') || 'Yeni Metadata Ekle'}
              </h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
                <div>
                  <label htmlFor="metadataKey" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('key', 'common')}
                  </label>
                  <input
                    type="text"
                    id="metadataKey"
                    value={newMetadataKey}
                    onChange={(e) => setNewMetadataKey(e.target.value)}
                    placeholder={t('metadata_key_placeholder', 'relationships') || 'Örn: önem_derecesi'}
                    className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-600 dark:border-gray-500 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="metadataValue" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('value', 'common')}
                  </label>
                  <input
                    type="text"
                    id="metadataValue"
                    value={newMetadataValue}
                    onChange={(e) => setNewMetadataValue(e.target.value)}
                    placeholder={t('metadata_value_placeholder', 'relationships') || 'Örn: yüksek'}
                    className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-600 dark:border-gray-500 text-sm"
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={addMetadataKeyValue}
                disabled={!newMetadataKey.trim()}
                className={`px-3 py-1 text-sm rounded
                  ${newMetadataKey.trim() 
                    ? 'bg-primary-light dark:bg-primary-dark text-white' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'}`}
              >
                {t('add', 'common') || 'Ekle'}
              </button>
            </div>
          </div>
        )}
        
        {/* Adım 5: İnceleme */}
        {currentStep === FormStep.REVIEW && (
          <div>
            <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
              {t('review_and_create', 'relationships')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t('review_relationship_type', 'relationships') || 
                'Lütfen bilgileri gözden geçirin ve doğru olduklarından emin olun.'}
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('basic_information', 'common')}</h3>
                  <dl className="mt-2 text-sm">
                    <div className="flex justify-between py-1">
                      <dt className="text-gray-500 dark:text-gray-400">{t('name', 'common')}:</dt>
                      <dd className="text-gray-900 dark:text-white font-medium">{formData.name}</dd>
                    </div>
                    <div className="flex justify-between py-1">
                      <dt className="text-gray-500 dark:text-gray-400">{t('code', 'common')}:</dt>
                      <dd className="text-gray-900 dark:text-white font-medium">{formData.code}</dd>
                    </div>
                    <div className="flex justify-between py-1">
                      <dt className="text-gray-500 dark:text-gray-400">{t('description', 'common')}:</dt>
                      <dd className="text-gray-900 dark:text-white">
                        {formData.description || <span className="text-gray-400 dark:text-gray-500">{t('no_description', 'common')}</span>}
                      </dd>
                    </div>
                    <div className="flex justify-between py-1">
                      <dt className="text-gray-500 dark:text-gray-400">{t('is_directional', 'relationships')}:</dt>
                      <dd className="text-gray-900 dark:text-white">
                        {formData.isDirectional ? t('yes', 'common') : t('no', 'common')}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('entity_types', 'relationships')}</h3>
                  <dl className="mt-2 text-sm">
                    <div className="flex justify-between py-1">
                      <dt className="text-gray-500 dark:text-gray-400">{t('source_types', 'relationships')}:</dt>
                      <dd className="text-gray-900 dark:text-white">
                        {formData.allowedSourceTypes.length > 0
                          ? formData.allowedSourceTypes.join(', ')
                          : <span className="text-gray-400 dark:text-gray-500">{t('none_selected', 'common')}</span>}
                      </dd>
                    </div>
                    
                    {formData.isDirectional && (
                      <div className="flex justify-between py-1">
                        <dt className="text-gray-500 dark:text-gray-400">{t('target_types', 'relationships')}:</dt>
                        <dd className="text-gray-900 dark:text-white">
                          {formData.allowedTargetTypes.length > 0
                            ? formData.allowedTargetTypes.join(', ')
                            : <span className="text-gray-400 dark:text-gray-500">{t('none_selected', 'common')}</span>}
                        </dd>
                      </div>
                    )}
                  </dl>
                  
                  {Object.keys(formData.metadata).length > 0 && (
                    <>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">{t('metadata', 'relationships')}</h3>
                      <dl className="mt-2 text-sm">
                        {Object.entries(formData.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-1">
                            <dt className="text-gray-500 dark:text-gray-400">{key}:</dt>
                            <dd className="text-gray-900 dark:text-white">{String(value)}</dd>
                          </div>
                        ))}
                      </dl>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Form kontrol butonları */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={currentStep === FormStep.BASIC_INFO ? () => navigate('/relationships/types/list') : handlePrev}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          disabled={loading}
        >
          {currentStep === FormStep.BASIC_INFO ? t('cancel', 'common') : t('previous_step', 'common')}
        </button>
        
        {currentStep === FormStep.REVIEW ? (
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
            disabled={loading}
          >
            {loading
              ? t('creating', 'relationships') || 'Oluşturuluyor...'
              : t('create_type', 'relationships') || 'Oluştur'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
          >
            {t('next_step', 'common')}
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateRelationshipTypePage; 