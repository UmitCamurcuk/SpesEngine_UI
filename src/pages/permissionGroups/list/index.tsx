import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../components/notifications';
import { useListPage } from '../../../hooks/useListPage';
import { ListPageLayout } from '../../../components/layout';
import { SearchForm } from '../../../components/common';
import { Table, Button, Badge } from '../../../components/ui';
import { TableColumn } from '../../../components/ui/Table';
import permissionGroupService from '../../../services/api/permissionGroupService';
import { PermissionGroup } from '../../../types/permissionGroup';

const PermissionGroupsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();

  // Wrapper function to adapt permission group service to useListPage interface
  const fetchPermissionGroupsWrapper = useCallback(async (params: any) => {
    const result = await permissionGroupService.getPermissionGroups(params);
    // Adapt the response format if needed
    return {
      data: result.permissionGroups || [],
      page: result.pagination?.currentPage || params?.page || 1,
      limit: params?.limit || 10,
      total: result.total || 0
    };
  }, []);

  const {
    data: permissionGroups = [],
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
    fetchFunction: fetchPermissionGroupsWrapper,
    deleteFunction: permissionGroupService.deletePermissionGroup,
    onDeleteSuccess: (permissionGroup) => {
      showToast({
        type: 'success',
        title: 'Başarılı',
        message: `${permissionGroup.name} başarıyla silindi`
      });
    },
    onDeleteError: (error) => {
      showToast({
        type: 'error',
        title: 'Hata',
        message: 'İzin grubu silinirken hata oluştu: ' + error
      });
    }
  });

  // Safe array operations
  const safePermissionGroups = Array.isArray(permissionGroups) ? permissionGroups : [];

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
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/permissionGroups/details/${group._id}`);
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
              confirmDelete(group._id, group.name);
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
      title: 'Toplam İzin Grubu',
      value: pagination.total,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
        </svg>
      ),
      color: 'purple' as const
    },
    {
      title: 'Aktif Gruplar',
      value: permissionGroups.filter(group => group.isActive).length,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ),
      color: 'green' as const
    },
    {
      title: 'Pasif Gruplar',
      value: permissionGroups.filter(group => !group.isActive).length,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
      color: 'red' as const
    },
    {
      title: 'Sistem Grupları',
      value: permissionGroups.length,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
        </svg>
      ),
      color: 'blue' as const
    }
  ];

  return (
    <>
      <ListPageLayout
        title="İzin Grupları"
        description="Sistem izin gruplarını görüntüleyin ve yönetin"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        }
        breadcrumbItems={[
          { label: 'Ana Sayfa', path: '/' },
          { label: 'İzin Grupları' }
        ]}
        onCreateClick={() => navigate('/permissionGroups/create')}
        createButtonText="Yeni İzin Grubu"
        stats={stats}
        searchComponent={
          <SearchForm
            onSearchInput={handleSearchInput}
            onSubmit={handleSearch}
            placeholder="İzin grubu ara..."
            searchButtonText="Ara"
          />
        }
        error={error}
      >
        <Table
          columns={columns}
          data={safePermissionGroups}
          isLoading={isLoading}
          emptyMessage="Gösterilecek izin grubu bulunamadı"
          onRowClick={(permissionGroup) => navigate(`/permissionGroups/details/${permissionGroup._id}`)}
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
                İzin Grubunu Sil
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>{deleteModal.itemName}</strong> izin grubunu silmek istediğinizden emin misiniz?
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

export default PermissionGroupsListPage; 