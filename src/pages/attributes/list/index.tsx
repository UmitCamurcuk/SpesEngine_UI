import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../../components/ui/Table';
import type { TableColumn } from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import AttributeBadge from '../../../components/attributes/AttributeBadge';
import attributeService from '../../../services/api/attributeService';
import { Attribute, AttributeType } from '../../../types/attribute';
import { useTranslation } from '../../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../../utils/translationUtils';
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
const AttributesListPage: React.FC = () => {
  // HOOKS
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  const { showToast } = useNotification();

  // API service wrapper for useListPage hook
  const fetchAttributes = useCallback(async (params: any) => {
    const result = await attributeService.getAttributes(params);
    return {
      data: result.attributes || [],
      page: result.page || 1,
      limit: result.limit || 10,
      total: result.total || 0
    };
  }, []);

  const deleteAttribute = useCallback(async (id: string) => {
    await attributeService.deleteAttribute(id);
  }, []);

  // Use our custom hook
  const {
    data: attributes,
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
  } = useListPage<Attribute>({
    fetchFunction: fetchAttributes,
    deleteFunction: deleteAttribute,
    onDeleteSuccess: (deletedItem) => {
      showToast({
        title: 'Başarılı!',
        message: `"${getEntityName(deletedItem, currentLanguage)}" öznitelik başarıyla silindi.`,
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
  const handleRowClick = (attribute: Attribute) => {
    navigate(`/attributes/${attribute._id}`);
  };

  const handleCreateAttribute = () => {
    navigate('/attributes/create');
  };

  // STATISTICS
  const stats = useMemo(() => {
    const requiredCount = attributes.filter(attr => attr?.isRequired).length;
    const textCount = attributes.filter(attr => attr?.type === AttributeType.TEXT).length;
    const numberCount = attributes.filter(attr => attr?.type === AttributeType.NUMBER).length;
    const booleanCount = attributes.filter(attr => attr?.type === AttributeType.BOOLEAN).length;
    
    return [
      {
        title: 'Toplam Öznitelikler',
        value: pagination.total,
        icon: (
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        ),
        color: 'purple' as const
      },
      {
        title: 'Zorunlu Öznitelikler',
        value: requiredCount,
        icon: (
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        ),
        color: 'red' as const
      },
      {
        title: 'Metin Öznitelikleri',
        value: textCount,
        icon: (
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
        color: 'blue' as const
      },
      {
        title: 'Sayısal Öznitelikler',
        value: numberCount + booleanCount,
        icon: (
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
        ),
        color: 'green' as const
      }
    ];
  }, [attributes, pagination.total, currentLanguage]);

  // TABLE COLUMNS
  const columns: TableColumn<Attribute>[] = useMemo(() => [
    {
      key: 'name',
      header: 'Ad',
      sortable: true,
      filterable: true,
      render: (row) => (
        <div className="flex items-center">
          <div className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]" title={getEntityName(row, currentLanguage)}>
            {getEntityName(row, currentLanguage)}
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
      key: 'type',
      header: 'Tip',
      sortable: true,
      filterable: true,
      render: (row) => (
        <AttributeBadge type={row.type} />
      )
    },
    {
      key: 'isRequired',
      header: 'Zorunlu',
      sortable: true,
      filterable: true,
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.isRequired 
            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' 
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        }`}>
          {row.isRequired ? 'Zorunlu' : 'İsteğe Bağlı'}
        </span>
      )
    },
    {
      key: 'description',
      header: 'Açıklama',
      render: (row) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={getEntityDescription(row, currentLanguage)}>
          {getEntityDescription(row, currentLanguage) || <span className="text-gray-400 italic">Açıklama yok</span>}
        </div>
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
  const renderActions = (attribute: Attribute) => (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        className="p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900 rounded-md"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/attributes/${attribute._id}`);
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
          handleDeleteClick(attribute._id, getEntityName(attribute, currentLanguage));
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
      placeholder="Öznitelik adı, kod veya açıklama ara..."
      searchButtonText="Ara"
    />
  );

  // MAIN RENDER
  return (
    <>
      <ListPageLayout
        title="Öznitelikler"
        description="Tüm öznitelikleri görüntüleyin, düzenleyin ve yönetin"
        icon={
          <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        }
        breadcrumbItems={[
          { label: 'Öznitelikler' }
        ]}
        onCreateClick={handleCreateAttribute}
        createButtonText="Yeni Öznitelik Oluştur"
        stats={stats}
        searchComponent={searchComponent}
        error={error}
      >
        <Card>
          <Table
            columns={columns}
            data={attributes || []}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Henüz hiç öznitelik oluşturulmamış</p>
                <div className="mt-4">
                  <Button
                    variant="primary"
                    className="inline-flex items-center"
                    onClick={handleCreateAttribute}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    İlk Öznitelik Oluştur
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
        title="Öznitelik Sil"
        message={`"${deleteModal.name}" özniteliğini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
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

export default AttributesListPage; 