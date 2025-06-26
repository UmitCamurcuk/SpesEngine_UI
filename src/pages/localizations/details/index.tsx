import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  PencilIcon, 
  TrashIcon, 
  CheckIcon, 
  XMarkIcon,
  GlobeAltIcon,
  KeyIcon,
  FolderIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Tipler
interface Localization {
  key: string;
  namespace: string;
  translations: Record<string, string>;
  lastUpdated?: string;
  updatedBy?: string;
}

const LocalizationDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { namespace, key } = useParams<{ namespace: string; key: string }>();
  
  // Debug parametreleri
  console.log('Details page params:', { namespace, key });
  
  // State'ler
  const [localization, setLocalization] = useState<Localization>({
    key: '',
    namespace: '',
    translations: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedTranslations, setEditedTranslations] = useState<Record<string, string>>({});
  const [languages, setLanguages] = useState<string[]>(['tr', 'en']);

  // API çağrıları
  const fetchData = async () => {
    if (!namespace || !key) {
      return;
    }

    try {
      setIsLoading(true);
      
      const compositeId = `${namespace}:${key}`;
      
      const [langResult, localizationResult] = await Promise.all([
        localizationService.getSupportedLanguages(),
        localizationService.getTranslationById(compositeId)
      ]);

      if (langResult.success) {
        setLanguages(langResult.data);
      }

      if (localizationResult.success && localizationResult.data) {
        const localizationData: Localization = {
          key: localizationResult.data.key,
          namespace: localizationResult.data.namespace,
          translations: localizationResult.data.translations || {},
          lastUpdated: localizationResult.data.updatedAt,
          updatedBy: 'System' // TODO: Kullanıcı bilgisi eklenebilir
        };

        setLocalization(localizationData);
        setEditedTranslations(localizationData.translations);
      }
    } catch (err: any) {
      toast.error(err.message || 'Veriler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [namespace, key]);

  // Event handlers
  const handleInputChange = (lang: string, value: string) => {
    setEditedTranslations(prev => ({
      ...prev,
      [lang]: value
    }));
  };

  const handleSubmit = async () => {
    if (!namespace || !key) {
      toast.error('Geçersiz çeviri parametreleri');
      return;
    }

    try {
      setIsSaving(true);
      
      const compositeId = `${namespace}:${key}`;
      
      await localizationService.updateTranslationById(compositeId, {
        translations: editedTranslations
      });
      
      // Yeni veriyi tekrar getir
      await fetchData();
      
      toast.success('Değişiklikler kaydedildi');
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || 'Kayıt sırasında bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bu çeviriyi silmek istediğinize emin misiniz?')) return;
    
    try {
      setIsLoading(true);
      // API implementasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Çeviri başarıyla silindi');
      navigate('/localizations/list');
    } catch (err: any) {
      toast.error('Silme işlemi sırasında bir hata oluştu');
    }
  };

  if (isLoading && !localization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!localization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Çeviri Bulunamadı
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            İstediğiniz çeviri kaydına ulaşılamadı.
          </p>
          <Button onClick={() => navigate('/localizations/list')}>
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Listeye Dön
          </Button>
        </div>
      </div>
    );
  }

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
              Çeviri Detayları
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {localization.namespace}:{localization.key}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <Button
                variant="success"
                onClick={handleSubmit}
                disabled={isSaving}
              >
                <CheckIcon className="w-5 h-5 mr-2" />
                Kaydet
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditedTranslations(localization.translations);
                }}
              >
                <XMarkIcon className="w-5 h-5 mr-2" />
                İptal
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                onClick={() => setIsEditing(true)}
              >
                <PencilIcon className="w-5 h-5 mr-2" />
                Düzenle
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
              >
                <TrashIcon className="w-5 h-5 mr-2" />
                Sil
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Ana İçerik */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Üst Bilgiler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-3">
            <KeyIcon className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Anahtar</p>
              <p className="mt-1 text-gray-900 dark:text-white font-mono">{localization.key}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <FolderIcon className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Namespace</p>
              <p className="mt-1 text-gray-900 dark:text-white font-mono">{localization.namespace}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <ClockIcon className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Son Güncelleme</p>
              <p className="mt-1 text-gray-900 dark:text-white">
                {new Date(localization.lastUpdated || '').toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <GlobeAltIcon className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Dil Sayısı</p>
              <p className="mt-1 text-gray-900 dark:text-white">
                {Object.keys(localization.translations).length} dil
              </p>
            </div>
          </div>
        </div>

        {/* Çeviriler */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Çeviriler
          </h2>
          
          <div className="space-y-4">
            {languages.map(lang => (
              <div key={lang} className="relative">
                <Transition
                  show={isEditing}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Input
                    label={`${lang.toUpperCase()} Çevirisi`}
                    value={editedTranslations[lang] || ''}
                    onChange={(e) => handleInputChange(lang, e.target.value)}
                    placeholder={`${lang.toUpperCase()} dilinde çeviriyi girin`}
                  />
                </Transition>
                
                {!isEditing && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      {lang.toUpperCase()} Çevirisi
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {localization.translations[lang] || '-'}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalizationDetailsPage; 