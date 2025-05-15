import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, SearchBar, Pagination, Badge } from '../../../components/ui';
import type { TableColumn } from '../../../components/ui/Table';
import permissionGroupService from '../../../services/api/permissionGroupService';
import type { PermissionGroup } from '../../../services/api/permissionGroupService';

const PermissionGroupsListPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Veri state'i
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Sayfalama ve arama için state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [itemsPerPage] = useState<number>(10);
  
  // Verileri getir
  const fetchPermissionGroups = async (page: number, search: string = '') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await permissionGroupService.getPermissionGroups({
        page,
        limit: itemsPerPage,
        search
      });
      
      setPermissionGroups(result.permissionGroups);
      setTotalItems(result.total);
      setTotalPages(result.pagination.totalPages);
      setCurrentPage(result.pagination.currentPage);
    } catch (err: any) {
      setError('İzin grupları yüklenirken bir hata oluştu: ' + (err.message || err));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sayfa yüklendiğinde verileri getir
  useEffect(() => {
    fetchPermissionGroups(currentPage, searchTerm);
  }, [currentPage]);
  
  // Arama fonksiyonu
  const handleSearch = () => {
    setCurrentPage(1); // Aramada her zaman ilk sayfaya dön
    fetchPermissionGroups(1, searchTerm);
  };
  
  // Tablo sütunları
  const columns: TableColumn<PermissionGroup>[] = [
    {
      key: 'name',
      header: 'Grup Adı',
      render: (group: PermissionGroup) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {group.name}
        </div>
      )
    },
    {
      key: 'code',
      header: 'Kod',
      render: (group: PermissionGroup) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
          {group.code}
        </div>
      )
    },
    {
      key: 'description',
      header: 'Açıklama',
      render: (group: PermissionGroup) => (
        <div className="max-w-xs truncate" title={group.description}>
          {group.description}
        </div>
      )
    },
    {
      key: 'isActive',
      header: 'Durum',
      render: (group: PermissionGroup) => (
        <div className="text-center">
          {group.isActive ? (
            <Badge color="success" size="sm">Aktif</Badge>
          ) : (
            <Badge color="danger" size="sm">Pasif</Badge>
          )}
        </div>
      )
    },
    {
      key: '_id',
      header: 'İşlemler',
      render: (group: PermissionGroup) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/permissionGroups/details/${group._id}`)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="ml-1">Detay</span>
          </Button>
        </div>
      )
    }
  ];
  
  return (
    <div className="space-y-6">
      {/* Başlık ve Kontroller */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-7 h-7 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              İzin Grupları
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Sistem izin gruplarını görüntüleyin ve yönetin
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchBar
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              onSearch={handleSearch}
              placeholder="İzin grubu ara..."
            />
            
            <Button
              variant="primary"
              onClick={() => navigate('/permissionGroups/create')}
              className="flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yeni İzin Grubu
            </Button>
          </div>
        </div>
      </div>
      
      {/* İçerik */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400">
            <p className="font-medium">Hata</p>
            <p>{error}</p>
          </div>
        )}
        
        <Table
          columns={columns}
          data={permissionGroups}
          isLoading={isLoading}
          emptyMessage="Gösterilecek izin grubu bulunamadı"
          onRowClick={(group) => navigate(`/permissionGroups/details/${group._id}`)}
        />
        
        {!isLoading && !error && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionGroupsListPage; 