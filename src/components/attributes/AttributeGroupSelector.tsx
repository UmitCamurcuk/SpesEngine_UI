import React, { useEffect, useState, useMemo } from 'react';
import attributeGroupService from '../../services/api/attributeGroupService';
import attributeService from '../../services/api/attributeService';
import { useTranslation } from '../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../utils/translationUtils';

interface AttributeGroupSelectorProps {
  selectedAttributeGroups: string[];
  onChange: (attributeGroupIds: string[]) => void;
}

interface AttributeGroupOption {
  _id: string;
  name: string;
  code: string;
  description: string;
  attributeCount: number;
  isActive: boolean;
}

const AttributeGroupSelector: React.FC<AttributeGroupSelectorProps> = ({
  selectedAttributeGroups,
  onChange
}) => {
  const { t, currentLanguage } = useTranslation();
  const [attributeGroups, setAttributeGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [attributeCounts, setAttributeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchAttributeGroups = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Tüm öznitelik gruplarını getir
        const result = await attributeGroupService.getAttributeGroups({ limit: 100 });
        setAttributeGroups(result.attributeGroups);
      } catch (err: any) {
        console.error('Öznitelik grupları yüklenirken hata:', err);
        setError(err.message || 'Öznitelik grupları yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAttributeGroups();
  }, [currentLanguage]);
  
  // Arama terimine göre filtrelenmiş öznitelik grupları
  const filteredAttributeGroups = useMemo(() => {
    if (!searchTerm.trim()) return attributeGroups;
    
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return attributeGroups.filter(group => {
      const name = getEntityName(group, currentLanguage) || '';
      const code = group.code || '';
      const description = getEntityDescription(group, currentLanguage) || '';
      
      return name.toLowerCase().includes(lowerCaseSearchTerm) ||
             code.toLowerCase().includes(lowerCaseSearchTerm) ||
             description.toLowerCase().includes(lowerCaseSearchTerm);
    });
  }, [attributeGroups, searchTerm, currentLanguage]);
  
  // Checkbox değişikliğini ele al
  const handleCheckboxChange = (attributeGroupId: string) => {
    let newSelectedGroups: string[];
    
    if (selectedAttributeGroups.includes(attributeGroupId)) {
      // Zaten seçili ise kaldır
      newSelectedGroups = selectedAttributeGroups.filter(id => id !== attributeGroupId);
    } else {
      // Seçili değilse ekle
      newSelectedGroups = [...selectedAttributeGroups, attributeGroupId];
    }
    
    onChange(newSelectedGroups);
  };
  
  // Tümünü seç/kaldır
  const handleSelectAll = () => {
    if (selectedAttributeGroups.length === filteredAttributeGroups.length) {
      // Tümü seçili ise tümünü kaldır
      onChange([]);
    } else {
      // Değilse tümünü seç
      onChange(filteredAttributeGroups.map(group => group._id));
    }
  };
  
  if (isLoading) {
    return <div className="text-center py-4">Yükleniyor...</div>;
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }
  
  if (attributeGroups.length === 0) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <p className="text-yellow-600 dark:text-yellow-400">Öznitelik grubu bulunamadı</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
          Öznitelik Grupları
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {selectedAttributeGroups.length} / {attributeGroups.length} seçili
        </div>
      </div>
      
      {/* Arama ve toplu işlem kontrolleri */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Öznitelik grubu ara..."
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
          />
        </div>
        
        <button
          type="button"
          onClick={handleSelectAll}
          className="text-white bg-primary-light hover:bg-primary-light/90 focus:ring-4 focus:ring-primary-light/30 font-medium rounded-lg text-sm px-4 py-2.5 dark:bg-primary-dark dark:hover:bg-primary-dark/90 dark:focus:ring-primary-dark/30"
        >
          {selectedAttributeGroups.length === filteredAttributeGroups.length ? "Tümünü Kaldır" : "Tümünü Seç"}
        </button>
      </div>
      
      {/* Öznitelik grubu listesi */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="w-16 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Seç
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Grup
              </th>
              <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Kod
              </th>
              <th scope="col" className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Açıklama
              </th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Öznitelik Sayısı
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {filteredAttributeGroups.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Arama kriterlerine uygun öznitelik grubu bulunamadı
                </td>
              </tr>
            ) : (
              filteredAttributeGroups.map(group => (
                <tr key={group._id} className={selectedAttributeGroups.includes(group._id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedAttributeGroups.includes(group._id)}
                      onChange={() => handleCheckboxChange(group._id)}
                      className="w-4 h-4 text-primary-light bg-gray-100 border-gray-300 rounded focus:ring-primary-light dark:focus:ring-primary-dark dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {getEntityName(group, currentLanguage)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 md:hidden">
                        {group.code}
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap">
                    <div className="font-mono text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {group.code}
                    </div>
                  </td>
                  <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="truncate max-w-xs" title={getEntityDescription(group, currentLanguage) || ''}>
                      {getEntityDescription(group, currentLanguage) || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {Array.isArray(group.attributes) ? group.attributes.length : 0} öznitelik
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Mobil cihazlarda daha fazla bilgi için tooltip ya da açıklama */}
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 md:hidden">
        Daha fazla bilgi görmek için ekranı sağa kaydırın veya cihazınızı yatay konuma getirin.
      </p>
    </div>
  );
};

export default AttributeGroupSelector; 