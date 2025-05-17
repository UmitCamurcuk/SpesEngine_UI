import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../context/i18nContext';
import localizationService from '../../../services/api/localizationService';

// Bileşenler
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Transition } from '@headlessui/react';
import { toast } from 'react-hot-toast';

// İkonlar
import { 
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  GlobeAltIcon,
  KeyIcon,
  FolderIcon,
  DocumentPlusIcon
} from '@heroicons/react/24/outline';

interface FormData {
  key: string;
  namespace: string;
  translations: Record<string, string>;
}

const LocalizationCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [languages, setLanguages] = useState<string[]>(['tr', 'en']);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
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
        
        // Her dil için boş çeviri alanı oluştur
        const initialTranslations = result.data.reduce((acc: Record<string, string>, lang: string) => ({
          ...acc,
          [lang]: ''
        }), {});
        
        setFormData(prev => ({
          ...prev,
          translations: initialTranslations
        }));
      }
    } catch (error) {
      toast.error('Desteklenen diller getirilirken hata oluştu');
    }
  };
  
  useEffect(() => {
    fetchSupportedLanguages();
  }, []);
  
  // Form değişikliklerini işle
  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('translation_')) {
      const lang = field.replace('translation_', '');
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
        [field]: value
      }));
    }
    setIsDirty(true);
  };
  
  // Formu kaydet
  const handleSubmit = async () => {
    if (!formData.key || !formData.namespace) {
      toast.error('Anahtar ve namespace alanları zorunludur');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Backend API'si tamamlandığında buradaki kodu güncelle
      // const result = await localizationService.createTranslation(formData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      
      toast.success('Çeviri başarıyla eklendi');
      navigate(`/localizations/details/${formData.namespace}/${formData.key}`);
    } catch (err: any) {
      toast.error(err.message || 'Çeviri eklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Üst Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/localizations/list')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Yeni Çeviri Ekle
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Sisteme yeni bir çeviri eklemek için formu doldurun
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={!isDirty || isLoading}
            loading={isLoading}
          >
            <CheckIcon className="w-5 h-5 mr-2" />
            Kaydet
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/localizations/list')}
          >
            <XMarkIcon className="w-5 h-5 mr-2" />
            İptal
          </Button>
        </div>
      </div>

      {/* Ana İçerik */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Temel Bilgiler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-3">
            <KeyIcon className="w-5 h-5 text-gray-400 mt-1" />
            <div className="flex-1">
              <Input
                label="Anahtar"
                value={formData.key}
                onChange={(e) => handleInputChange('key', e.target.value)}
                placeholder="örn: welcome_message"
                required
              />
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <FolderIcon className="w-5 h-5 text-gray-400 mt-1" />
            <div className="flex-1">
              <Input
                label="Namespace"
                value={formData.namespace}
                onChange={(e) => handleInputChange('namespace', e.target.value)}
                placeholder="örn: common"
                required
              />
            </div>
          </div>
        </div>

        {/* Çeviriler */}
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <GlobeAltIcon className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Çeviriler
            </h2>
          </div>
          
          <div className="space-y-4">
            {languages.map(lang => (
              <div key={lang} className="relative">
                <Transition
                  show={true}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Input
                    label={`${lang.toUpperCase()} Çevirisi`}
                    value={formData.translations[lang] || ''}
                    onChange={(e) => handleInputChange(`translation_${lang}`, e.target.value)}
                    placeholder={`${lang.toUpperCase()} dilinde çeviriyi girin`}
                  />
                </Transition>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalizationCreatePage; 