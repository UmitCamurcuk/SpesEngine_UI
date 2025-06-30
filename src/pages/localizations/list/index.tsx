import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../components/notifications';
import { useListPage } from '../../../hooks/useListPage';
import { ListPageLayout } from '../../../components/layout';
import { SearchForm } from '../../../components/common';
import { Table, Button } from '../../../components/ui';
import { TableColumn } from '../../../components/ui/Table';
import localizationService from '../../../services/api/localizationService';

interface ProcessedTranslation {
  _id: string;
  namespace: string;
  key: string;
  translations: Record<string, string>;
  languageCount: number;
  totalValues: number;
}

const LocalizationsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();

  // Wrapper function to adapt localization service to useListPage interface
  const fetchLocalizationsWrapper = useCallback(async (params: any) => {
    const result = await localizationService.getLocalizations(params);
    
    // Process the localization data
    const translationMap = new Map<string, ProcessedTranslation>();
    const localizations = result.localizations || result.data || result;
    
    if (Array.isArray(localizations)) {
      localizations.forEach((localization: any) => {
        const key = `${localization.namespace || 'default'}.${localization.key}`;
        
        if (!translationMap.has(key)) {
          translationMap.set(key, {
            _id: localization._id || key,
            namespace: localization.namespace || 'default',
            key: localization.key,
            translations: {},
            languageCount: 0,
            totalValues: 0
          });
        }
        
        const translation = translationMap.get(key)!;
        translation.translations[localization.language] = localization.value;
        translation.languageCount++;
        translation.totalValues++;
      });
    }
    
    const processedData = Array.from(translationMap.values());
    
    return {
      data: processedData,
      page: result.pagination?.currentPage || params?.page || 1,
      limit: params?.limit || 10,
      total: result.total || processedData.length
    };
  }, []);

  const {
    data: localizations = [],
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
    fetchFunction: fetchLocalizationsWrapper,
    deleteFunction: localizationService.deleteLocalization,
    onDeleteSuccess: (localization) => {
      showToast({
        type: 'success',
        title: 'Başarılı',
        message: `${localization.namespace}.${localization.key} başarıyla silindi`
      });
    },
    onDeleteError: (error) => {
      showToast({
        type: 'error',
        title: 'Hata',
        message: 'Çeviri silinirken hata oluştu: ' + error
      });
    }
  });

  // Safe array operations
  const safeLocalizations = Array.isArray(localizations) ? localizations : [];

  // Tablo sütunları
  const columns: TableColumn<ProcessedTranslation>[] = [
    {
      key: 'namespace',
      header: 'Namespace',
      render: (localization: ProcessedTranslation) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {localization.namespace}
        </div>
      )
    },
    {
      key: 'key',
      header: 'Anahtar',
      render: (localization: ProcessedTranslation) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
          {localization.key}
        </div>
      )
    },
    {
      key: '_id',
      header: 'İşlemler',
      render: (localization: ProcessedTranslation) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/localizations/details/${localization._id}`);
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
              handleDeleteClick(localization._id);
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

  return (
    <ListPageLayout
      title="Çeviriler"
      description="Sistem çevirilerini görüntüleyin ve yönetin"
      icon={
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clipRule="evenodd" />
        </svg>
      }
      breadcrumbItems={[
        { label: 'Ana Sayfa', path: '/' },
        { label: 'Çeviriler' }
      ]}
      onCreateClick={() => navigate('/localizations/create')}
      createButtonText="Yeni Çeviri"
      searchComponent={
        <SearchForm
          onSearchInput={handleSearchInput}
          onSubmit={handleSearch}
          placeholder="Çeviri ara..."
          searchButtonText="Ara"
        />
      }
      error={error}
    >
      <Table
        columns={columns}
        data={safeLocalizations}
        isLoading={isLoading}
        emptyMessage="Gösterilecek çeviri bulunamadı"
        onRowClick={(localization) => navigate(`/localizations/details/${localization._id}`)}
        pagination={{
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total || 0
        }}
        onPageChange={handlePageChange}
      />
    </ListPageLayout>
  );
};

export default LocalizationsListPage; 