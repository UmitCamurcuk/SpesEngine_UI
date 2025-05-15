import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  showInfo?: boolean;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showInfo = true,
  className = '',
}) => {
  // Sayfa butonlarını oluştur (maksimum 5 sayfa göster)
  const renderPageButtons = () => {
    const buttons = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Eğer 5'ten az sayfa gösterilecekse, başlangıç sayfasını ayarla
    if (endPage - startPage < 4 && totalPages > 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    // İlk sayfa düğmesi
    if (startPage > 1) {
      buttons.push(
        <button
          key="first"
          onClick={() => onPageChange(1)}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          1
        </button>
      );
      
      // İlk sayfadan hemen sonra gelmeyen sayfalar için üç nokta
      if (startPage > 2) {
        buttons.push(
          <span
            key="ellipsis1"
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            ...
          </span>
        );
      }
    }
    
    // Sayfa düğmeleri
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          aria-current={currentPage === i ? 'page' : undefined}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
            currentPage === i
              ? 'z-10 bg-primary-light dark:bg-primary-dark border-primary-light dark:border-primary-dark text-white'
              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Son sayfadan önce gelmeyen sayfalar için üç nokta
    if (endPage < totalPages - 1) {
      buttons.push(
        <span
          key="ellipsis2"
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          ...
        </span>
      );
    }
    
    // Son sayfa düğmesi (eğer zaten gösterilmediyse)
    if (endPage < totalPages) {
      buttons.push(
        <button
          key="last"
          onClick={() => onPageChange(totalPages)}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          {totalPages}
        </button>
      );
    }
    
    return buttons;
  };
  
  // Eğer toplam sayfa 1 veya daha azsa, sayfalama gösterme
  if (totalPages <= 1) {
    return null;
  }
  
  return (
    <div className={`flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0 ${className}`}>
      {/* Gösterilen öğeler hakkında bilgi */}
      {showInfo && totalItems !== undefined && itemsPerPage !== undefined && (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span>
          {' - '}
          <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span>
          {' / '}
          <span className="font-medium">{totalItems}</span> öğe gösteriliyor
        </div>
      )}
      
      {/* Sayfalama butonları */}
      <div className="inline-flex -space-x-px overflow-hidden">
        {/* Önceki sayfa butonu */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 ${
            currentPage <= 1
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          <span className="sr-only">Önceki</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Sayfa numaraları */}
        {renderPageButtons()}
        
        {/* Sonraki sayfa butonu */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 ${
            currentPage >= totalPages
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          <span className="sr-only">Sonraki</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Pagination; 