import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import localizationService from '../../../services/api/localizationService';
import { useTranslation } from '../../../context/i18nContext';

// Lokalizasyon tipi
interface Localization {
  key: string;
  namespace: string;
  translations: Record<string, string>;
}

const LocalizationDetailsPage: React.FC = () => {
  const { namespace = '', key = '' } = useParams<{ namespace: string; key: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // State tanımlamaları
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [localization, setLocalization] = useState<Localization | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [languages, setLanguages] = useState<string[]>(['tr', 'en']);
  
  // Form state
  const [formData, setFormData] = useState<{
    key: string;
    namespace: string;
    translations: Record<string, string>;
  }>({
    key: '',
    namespace: '',
    translations: {}
  });
  
  // Dil desteğini getir
  const fetchSupportedLanguages = async () => {
    try {
      const result = await localizationService.getSupportedLanguages();
      if (result.success && Array.isArray(result.data)) {
        setLanguages(result.data);
      }
    } catch (error) {
      console.error('Desteklenen diller getirilirken hata oluştu:', error);
    }
  };
  
  // Çeviri bilgilerini getir
  const fetchLocalization = async () => {
    if (!namespace || !key) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Şimdilik sadece TR çevirisini gösteriyoruz
      // İleride tüm dillerdeki çevirileri getiren bir API endpoint'i eklenecek
      const result = await localizationService.getTranslations('tr');
      
      if (result.success && result.data) {
        // Doğru çeviriyi bul
        if (result.data[namespace] && result.data[namespace][key]) {
          // TR çevirisini al
          const translations: Record<string, string> = {
            tr: result.data[namespace][key]
          };
          
          // Bir mock çeviri ekle
          translations['en'] = result.data[namespace][key] + ' (EN)';
          
          const localizationData: Localization = {
            key,
            namespace,
            translations
          };
          
          setLocalization(localizationData);
          setFormData(localizationData);
        } else {
          throw new Error('Çeviri bulunamadı');
        }
      } else {
        throw new Error('Çeviri bilgisi alınamadı');
      }
    } catch (err: any) {
      setError(err.message || 'Çeviri bilgisi getirilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Bağımlılıklar değiştiğinde veri çek
  useEffect(() => {
    fetchLocalization();
    fetchSupportedLanguages();
  }, [namespace, key]);
  
  // Form değişikliklerini işle
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('translation_')) {
      const lang = name.replace('translation_', '');
      setFormData(prev => ({
        ...prev,
        translations: {
          ...prev.translations,
          [lang]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Düzenleme modunu açıp kapat
  const toggleEditMode = () => {
    if (isEditing) {
      // Düzenleme iptal
      setFormData(localization || { key: '', namespace: '', translations: {} });
    }
    setIsEditing(!isEditing);
  };
  
  // Formu kaydet
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.key || !formData.namespace) {
      setError('Anahtar ve namespace alanları zorunludur');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Backend API'si tamamlandığında buradaki kodu güncelle
      // const result = await localizationService.upsertTranslation(formData);
      
      alert('Bu özellik henüz implementasyonu tamamlanmadı. Kayıt işlemi gerçekleşmiyor.');
      
      // Form güncellendi varsayalım
      setLocalization(formData);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Çeviri güncellenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Silme işlemi
  const handleDelete = async () => {
    if (!localization) return;
    
    if (window.confirm(`"${localization.namespace}:${localization.key}" çevirisini silmek istediğinize emin misiniz?`)) {
      setIsLoading(true);
      setError(null);
      
      try {
        // Backend API'si tamamlandığında buradaki kodu güncelle
        // await localizationService.deleteLocalization(localization.key, localization.namespace);
        
        alert('Bu özellik henüz implementasyonu tamamlanmadı. Silme işlemi gerçekleşmiyor.');
        
        // Başarıyla silindi varsayalım, listeye dön
        navigate('/localizations/list');
      } catch (err: any) {
        setError(err.message || 'Çeviri silinirken bir hata oluştu');
        setIsLoading(false);
      }
    }
  };
  
  // Yükleniyor veya hata durumunda
  if (isLoading && !localization) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-light dark:border-primary-dark"></div>
        </div>
      </div>
    );
  }
  
  if (error && !localization) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
        <Button onClick={() => navigate('/localizations/list')}>Listeye Dön</Button>
      </div>
    );
  }
  
  if (!localization) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="text-yellow-700 dark:text-yellow-400">Çeviri bulunamadı.</p>
        </div>
        <Button onClick={() => navigate('/localizations/list')}>Listeye Dön</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Üst başlık ve butonlar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <div className="flex items-center">
            <button
              onClick={() => navigate('/localizations/list')}
              className="mr-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Çeviri Detayları</h1>
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {namespace}:{key}
          </p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button
            variant={isEditing ? 'outline' : 'primary'}
            onClick={toggleEditMode}
          >
            {isEditing ? 'İptal' : 'Düzenle'}
          </Button>
          {!isEditing && (
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Sil
            </Button>
          )}
        </div>
      </div>
      
      {/* Hata mesajı */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}
      
      {/* Form */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Anahtar */}
              <Input
                label="Anahtar"
                name="key"
                value={formData.key}
                onChange={handleInputChange}
                disabled={!isEditing}
                fullWidth
                required
              />
              
              {/* Namespace */}
              <Input
                label="Namespace"
                name="namespace"
                value={formData.namespace}
                onChange={handleInputChange}
                disabled={!isEditing}
                fullWidth
                required
              />
            </div>
            
            {/* Çeviriler */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Çeviriler</h3>
              
              <div className="space-y-4">
                {languages.map(lang => (
                  <Input
                    key={lang}
                    label={`${lang.toUpperCase()} Çevirisi`}
                    name={`translation_${lang}`}
                    value={formData.translations[lang] || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    fullWidth
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Aksiyon butonları */}
          {isEditing && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={toggleEditMode}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LocalizationDetailsPage; 