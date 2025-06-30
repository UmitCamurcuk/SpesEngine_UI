import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../components/notifications';
import { useListPage } from '../../../hooks/useListPage';
import { ListPageLayout } from '../../../components/layout';
import { SearchForm } from '../../../components/common';
import { Table, Button, Badge } from '../../../components/ui';
import { TableColumn } from '../../../components/ui/Table';
import permissionService from '../../../services/api/permissionService';
import { Permission } from '../../../types/permission';

const PermissionsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();

  // Wrapper function to adapt permission service to useListPage interface
  const fetchPermissionsWrapper = useCallback(async (params: any) => {
    const result = await permissionService.getPermissions(params);
    // Adapt the response format if needed
    if (result.data && Array.isArray(result.data)) {
      return result;
    }
    // If it returns different format, adapt it
    return {
      data: Array.isArray(result) ? result : (result.permissions || []),
      page: result.pagination?.currentPage || params?.page || 1,
      limit: params?.limit || 10,
      total: result.total || (Array.isArray(result) ? result.length : 0)
    };
  }, []);

  const {
    data: permissions = [],
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
    fetchFunction: fetchPermissionsWrapper,
    deleteFunction: permissionService.deletePermission,
    onDeleteSuccess: (permission) => {
      showToast({
        type: 'success',
        title: 'Başarılı',
        message: `${permission.name?.tr || permission.code} başarıyla silindi`
      });
    },
    onDeleteError: (error) => {
      showToast({
        type: 'error',
        title: 'Hata',
        message: 'İzin silinirken hata oluştu: ' + error
      });
    }
  });

  // Safe array operations
  const safePermissions = Array.isArray(permissions) ? permissions : [];

  // Tablo sütunları
  const columns: TableColumn<Permission>[] = [
    {
      key: 'name',
      header: 'İzin Adı',
      render: (permission: Permission) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {permission.name?.tr || permission.code}
        </div>
      )
    },
    {
      key: 'code',
      header: 'Kod',
      render: (permission: Permission) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
          {permission.code}
        </div>
      )
    },
    {
      key: 'description',
      header: 'Açıklama',
      render: (permission: Permission) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {permission.description?.tr || '-'}
        </div>
      )
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
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/permissions/details/${permission._id}`);
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
              confirmDelete(permission._id, permission.name?.tr || permission.code);
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
      title: 'Toplam İzin',
      value: pagination.total,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      color: 'purple' as const
    },
    {
      title: 'Aktif İzinler',
      value: permissions.filter(permission => permission.isActive).length,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ),
      color: 'green' as const
    },
    {
      title: 'Pasif İzinler',
      value: permissions.filter(permission => !permission.isActive).length,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
      color: 'red' as const
    },
    {
      title: 'Sistem İzinleri',
      value: permissions.length,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      color: 'blue' as const
    }
  ];

  return (
    <>
      <ListPageLayout
        title="İzinler"
        description="Sistem izinlerini görüntüleyin ve yönetin"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        }
        breadcrumbItems={[
          { label: 'Ana Sayfa', path: '/' },
          { label: 'İzinler' }
        ]}
        onCreateClick={() => navigate('/permissions/create')}
        createButtonText="Yeni İzin"
        stats={stats}
        searchComponent={
          <SearchForm
            onSearchInput={handleSearchInput}
            onSubmit={handleSearch}
            placeholder="İzin ara..."
            searchButtonText="Ara"
          />
        }
        error={error}
      >
        <Table
          columns={columns}
          data={safePermissions}
          isLoading={isLoading}
          emptyMessage="Gösterilecek izin bulunamadı"
          onRowClick={(permission) => navigate(`/permissions/details/${permission._id}`)}
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
                İzni Sil
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>{deleteModal.itemName}</strong> iznini silmek istediğinizden emin misiniz?
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
                  onClick={() => deleteModal.confirm()}
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

export default PermissionsListPage; 