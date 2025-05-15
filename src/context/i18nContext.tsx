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
  t: (key: string, namespace?: string) => string;
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

  // Dil değiştirme fonksiyonu
  const changeLanguage = (lang: string) => {
    dispatch(setLanguage(lang));
  };

  // Çeviri fonksiyonu
  const t = (key: string, namespace: string = 'common'): string => {
    if (!translations || !translations[namespace]) {
      return key;
    }
    
    return translations[namespace][key] || key;
  };

  // Dil değiştiğinde çevirileri yükle
  useEffect(() => {
    // @ts-ignore
    dispatch(fetchTranslations(currentLanguage));
    setIsLoaded(true);
  }, [currentLanguage, dispatch]);

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