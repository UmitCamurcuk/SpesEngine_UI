import { useState, useEffect, useCallback } from 'react';
import type { SortParams, FilterParams, PaginationParams } from '../components/ui/Table';

// INTERFACES
interface ApiParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  direction?: 'asc' | 'desc';
  [key: string]: any;
}

interface UseListPageProps<T> {
  fetchFunction: (params: ApiParams) => Promise<{
    data: T[];
    page: number;
    limit: number;
    total: number;
  }>;
  deleteFunction?: (id: string) => Promise<void>;
  initialLimit?: number;
  onDeleteSuccess?: (deletedItem: T) => void;
  onDeleteError?: (error: string) => void;
}

interface UseListPageReturn<T> {
  // Data
  data: T[];
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  pagination: PaginationParams;
  handlePageChange: (page: number) => void;
  
  // Search
  searchTerm: string;
  handleSearchInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearch: (e: React.FormEvent<HTMLFormElement>) => void;
  
  // Sort & Filter
  sort: SortParams | null;
  filters: FilterParams[];
  handleSort: (sort: SortParams) => void;
  handleFilter: (filters: FilterParams[]) => void;
  
  // Delete
  deleteModal: {
    isOpen: boolean;
    id: string | null;
    name: string;
  };
  handleDeleteClick: (id: string, name: string) => void;
  confirmDelete: () => Promise<void>;
  cancelDelete: () => void;
  
  // Refresh
  refreshData: () => void;
}

// DEBOUNCE UTILITY
function debounce<T extends (...args: any[]) => any>(
  func: T, 
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// MAIN HOOK
export const useListPage = <T extends { _id: string }>({
  fetchFunction,
  deleteFunction,
  initialLimit = 10,
  onDeleteSuccess,
  onDeleteError
}: UseListPageProps<T>): UseListPageReturn<T> => {
  // Data state
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: initialLimit,
    total: 0
  });
  
  // Sort & Filter state
  const [sort, setSort] = useState<SortParams | null>(null);
  const [filters, setFilters] = useState<FilterParams[]>([]);
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string | null;
    name: string;
  }>({
    isOpen: false,
    id: null,
    name: ''
  });

  // Fetch data function
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params: ApiParams = {
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
      
      const result = await fetchFunction(params);
      
      setData(result.data);
      setPagination({
        page: result.page,
        limit: result.limit,
        total: result.total
      });
    } catch (err: any) {
      console.error('Data fetch error:', err);
      setError(err.message || 'Veri yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, sort, filters, searchTerm, fetchFunction]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500),
    []
  );

  // Event handlers
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleSort = (newSort: SortParams) => {
    setSort(newSort);
  };

  const handleFilter = (newFilters: FilterParams[]) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      id,
      name
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id || !deleteFunction) return;
    
    try {
      await deleteFunction(deleteModal.id);
      
      // Modal'ı kapat
      setDeleteModal({ isOpen: false, id: null, name: '' });
      
      // Success callback
      if (onDeleteSuccess) {
        const deletedItem = data.find(item => item._id === deleteModal.id);
        if (deletedItem) {
          onDeleteSuccess(deletedItem);
        }
      }
      
      // Veriyi yenile
      fetchData();
    } catch (err: any) {
      setDeleteModal({ isOpen: false, id: null, name: '' });
      
      // Error callback
      if (onDeleteError) {
        onDeleteError(err.message || 'Silme işlemi sırasında bir hata oluştu');
      }
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, id: null, name: '' });
  };

  const refreshData = () => {
    fetchData();
  };

  // Effects
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    // Data
    data,
    isLoading,
    error,
    
    // Pagination
    pagination,
    handlePageChange,
    
    // Search
    searchTerm,
    handleSearchInput,
    handleSearch,
    
    // Sort & Filter
    sort,
    filters,
    handleSort,
    handleFilter,
    
    // Delete
    deleteModal,
    handleDeleteClick,
    confirmDelete,
    cancelDelete,
    
    // Refresh
    refreshData
  };
};

export default useListPage; 