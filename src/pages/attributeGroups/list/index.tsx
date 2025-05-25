import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../../components/ui/Table';
import type { TableColumn, SortParams, FilterParams, PaginationParams } from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Breadcrumb from '../../../components/common/Breadcrumb';
import attributeGroupService from '../../../services/api/attributeGroupService';
import { useTranslation } from '../../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../../utils/translationUtils';

// INTERFACES
interface AttributeGroup {
  _id: string;
  name: string;
  code: string;
  description: string;
  attributes: any[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AttributeGroupApiParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  direction?: 'asc' | 'desc';
  [key: string]: any;
}

// UTILITY COMPONENTS
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

// MAIN COMPONENT
const AttributeGroupsListPage: React.FC = () => {
  // HOOKS
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  
  // STATE VARIABLES
  const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 10,
    total: 0
  });
  
  const [sort, setSort] = useState<SortParams | null>(null);
  const [filters, setFilters] = useState<FilterParams[]>([]);
  
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onThisPage: 0
  });

  // HELPER FUNCTIONS
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500),
    []
  );

  const fetchAttributeGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params: AttributeGroupApiParams = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      
      if (sort) {
        params.sort = sort.field;
        params.direction = sort.direction;
      }
      
      filters.forEach(filter => {
        params[filter.field] = filter.value;
      });
      
      const result = await attributeGroupService.getAttributeGroups(params);
      
      setAttributeGroups(result.attributeGroups);
      setPagination({
        page: result.page,
        limit: result.limit,
        total: result.total
      });
      
      // İstatistikleri hesapla
      const activeCount = result.attributeGroups.filter(group => group.isActive).length;
      
      setStats({
        total: result.total,
        active: activeCount,
        onThisPage: result.attributeGroups.length
      });
    } catch (err: any) {
      setError(err.message || t('attribute_groups_fetch_error', 'attribute_groups'));
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, sort, filters, searchTerm, t]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleSort = (sort: SortParams) => {
    setSort(sort);
  };

  const handleFilter = (filters: FilterParams[]) => {
    setFilters(filters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleRowClick = (group: AttributeGroup) => {
    navigate(`/attributeGroups/details/${group._id}`);
  };

  const handleCreateAttributeGroup = () => {
    navigate('/attributeGroups/create');
  };

  const handleDeleteAttributeGroup = async (id: string, name: string) => {
    if (window.confirm(t('confirm_delete_attribute_group', 'attribute_groups').replace('{{name}}', name))) {
      try {
        await attributeGroupService.deleteAttributeGroup(id);
        fetchAttributeGroups();
      } catch (err: any) {
        setError(err.message || t('attribute_group_delete_error', 'attribute_groups'));
      }
    }
  };

  // EFFECTS
  useEffect(() => {
    fetchAttributeGroups();
  }, [fetchAttributeGroups]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAttributeGroups();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // TABLE COLUMNS
  const columns: TableColumn<AttributeGroup>[] = [
    {
      key: 'name',
      header: t('name', 'attribute_groups'),
      sortable: true,
      filterable: false,
      render: (row) => (
        <div className="flex items-center">
          <div className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]" title={getEntityName(row, currentLanguage)}>
            {getEntityName(row, currentLanguage)}
          </div>
        </div>
      )
    },
    {
      key: 'code',
      header: t('code', 'attribute_groups'),
      sortable: true,
      filterable: false,
      render: (row) => (
        <div className="font-mono text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded truncate max-w-[150px]" title={row.code}>
          {row.code}
        </div>
      )
    },
    {
      key: 'description',
      header: t('description', 'attribute_groups'),
      render: (row) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={getEntityDescription(row, currentLanguage)}>
          {getEntityDescription(row, currentLanguage) || <span className="text-gray-400 italic">{t('no_description', 'attribute_groups')}</span>}
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
      header: t('status', 'attribute_groups'),
      sortable: true,
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.isActive 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
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
          {row.isActive ? t('active', 'attribute_groups') : t('inactive', 'attribute_groups')}
        </span>
      )
    },
    {
      key: 'updatedAt',
      header: t('last_update', 'attribute_groups'),
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

  const renderActions = (group: AttributeGroup) => (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        className="p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900 rounded-md"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/attributeGroups/details/${group._id}`);
        }}
        title={t('view', 'attribute_groups')}
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
          handleDeleteAttributeGroup(group._id, getEntityName(group, currentLanguage));
        }}
        title={t('delete', 'attribute_groups')}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </Button>
    </div>
  );

  // MAIN RENDER
  return (
    <div className="space-y-6">
      {/* BREADCRUMB */}
      <div className="flex items-center justify-between">
        <Breadcrumb 
          items={[
            { label: t('attribute_groups_title', 'attribute_groups') }
          ]} 
        />
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 
                         flex items-center justify-center mr-3">
            <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('attribute_groups_title', 'attribute_groups')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('manage_attribute_groups', 'attribute_groups')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="primary"
            className="flex items-center"
            onClick={handleCreateAttributeGroup}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t('new_attribute_group', 'attribute_groups')}
          </Button>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-400 dark:border-purple-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-purple-500 dark:text-purple-400">{t('total_attribute_groups', 'attribute_groups')}</div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.total}</div>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-green-500 dark:text-green-400">{t('active_attribute_groups', 'attribute_groups')}</div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.active}</div>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-blue-500 dark:text-blue-400">{t('on_this_page', 'attribute_groups')}</div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.onThisPage}</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* SEARCH */}
      <Card>
        <CardBody>
          <form className="flex w-full max-w-lg" onSubmit={handleSearch}>
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full p-2 pl-10 text-sm border border-gray-300 rounded-l-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder={t('search_attribute_groups', 'attribute_groups')}
                onChange={(e) => debouncedSearch(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="rounded-l-none"
            >
              {t('search', 'attribute_groups')}
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-start">
          <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* TABLE */}
      <Card>
        <Table
          columns={columns}
          data={attributeGroups}
          keyField="_id"
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSort={handleSort}
          onFilter={handleFilter}
          onRowClick={handleRowClick}
          renderActions={renderActions}
          emptyMessage={
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('no_attribute_groups_found', 'attribute_groups')}</p>
              <div className="mt-4">
                <Button
                  variant="primary"
                  className="inline-flex items-center"
                  onClick={handleCreateAttributeGroup}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {t('add_first_attribute_group', 'attribute_groups')}
                </Button>
              </div>
            </div>
          }
        />
      </Card>
    </div>
  );
};

// DEBOUNCE FUNCTION
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export default AttributeGroupsListPage; 