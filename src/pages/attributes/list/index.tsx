import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../../components/ui/Table';
import type { TableColumn, SortParams, FilterParams, PaginationParams } from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import AttributeBadge from '../../../components/attributes/AttributeBadge';
import attributeService from '../../../services/api/attributeService';
import type { Attribute, AttributeApiParams } from '../../../services/api/attributeService';
import { AttributeType } from '../../../types/attribute';

const AttributesListPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State tanımlamaları
  const [attributes, setAttributes] = useState<Attribute[]>([]);
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
    required: 0,
    types: {} as Record<AttributeType, number>
  });

  // Öznitelikleri getir
  const fetchAttributes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // API parametrelerini hazırla
      const params: AttributeApiParams = {
        page: pagination.page,
        limit: pagination.limit
      };
      
      // Arama terimi varsa ekle
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      
      // Sıralama parametreleri
      if (sort) {
        console.log('API\'ye gönderilen sıralama parametreleri:', { field: sort.field, direction: sort.direction });
        params.sort = sort.field;
        params.direction = sort.direction;
      }
      
      // Filtre parametreleri
      filters.forEach(filter => {
        params[filter.field] = filter.value;
      });
      
      // API'den veri al
      const result = await attributeService.getAttributes(params);
      console.log('Backend\'den dönen veri:', result);
      
      setAttributes(result.attributes);
      setPagination({
        page: result.page,
        limit: result.limit,
        total: result.total
      });
      
      // İstatistikleri hesapla
      if (result.attributes.length > 0) {
        const typeCounts = {} as Record<AttributeType, number>;
        let requiredCount = 0;
        
        result.attributes.forEach(attr => {
          // Tip sayısını artır
          typeCounts[attr.type] = (typeCounts[attr.type] || 0) + 1;
          
          // Zorunlu sayısını artır
          if (attr.isRequired) {
            requiredCount++;
          }
        });
        
        setStats({
          total: result.total,
          required: requiredCount,
          types: typeCounts
        });
      }
    } catch (err: any) {
      setError(err.message || 'Öznitelikler getirilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Bağımlılıklar değiştiğinde yeniden veri çek
  useEffect(() => {
    console.log('useEffect triggered with sort:', sort);
    fetchAttributes();
  }, [pagination.page, pagination.limit, sort, filters, searchTerm]);
  
  // Sayfa değişim handler
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };
  
  // Sıralama değişim handler
  const handleSort = (sort: SortParams) => {
    console.log('Sıralama isteği:', sort.field, 'Yön:', sort.direction);
    
    // Sadece backend'in yapması için state'i güncelliyoruz
    // Frontend'de sıralama yapmıyoruz
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
  const handleRowClick = (attribute: Attribute) => {
    navigate(`/attributes/${attribute._id}`);
  };
  
  // Öznitelik oluştur handler
  const handleCreateAttribute = () => {
    navigate('/attributes/create');
  };
  
  // Silme işlemi handler
  const handleDeleteAttribute = async (id: string, name: string) => {
    if (window.confirm(`"${name}" özniteliğini silmek istediğinize emin misiniz?`)) {
      try {
        await attributeService.deleteAttribute(id);
        // Silme başarılı olduğunda listeyi yenile
        fetchAttributes();
      } catch (err: any) {
        setError(err.message || 'Öznitelik silinirken bir hata oluştu');
      }
    }
  };
  
  // Tablo sütunları
  const columns: TableColumn<Attribute>[] = [
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
      key: 'type',
      header: 'Tip',
      sortable: true,
      render: (row) => <AttributeBadge type={row.type as AttributeType} showLabel={true} />
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
      key: 'isRequired',
      header: 'Zorunlu',
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.isRequired 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
        }`}>
          {row.isRequired ? (
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {row.isRequired ? 'Evet' : 'Hayır'}
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
  const renderActions = (attribute: Attribute) => (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        className="p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900 rounded-md"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/attributes/${attribute._id}`);
        }}
        title="Görüntüle"
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
          handleDeleteAttribute(attribute._id, attribute.name);
        }}
        title="Sil"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Üst Başlık ve İstatistikler */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-6 h-6 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Öznitelikler
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Ürün ve hizmetleriniz için öznitelikleri yönetin
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button
              variant="primary"
              className="flex items-center shadow-md"
              onClick={handleCreateAttribute}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Yeni Öznitelik</span>
            </Button>
          </div>
        </div>
        
        {/* İstatistik kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
            <div className="text-blue-500 dark:text-blue-400 text-sm font-medium">Toplam Öznitelik</div>
            <div className="mt-2 flex items-baseline">
              <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</span>
              <span className="ml-2 text-xs text-blue-500 dark:text-blue-400">adet</span>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-900">
            <div className="text-green-500 dark:text-green-400 text-sm font-medium">Zorunlu Olan</div>
            <div className="mt-2 flex items-baseline">
              <span className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.required}</span>
              <span className="ml-2 text-xs text-green-500 dark:text-green-400">adet</span>
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-900">
            <div className="text-purple-500 dark:text-purple-400 text-sm font-medium">Bu Sayfada</div>
            <div className="mt-2 flex items-baseline">
              <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">{attributes.length}</span>
              <span className="ml-2 text-xs text-purple-500 dark:text-purple-400">/{stats.total} öznitelik</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Arama ve Filtreleme */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
        <form className="flex w-full max-w-lg" onSubmit={handleSearch}>
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full p-2 pl-10 text-sm border border-gray-300 rounded-l-lg focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Öznitelik adı, kodu veya açıklaması ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            className="rounded-l-none"
          >
            Ara
          </Button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-start">
          <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <Table
          columns={columns}
          data={attributes}
          keyField="_id"
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSort={handleSort}
          onFilter={handleFilter}
          onRowClick={handleRowClick}
          actions={renderActions}
          emptyMessage={
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Henüz hiç öznitelik bulunamadı</p>
              <div className="mt-4">
                <Button
                  variant="primary"
                  className="inline-flex items-center"
                  onClick={handleCreateAttribute}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  İlk Özniteliği Ekle
                </Button>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default AttributesListPage; 