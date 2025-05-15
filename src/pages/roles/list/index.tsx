import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, SearchBar, Pagination, Badge } from '../../../components/ui';
import type { TableColumn } from '../../../components/ui/Table';
import roleService from '../../../services/api/roleService';
import type { Role } from '../../../services/api/roleService';

const RolesListPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Veri state'i
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Sayfalama ve arama için state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [itemsPerPage] = useState<number>(10);
  
  // Verileri getir
  const fetchRoles = async (page: number, search: string = '') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await roleService.getRoles({
        page,
        limit: itemsPerPage,
        search
      });
      
      setRoles(result.roles);
      setTotalItems(result.total);
      setTotalPages(result.pagination.totalPages);
      setCurrentPage(result.pagination.currentPage);
    } catch (err: any) {
      setError('Roller yüklenirken bir hata oluştu: ' + (err.message || err));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sayfa yüklendiğinde verileri getir
  useEffect(() => {
    fetchRoles(currentPage, searchTerm);
  }, [currentPage]);
  
  // Arama fonksiyonu
  const handleSearch = () => {
    setCurrentPage(1); // Aramada her zaman ilk sayfaya dön
    fetchRoles(1, searchTerm);
  };
  
  // Tablo sütunları
  const columns: TableColumn<Role>[] = [
    {
      key: 'name',
      header: 'Rol Adı',
      render: (role: Role) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {role.name}
        </div>
      )
    },
    {
      key: 'description',
      header: 'Açıklama',
      render: (role: Role) => (
        <div className="max-w-xs truncate" title={role.description}>
          {role.description}
        </div>
      )
    },
    {
      key: 'permissions',
      header: 'İzin Sayısı',
      render: (role: Role) => (
        <div className="text-center">
          <Badge color="primary" size="sm">
            {Array.isArray(role.permissions) ? role.permissions.length : 0}
          </Badge>
        </div>
      )
    },
    {
      key: 'isActive',
      header: 'Durum',
      render: (role: Role) => (
        <div className="text-center">
          {role.isActive ? (
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
      render: (role: Role) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/roles/details/${role._id}`)}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Roller
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Sistem rollerini görüntüleyin ve yönetin
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchBar
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              onSearch={handleSearch}
              placeholder="Rol ara..."
            />
            
            <Button
              variant="primary"
              onClick={() => navigate('/roles/create')}
              className="flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yeni Rol
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
          data={roles}
          isLoading={isLoading}
          emptyMessage="Gösterilecek rol bulunamadı"
          onRowClick={(role) => navigate(`/roles/details/${role._id}`)}
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

export default RolesListPage; 