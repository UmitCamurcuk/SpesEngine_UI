import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import attributeService from '../../services/api/attributeService';
import attributeGroupService from '../../services/api/attributeGroupService';
import { useTranslation } from '../../context/i18nContext';
import { getEntityName } from '../../utils/translationUtils';
import AttributeBadge from './AttributeBadge';

interface PaginatedAttributeSelectorProps {
  selectedAttributes: string[];
  onChange: (attributeIds: string[]) => void;
  excludeIds?: string[]; // Dışlanacak öznitelik ID'leri
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
  options: string[];
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
  options?: string[];
  attributeGroup: string | AttributeGroupObject;
  [key: string]: any;
}

const PaginatedAttributeSelector: React.FC<PaginatedAttributeSelectorProps> = React.memo(({
  selectedAttributes,
  onChange,
  excludeIds = [] // Varsayılan olarak boş dizi
}) => {
  const { t, currentLanguage } = useTranslation();
  const [attributes, setAttributes] = useState<AttributeOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalAttributes, setTotalAttributes] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(20);
  const [attributeGroups, setAttributeGroups] = useState<AttributeGroupObject[]>([]);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('');
  
  // API çağrısını takip etmek için ref kullan
  const isApiCallInProgress = useRef(false);
  // Debounce için timeout ref'i
  const debounceTimeout = useRef<number | null>(null);
  // Son API çağrısı zamanı
  const lastFetchTime = useRef<number>(0);

  // Sayfalama değişkenleri
  const totalPages = Math.ceil(totalAttributes / pageSize);
  
  // Tüm attribute'ları ve grupları yükle
  useEffect(() => {
    const fetchAttributeGroups = async () => {
      try {
        const result = await attributeGroupService.getAttributeGroups({ limit: 100 });
        setAttributeGroups(result.attributeGroups);
      } catch (err: any) {
        console.error('Öznitelik grupları yüklenirken hata:', err);
      }
    };
    
    fetchAttributeGroups();
    
    // Component unmount olduğunda timeout'u temizle
    return () => {
      if (debounceTimeout.current) {
        window.clearTimeout(debounceTimeout.current);
      }
    };
  }, []);
  
  // API çağrısı memoize
  const fetchAttributes = useCallback(async () => {
    // Eğer son API çağrısından bu yana 1 saniye geçmediyse, çağrıyı iptal et
    const now = Date.now();
    if (now - lastFetchTime.current < 1000) {
      console.log('Son API çağrısından bu yana çok az zaman geçti, yeni istek atlanıyor');
      return;
    }
    
    // Eğer zaten bir API çağrısı devam ediyorsa yeni çağrı yapma
    if (isApiCallInProgress.current) {
      console.log('İşlem zaten devam ediyor, yeni istek atlanıyor');
      return;
    }
    
    isApiCallInProgress.current = true;
    lastFetchTime.current = now;
    setIsLoading(true);
    setError(null);
    
    try {
      // Filtreleri oluştur
      let queryParams: any = {
        page,
        limit: pageSize
      };
      
      // Arama terimi varsa ekle
      if (searchTerm.trim()) {
        queryParams.search = searchTerm.trim();
      }
      
      // Grup filtresi varsa ekle
      if (selectedGroupFilter) {
        queryParams.attributeGroup = selectedGroupFilter;
      }
      
      // Attribute'ları getir
      console.log('Öznitelikler için API isteği gönderiliyor:', queryParams);
      const result = await attributeService.getAttributes(queryParams);
      setTotalAttributes(result.total);
      
      // Attribute'ları dönüştür ve dışlanacak ID'leri filtrele
      const mappedAttributes = (result.attributes as any[])
        .filter((attr) => !excludeIds.includes(attr._id)) // Dışlanacak ID'leri filtrele
        .map((attr) => {
          let groupId = '';
          let groupName = '';
          let groupCode = '';
          
          if (typeof attr.attributeGroup === 'object') {
            groupId = attr.attributeGroup._id;
            groupName = getEntityName(attr.attributeGroup, currentLanguage) || attr.attributeGroup.name || '';
            groupCode = attr.attributeGroup.code || '';
          } else if (attr.attributeGroup) {
            groupId = attr.attributeGroup;
            
            // Grup ID'sine göre grup bilgisini bul
            const foundGroup = attributeGroups.find(g => g._id === attr.attributeGroup);
            if (foundGroup) {
              groupName = getEntityName(foundGroup, currentLanguage) || foundGroup.name;
              groupCode = foundGroup.code;
            }
          }
          
          return {
            _id: attr._id,
            name: getEntityName(attr, currentLanguage) || attr.name,
            code: attr.code,
            type: attr.type,
            description: attr.description || '',
            isRequired: attr.isRequired || false,
            options: attr.options || [],
            attributeGroup: {
              _id: groupId,
              name: groupName,
              code: groupCode
            }
          };
        });
      
      setAttributes(mappedAttributes);
    } catch (err: any) {
      console.error('Attributes yüklenirken hata:', err);
      setError(err.message || 'Öznitelikler yüklenemedi');
    } finally {
      setIsLoading(false);
      isApiCallInProgress.current = false;
    }
  }, [page, pageSize, searchTerm, selectedGroupFilter, attributeGroups, excludeIds]);
  
  // Sayfa, arama terimi veya grup filtresi değiştiğinde attribute'ları yükle
  useEffect(() => {
    // Önceki timeout'u temizle
    if (debounceTimeout.current) {
      window.clearTimeout(debounceTimeout.current);
    }
    
    // Referans değeri tut
    const lastAttemptTime = Date.now();
    const debounceDelay = 500; // Gecikmeyi artırarak sorunu çözelim
    
    // API çağrısını debounce ile yap
    debounceTimeout.current = window.setTimeout(() => {
      // Eğer son API çağrısından bu yana yeterli zaman geçmişse
      if (Date.now() - lastAttemptTime >= debounceDelay) {
        fetchAttributes();
      }
    }, debounceDelay);
    
    // Cleanup function
    return () => {
      if (debounceTimeout.current) {
        window.clearTimeout(debounceTimeout.current);
      }
    };
  }, [fetchAttributes]);
  
  // Arama işleminde sayfa numarasını sıfırla
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Arama yapıldığında ilk sayfaya dön
  };
  
  // Grup filtreleme
  const handleGroupFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroupFilter(e.target.value);
    setPage(1); // Filtre değiştiğinde ilk sayfaya dön
  };
  
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
  
  // Sayfadaki tümünü seç/kaldır
  const handleSelectAllInPage = () => {
    const currentPageAttributeIds = attributes.map(attr => attr._id);
    const allSelected = currentPageAttributeIds.every(id => selectedAttributes.includes(id));
    
    if (allSelected) {
      // Tüm sayfa seçili ise, bu sayfadakileri kaldır
      const newSelected = selectedAttributes.filter(id => !currentPageAttributeIds.includes(id));
      onChange(newSelected);
    } else {
      // Tüm sayfa seçili değilse, bu sayfadakileri ekle (zaten seçili olanları koruyarak)
      const newSelected = [...new Set([...selectedAttributes, ...currentPageAttributeIds])];
      onChange(newSelected);
    }
  };
  
  // Sayfa değiştirme
  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  
  // Sayfa boyutu değiştirme
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setPage(1); // Sayfa boyutu değişince ilk sayfaya dön
  };
  
  if (isLoading && page === 1) {
    return <div className="text-center py-4">Yükleniyor...</div>;
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400">{error}</p>
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
          {selectedAttributes.length} öznitelik seçili
        </div>
      </div>
      
      {/* Arama, Filtreleme ve Sayfalama Kontrolleri */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        {/* Arama */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            type="search"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Öznitelik ara..."
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
          />
        </div>
        
        {/* Grup Filtresi */}
        <div className="w-full md:w-64">
          <select
            value={selectedGroupFilter}
            onChange={handleGroupFilter}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
          >
            <option value="">Tüm Gruplar</option>
            {attributeGroups.map(group => (
              <option key={group._id} value={group._id}>
                {getEntityName(group, currentLanguage) || group.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Sayfa Boyutu */}
        <div className="w-full md:w-48">
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
          >
            <option value={10}>10 / sayfa</option>
            <option value={20}>20 / sayfa</option>
            <option value={50}>50 / sayfa</option>
            <option value={100}>100 / sayfa</option>
          </select>
        </div>
        
        {/* Tümünü Seç Butonu */}
        <button
          type="button"
          onClick={handleSelectAllInPage}
          className="text-white bg-primary-light hover:bg-primary-light/90 focus:ring-4 focus:ring-primary-light/30 font-medium rounded-lg text-sm px-4 py-2.5 dark:bg-primary-dark dark:hover:bg-primary-dark/90 dark:focus:ring-primary-dark/30"
        >
          {attributes.every(attr => selectedAttributes.includes(attr._id))
            ? "Sayfadakileri Kaldır"
            : "Sayfadakileri Seç"}
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
                Açıklama
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {attributes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm ? "Arama kriterlerine uygun öznitelik bulunamadı" : "Öznitelik bulunamadı"}
                </td>
              </tr>
            ) : (
              attributes.map((attr) => (
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
                    {attr.type === 'select' && attr.options.length > 0 && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        ({attr.options.length} seçenek)
                      </span>
                    )}
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
                    <div className="truncate max-w-xs" title={getEntityName(attr, currentLanguage, 'description') || attr.description || '-'}>
                      {getEntityName(attr, currentLanguage, 'description') || attr.description || '-'}
                    </div>
                  </td>
                </tr>
              ))
            )}
            {isLoading && page > 1 && (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-light dark:border-primary-dark"></div>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Yükleniyor...</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Sayfalama Kontrolleri */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Toplam {totalAttributes} öznitelik, {totalPages} sayfa
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => goToPage(1)}
            disabled={page === 1}
            className={`px-3 py-1 rounded-md ${page === 1 ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className={`px-3 py-1 rounded-md ${page === 1 ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Sayfa numaraları */}
          <div className="flex items-center">
            <span className="px-3 py-1 rounded-md bg-primary-light text-white dark:bg-primary-dark">
              {page}
            </span>
            <span className="mx-1">/</span>
            <span className="px-2 py-1">
              {totalPages}
            </span>
          </div>
          
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className={`px-3 py-1 rounded-md ${page === totalPages ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={page === totalPages}
            className={`px-3 py-1 rounded-md ${page === totalPages ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobil cihazlarda daha fazla bilgi için tooltip ya da açıklama */}
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 md:hidden">
        Daha fazla bilgi görmek için ekranı sağa kaydırın veya cihazınızı yatay konuma getirin.
      </p>
    </div>
  );
}, (prevProps, nextProps) => {
  // selectedAttributes dizileri aynı referansa sahip değilse ama içerik aynıysa
  // gereksiz render'ı önle
  if (prevProps.selectedAttributes.length !== nextProps.selectedAttributes.length) {
    return false; // Render et
  }
  
  // excludeIds karşılaştırması
  if (
    (prevProps.excludeIds && !nextProps.excludeIds) || 
    (!prevProps.excludeIds && nextProps.excludeIds) ||
    (prevProps.excludeIds && nextProps.excludeIds && 
     prevProps.excludeIds.length !== nextProps.excludeIds.length)
  ) {
    return false; // Render et
  }
  
  // selectedAttributes içeriğini kontrol et
  for (let i = 0; i < prevProps.selectedAttributes.length; i++) {
    if (prevProps.selectedAttributes[i] !== nextProps.selectedAttributes[i]) {
      return false; // Render et
    }
  }
  
  // excludeIds içeriğini kontrol et (varsa)
  if (prevProps.excludeIds && nextProps.excludeIds) {
    for (let i = 0; i < prevProps.excludeIds.length; i++) {
      if (prevProps.excludeIds[i] !== nextProps.excludeIds[i]) {
        return false; // Render et
      }
    }
  }
  
  // onChange fonksiyonu karşılaştırması yapmıyoruz çünkü 
  // genellikle her render'da yeni bir referans oluşturulur
  return true; // Render etme
});

export default PaginatedAttributeSelector; 