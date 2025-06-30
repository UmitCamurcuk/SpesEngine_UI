import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import Button from '../ui/Button';

// INTERFACES
interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface StatItem {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'purple' | 'green' | 'blue' | 'yellow' | 'red';
}

interface ListPageLayoutProps {
  // Header
  title: string;
  description?: string;
  icon?: React.ReactNode;
  breadcrumbItems: BreadcrumbItem[];
  
  // Actions
  onCreateClick?: () => void;
  createButtonText?: string;
  
  // Statistics
  stats?: StatItem[];
  
  // Search
  searchComponent?: React.ReactNode;
  
  // Content
  children: React.ReactNode;
  
  // Error
  error?: string | null;
}

// UTILITY COMPONENTS
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

// Color schemes for stats cards
const getStatCardColors = (color: StatItem['color']) => {
  const colorMap = {
    purple: 'from-purple-500 to-purple-600 bg-purple-500',
    green: 'from-green-500 to-green-600 bg-green-500',
    blue: 'from-blue-500 to-blue-600 bg-blue-500',
    yellow: 'from-yellow-500 to-yellow-600 bg-yellow-500',
    red: 'from-red-500 to-red-600 bg-red-500',
  };
  return colorMap[color];
};

// MAIN COMPONENT
const ListPageLayout: React.FC<ListPageLayoutProps> = ({
  title,
  description,
  icon,
  breadcrumbItems,
  onCreateClick,
  createButtonText = 'Yeni Oluştur',
  stats = [],
  searchComponent,
  error,
  children,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
        {/* BREADCRUMB */}
        <div className="hidden sm:block">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* HEADER SECTION */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
          <div className="px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center">
                  {icon && (
                    <div className="flex-shrink-0 mr-3">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white">
                        {icon}
                      </div>
                    </div>
                  )}
                  <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                      {title}
                    </h1>
                    {description && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {onCreateClick && (
                <div className="flex-shrink-0">
                  <Button
                    className="w-full sm:w-auto flex items-center justify-center"
                    onClick={onCreateClick}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="hidden sm:inline">{createButtonText}</span>
                    <span className="sm:hidden">Yeni</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* STATISTICS CARDS */}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
                <div className="p-3 sm:p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-r ${getStatCardColors(stat.color)} flex items-center justify-center text-white`}>
                        {stat.icon}
                      </div>
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {stat.title}
                      </p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SEARCH SECTION */}
        {searchComponent && (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
            <div className="p-4 sm:p-6">
              {searchComponent}
            </div>
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Hata oluştu
                </p>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListPageLayout; 