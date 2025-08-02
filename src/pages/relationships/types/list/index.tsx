import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../../../components/ui/Table';
import type { TableColumn } from '../../../../components/ui/Table';
import Button from '../../../../components/ui/Button';
import Badge from '../../../../components/ui/Badge';
import relationshipService from '../../../../services/api/relationshipService';
import { IRelationshipType } from '../../../../types/relationship';
import { useTranslation } from '../../../../context/i18nContext';
import ModalNotification from '../../../../components/notifications/ModalNotification';
import { useNotification } from '../../../../components/notifications';
import ListPageLayout from '../../../../components/layout/ListPageLayout';

import useListPage from '../../../../hooks/useListPage';

// UTILITY COMPONENTS
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden ${className}`}>
    {children}
  </div>
);

// MAIN COMPONENT
const RelationshipTypesListPage: React.FC = () => {
  // HOOKS
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  const { showToast } = useNotification();

  // API service wrapper for useListPage hook
  const fetchRelationshipTypes = useCallback(async (params: any) => {
    const result = await relationshipService.getAllRelationshipTypes();
    // API doesn't support pagination yet, so simulate it
    const data = Array.isArray(result) ? result : [];
    const startIndex = ((params.page || 1) - 1) * (params.limit || 10);
    const endIndex = startIndex + (params.limit || 10);
    const filteredData = params.search 
      ? data.filter(item => 
          item.name?.toLowerCase().includes(params.search.toLowerCase()) ||
          item.code?.toLowerCase().includes(params.search.toLowerCase()) ||
          item.description?.toLowerCase().includes(params.search.toLowerCase())
        )
      : data;
    
    return {
      data: filteredData.slice(startIndex, endIndex),
      page: params.page || 1,
      limit: params.limit || 10,
      total: filteredData.length
    };
  }, []);

  const deleteRelationshipType = useCallback(async (id: string) => {
    await relationshipService.deleteRelationshipType(id);
  }, []);

  // Use our custom hook
  const {
    data: relationshipTypes,
    isLoading,
    pagination,
    handlePageChange,
    handleSearchInput,
    handleSearch,
    handleSort,
    deleteModal,
    handleDeleteClick,
  } = useListPage<IRelationshipType>({
    fetchFunction: fetchRelationshipTypes,
    deleteFunction: deleteRelationshipType,
    onDeleteSuccess: (deletedItem) => {
      showToast({
        title: 'Başarılı!',
        message: `"${deletedItem.name}" ilişki tipi başarıyla silindi.`,
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
  const handleRowClick = (relationshipType: IRelationshipType) => {
    navigate(`/relationships/details/${relationshipType._id}`);
  };

  const handleCreateRelationshipType = () => {
    navigate('/relationships/create');
  };

  // STATISTICS
  const stats = useMemo(() => {
    const directionalCount = relationshipTypes.filter(rt => rt?.isDirectional).length;
    const bidirectionalCount = relationshipTypes.filter(rt => !rt?.isDirectional).length;
    
    return [
      {
        title: 'Toplam İlişki Tipleri',
        value: pagination.total,
        icon: (
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        ),
        color: 'blue',
        bgColor: 'bg-blue-100 dark:bg-blue-900/50'
      },
      {
        title: 'Yönlü İlişkiler',
        value: directionalCount,
        icon: (
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        ),
        color: 'green',
        bgColor: 'bg-green-100 dark:bg-green-900/50'
      },
      {
        title: 'Çift Yönlü İlişkiler',
        value: bidirectionalCount,
        icon: (
          <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        ),
        color: 'purple',
        bgColor: 'bg-purple-100 dark:bg-purple-900/50'
      }
    ];
  }, [relationshipTypes, pagination.total]);

  // TABLE COLUMNS
  const columns: TableColumn<IRelationshipType>[] = useMemo(() => [
    {
      key: 'name',
      header: 'İsim',
      sortable: true,
      render: (item) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              item.isDirectional 
                ? 'bg-green-100 dark:bg-green-900/50' 
                : 'bg-purple-100 dark:bg-purple-900/50'
            }`}>
              {item.isDirectional ? (
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {item.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {item.code}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'isDirectional',
      header: 'Yön',
      sortable: true,
      render: (item) => (
        <Badge color={item.isDirectional ? 'success' : 'secondary'}>
          {item.isDirectional ? 'Yönlü' : 'Çift Yönlü'}
        </Badge>
      )
    },
    {
      key: 'allowedSourceTypes',
      header: 'Kaynak Tipler',
      sortable: false,
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {Array.isArray(item.allowedSourceTypes) ? item.allowedSourceTypes.slice(0, 3).map((type, index) => (
            <Badge key={index} color="light" size="sm">
              {type}
            </Badge>
          )) : null}
          {Array.isArray(item.allowedSourceTypes) && item.allowedSourceTypes.length > 3 && (
            <Badge color="light" size="sm">
              +{item.allowedSourceTypes.length - 3}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'allowedTargetTypes',
      header: 'Hedef Tipler',
      sortable: false,
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {Array.isArray(item.allowedTargetTypes) ? item.allowedTargetTypes.slice(0, 3).map((type, index) => (
            <Badge key={index} color="light" size="sm">
              {type}
            </Badge>
          )) : null}
          {Array.isArray(item.allowedTargetTypes) && item.allowedTargetTypes.length > 3 && (
            <Badge color="light" size="sm">
              +{item.allowedTargetTypes.length - 3}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'description',
      header: 'Açıklama',
      sortable: false,
      render: (item) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 truncate block max-w-xs">
          {item.description || '-'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'İşlemler',
      sortable: false,
      render: (item) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/relationships/details/${item._id}`);
            }}
            className="flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Görüntüle
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(item);
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/50"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Sil
          </Button>
        </div>
      )
    }
  ], [navigate, handleDeleteClick]);

  return (
    <ListPageLayout 
      title="İlişkiler"
      breadcrumbItems={[
        { label: 'Ana Sayfa', path: '/' },
        { label: 'İlişkiler' }
      ]}
    >
      {/* BREADCRUMB */}
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
            İlişki Tipleri
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Sistem genelinde kullanılan ilişki tiplerini yönetin
          </p>
        </div>
        <div className="flex flex-shrink-0 space-x-4">
          <Button
            variant="primary"
            className="flex items-center"
            onClick={handleCreateRelationshipType}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Yeni İlişki Tipi
          </Button>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${stat.bgColor} rounded-md p-3`}>
                {stat.icon}
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {stat.title}
                </h3>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* SEARCH AND FILTERS */}
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="İlişki tipi ara (isim, kod, açıklama)..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              onChange={handleSearchInput}
            />
            <Button variant="primary" onClick={() => handleSearch()}>
              Ara
            </Button>
          </div>
        </div>
      </Card>

      {/* TABLE */}
      <Card>
        <Table
          columns={columns}
          data={relationshipTypes}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          onSort={handleSort}
          pagination={pagination}
          onPageChange={handlePageChange}
          emptyMessage={
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Henüz ilişki tipi bulunmuyor
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                İlk ilişki tipinizi oluşturmak için "Yeni İlişki Tipi" butonuna tıklayın.
              </p>
              <Button variant="primary" onClick={handleCreateRelationshipType}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                İlk İlişki Tipini Oluştur
              </Button>
            </div>
          }
        />
      </Card>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal.isOpen && (
        <ModalNotification 
          isOpen={deleteModal.isOpen}
          onClose={() => {}}
          type="error"
          title="İlişki Tipini Sil"
          message={`"${deleteModal.name}" ilişki tipini silmek istediğinizden emin misiniz?`}
        />
      )}
    </ListPageLayout>
  );
};

export default RelationshipTypesListPage;