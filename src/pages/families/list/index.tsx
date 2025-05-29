import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../../components/ui/Table';
import type { TableColumn, SortParams, FilterParams, PaginationParams } from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Breadcrumb from '../../../components/common/Breadcrumb';
import familyService from '../../../services/api/familyService';
import type { Family, FamilyApiParams } from '../../../types/family';
import { useTranslation } from '../../../context/i18nContext';
import { getEntityName } from '../../../utils/translationUtils';

// Card bileşenleri
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

const FamiliesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  
  // State tanımlamaları
  const [families, setFamilies] = useState<Family[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
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
    active: 0,
    withParent: 0,
    withAttributeGroups: 0
  });

  // Aileleri getir
  const fetchFamilies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // API parametrelerini hazırla
      const params: FamilyApiParams = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      // Arama terimi varsa ekle
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      
      // Sıralama parametreleri
      if (sort) {
        params.sort = sort.field;
        params.direction = sort.direction;
      }
      
      // Filtre parametreleri
      filters.forEach(filter => {
        params[filter.field] = filter.value;
      });
      
      // API'den veri al
      const result = await familyService.getFamilies(params);
      
      setFamilies(result.families);
      setPagination({
        page: result.page,
        limit: result.limit,
        total: result.total
      });
      
      // İstatistikleri hesapla
      if (result.families.length > 0) {
        let activeCount = 0;
        let withParentCount = 0;
        let withAttributeGroupsCount = 0;
        
        result.families.forEach(family => {
          if (family.isActive) {
            activeCount++;
          }
          if (family.parentFamily) {
            withParentCount++;
          }
          if (family.attributeGroups && family.attributeGroups.length > 0) {
            withAttributeGroupsCount++;
          }
        });
        
        setStats({
          total: result.total,
          active: activeCount,
          withParent: withParentCount,
          withAttributeGroups: withAttributeGroupsCount
        });
      }
    } catch (err: any) {
      setError(err.message || 'Aileler getirilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, sort, filters, searchTerm]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500),
    []
  );

  // Bağımlılıklar değiştiğinde yeniden veri çek
  useEffect(() => {
    fetchFamilies();
  }, [fetchFamilies]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchFamilies();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);
  
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
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  // Satır tıklama handler - detay sayfasına yönlendir
  const handleRowClick = (family: Family) => {
    navigate(`/families/details/${family._id}`);
  };
  
  // Aile oluştur handler
  const handleCreateFamily = () => {
    navigate('/families/create');
  };
  
  // Silme işlemi handler
  const handleDeleteFamily = async (id: string, name: string) => {
    if (window.confirm(`"${name}" ailesini silmek istediğinize emin misiniz?`)) {
      try {
        await familyService.deleteFamily(id);
        // Silme başarılı olduğunda listeyi yenile
        fetchFamilies();
      } catch (err: any) {
        setError(err.message || 'Aile silinirken bir hata oluştu');
      }
    }
  };
  
  // Tablo sütunları
  const columns: TableColumn<Family>[] = [
    {
      key: 'name',
      header: 'Ad',
      sortable: true,
      filterable: true,
      render: (row) => (
        <div className="flex items-center">
          <div className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]" title={getEntityName(row, currentLanguage) || row.name}>
            {getEntityName(row, currentLanguage) || row.name}
          </div>
        </div>
      )
    },
    {
      key: 'code',
      header: 'Kod',
      sortable: true,
      filterable: true,
      render: (row) => (
        <div className="font-mono text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded truncate max-w-[150px]" title={row.code}>
          {row.code}
        </div>
      )
    },
    {
      key: 'description',
      header: 'Açıklama',
      render: (row) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={row.description}>
          {row.description || <span className="text-gray-400 italic">Açıklama yok</span>}
        </div>
      )
    },
    {
      key: 'parentFamily',
      header: 'Üst Aile',
      render: (row) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {row.parentFamily ? row.parentFamily : <span className="text-gray-400 italic">Ana Aile</span>}
        </div>
      )
    },
    {
      key: 'isActive',
      header: 'Durum',
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.isActive 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        }`}>
          {row.isActive ? (
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {row.isActive ? 'Aktif' : 'Pasif'}
        </span>
      )
    },
    {
      key: 'updatedAt',
      header: 'Son Güncelleme',
      sortable: true,
      render: (row) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(row.updatedAt).toLocaleDateString('tr-TR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      )
    }
  ];

  // Tablo için işlem butonları
  const renderActions = (family: Family) => (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        className="p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900 rounded-md"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/families/details/${family._id}`);
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </Button>
      <Button
        variant="outline"
        className="p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900 rounded-md"
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteFamily(family._id, family.name);
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* BREADCRUMB */}
      <Breadcrumb 
        items={[
          { label: 'Aileler' }
        ]} 
      />

      {/* HEADER CARD */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <svg className="w-7 h-7 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                Ürün Aileleri
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Tüm ürün ailelerini görüntüleyin, düzenleyin ve yönetin
              </p>
              
              {/* Basit istatistikler */}
              <div className="flex mt-2 space-x-4 text-xs">
                <div className="text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">{stats.total}</span> Toplam
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-green-600 dark:text-green-400">{stats.active}</span> Aktif
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-red-600 dark:text-red-400">{stats.total - stats.active}</span> Pasif
                </div>
              </div>
            </div>
            
            <Button
              className="mt-4 md:mt-0 flex items-center"
              onClick={handleCreateFamily}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yeni Aile Oluştur
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      {/* SEARCH CARD */}
      <Card>
        <CardBody className="py-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text" 
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark" 
                placeholder="Aile adı, kod veya açıklama ara..." 
                value={searchTerm}
                onChange={(e) => {
                  e.preventDefault();
                  debouncedSearch(e.target.value);
                }}
              />
            </div>
            <Button type="submit" className="md:w-auto">
              Ara
            </Button>
          </form>
        </CardBody>
      </Card>
      
      {/* DATA TABLE CARD */}
      <Card>
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 border-b border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        <Table
          columns={columns}
          data={families}
          keyField="_id"
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSort={handleSort}
          onFilter={handleFilter}
          renderActions={renderActions}
          onRowClick={handleRowClick}
          emptyMessage="Henüz hiç aile oluşturulmamış"
        />
      </Card>
    </div>
  );
};

export default FamiliesListPage; 