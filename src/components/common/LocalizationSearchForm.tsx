import React, { useState } from 'react';
import Button from '../ui/Button';

interface LocalizationSearchFormProps {
  onSearchInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  placeholder?: string;
  searchButtonText?: string;
  className?: string;
  searchTerm?: string;
}

const LocalizationSearchForm: React.FC<LocalizationSearchFormProps> = ({
  onSearchInput,
  onSubmit,
  placeholder = "Namespace, anahtar veya çeviri ara...",
  searchButtonText = "Ara",
  className = "flex w-full max-w-lg",
  searchTerm = ""
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="w-full max-w-lg">
      <form className={className} onSubmit={onSubmit}>
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full p-2 pl-10 text-sm border border-gray-300 rounded-l-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder={placeholder}
            onChange={onSearchInput}
            value={searchTerm}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          className="rounded-l-none"
        >
          {searchButtonText}
        </Button>
      </form>
      
      {/* Gelişmiş Arama Bilgisi */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <svg className={`w-3 h-3 mr-1 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Gelişmiş arama ipuçları
        </button>
        
        {showAdvanced && (
          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-300 mb-2">
              <strong>Arama yapabileceğiniz alanlar:</strong>
            </p>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <li>• <strong>Namespace:</strong> common, attributes, categories vb.</li>
              <li>• <strong>Anahtar:</strong> delete, save, cancel vb.</li>
              <li>• <strong>Çeviri değerleri:</strong> Türkçe, İngilizce ve diğer dillerdeki metinler</li>
            </ul>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              <strong>Örnek:</strong> "sil" yazarak hem "delete" anahtarını hem de "Sil" çevirisini bulabilirsiniz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocalizationSearchForm; 