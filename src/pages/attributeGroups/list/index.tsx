import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../../components/ui/Table';
import type { TableColumn } from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import attributeGroupService from '../../../services/api/attributeGroupService';
import { useTranslation } from '../../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../../utils/translationUtils';
import ModalNotification from '../../../components/notifications/ModalNotification';
import { useNotification } from '../../../components/notifications';
import ListPageLayout from '../../../components/layout/ListPageLayout';
import SearchForm from '../../../components/common/SearchForm';
import useListPage from '../../../hooks/useListPage';

// INTERFACES
interface AttributeGroup {
  _id: string;
  name: string;
  code: string;
  description: string;
  attributes: any[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
}

// UTILITY COMPONENTS
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden ${className}`}>
    {children}
  </div>
);

// MAIN COMPONENT
const AttributeGroupsListPage: React.FC = () => {
  // HOOKS
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  const { showToast } = useNotification();

  // API service wrapper for useListPage hook
  const fetchAttributeGroups = useCallback(async (params: any) => {
    const result = await attributeGroupService.getAttributeGroups(params);
    return {
      data: result.attributeGroups || [],
      page: result.page || 1,
      limit: result.limit || 10,
      total: result.total || 0
    };
  }, []);

  const deleteAttributeGroup = useCallback(async (id: string) => {
    await attributeGroupService.deleteAttributeGroup(id);
  }, []);

  // Use our custom hook
  const {
    data: attributeGroups,
    isLoading,
    error,
    pagination,
    handlePageChange,
    handleSearchInput,
    handleSearch,
    sort,
    handleSort,
    handleFilter,
    deleteModal,
    handleDeleteClick,
    confirmDelete,
    cancelDelete,
  } = useListPage<AttributeGroup>({
    fetchFunction: fetchAttributeGroups,
    deleteFunction: deleteAttributeGroup,
    onDeleteSuccess: (deletedItem) => {
      showToast({
        title: 'Başarılı!',
        message: `"${getEntityName(deletedItem, currentLanguage)}" öznitelik grubu başarıyla silindi.`,
        type: 'success'
      });
    },
    onDeleteError: (error) => {
      showToast({
        title: 'Hata!',
        message: error,
        type: 'error'
      });
    }
  });

  // HELPER FUNCTIONS
  const handleRowClick = (group: AttributeGroup) => {
    navigate(`/attributeGroups/details/${group._id}`);
  };

  const handleCreateAttributeGroup = () => {
    navigate('/attributeGroups/create');
  };

  // STATISTICS
  const stats = useMemo(() => {
    const activeCount = attributeGroups.filter(group => group?.isActive).length;
    
    return [
      {
        title: t('total_attribute_groups', 'attribute_groups'),
        value: pagination.total,
        icon: (
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        ),
        color: 'purple' as const
      },
      {
        title: t('active_attribute_groups', 'attribute_groups'),
        value: activeCount,
        icon: (
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'green' as const
      },
      {
        title: t('on_this_page', 'attribute_groups'),
        value: attributeGroups.length,
        icon: (
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
        color: 'blue' as const
      }
    ];
  }, [attributeGroups, pagination.total, t, currentLanguage]);

  // TABLE COLUMNS
  const columns: TableColumn<AttributeGroup>[] = useMemo(() => [
    {
      key: 'name',
      header: t('name', 'attribute_groups'),
      sortable: true,
      filterable: false,
      render: (row) => {
        const entityName = getEntityName(row, currentLanguage);
        
        return (
          <div className="flex items-center">
            <div className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]" title={entityName}>
              {entityName || 'İsim bulunamadı'}
            </div>
          </div>
        );
      }
    },
    {
      key: 'code',
      header: t('code', 'attribute_groups'),
      sortable: true,
      filterable: false,
      render: (row) => (
        <div className="font-mono text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded truncate max-w-[150px]" title={row.code}>
          {row.code}
        </div>
      )
    },
    {
      key: 'description',
      header: t('description', 'attribute_groups'),
      render: (row) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={getEntityDescription(row, currentLanguage)}>
          {getEntityDescription(row, currentLanguage) || <span className="text-gray-400 italic">{t('no_description', 'attribute_groups')}</span>}
        </div>
      )
    },
    {
      key: 'attributes',
      header: t('attribute_count', 'attribute_groups'),
      render: (row) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {Array.isArray(row.attributes) ? row.attributes.length : 0}
        </div>
      )
    },
    {
      key: 'isActive',
      header: t('status', 'attribute_groups'),
      sortable: true,
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.isActive 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
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
          {row.isActive ? t('active', 'attribute_groups') : t('inactive', 'attribute_groups')}
        </span>
      )
    },
    {
      key: 'updatedAt',
      header: t('last_update', 'attribute_groups'),
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
    },
    {
      key: 'updatedBy',
      header: t('last_changed_by', 'attribute_groups'),
      render: (row) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {row.updatedBy ? (
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mr-2 text-xs font-medium">
                {row.updatedBy.name.charAt(0).toUpperCase()}
              </div>
              <span title={row.updatedBy.email}>{row.updatedBy.name}</span>
            </div>
          ) : (
            <span className="text-gray-400 italic">{t('unknown', 'attribute_groups')}</span>
          )}
        </div>
      )
    }
  ], [t, currentLanguage]);

  const renderActions = (group: AttributeGroup) => (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        className="p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900 rounded-md"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/attributeGroups/details/${group._id}`);
        }}
        title={t('view', 'attribute_groups')}
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
          handleDeleteClick(group._id, getEntityName(group, currentLanguage));
        }}
        title={t('delete', 'attribute_groups')}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </Button>
    </div>
  );

  // SEARCH COMPONENT
  const searchComponent = (
    <SearchForm
      onSearchInput={handleSearchInput}
      onSubmit={handleSearch}
      placeholder={t('search_attribute_groups', 'attribute_groups')}
      searchButtonText={t('search', 'attribute_groups')}
    />
  );

  // MAIN RENDER
  return (
    <>
      <ListPageLayout
        title={t('attribute_groups_title', 'attribute_groups')}
        description={t('manage_attribute_groups', 'attribute_groups')}
        icon={
          <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        }
        breadcrumbItems={[
          { label: t('attribute_groups_title', 'attribute_groups') }
        ]}
        onCreateClick={handleCreateAttributeGroup}
        createButtonText={t('new_attribute_group', 'attribute_groups')}
        stats={stats}
        searchComponent={searchComponent}
        error={error}
      >
        <Card>
          <Table
            columns={columns}
            data={attributeGroups || []}
            keyField="_id"
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onSort={handleSort}
            onFilter={handleFilter}
            onRowClick={handleRowClick}
            renderActions={renderActions}
            emptyMessage={
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('no_attribute_groups_found', 'attribute_groups')}</p>
                <div className="mt-4">
                  <Button
                    variant="primary"
                    className="inline-flex items-center"
                    onClick={handleCreateAttributeGroup}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {t('add_first_attribute_group', 'attribute_groups')}
                  </Button>
                </div>
              </div>
            }
          />
        </Card>
      </ListPageLayout>

      {/* Delete Confirmation Modal */}
      <ModalNotification
        isOpen={deleteModal.isOpen}
        type="warning"
        title="Öznitelik Grubunu Sil"
        message={`"${deleteModal.name}" öznitelik grubunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        onClose={cancelDelete}
        primaryButton={{
          text: "Sil",
          onClick: confirmDelete,
          variant: "error"
        }}
        secondaryButton={{
          text: "İptal",
          onClick: cancelDelete
        }}
      />
    </>
  );
};

export default AttributeGroupsListPage; 