import React from 'react';
import { useTranslation } from '../../context/i18nContext';

const LanguageSwitcher: React.FC = () => {
  const { currentLanguage, changeLanguage, supportedLanguages } = useTranslation();

  // Dil kodlarına göre bayrak ve isim eşleştirmesi
  const languageOptions = {
    tr: {
      name: 'Türkçe',
      flag: '🇹🇷'
    },
    en: {
      name: 'English',
      flag: '🇬🇧'
    },
    de: {
      name: 'Deutsch',
      flag: '🇩🇪'
    },
    fr: {
      name: 'Français',
      flag: '🇫🇷'
    }
  };

  return (
    <div className="relative">
      <select
        className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 pl-3 pr-8 text-sm leading-tight cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={currentLanguage}
        onChange={(e) => changeLanguage(e.target.value)}
      >
        {supportedLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {languageOptions[lang as keyof typeof languageOptions]?.flag || ''} {languageOptions[lang as keyof typeof languageOptions]?.name || lang.toUpperCase()}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </div>
  );
};

export default LanguageSwitcher; 