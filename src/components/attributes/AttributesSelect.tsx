import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Button from '../ui/Button';
import attributeService from '../../services/api/attributeService';
import { Attribute } from '../../types/attribute';
import { useTranslation } from '../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../utils/translationUtils';
import AttributeBadge from './AttributeBadge';

interface AttributesSelectProps {
  selectedAttributeIds: string[];
  onSelectionChange: (attributeIds: string[]) => void;
  title?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  maxHeight?: string;
  isMultiple?: boolean; // Tek seçim veya çoklu seçim
  excludeAttributeIds?: string[]; // Hariç tutulacak attribute ID'leri
}

const AttributesSelect: React.FC<AttributesSelectProps> = ({
  selectedAttributeIds,
  onSelectionChange,
  title = 'Öznitelik Seçimi',
  emptyMessage = 'Henüz öznitelik bulunmuyor.',
  searchPlaceholder = 'Öznitelik ara...',
  maxHeight = 'max-h-96',
  isMultiple = true,
  excludeAttributeIds = []
}) => {
  const { t, currentLanguage } = useTranslation();
  
  // State
  const [allAttributes, setAllAttributes] = useState<Attribute[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Memoized filtered attributes - excludeAttributeIds'e göre filtrele
  const attributes = useMemo(() => {
    return allAttributes.filter(attr => !excludeAttributeIds.includes(attr._id));
  }, [allAttributes, excludeAttributeIds]);

  // Memoized search filtered attributes
  const filteredAttributes = useMemo(() => {
    if (!searchTerm.trim()) {
      return attributes;
    }

    return attributes.filter(attr => {
      const name = getEntityName(attr, currentLanguage).toLowerCase();
      const code = attr.code.toLowerCase();
      const description = getEntityDescription(attr, currentLanguage).toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      return name.includes(searchLower) || 
             code.includes(searchLower) || 
             description.includes(searchLower);
    });
  }, [attributes, searchTerm, currentLanguage]);

  // Debounce function
  const debounce = <T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void => {
    let timeoutId: number;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
    }, 300),
    []
  );

  // Attributes yükle - sadece bir kere
  useEffect(() => {
    const fetchAttributes = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await attributeService.getAttributes({
          page: 1,
          limit: 1000, // Tüm attributes'ları al
          isActive: true
        });
        
        setAllAttributes(result.attributes);
      } catch (err: any) {
        console.error('Attributes yüklenirken hata:', err);
        setError(err.message || 'Öznitelikler yüklenirken hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttributes();
  }, []); // Dependency yok - sadece bir kere yükle

  // Selection handlers
  const handleAttributeSelect = (attributeId: string) => {
    if (isMultiple) {
      if (selectedAttributeIds.includes(attributeId)) {
        // Remove from selection
        onSelectionChange(selectedAttributeIds.filter(id => id !== attributeId));
      } else {
        // Add to selection
        onSelectionChange([...selectedAttributeIds, attributeId]);
      }
    } else {
      // Single selection
      if (selectedAttributeIds.includes(attributeId)) {
        onSelectionChange([]); // Deselect if already selected
      } else {
        onSelectionChange([attributeId]); // Single selection
      }
    }
  };

  const handleSelectAll = () => {
    if (isMultiple) {
      const allIds = filteredAttributes.map(attr => attr._id);
      onSelectionChange(allIds);
    }
  };

  const handleDeselectAll = () => {
    onSelectionChange([]);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            Öznitelikler yükleniyor...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Hata</h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        {isMultiple && filteredAttributes.length > 0 && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={selectedAttributeIds.length === filteredAttributes.length}
            >
              Tümünü Seç
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              disabled={selectedAttributeIds.length === 0}
            >
              Seçimi Temizle
            </Button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
          placeholder={searchPlaceholder}
          onChange={(e) => debouncedSearch(e.target.value)}
        />
      </div>

      {/* Selection Summary */}
      {selectedAttributeIds.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800 dark:text-blue-300">
              {isMultiple 
                ? `${selectedAttributeIds.length} öznitelik seçildi`
                : `1 öznitelik seçildi`
              }
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              className="text-blue-600 dark:text-blue-400"
            >
              Temizle
            </Button>
          </div>
        </div>
      )}

      {/* Attributes List */}
      {filteredAttributes.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Arama kriterlerine uygun öznitelik bulunamadı.' : emptyMessage}
          </p>
        </div>
      ) : (
        <div className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${maxHeight} overflow-y-auto`}>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                  Seçim
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Öznitelik
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Kod
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tip
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Açıklama
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAttributes.map((attribute) => {
                const isSelected = selectedAttributeIds.includes(attribute._id);
                
                return (
                  <tr 
                    key={attribute._id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                    onClick={() => handleAttributeSelect(attribute._id)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type={isMultiple ? 'checkbox' : 'radio'}
                        checked={isSelected}
                        onChange={() => handleAttributeSelect(attribute._id)}
                        className="h-4 w-4 text-primary-light focus:ring-primary-light border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {getEntityName(attribute, currentLanguage)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                        {attribute.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <AttributeBadge type={attribute.type} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                        {getEntityDescription(attribute, currentLanguage) || '-'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttributesSelect; 