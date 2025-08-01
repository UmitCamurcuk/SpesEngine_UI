import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Table from '../../../components/ui/Table';
import type { TableColumn } from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import itemService from '../../../services/api/itemService';
import itemTypeService from '../../../services/api/itemTypeService';
import type { Item } from '../../../types/item';
import type { ItemType } from '../../../types/itemType';
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
const DynamicItemListPage: React.FC = () => {
  // HOOKS
  const { itemTypeCode } = useParams<{ itemTypeCode: string }>();
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  const { showToast } = useNotification();

  // Basit attribute render fonksiyonu
  const renderAttributeValue = (value: any, attribute: any) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic">-</span>;
    }

    switch (attribute.type) {
      case 'boolean':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {value ? 'Evet' : 'Hayır'}
          </span>
        );
      case 'date':
        return new Date(value).toLocaleDateString('tr-TR');
      case 'datetime':
        return new Date(value).toLocaleString('tr-TR');
      case 'number':
      case 'integer':
      case 'decimal':
        return (
          <span className="font-mono">
            {typeof value === 'number' ? value.toLocaleString('tr-TR') : value}
          </span>
        );
      default:
        return <span className="whitespace-pre-wrap">{String(value)}</span>;
    }
  };

  // State
  const [itemType, setItemType] = useState<ItemType | null>(null);
  const [isLoadingItemType, setIsLoadingItemType] = useState(true);
  const [tableModal, setTableModal] = useState<{
    isOpen: boolean;
    data: any[][];
    columns: string[];
    title: string;
  }>({
    isOpen: false,
    data: [],
    columns: [],
    title: ''
  });

  // ItemType bilgilerini yükle
  useEffect(() => {
    const fetchItemType = async () => {
      if (!itemTypeCode) return;
      
      try {
        setIsLoadingItemType(true);
        // Code'a göre direkt ItemType'ı getir
        const detailedItemType = await itemTypeService.getItemTypeByCode(itemTypeCode, {
          includeAttributes: true,
          includeAttributeGroups: true,
          populateAttributeGroupsAttributes: true
        });
        setItemType(detailedItemType);
      } catch (error: any) {
        console.error('ItemType yüklenirken hata:', error);
        showToast({
          type: 'error',
          title: 'Hata!',
          message: `${itemTypeCode} kodlu öğe tipi bulunamadı.`
        });
        navigate('/items/list');
      } finally {
        setIsLoadingItemType(false);
      }
    };

    fetchItemType();
  }, [itemTypeCode, navigate, showToast]);

  // API service wrapper for useListPage hook
  const fetchItems = useCallback(async (params: any) => {
    if (!itemType) return { data: [], page: 1, limit: 10, total: 0 };
    
    // ItemType'a göre filtrele
    const result = await itemService.getItems({
      ...params,
      itemType: itemType._id
    });
    
    // Debug için console.log ekleyelim
    console.log('API Response:', result);
    if (result.items && result.items.length > 0) {
      console.log('First item createdBy:', result.items[0].createdBy);
      console.log('First item updatedBy:', result.items[0].updatedBy);
    }
    
    return {
      data: result.items || [],
      page: result.page || 1,
      limit: result.limit || 10,
      total: result.total || 0
    };
  }, [itemType]);

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
    navigate('/items/create', { 
      state: { preselectedItemType: itemType } 
    });
  };

  // Dinamik sütunlar - Sadece ItemType settings'den al
  const columns = useMemo((): TableColumn<Item>[] => {
    if (!itemType) return [];

    // Sadece ItemType settings'deki tableColumns'dan sütunları al
    if (itemType.settings?.display?.tableColumns) {
      return itemType.settings.display.tableColumns
        .filter(col => col.visible)
        .sort((a, b) => a.order - b.order)
        .map(col => {
          // Default sütunlar için render fonksiyonları
          const getDefaultRender = (key: string) => {
            switch (key) {
              case 'itemType':
                return (row: Item) => {
                  const itemTypeData = typeof row.itemType === 'object' ? row.itemType : null;
                  return itemTypeData ? getEntityName(itemTypeData, currentLanguage) : 'N/A';
                };
              case 'family':
                return (row: Item) => {
                  const familyData = typeof row.family === 'object' ? row.family : null;
                  return familyData ? getEntityName(familyData, currentLanguage) : 'N/A';
                };
              case 'category':
                return (row: Item) => {
                  const categoryData = typeof row.category === 'object' ? row.category : null;
                  return categoryData ? getEntityName(categoryData, currentLanguage) : 'N/A';
                };
              case 'createdBy':
                return (row: Item) => {
                  const createdByData = typeof row.createdBy === 'object' ? row.createdBy : null;
                  return createdByData ? `${createdByData.firstName || ''} ${createdByData.lastName || ''}`.trim() : 'N/A';
                };
              case 'updatedBy':
                return (row: Item) => {
                  const updatedByData = typeof row.updatedBy === 'object' ? row.updatedBy : null;
                  return updatedByData ? `${updatedByData.firstName || ''} ${updatedByData.lastName || ''}`.trim() : 'N/A';
                };
              case 'createdAt':
                return (row: Item) => new Date(row.createdAt).toLocaleDateString('tr-TR');
              case 'updatedAt':
                return (row: Item) => new Date(row.updatedAt).toLocaleDateString('tr-TR');
              default:
                return () => 'N/A';
            }
          };
          
          // Default sütunlar için
          if (['itemType', 'family', 'category', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'].includes(col.key)) {
            return {
              key: col.key,
              header: col.title,
              sortable: col.sortable ?? true,
              filterable: col.filterable ?? true,
              render: getDefaultRender(col.key)
            };
          }
          
          // Attribute sütunları için - ItemType'dan attribute bilgisini al
          const attributeInfo = itemType.attributes?.find((attr: any) => attr._id === col.key);
          
          return {
            key: col.key,
            header: col.title,
            sortable: col.sortable ?? true,
            filterable: col.filterable ?? true,
            render: (row) => {
              if (!row.attributes || !Array.isArray(row.attributes)) {
                return '-';
              }
              
              // Yeni array formatında attribute'u bul
              const attributeData = row.attributes.find((attr: any) => attr._id === col.key);
              
              if (!attributeData) {
                return '-';
              }
              
              // Eğer değer başka bir attribute'un ID'si ise ve referencedValue varsa
              if (attributeData.referencedValue) {
                return getEntityName(attributeData.referencedValue, currentLanguage);
              }
              
              // Table tipindeki attribute'lar için özel render
              if (attributeData.type === 'table' && Array.isArray(attributeData.value)) {
                const rowCount = attributeData.value.length;
                const columnCount = attributeData.value[0]?.length || 0;
                
                return (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {rowCount} Satır, {columnCount} Sütun
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTableModal({
                          isOpen: true,
                          data: attributeData.value,
                          columns: attributeInfo?.validations?.columns?.map((col: any) => col.name) || [],
                          title: getEntityName(attributeInfo, currentLanguage)
                        });
                      }}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      title="Tabloyu görüntüle"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                );
              }
              
              // Diğer attribute tipleri için normal render
              return renderAttributeValue(attributeData.value, {
                _id: attributeData._id,
                name: attributeData.name,
                type: attributeData.type,
                options: attributeData.options
              });
            }
          };
        });
    }

    return [];
  }, [itemType, currentLanguage, t, renderAttributeValue]);

  // Stats
  const stats = useMemo(() => {
    if (!items) return [];
    
    const totalItems = items.length;
    const activeItems = items.filter(item => item.isActive).length;
    const inactiveItems = totalItems - activeItems;

    return [
      {
        title: t('total_items', 'items'),
        value: totalItems,
        change: '+0%',
        changeType: 'neutral' as const,
        color: 'blue' as const,
        icon: (
          <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        )
      },
      {
        title: t('active_items', 'items'),
        value: activeItems,
        change: '+0%',
        changeType: 'positive' as const,
        color: 'green' as const,
        icon: (
          <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      {
        title: t('inactive_items', 'items'),
        value: inactiveItems,
        change: '+0%',
        changeType: 'negative' as const,
        color: 'red' as const,
        icon: (
          <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      }
    ];
  }, [items, t]);

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

  // Loading state
  if (isLoadingItemType) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!itemType) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Öğe tipi bulunamadı</h2>
          <p className="text-gray-500 dark:text-gray-400">Belirtilen öğe tipi mevcut değil.</p>
        </div>
      </div>
    );
  }

  // MAIN RENDER
  return (
    <>
      <ListPageLayout
        title={itemType.settings?.display?.listTitle || `${getEntityName(itemType, currentLanguage)} Öğeleri`}
        description={itemType.settings?.display?.listDescription || `Tüm ${getEntityName(itemType, currentLanguage)} öğelerini görüntüleyin, düzenleyin ve yönetin`}
        icon={
          <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        }
        breadcrumbItems={[
          { label: t('items', 'common'), path: '/items/list' },
          { label: getEntityName(itemType, currentLanguage) }
        ]}
        onCreateClick={handleCreateItem}
        createButtonText={`Yeni ${getEntityName(itemType, currentLanguage)} Oluştur`}
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
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Henüz hiç {getEntityName(itemType, currentLanguage)} öğesi oluşturulmamış
                </p>
                <div className="mt-4">
                  <Button
                    variant="primary"
                    className="inline-flex items-center"
                    onClick={handleCreateItem}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    İlk {getEntityName(itemType, currentLanguage)} Oluştur
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
        onClose={cancelDelete}
        type="warning"
        title="Öğe Silme Onayı"
        message={`"${deleteModal.name}" adlı öğeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        primaryButton={{
          text: 'Sil',
          onClick: confirmDelete,
          variant: 'error'
        }}
        secondaryButton={{
          text: 'İptal',
          onClick: cancelDelete
        }}
      />

      {/* Table Data Modal */}
      <ModalNotification
        isOpen={tableModal.isOpen}
        onClose={() => setTableModal(prev => ({ ...prev, isOpen: false }))}
        type="info"
        title={tableModal.title}
        message=""
        customContent={
          <div className="mt-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {tableModal.columns.map((column, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableModal.data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        }
        primaryButton={{
          text: 'Kapat',
          onClick: () => setTableModal(prev => ({ ...prev, isOpen: false })),
          variant: 'primary'
        }}
      />
    </>
  );
};

export default DynamicItemListPage; 