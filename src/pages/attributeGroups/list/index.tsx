import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../../components/ui/Table';
import type { TableColumn, SortParams, FilterParams, PaginationParams } from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import attributeGroupService from '../../../services/api/attributeGroupService';
import type { AttributeGroup, AttributeGroupApiParams } from '../../../services/api/attributeGroupService';
import { useTranslation } from '../../../context/i18nContext';

const AttributeGroupsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // State tanımlamaları
  const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>([]);
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
    active: 0
  });

  // Öznitelik gruplarını getir
  const fetchAttributeGroups = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // API parametrelerini hazırla
      const params: AttributeGroupApiParams = {
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
      const result = await attributeGroupService.getAttributeGroups(params);
      
      setAttributeGroups(result.attributeGroups);
      setPagination({
        page: result.page,
        limit: result.limit,
        total: result.total
      });
      
      // İstatistikleri hesapla
      if (result.attributeGroups.length > 0) {
        let activeCount = 0;
        
        result.attributeGroups.forEach(group => {
          if (group.isActive) {
            activeCount++;
          }
        });
        
        setStats({
          total: result.total,
          active: activeCount
        });
      }
    } catch (err: any) {
      setError(err.message || t('attribute_groups_fetch_error', 'attribute_groups'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Bağımlılıklar değiştiğinde yeniden veri çek
  useEffect(() => {
    fetchAttributeGroups();
  }, [pagination.page, pagination.limit, sort, filters, searchTerm]);
  
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
  const handleRowClick = (group: AttributeGroup) => {
    navigate(`/attributeGroups/details/${group._id}`);
  };
  
  // Öznitelik grubu oluştur handler
  const handleCreateAttributeGroup = () => {
    navigate('/attributeGroups/create');
  };
  
  // Silme işlemi handler
  const handleDeleteAttributeGroup = async (id: string, name: string) => {
    if (window.confirm(`${t('confirm_delete_attribute_group', 'attribute_groups')}`.replace('{{name}}', name))) {
      try {
        await attributeGroupService.deleteAttributeGroup(id);
        // Silme başarılı olduğunda listeyi yenile
        fetchAttributeGroups();
      } catch (err: any) {
        setError(err.message || t('attribute_group_delete_error', 'attribute_groups'));
      }
    }
  };
  
  // Tablo sütunları
  const columns: TableColumn<AttributeGroup>[] = [
    {
      key: 'name',
      header: t('name', 'common'),
      sortable: true,
      filterable: true,
      render: (row) => (
        <div className="flex items-center">
          <div className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]" title={row.name}>
            {row.name}
          </div>
        </div>
      )
    },
    {
      key: 'code',
      header: t('code', 'common'),
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
      header: t('description', 'common'),
      render: (row) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={row.description}>
          {row.description || <span className="text-gray-400 italic">{t('no_description', 'common')}</span>}
        </div>
      )
    },
    {
      key: 'attributes',
      header: t('attribute_count', 'attribute_groups'),
      render: (row) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {Array.isArray(row.attributes) ? row.attributes.length : 0}
        </div>
      )
    },
    {
      key: 'isActive',
      header: t('status', 'common'),
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
          {row.isActive ? t('active', 'common') : t('inactive', 'common')}
        </span>
      )
    },
    {
      key: 'updatedAt',
      header: t('last_update', 'common'),
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
  const renderActions = (group: AttributeGroup) => (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        className="p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900 rounded-md"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/attributeGroups/details/${group._id}`);
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
          handleDeleteAttributeGroup(group._id, group.name);
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
      {/* Başlık ve Butonlar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <svg className="w-6 h-6 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {t('attribute_groups_title', 'attributes')}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {t('total', 'common')} {stats.total} {t('group', 'common')}, {stats.active} {t('active', 'common')}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder={t('search', 'common') + '...'}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary-light dark:focus:ring-primary-dark dark:bg-gray-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit" variant="primary" className="rounded-l-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Button>
          </form>
          
          <Button
            variant="primary"
            className="flex items-center"
            onClick={handleCreateAttributeGroup}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>{t('new_group', 'attributes')}</span>
          </Button>
        </div>
      </div>
      
      {/* Hata Mesajı */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900 dark:border-red-700 dark:text-red-300" role="alert">
          <strong className="font-bold">{t('error', 'common')}! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {/* Tablo */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <Table
          columns={columns}
          data={attributeGroups}
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
          renderActions={renderActions}
          emptyMessage={t('no_attribute_groups_found', 'attribute_groups')}
        />
      </div>
    </div>
  );
};

export default AttributeGroupsListPage; 