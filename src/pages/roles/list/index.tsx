import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../components/notifications';
import { useListPage } from '../../../hooks/useListPage';
import { ListPageLayout } from '../../../components/layout';
import { SearchForm } from '../../../components/common';
import { Table, Button, Badge } from '../../../components/ui';
import { TableColumn } from '../../../components/ui/Table';
import roleService from '../../../services/api/roleService';
import { Role } from '../../../types/role';

const RolesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();

  // Wrapper function to adapt role service to useListPage interface
  const fetchRolesWrapper = useCallback(async (params: any) => {
    const result = await roleService.getRoles(params);
    return {
      data: result.roles,
      page: result.pagination.currentPage,
      limit: params?.limit || 10,
      total: result.total
    };
  }, []);

  const {
    data: roles = [], 
    isLoading,
    error,
    pagination,
    searchTerm,
    handleSearchInput,
    handleSearch,
    handlePageChange,
    deleteModal,
    handleDeleteClick,
    confirmDelete,
    cancelDelete
  } = useListPage({
    fetchFunction: fetchRolesWrapper,
    deleteFunction: roleService.deleteRole,
    onDeleteSuccess: (role) => {
      showToast({
        type: 'success',
        title: 'Başarılı',
        message: `${role.name} başarıyla silindi`
      });
    },
    onDeleteError: (error) => {
      showToast({
        type: 'error',
        title: 'Hata',
        message: 'Rol silinirken hata oluştu: ' + error
      });
    }
  });

  // Safe array operations
  const safeRoles = Array.isArray(roles) ? roles : [];

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
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/roles/details/${role._id}`);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="ml-1">Detay</span>
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(role._id, role.name);
            }}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Sil
          </Button>
        </div>
      )
    }
  ];

  const stats = [
    {
      title: 'Toplam Rol',
      value: pagination.total || 0,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      ),
      color: 'purple' as const
    },
    {
      title: 'Aktif Roller',
      value: safeRoles.filter(role => role.isActive).length,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ),
      color: 'green' as const
    },
    {
      title: 'Pasif Roller',
      value: safeRoles.filter(role => !role.isActive).length,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
      color: 'red' as const
    },
    {
      title: 'İzinli Roller',
      value: safeRoles.filter(role => Array.isArray(role.permissions) && role.permissions.length > 0).length,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      color: 'blue' as const
    }
  ];

  return (
    <>
      <ListPageLayout
        title="Roller"
        description="Sistem rollerini görüntüleyin ve yönetin"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        }
        breadcrumbItems={[
          { label: 'Ana Sayfa', path: '/' },
          { label: 'Roller' }
        ]}
        onCreateClick={() => navigate('/roles/create')}
        createButtonText="Yeni Rol"
        stats={stats}
        searchComponent={
          <SearchForm
            onSearchInput={handleSearchInput}
            onSubmit={handleSearch}
            placeholder="Rol ara..."
            searchButtonText="Ara"
          />
        }
        error={error}
      >
        <Table
          columns={columns}
          data={safeRoles}
          isLoading={isLoading}
          emptyMessage="Gösterilecek rol bulunamadı"
          onRowClick={(role) => navigate(`/roles/details/${role._id}`)}
          pagination={{
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total || 0
          }}
          onPageChange={handlePageChange}
        />
      </ListPageLayout>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-2">
                Rolü Sil
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>{deleteModal.name}</strong> rolünü silmek istediğinizden emin misiniz?
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 mr-2"
                >
                  İptal
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RolesListPage; 