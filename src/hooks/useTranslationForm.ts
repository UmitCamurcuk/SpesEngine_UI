import { useState, useEffect } from 'react';
import localizationService from '../services/api/localizationService';

interface TranslationFormData {
  nameTranslations: Record<string, string>;
  descriptionTranslations: Record<string, string>;
}

interface UseTranslationFormReturn {
  supportedLanguages: string[];
  translationData: TranslationFormData;
  isLoading: boolean;
  error: string | null;
  handleTranslationChange: (field: 'nameTranslations' | 'descriptionTranslations', language: string, value: string) => void;
  setTranslationData: React.Dispatch<React.SetStateAction<TranslationFormData>>;
  createTranslations: (code: string, namespace: string) => Promise<{ nameId: string; descriptionId?: string }>;
}

export const useTranslationForm = (): UseTranslationFormReturn => {
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>([]);
  const [translationData, setTranslationData] = useState<TranslationFormData>({
    nameTranslations: {},
    descriptionTranslations: {}
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Desteklenen dilleri yükle
  useEffect(() => {
    const fetchSupportedLanguages = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await localizationService.getSupportedLanguages();
        
        if (response && response.success && Array.isArray(response.data)) {
          setSupportedLanguages(response.data);
          
          // Her dil için boş çeviri alanı oluştur
          const initialTranslations = response.data.reduce((acc: Record<string, string>, lang: string) => {
            acc[lang] = '';
            return acc;
          }, {} as Record<string, string>);
          
          setTranslationData({
            nameTranslations: initialTranslations,
            descriptionTranslations: initialTranslations
          });
        } else {
          console.error('Geçersiz API response:', response);
          // Fallback olarak varsayılan dilleri kullan
          setSupportedLanguages(['tr', 'en']);
          setTranslationData({
            nameTranslations: { tr: '', en: '' },
            descriptionTranslations: { tr: '', en: '' }
          });
        }
      } catch (err: any) {
        console.error('Desteklenen diller alınamadı:', err);
        setError('Desteklenen diller alınamadı');
        // Hata durumunda varsayılan dilleri kullan
        setSupportedLanguages(['tr', 'en']);
        setTranslationData({
          nameTranslations: { tr: '', en: '' },
          descriptionTranslations: { tr: '', en: '' }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupportedLanguages();
  }, []);

  // Translation değişikliklerini handle et
  const handleTranslationChange = (
    field: 'nameTranslations' | 'descriptionTranslations',
    language: string,
    value: string
  ) => {
    setTranslationData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [language]: value
      }
    }));
  };

  // Çevirileri oluştur
  const createTranslations = async (
    code: string,
    namespace: string
  ): Promise<{ nameId: string; descriptionId?: string }> => {
    try {
      // Name translation oluştur
      const nameTranslationResponse = await localizationService.createTranslation({
        key: `${code}_name`,
        namespace,
        translations: translationData.nameTranslations
      });

      // Description translation oluştur (eğer varsa)
      let descriptionId: string | undefined;
      const hasDescription = Object.values(translationData.descriptionTranslations).some(desc => desc.trim());
      
      if (hasDescription) {
        const descriptionTranslationResponse = await localizationService.createTranslation({
          key: `${code}_description`,
          namespace,
          translations: translationData.descriptionTranslations
        });
        descriptionId = descriptionTranslationResponse.data._id;
      }

      return {
        nameId: nameTranslationResponse.data._id,
        descriptionId
      };
    } catch (error) {
      console.error('Çeviriler oluşturulurken hata:', error);
      throw error;
    }
  };

  return {
    supportedLanguages,
    translationData,
    isLoading,
    error,
    handleTranslationChange,
    setTranslationData,
    createTranslations
  };
}; 