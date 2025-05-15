import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import localizationService from '../../../services/api/localizationService';
import { useTranslation } from '../../../context/i18nContext';

const LocalizationCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // State tanımlamaları
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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
  
  // İlk yüklemede dil desteğini getir
  useEffect(() => {
    fetchSupportedLanguages();
  }, []);
  
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
      // const result = await localizationService.createTranslation(formData);
      
      alert('Bu özellik henüz implementasyonu tamamlanmadı. Ekleme işlemi gerçekleşmiyor.');
      
      // Başarıyla eklendi varsayalım, detay sayfasına yönlendir
      navigate(`/localizations/details/${formData.namespace}/${formData.key}`);
    } catch (err: any) {
      setError(err.message || 'Çeviri eklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Yeni Çeviri Ekle</h1>
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Sisteme yeni çeviri eklemek için formu doldurun
          </p>
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
                fullWidth
                required
                placeholder="örn: welcome_message"
              />
              
              {/* Namespace */}
              <Input
                label="Namespace"
                name="namespace"
                value={formData.namespace}
                onChange={handleInputChange}
                fullWidth
                required
                placeholder="örn: common"
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
                    fullWidth
                    placeholder={`${lang.toUpperCase()} dilindeki çeviriyi girin`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Aksiyon butonları */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate('/localizations/list')}
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Ekleniyor...' : 'Ekle'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocalizationCreatePage; 