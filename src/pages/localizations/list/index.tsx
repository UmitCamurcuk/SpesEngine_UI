import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../../components/ui/Table';
import type { TableColumn, SortParams, FilterParams, PaginationParams } from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import localizationService from '../../../services/api/localizationService';
import { useTranslation } from '../../../context/i18nContext';

// Lokalizasyon tipi
interface Localization {
  _id: string;
  key: string;
  namespace: string;
  translations: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

// API parametreleri
interface LocalizationApiParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  direction?: 'asc' | 'desc';
  namespace?: string;
  [key: string]: any;
}

const LocalizationsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // State tanımlamaları
  const [localizations, setLocalizations] = useState<Localization[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Dil seçenekleri
  const [languages, setLanguages] = useState<string[]>(['tr', 'en']);
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 10,
    total: 0
  });
  
  // Sıralama state
  const [sort, setSort] = useState<SortParams | null>(null);
  
  // Filtre state
  const [filters, setFilters] = useState<FilterParams[]>([]);
  
  // İstatistikler
  const [stats, setStats] = useState({
    total: 0,
    namespaces: {} as Record<string, number>
  });

  // Desteklenen dilleri getir
  const fetchSupportedLanguages = async () => {
    try {
      const result = await localizationService.getSupportedLanguages();
      if (result.success && Array.isArray(result.data)) {
        setLanguages(result.data);
      }
    } catch (error) {
      console.error('Desteklenen diller getirilirken hata oluştu:', error);
    }
  };

  // Çevirileri getir
  const fetchLocalizations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // API parametrelerini hazırla (şimdilik sadece Frontend'de filtreleme yapıyoruz)
      // Backend servisi tamamlandığında API parametreleri eklenecek
      
      // Basit bir demo için şu anda TR dilindeki tüm çevirileri alıyoruz
      const result = await localizationService.getTranslations('tr');
      
      if (result.success && result.data) {
        // Çevirileri düz bir diziye dönüştür
        const allLocalizations: Localization[] = [];
        
        // Her namespace için
        Object.entries(result.data).forEach(([namespace, translations]) => {
          // Her anahtar-değer çifti için
          Object.entries(translations as Record<string, string>).forEach(([key, value]) => {
            // Tüm dillerdeki çevirileri almak için ayrı request atılması gerekiyor
            // Şimdilik sadece TR dilini gösteriyoruz
            const translationObj: Record<string, string> = { tr: value };
            
            allLocalizations.push({
              _id: `${namespace}:${key}`, // Geçici ID
              key,
              namespace,
              translations: translationObj,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          });
        });
        
        // Filtreleme, arama ve sıralama işlemlerini uygula
        let filteredLocalizations = [...allLocalizations];
        
        // Arama terimini uygula
        if (searchTerm) {
          const lowerSearch = searchTerm.toLowerCase();
          filteredLocalizations = filteredLocalizations.filter(
            item => item.key.toLowerCase().includes(lowerSearch) ||
                   item.namespace.toLowerCase().includes(lowerSearch)
          );
        }
        
        // Filtreleri uygula
        if (filters.length > 0) {
          filteredLocalizations = filteredLocalizations.filter(item => {
            return filters.every(filter => {
              if (filter.field === 'namespace') {
                return item.namespace === filter.value;
              }
              return true;
            });
          });
        }
        
        // Sıralamayı uygula
        if (sort) {
          filteredLocalizations.sort((a, b) => {
            if (sort.field === 'key') {
              return sort.direction === 'asc' 
                ? a.key.localeCompare(b.key)
                : b.key.localeCompare(a.key);
            }
            if (sort.field === 'namespace') {
              return sort.direction === 'asc'
                ? a.namespace.localeCompare(b.namespace)
                : b.namespace.localeCompare(a.namespace);
            }
            return 0;
          });
        }
        
        // Pagination işlemleri
        const startIndex = (pagination.page - 1) * pagination.limit;
        const endIndex = startIndex + pagination.limit;
        const paginatedLocalizations = filteredLocalizations.slice(startIndex, endIndex);
        
        setLocalizations(paginatedLocalizations);
        setPagination(prev => ({
          ...prev,
          total: filteredLocalizations.length
        }));
        
        // İstatistikleri hesapla
        const namespaces: Record<string, number> = {};
        allLocalizations.forEach(item => {
          namespaces[item.namespace] = (namespaces[item.namespace] || 0) + 1;
        });
        
        setStats({
          total: allLocalizations.length,
          namespaces
        });
      }
    } catch (err: any) {
      setError(err.message || 'Çeviriler getirilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Bağımlılıklar değiştiğinde yeniden veri çek
  useEffect(() => {
    fetchLocalizations();
  }, [pagination.page, pagination.limit, sort, filters, searchTerm]);
  
  // Desteklenen dilleri ilk yüklemede getir
  useEffect(() => {
    fetchSupportedLanguages();
  }, []);
  
  // Sayfa değişim handler
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };
  
  // Sıralama değişim handler
  const handleSort = (sort: SortParams) => {
    setSort(sort);
  };
  
  // Filtre değişim handler
  const handleFilter = (filters: FilterParams[]) => {
    setFilters(filters);
    // Filtreleme yapıldığında ilk sayfaya dön
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  // Arama handler
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aramayı uygula ve ilk sayfaya dön
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  // Satır tıklama handler - detay sayfasına yönlendir
  const handleRowClick = (localization: Localization) => {
    navigate(`/localizations/details/${localization.namespace}/${localization.key}`);
  };
  
  // Çeviri oluştur handler
  const handleCreateLocalization = () => {
    navigate('/localizations/create');
  };
  
  // Silme işlemi handler
  const handleDeleteLocalization = async (id: string, key: string, namespace: string) => {
    if (window.confirm(`"${namespace}:${key}" çevirisini silmek istediğinize emin misiniz?`)) {
      try {
        // API tamamlandığında burası güncellenecek
        // await localizationService.deleteLocalization(key, namespace);
        alert('Silme işlemi için API henüz tamamlanmadı.');
        // Silme başarılı olduğunda listeyi yenile
        // fetchLocalizations();
      } catch (err: any) {
        setError(err.message || 'Çeviri silinirken bir hata oluştu');
      }
    }
  };
  
  // Tablo sütunları
  const columns: TableColumn<Localization>[] = [
    {
      key: 'key',
      header: 'Anahtar',
      sortable: true,
      filterable: true,
      render: (row) => (
        <div className="flex items-center">
          <div className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]" title={row.key}>
            {row.key}
          </div>
        </div>
      )
    },
    {
      key: 'namespace',
      header: 'Namespace',
      sortable: true,
      filterable: true,
      render: (row) => (
        <div className="font-mono text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded truncate max-w-[150px]" title={row.namespace}>
          {row.namespace}
        </div>
      )
    },
    {
      key: 'tr',
      header: 'Türkçe',
      render: (row) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={row.translations['tr']}>
          {row.translations['tr'] || '-'}
        </div>
      )
    },
    {
      key: 'en',
      header: 'İngilizce',
      render: (row) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={row.translations['en']}>
          {row.translations['en'] || '-'}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (row) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="primary"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/localizations/details/${row.namespace}/${row.key}`);
            }}
          >
            Detay
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteLocalization(row._id, row.key, row.namespace);
            }}
          >
            Sil
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Çeviriler</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Sistemdeki tüm çevirileri yönetin
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            onClick={handleCreateLocalization}
            className="flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Yeni Çeviri Ekle
          </Button>
        </div>
      </div>
      
      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Toplam Çeviri</p>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Namespace Sayısı</p>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{Object.keys(stats.namespaces).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Dil Sayısı</p>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{languages.length}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Arama formu */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">Ara</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                id="search"
                name="search"
                type="search"
                placeholder="Anahtar veya namespace ara..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Button type="submit">Ara</Button>
          </div>
        </form>
      </div>
      
      {/* Tablo */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-500 text-red-700 dark:text-red-400 mb-4">
            <p>{error}</p>
          </div>
        )}
        
        <Table
          columns={columns}
          data={localizations}
          isLoading={isLoading}
          pagination={{
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total
          }}
          onPageChange={handlePageChange}
          onSort={handleSort}
          onFilter={handleFilter}
          onRowClick={handleRowClick}
          emptyMessage="Hiç çeviri bulunamadı."
        />
      </div>
    </div>
  );
};

export default LocalizationsListPage; 