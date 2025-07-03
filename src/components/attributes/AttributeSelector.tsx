import React, { useEffect, useState, useMemo } from 'react';
import attributeService from '../../services/api/attributeService';
import { useTranslation } from '../../context/i18nContext';
import AttributeBadge from './AttributeBadge';

interface AttributeSelectorProps {
  attributeGroupIds: string[];
  selectedAttributes: string[];
  onChange: (attributeIds: string[]) => void;
}

// API'den dönen attributeGroup tipini tanımla
interface AttributeGroupObject {
  _id: string;
  name: string;
  code: string;
}

interface AttributeOption {
  _id: string;
  name: string;
  code: string;
  type: string;
  description: string;
  isRequired: boolean;
  options: {
    _id: string;
    name: string;
    code: string;
    type: string;
  }[];
  optionType?: {
    _id: string;
    name: string;
    code: string;
    type: string;
  };
  attributeGroup: {
    _id: string;
    name: string;
    code: string;
  };
}

// API'den dönen attribute tipini tanımla
interface ApiAttribute {
  _id: string;
  name: string;
  code: string;
  type: string;
  description?: string;
  isRequired?: boolean;
  options?: {
    _id: string;
    name: string;
    code: string;
    type: string;
  }[];
  optionType?: {
    _id: string;
    name: string;
    code: string;
    type: string;
  };
  attributeGroup: string | AttributeGroupObject;
  [key: string]: any;
}

const AttributeSelector: React.FC<AttributeSelectorProps> = ({
  attributeGroupIds,
  selectedAttributes,
  onChange
}) => {
  const { t } = useTranslation();
  const [attributes, setAttributes] = useState<AttributeOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  useEffect(() => {
    const fetchAttributes = async () => {
      if (!attributeGroupIds.length) {
        setAttributes([]);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Tüm attribute'ları getir, UI'da filtreleyelim
        const result = await attributeService.getAttributes({ limit: 100 });
        const apiAttributes = result.attributes as ApiAttribute[];
        
        // AttributeGroup ID'lerine göre filtrele
        const filteredAttributes = apiAttributes
          .filter(attr => {
            if (!attr.attributeGroup) return false;
            
            // attributeGroup nesne ya da string olabilir
            if (typeof attr.attributeGroup === 'object') {
              return attributeGroupIds.includes(attr.attributeGroup._id);
            } else {
              return attributeGroupIds.includes(attr.attributeGroup);
            }
          })
          .map(attr => {
            let groupId = '';
            let groupName = '';
            let groupCode = '';
            
            if (typeof attr.attributeGroup === 'object') {
              groupId = attr.attributeGroup._id;
              groupName = attr.attributeGroup.name || '';
              groupCode = attr.attributeGroup.code || '';
            } else {
              groupId = attr.attributeGroup;
            }
            
            return {
              _id: attr._id,
              name: attr.name,
              code: attr.code,
              type: attr.type,
              description: attr.description || '',
              isRequired: attr.isRequired || false,
              options: attr.options || [],
              optionType: attr.optionType,
              attributeGroup: {
                _id: groupId,
                name: groupName,
                code: groupCode
              }
            };
          });
        
        setAttributes(filteredAttributes);
      } catch (err: any) {
        console.error('Attributes yüklenirken hata:', err);
        setError(err.message || 'Öznitelikler yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAttributes();
  }, [attributeGroupIds]);
  
  // Arama terimine göre filtrelenmiş öznitelikler
  const filteredAttributes = useMemo(() => {
    if (!searchTerm.trim()) return attributes;
    
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return attributes.filter(attr => 
      attr.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      attr.code.toLowerCase().includes(lowerCaseSearchTerm) ||
      attr.description.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [attributes, searchTerm]);
  
  // Checkbox değişikliğini ele al
  const handleCheckboxChange = (attributeId: string) => {
    let newSelectedAttributes: string[];
    
    if (selectedAttributes.includes(attributeId)) {
      // Zaten seçili ise kaldır
      newSelectedAttributes = selectedAttributes.filter(id => id !== attributeId);
    } else {
      // Seçili değilse ekle
      newSelectedAttributes = [...selectedAttributes, attributeId];
    }
    
    onChange(newSelectedAttributes);
  };
  
  // Tümünü seç/kaldır
  const handleSelectAll = () => {
    if (selectedAttributes.length === filteredAttributes.length) {
      // Tümü seçili ise tümünü kaldır
      onChange([]);
    } else {
      // Değilse tümünü seç
      onChange(filteredAttributes.map(attr => attr._id));
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
  
  if (!attributeGroupIds.length) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <p className="text-yellow-600 dark:text-yellow-400">Lütfen önce öznitelik gruplarını seçin</p>
      </div>
    );
  }
  
  if (attributes.length === 0) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-blue-600 dark:text-blue-400">Seçilen gruplara ait öznitelik bulunamadı</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
          Öznitelikler
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {selectedAttributes.length} / {attributes.length} seçili
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
            placeholder="Öznitelik ara..."
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
          />
        </div>
        
        <button
          type="button"
          onClick={handleSelectAll}
          className="text-white bg-primary-light hover:bg-primary-light/90 focus:ring-4 focus:ring-primary-light/30 font-medium rounded-lg text-sm px-4 py-2.5 dark:bg-primary-dark dark:hover:bg-primary-dark/90 dark:focus:ring-primary-dark/30"
        >
          {selectedAttributes.length === filteredAttributes.length ? "Tümünü Kaldır" : "Tümünü Seç"}
        </button>
      </div>
      
      {/* Öznitelik listesi */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="w-16 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Seç
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Öznitelik
              </th>
              <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Grup
              </th>
              <th scope="col" className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Tip
              </th>
              <th scope="col" className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Zorunlu
              </th>
              <th scope="col" className="hidden xl:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Seçenekler
              </th>
              <th scope="col" className="hidden xl:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Açıklama
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {filteredAttributes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm ? "Arama kriterlerine uygun öznitelik bulunamadı" : "Öznitelik bulunamadı"}
                </td>
              </tr>
            ) : (
              filteredAttributes.map(attr => (
                <tr key={attr._id} className={selectedAttributes.includes(attr._id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedAttributes.includes(attr._id)}
                      onChange={() => handleCheckboxChange(attr._id)}
                      className="w-4 h-4 text-primary-light bg-gray-100 border-gray-300 rounded focus:ring-primary-light dark:focus:ring-primary-dark dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {attr.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {attr.code}
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {attr.attributeGroup.name || attr.attributeGroup.code || '-'}
                  </td>
                  <td className="hidden lg:table-cell px-4 py-3 whitespace-nowrap">
                    <AttributeBadge type={attr.type as any} size="sm" />
                  </td>
                  <td className="hidden lg:table-cell px-4 py-3 whitespace-nowrap">
                    {attr.isRequired ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Evet
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                        Hayır
                      </span>
                    )}
                  </td>
                  <td className="hidden xl:table-cell px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {(attr.type === 'select' || attr.type === 'multiselect') && (
                      <div className="flex flex-col">
                        {attr.optionType && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Tip: {attr.optionType.name} ({attr.optionType.code})
                          </div>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {attr.options?.length || 0} seçenek
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="hidden xl:table-cell px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="truncate max-w-xs" title={attr.description || '-'}>
                      {attr.description || '-'}
                    </div>
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

export default AttributeSelector; 