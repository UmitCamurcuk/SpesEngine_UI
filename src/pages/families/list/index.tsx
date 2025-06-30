import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../../components/ui/Table';
import type { TableColumn } from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import familyService from '../../../services/api/familyService';
import type { Family } from '../../../types/family';
import { useTranslation } from '../../../context/i18nContext';
import { getEntityName } from '../../../utils/translationUtils';
import ModalNotification from '../../../components/notifications/ModalNotification';
import { useNotification } from '../../../components/notifications';
import ListPageLayout from '../../../components/layout/ListPageLayout';
import SearchForm from '../../../components/common/SearchForm';
import useListPage from '../../../hooks/useListPage';

// UTILITY COMPONENTS
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden ${className}`}>
    {children}
  </div>
);

// MAIN COMPONENT
const FamiliesListPage: React.FC = () => {
  // HOOKS
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  const { showToast } = useNotification();

  // API service wrapper for useListPage hook
  const fetchFamilies = useCallback(async (params: any) => {
    const result = await familyService.getFamilies(params);
    return {
      data: result.families || [],
      page: result.page || 1,
      limit: result.limit || 10,
      total: result.total || 0
    };
  }, []);

  const deleteFamily = useCallback(async (id: string) => {
    await familyService.deleteFamily(id);
  }, []);

  // Use our custom hook
  const {
    data: families,
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
  } = useListPage<Family>({
    fetchFunction: fetchFamilies,
    deleteFunction: deleteFamily,
    onDeleteSuccess: (deletedItem) => {
      showToast({
        title: 'Başarılı!',
        message: `"${getEntityName(deletedItem, currentLanguage) || deletedItem.name}" aile başarıyla silindi.`,
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
  const handleRowClick = (family: Family) => {
    navigate(`/families/details/${family._id}`);
  };
  
  const handleCreateFamily = () => {
    navigate('/families/create');
  };
  
  // STATISTICS
  const stats = useMemo(() => {
    const activeCount = families.filter(family => family?.isActive).length;
    const withParentCount = families.filter(family => family?.parentFamily).length;
    const withAttributeGroupsCount = families.filter(family => family?.attributeGroups && family.attributeGroups.length > 0).length;
    
    return [
      {
        title: 'Toplam Aileler',
        value: pagination.total,
        icon: (
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
        ),
        color: 'purple' as const
      },
      {
        title: 'Aktif Aileler',
        value: activeCount,
        icon: (
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'green' as const
      },
      {
        title: 'Alt Aileler',
        value: withParentCount,
        icon: (
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        ),
        color: 'blue' as const
      },
      {
        title: 'Öznitelik Gruplu',
        value: withAttributeGroupsCount,
        icon: (
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        ),
        color: 'yellow' as const
      }
    ];
  }, [families, pagination.total, currentLanguage]);

  // TABLE COLUMNS
  const columns: TableColumn<Family>[] = useMemo(() => [
    {
      key: 'name',
      header: 'Ad',
      sortable: true,
      filterable: true,
      render: (row) => (
        <div className="flex items-center">
          <div className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]" title={getEntityName(row, currentLanguage) || row.name}>
            {getEntityName(row, currentLanguage) || row.name}
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
      key: 'parentFamily',
      header: 'Üst Aile',
      render: (row) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {row.parentFamily ? row.parentFamily : <span className="text-gray-400 italic">Ana Aile</span>}
        </div>
      )
    },
    {
      key: 'isActive',
      header: 'Durum',
      sortable: true,
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
  ], [currentLanguage]);

  // Tablo için işlem butonları
  const renderActions = (family: Family) => (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        className="p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900 rounded-md"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/families/details/${family._id}`);
        }}
        title="Detayları Görüntüle"
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
          handleDeleteClick(family._id, getEntityName(family, currentLanguage) || family.name);
        }}
        title="Sil"
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
      placeholder="Aile adı, kod veya açıklama ara..."
      searchButtonText="Ara"
    />
  );

  // MAIN RENDER
  return (
    <>
      <ListPageLayout
        title="Ürün Aileleri"
        description="Tüm ürün ailelerini görüntüleyin, düzenleyin ve yönetin"
        icon={
          <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
        }
        breadcrumbItems={[
          { label: 'Aileler' }
        ]} 
        onCreateClick={handleCreateFamily}
        createButtonText="Yeni Aile Oluştur"
        stats={stats}
        searchComponent={searchComponent}
        error={error}
      >
      <Card>
        <Table
          columns={columns}
            data={families || []}
          keyField="_id"
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSort={handleSort}
          onFilter={handleFilter}
          renderActions={renderActions}
          onRowClick={handleRowClick}
            emptyMessage={
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Henüz hiç aile oluşturulmamış</p>
                <div className="mt-4">
                  <Button
                    variant="primary"
                    className="inline-flex items-center"
                    onClick={handleCreateFamily}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    İlk Aile Oluştur
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
        title="Aile Sil"
        message={`"${deleteModal.name}" ailesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
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

export default FamiliesListPage; 