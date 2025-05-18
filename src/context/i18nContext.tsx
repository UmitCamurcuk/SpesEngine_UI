import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { 
  fetchTranslations, 
  setLanguage, 
  selectCurrentLanguage, 
  selectTranslations,
  selectSupportedLanguages
} from '../redux/features/localization/localizationSlice';
import { useAppSelector } from '../redux/store';

// Context tipi
interface I18nContextType {
  t: (key: string, namespace?: string, options?: { use?: boolean }) => string;
  changeLanguage: (lang: string) => void;
  currentLanguage: string;
  supportedLanguages: string[];
}

// Default değerler
const defaultContext: I18nContextType = {
  t: (key: string) => key,
  changeLanguage: () => {},
  currentLanguage: 'tr',
  supportedLanguages: ['tr', 'en']
};

// Context'i oluştur
const I18nContext = createContext<I18nContextType>(defaultContext);

// Provider component
export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const currentLanguage = useAppSelector(selectCurrentLanguage);
  const translations = useAppSelector(selectTranslations);
  const supportedLanguages = useAppSelector(selectSupportedLanguages);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadedLanguage, setLoadedLanguage] = useState('');

  // Dil değiştirme fonksiyonu
  const changeLanguage = (lang: string) => {
    console.log(`[i18n] Dil değiştiriliyor: ${lang}`);
    dispatch(setLanguage(lang));
  };

  // Çeviri fonksiyonu
  const t = (key: string, namespace: string = 'common', options?: { use?: boolean }): string => {
    if (!translations) {
      console.log(`[i18n] Çeviriler bulunamadı! Key: ${key}, Namespace: ${namespace}`);
      return key;
    }
    
    if (!translations[namespace]) {
      console.log(`[i18n] Namespace bulunamadı! Key: ${key}, Namespace: ${namespace}`);
      return key;
    }
    
    const result = translations[namespace][key] || key;
    
    // Sadece debug modunda ve dahili kullanım değilse logla
    if (!options?.use && (namespace === 'menu' || namespace === 'attribute_types')) {
    }
    
    return result;
  };

  // Dil değiştiğinde çevirileri yükle
  useEffect(() => {
    
    // Sadece dil değişmiş veya henüz yüklenmemişse API çağrısı yap
    if (currentLanguage !== loadedLanguage) {
      // @ts-ignore
      dispatch(fetchTranslations(currentLanguage));
      setLoadedLanguage(currentLanguage);
      setIsLoaded(true);
    } else if (!isLoaded) {
      setIsLoaded(true);
    }
  }, [currentLanguage, dispatch, isLoaded, loadedLanguage, translations]);

  // Context değerleri
  const contextValue: I18nContextType = {
    t,
    changeLanguage,
    currentLanguage,
    supportedLanguages
  };

  // İlk yükleme tamamlanana kadar loading göster
  if (!isLoaded) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};

// Hook
export const useTranslation = () => useContext(I18nContext); 