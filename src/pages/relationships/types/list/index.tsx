import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../../context/i18nContext';
import { useNotification } from '../../../../components/notifications';
import { useListPage } from '../../../../hooks/useListPage';
import { ListPageLayout } from '../../../../components/layout';
import { SearchForm } from '../../../../components/common';
import { Table, Button, Badge } from '../../../../components/ui';
import { TableColumn } from '../../../../components/ui/Table';
import { relationshipService } from '../../../../services';
import { IRelationshipType } from '../../../../types/relationship';

const RelationshipTypesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useNotification();

  // Wrapper function to adapt relationship service to useListPage interface
  const fetchRelationshipTypesWrapper = useCallback(async (params: any) => {
    const result = await relationshipService.getAllRelationshipTypes(params);
    // Assuming the service returns data in the correct format, or adapt as needed
    if (result.data && Array.isArray(result.data)) {
      return result;
    }
    // If it returns different format, adapt it
    return {
      data: Array.isArray(result) ? result : [],
      page: params?.page || 1,
      limit: params?.limit || 10,
      total: Array.isArray(result) ? result.length : 0
    };
  }, []);

  const {
    data: relationshipTypes = [],
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
    fetchFunction: fetchRelationshipTypesWrapper,
    deleteFunction: relationshipService.deleteRelationshipType,
    onDeleteSuccess: (relationshipType) => {
      showToast({
        type: 'success',
        title: t('success', 'common'),
        message: `${relationshipType.name || relationshipType.code} ${t('deleted_successfully', 'common')}`
      });
    },
    onDeleteError: (error) => {
      showToast({
        type: 'error',
        title: t('error', 'common'),
        message: t('error_deleting', 'common') + ': ' + error
      });
    }
  });

  // Safe array operations
  const safeRelationshipTypes = Array.isArray(relationshipTypes) ? relationshipTypes : [];

  // Tablo sütunları
  const columns: TableColumn<IRelationshipType>[] = [
    {
      key: 'code',
      header: t('code', 'common'),
      render: (type: IRelationshipType) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {type.code}
        </div>
      )
    },
    {
      key: 'name',
      header: t('name', 'common'),
      render: (type: IRelationshipType) => (
        <div className="text-gray-500 dark:text-gray-300">
          {type.name}
        </div>
      )
    },
    {
      key: 'isDirectional',
      header: t('directional', 'relationships'),
      render: (type: IRelationshipType) => (
        <div className="text-center">
          {type.isDirectional ? (
            <Badge color="success" size="sm">{t('yes', 'common')}</Badge>
          ) : (
            <Badge color="danger" size="sm">{t('no', 'common')}</Badge>
          )}
        </div>
      )
    },
    {
      key: 'allowedSourceTypes',
      header: t('source_types', 'relationships'),
      render: (type: IRelationshipType) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {type.allowedSourceTypes.join(', ')}
        </div>
      )
    },
    {
      key: 'allowedTargetTypes',
      header: t('target_types', 'relationships'),
      render: (type: IRelationshipType) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {type.allowedTargetTypes.join(', ')}
        </div>
      )
    },
    {
      key: '_id',
      header: t('actions', 'common'),
      render: (type: IRelationshipType) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/relationships/types/details/${type._id}`);
            }}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {t('view', 'common')}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(type._id, type.name || type.code);
            }}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {t('delete', 'common')}
          </Button>
        </div>
      )
    }
  ];

  const stats = [
    {
      title: t('total_relationship_types', 'relationships'),
      value: pagination.total,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
      color: 'purple' as const
    },
    {
      title: t('directional_types', 'relationships'),
      value: relationshipTypes.filter(type => type.isDirectional).length,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      ),
      color: 'green' as const
    },
    {
      title: t('bidirectional_types', 'relationships'),
      value: relationshipTypes.filter(type => !type.isDirectional).length,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 9H17a1 1 0 110 2h-5.586l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 9H11a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
      ),
      color: 'blue' as const
    },
    {
      title: t('active_types', 'relationships'),
      value: relationshipTypes.length,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ),
      color: 'yellow' as const
    }
  ];

  return (
    <>
      <ListPageLayout
        title={t('relationship_types', 'relationships')}
        description={t('relationship_types_description', 'relationships') || 'İlişki tipleri, varlıklar arasındaki bağlantıları tanımlar ve yönetir.'}
        icon={
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
        }
        breadcrumbItems={[
          { label: t('home', 'menu'), path: '/' },
          { label: t('relationships', 'menu'), path: '/relationships' },
          { label: t('relationship_types', 'relationships') }
        ]}
        onCreateClick={() => navigate('/relationships/types/create')}
        createButtonText={t('add_relationship_type', 'relationships')}
        stats={stats}
        searchComponent={
          <SearchForm
            onSearchInput={handleSearchInput}
            onSubmit={handleSearch}
            placeholder={t('search_relationship_types', 'relationships') || 'İlişki tipi ara...'}
            searchButtonText={t('search', 'common') || 'Ara'}
          />
        }
        error={error}
      >
        <Table
          columns={columns}
          data={safeRelationshipTypes}
          isLoading={isLoading}
          emptyMessage={t('no_relationship_types_found', 'relationships') || 'Gösterilecek ilişki tipi bulunamadı'}
          onRowClick={(type) => navigate(`/relationships/types/details/${type._id}`)}
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
                {t('confirm_delete', 'common')}
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>{deleteModal.name}</strong> ilişki tipini silmek istediğinizden emin misiniz?
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 mr-2"
                >
                  {t('cancel', 'common')}
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

export default RelationshipTypesListPage;