import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../../components/ui/Table';
import type { TableColumn, SortParams, FilterParams, PaginationParams } from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import itemService from '../../../services/api/itemService';
import type { Item, ItemApiParams } from '../../../types/item';

const ItemsListPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State tanımlamaları
  const [items, setItems] = useState<Item[]>([]);
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

  // Öğeleri getir
  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // API parametrelerini hazırla
      const params: ItemApiParams = {
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
      const result = await itemService.getItems(params);
      
      setItems(result.items);
      setPagination({
        page: result.page,
        limit: result.limit,
        total: result.total
      });
      
      // İstatistikleri hesapla
      if (result.items.length > 0) {
        let activeCount = 0;
        
        result.items.forEach(item => {
          if (item.isActive) {
            activeCount++;
          }
        });
        
        setStats({
          total: result.total,
          active: activeCount
        });
      }
    } catch (err: any) {
      setError(err.message || 'Öğeler getirilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Bağımlılıklar değiştiğinde yeniden veri çek
  useEffect(() => {
    fetchItems();
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
  const handleRowClick = (item: Item) => {
    navigate(`/items/details/${item._id}`);
  };
  
  // Öğe oluştur handler
  const handleCreateItem = () => {
    navigate('/items/create');
  };
  
  // Silme işlemi handler
  const handleDeleteItem = async (id: string, name: string) => {
    if (window.confirm(`"${name}" öğesini silmek istediğinize emin misiniz?`)) {
      try {
        await itemService.deleteItem(id);
        // Silme başarılı olduğunda listeyi yenile
        fetchItems();
      } catch (err: any) {
        setError(err.message || 'Öğe silinirken bir hata oluştu');
      }
    }
  };
  
  // Tablo sütunları
  const columns: TableColumn<Item>[] = [
    {
      key: 'name',
      header: 'Ad',
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
      key: 'itemType',
      header: 'Öğe Tipi',
      render: (row) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {typeof row.itemType === 'object' && row.itemType && 'name' in row.itemType
            ? (row.itemType as any).name
            : row.itemType || <span className="text-gray-400 italic">Tip yok</span>}
        </div>
      )
    },
    {
      key: 'family',
      header: 'Aile',
      render: (row) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {typeof row.family === 'object' && row.family && 'name' in row.family
            ? (row.family as any).name
            : row.family || <span className="text-gray-400 italic">Aile yok</span>}
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
  const renderActions = (item: Item) => (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        className="p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900 rounded-md"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/items/details/${item._id}`);
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
          handleDeleteItem(item._id, item.name);
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
      {/* Başlık Kartı */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-7 h-7 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Öğeler
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Tüm öğeleri görüntüleyin, düzenleyin ve yönetin
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
            onClick={handleCreateItem}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Yeni Öğe Oluştur
          </Button>
        </div>
      </div>
      
      {/* Arama ve Filtreleme Kartı */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
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
              placeholder="Öğe adı, kod veya açıklama ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit" className="md:w-auto">
            Ara
          </Button>
        </form>
      </div>
      
      {/* Veri Tablosu */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
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
          data={items}
          keyField="_id"
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSort={handleSort}
          onFilter={handleFilter}
          renderActions={renderActions}
          onRowClick={handleRowClick}
          emptyMessage="Henüz hiç öğe oluşturulmamış"
        />
      </div>
    </div>
  );
};

export default ItemsListPage; 