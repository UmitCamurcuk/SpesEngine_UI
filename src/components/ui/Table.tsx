import React, { useState, useEffect } from 'react';
import Button from './Button';

// Dinamik tablo sütunu için tip tanımı
export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

// Tablo için paginasyon parametreleri
export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
}

// Sıralama için tip tanımı
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

// Filtre için tip tanımı
export interface FilterParams {
  field: string;
  value: string;
}

// Tablo props için tip tanımı
interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyField?: string;
  isLoading?: boolean;
  pagination?: PaginationParams;
  onPageChange?: (page: number) => void;
  onSort?: (sort: SortParams) => void;
  onFilter?: (filters: FilterParams[]) => void;
  onRowClick?: (row: T) => void;
  renderActions?: (row: T) => React.ReactNode;
  emptyMessage?: React.ReactNode;
  title?: string;
  toolbar?: React.ReactNode;
}

// Reusable Tablo Componenti
function Table<T extends Record<string, any>>({
  columns,
  data,
  keyField = '_id',
  isLoading = false,
  pagination,
  onPageChange,
  onSort,
  onFilter,
  onRowClick,
  renderActions,
  emptyMessage = "Gösterilecek veri bulunamadı",
  title,
  toolbar
}: TableProps<T>) {
  // Sıralama durumu
  const [currentSort, setCurrentSort] = useState<SortParams | null>(null);
  
  // Filtre durumu
  const [filters, setFilters] = useState<Record<string, string>>({});
  
  // Sıralama işleyicisi
  const handleSort = (field: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    // Aynı alan için tersine çevir, farklı alan için asc sıralama yap
    if (currentSort && currentSort.field === field) {
      direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    }
    
    const newSort = { field, direction };
    console.log('Table component sort triggered:', newSort);
    setCurrentSort(newSort);
    
    if (onSort) {
      console.log('Calling parent onSort with:', newSort);
      onSort(newSort);
    }
  };
  
  // Filtre işleyicisi
  const handleFilter = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    
    if (!value) {
      delete newFilters[field];
    }
    
    setFilters(newFilters);
    
    if (onFilter) {
      const filterParams = Object.entries(newFilters).map(([field, value]) => ({
        field,
        value
      }));
      onFilter(filterParams);
    }
  };
  
  // Filtre inputları için gecikme
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onFilter && Object.keys(filters).length > 0) {
        const filterParams = Object.entries(filters).map(([field, value]) => ({
          field,
          value
        }));
        onFilter(filterParams);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [filters, onFilter]);
  
  // Pagination hesaplamaları
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 0;
  
  // Sayfa değiştirme işleyicisi
  const handlePageChange = (page: number) => {
    if (onPageChange && page > 0 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      {/* Tablo Başlık ve Araç Çubuğu */}
      {(title || toolbar) && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          {title && <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">{title}</h3>}
          <div className="flex items-center space-x-2">
            {toolbar}
          </div>
        </div>
      )}
      
      {/* Tablo */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && onSort && (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none"
                      >
                        {currentSort && currentSort.field === column.key ? (
                          currentSort.direction === 'asc' ? (
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )
                        ) : (
                          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                  
                  {/* Filtreleme alanı */}
                  {column.filterable && onFilter && (
                    <div className="mt-2">
                      <input
                        type="text"
                        className="w-full px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                        placeholder={`${column.header} ile filtrele`}
                        value={filters[column.key] || ''}
                        onChange={(e) => handleFilter(column.key, e.target.value)}
                      />
                    </div>
                  )}
                </th>
              ))}
              {renderActions && (
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  İşlemler
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td
                  colSpan={renderActions ? columns.length + 1 : columns.length}
                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  <div className="flex justify-center items-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-primary-light dark:text-primary-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Yükleniyor...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={renderActions ? columns.length + 1 : columns.length}
                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={String(row[keyField])}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((column) => (
                    <td key={`${String(row[keyField])}-${column.key}`} className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <div className="max-w-xs">
                        {column.render
                          ? column.render(row, rowIndex)
                          : row[column.key] !== undefined
                          ? String(row[column.key])
                          : '-'}
                      </div>
                    </td>
                  ))}
                  {renderActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {renderActions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && totalPages > 0 && (
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <div className="flex-1 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Gösterilen <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> ile{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                arası, toplam <span className="font-medium">{pagination.total}</span> kayıt
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                className="px-3 py-1 text-sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Önceki
              </Button>
              {pagination.page > 2 && (
                <Button
                  variant="secondary"
                  className="px-3 py-1 text-sm"
                  onClick={() => handlePageChange(1)}
                >
                  1
                </Button>
              )}
              {pagination.page > 3 && (
                <span className="px-2 py-1 text-gray-500 dark:text-gray-400">...</span>
              )}
              {pagination.page > 1 && (
                <Button
                  variant="secondary"
                  className="px-3 py-1 text-sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  {pagination.page - 1}
                </Button>
              )}
              <Button
                variant="primary"
                className="px-3 py-1 text-sm"
              >
                {pagination.page}
              </Button>
              {pagination.page < totalPages && (
                <Button
                  variant="secondary"
                  className="px-3 py-1 text-sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  {pagination.page + 1}
                </Button>
              )}
              {pagination.page < totalPages - 2 && (
                <span className="px-2 py-1 text-gray-500 dark:text-gray-400">...</span>
              )}
              {pagination.page < totalPages - 1 && (
                <Button
                  variant="secondary"
                  className="px-3 py-1 text-sm"
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </Button>
              )}
              <Button
                variant="secondary"
                className="px-3 py-1 text-sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= totalPages}
              >
                Sonraki
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table; 