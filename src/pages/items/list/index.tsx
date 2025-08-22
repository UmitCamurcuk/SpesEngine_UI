import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../../components/ui/Table';
import type { TableColumn } from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import itemService from '../../../services/api/itemService';
import type { Item } from '../../../types/item';
import { useTranslation } from '../../../context/i18nContext';
import { getEntityName } from '../../../utils/translationUtils';
import ModalNotification from '../../../components/notifications/ModalNotification';
import { useNotification } from '../../../components/notifications';
import ListPageLayout from '../../../components/layout/ListPageLayout';
import SearchForm from '../../../components/common/SearchForm';
import useListPage from '../../../hooks/useListPage';
import UserDisplay from '../../../components/common/UserDisplay';

// UTILITY COMPONENTS
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden ${className}`}>
    {children}
  </div>
);

// MAIN COMPONENT
const ItemsListPage: React.FC = () => {
  // HOOKS
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  const { showToast } = useNotification();

  // API service wrapper for useListPage hook
  const fetchItems = useCallback(async (params: any) => {
    const result = await itemService.getItems(params);
    return {
      data: result.items || [],
      page: result.page || 1,
      limit: result.limit || 10,
      total: result.total || 0
    };
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    await itemService.deleteItem(id);
  }, []);

  // Use our custom hook
  const {
    data: items,
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
  } = useListPage<Item>({
    fetchFunction: fetchItems,
    deleteFunction: deleteItem,
    onDeleteSuccess: (deletedItem) => {
      showToast({
        title: 'Başarılı!',
        message: `Öğe başarıyla silindi.`,
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
  const handleRowClick = (item: Item) => {
    navigate(`/items/details/${item._id}`);
  };

  const handleCreateItem = () => {
    navigate('/items/create');
  };

  // STATISTICS
  const stats = useMemo(() => {
    const activeCount = items.filter(item => item?.isActive).length;
    const itemTypeCount = items.filter(item => item?.itemType).length;
    const familyCount = items.filter(item => item?.family).length;
    
    return [
      {
        title: 'Toplam Öğeler',
        value: pagination.total,
        icon: (
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        ),
        color: 'purple' as const
      },
      {
        title: 'Aktif Öğeler',
        value: activeCount,
        icon: (
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'green' as const
      },
      {
        title: 'Tipli Öğeler',
        value: itemTypeCount,
        icon: (
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        ),
        color: 'blue' as const
      },
      {
        title: 'Aile Atanmış',
        value: familyCount,
        icon: (
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
        ),
        color: 'yellow' as const
      }
    ];
  }, [items, pagination.total, currentLanguage]);

  // TABLE COLUMNS
  const columns: TableColumn<Item>[] = useMemo(() => [
    {
      key: 'category',
      header: 'Kategori',
      sortable: true,
      filterable: true,
      render: (row) => {
        const category = row.category;
        if (typeof category === 'object' && category) {
          const categoryName = getEntityName(category, currentLanguage || 'tr');
          return (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {categoryName || 'Kategori yok'}
            </div>
          );
        } else {
          return (
            <div className="text-sm text-gray-400 italic">
              Kategori yok
            </div>
          );
        }
      }
    },
    {
      key: 'family',
      header: 'Aile',
      sortable: true,
      filterable: true,
      render: (row) => {
        const family = row.family;
        if (typeof family === 'object' && family) {
          const familyName = getEntityName(family, currentLanguage || 'tr');
          return (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {familyName || 'Aile yok'}
            </div>
          );
        } else {
          return (
            <div className="text-sm text-gray-400 italic">
              Aile yok
            </div>
          );
        }
      }
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
      key: 'createdBy',
      header: 'Oluşturan',
      sortable: true,
      render: (row) => {
        const createdBy = row.createdBy;
        const createdAt = row.createdAt;
        
        return (
          <UserDisplay 
            user={typeof createdBy === 'object' ? createdBy : null}
            showEmail={true}
            showDate={true}
            date={createdAt}
            size="sm"
            variant="created"
          />
        );
      }
    },
    {
      key: 'updatedBy',
      header: 'Güncelleyen',
      sortable: true,
      render: (row) => {
        const updatedBy = row.updatedBy;
        const updatedAt = row.updatedAt;
        
        return (
          <UserDisplay 
            user={typeof updatedBy === 'object' ? updatedBy : null}
            showEmail={true}
            showDate={true}
            date={updatedAt}
            size="sm"
            variant="updated"
          />
        );
      }
    }
  ], [currentLanguage]);

  // Tablo için işlem butonları
  const renderActions = (item: Item) => (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        className="p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900 rounded-md"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/items/details/${item._id}`);
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
          handleDeleteClick(item._id, `${item.itemType ? (typeof item.itemType === 'object' ? (item.itemType as any).name : item.itemType) : 'Öğe'}`);
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
      placeholder="Kategori, aile, oluşturan veya özellik ara..."
      searchButtonText="Ara"
    />
  );

  // MAIN RENDER
  return (
    <>
      <ListPageLayout
        title="Öğeler"
        description="Tüm öğeleri görüntüleyin, düzenleyin ve yönetin"
        icon={
          <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        }
        breadcrumbItems={[
          { label: 'Öğeler' }
        ]}
        onCreateClick={handleCreateItem}
        createButtonText="Yeni Öğe Oluştur"
        stats={stats}
        searchComponent={searchComponent}
        error={error}
      >
        <Card>
          <Table
            columns={columns}
            data={items || []}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Henüz hiç öğe oluşturulmamış</p>
                <div className="mt-4">
                  <Button
                    variant="primary"
                    className="inline-flex items-center"
                    onClick={handleCreateItem}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    İlk Öğe Oluştur
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
        title="Öğe Sil"
        message={`"${deleteModal.name}" öğesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
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

export default ItemsListPage; 