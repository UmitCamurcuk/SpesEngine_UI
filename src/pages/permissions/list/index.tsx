import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, SearchBar, Pagination, Badge } from '../../../components/ui';
import type { TableColumn } from '../../../components/ui/Table';
import permissionService from '../../../services/api/permissionService';
import type { Permission } from '../../../services/api/permissionService';

const PermissionsListPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Veri state'i
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Sayfalama ve arama için state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [itemsPerPage] = useState<number>(10);
  
  // Verileri getir
  const fetchPermissions = async (page: number, search: string = '') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await permissionService.getPermissions({
        page,
        limit: itemsPerPage,
        search
      });
      
      setPermissions(result.permissions);
      setTotalItems(result.total);
      setTotalPages(result.pagination.totalPages);
      setCurrentPage(result.pagination.currentPage);
    } catch (err: any) {
      setError('İzinler yüklenirken bir hata oluştu: ' + (err.message || err));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sayfa yüklendiğinde verileri getir
  useEffect(() => {
    fetchPermissions(currentPage, searchTerm);
  }, [currentPage]);
  
  // Arama fonksiyonu
  const handleSearch = () => {
    setCurrentPage(1); // Aramada her zaman ilk sayfaya dön
    fetchPermissions(1, searchTerm);
  };
  
  // Tablo sütunları
  const columns: TableColumn<Permission>[] = [
    {
      key: 'name',
      header: 'İzin Adı',
      render: (permission: Permission) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {permission.name}
        </div>
      )
    },
    {
      key: 'code',
      header: 'Kod',
      render: (permission: Permission) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {permission.code}
        </div>
      )
    },
    {
      key: 'permissionGroup',
      header: 'Grup',
      render: (permission: Permission) => {
        const group = typeof permission.permissionGroup === 'object' 
          ? permission.permissionGroup 
          : { name: 'Belirtilmemiş' };
          
        return (
          <div className="text-sm">
            {group.name}
          </div>
        );
      }
    },
    {
      key: 'isActive',
      header: 'Durum',
      render: (permission: Permission) => (
        <div className="text-center">
          {permission.isActive ? (
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
      render: (permission: Permission) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/permissions/details/${permission._id}`)}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              İzinler
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Sistem izinlerini görüntüleyin ve yönetin
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchBar
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              onSearch={handleSearch}
              placeholder="İzin ara..."
            />
            
            <Button
              variant="primary"
              onClick={() => navigate('/permissions/create')}
              className="flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yeni İzin
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
          data={permissions}
          isLoading={isLoading}
          emptyMessage="Gösterilecek izin bulunamadı"
          onRowClick={(permission) => navigate(`/permissions/details/${permission._id}`)}
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

export default PermissionsListPage; 