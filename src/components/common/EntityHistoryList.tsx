import React, { useState, useEffect } from 'react';
import AttributeHistoryItem from '../attributes/AttributeHistoryItem';
import historyService from '../../services/api/historyService';
import { History, HistoryApiParams } from '../../types/history';
import Button from '../ui/Button';

interface EntityHistoryListProps {
  entityId: string;
  entityType?: string;
  title?: string;
}

const EntityHistoryList: React.FC<EntityHistoryListProps> = ({ 
  entityId, 
  entityType = 'attribute',
  title = 'İşlem Geçmişi'
}) => {
  const [historyItems, setHistoryItems] = useState<History[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    pages: 0
  });
  
  // History kayıtlarını getir
  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params: HistoryApiParams = {
        page: pagination.page,
        limit: pagination.limit,
        sort: 'createdAt',
        direction: 'desc'
      };
      
      const result = await historyService.getEntityHistory(entityId, params);
      
      setHistoryItems(result.history);
      setPagination({
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages
      });
    } catch (err: any) {
      setError(err.message || 'Geçmiş kayıtları getirilirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Component mount olduğunda ve pagination değiştiğinde verileri getir
  useEffect(() => {
    if (entityId) {
      fetchHistory();
    }
  }, [entityId, pagination.page, pagination.limit]);
  
  // Sayfa değiştirme işleyicisi
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };
  
  // Yenile butonu işleyicisi
  const handleRefresh = () => {
    fetchHistory();
  };
  
  if (isLoading && historyItems.length === 0) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-light border-t-transparent dark:border-primary-dark dark:border-t-transparent"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg text-red-700 dark:text-red-400">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Tekrar Dene
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Başlık ve Yenile Butonu */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <svg className="w-5 h-5 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {title}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          loading={isLoading}
          className="flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Yenile
        </Button>
      </div>
      
      {historyItems.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">İşlem geçmişi bulunamadı</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Bu kayıt için henüz işlem geçmişi kaydedilmemiş.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {historyItems.map(item => (
            <AttributeHistoryItem key={item._id} history={item} />
          ))}
        </div>
      )}
      
      {/* Sayfalama */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || isLoading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            
            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter(page => {
                // İlk, son ve mevcut sayfa etrafındaki 1 sayfayı göster
                return (
                  page === 1 ||
                  page === pagination.pages ||
                  Math.abs(page - pagination.page) <= 1
                );
              })
              .map((page, index, array) => {
                // Gerekli yerlere ayırıcı ekle
                const needsSeparatorBefore = index > 0 && page - array[index - 1] > 1;
                
                return (
                  <React.Fragment key={page}>
                    {needsSeparatorBefore && (
                      <span className="px-2 py-1 text-gray-500 dark:text-gray-400">...</span>
                    )}
                    <Button
                      variant={page === pagination.page ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      disabled={isLoading}
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                );
              })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages || isLoading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default EntityHistoryList; 