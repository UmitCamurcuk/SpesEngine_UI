import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../common/Breadcrumb';
import Button from '../ui/Button';

// INTERFACES
interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface DetailsPageLayoutProps {
  // Header
  title: string | ReactNode;
  subtitle?: string;
  breadcrumbItems: BreadcrumbItem[];
  
  // Navigation
  backLink: string;
  backButtonText: string;
  
  // Actions
  actions?: ReactNode;
  
  // Tabs
  tabs?: Array<{
    key: string;
    label: string;
    icon?: ReactNode;
    count?: number;
  }>;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  
  // Content
  children: ReactNode;
  
  // Status
  isLoading?: boolean;
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

// MAIN COMPONENT
const DetailsPageLayout: React.FC<DetailsPageLayoutProps> = ({
  title,
  subtitle,
  breadcrumbItems,
  backLink,
  backButtonText,
  actions,
  tabs,
  activeTab,
  onTabChange,
  children,
  isLoading,
  error
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-light border-t-transparent dark:border-primary-dark dark:border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-2">
          <svg className="w-6 h-6 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold">Hata</h3>
        </div>
        <p className="mb-3">{error}</p>
        <Link to={backLink}>
          <Button variant="outline" className="mt-2">
            {backButtonText}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* BREADCRUMB */}
      <div className="flex items-center justify-between">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Link to={backLink} className="mr-4">
            <Button variant="outline" size="sm" className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {backButtonText}
            </Button>
          </Link>
          <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/50 
                         flex items-center justify-center mr-3">
            <svg className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            {typeof title === 'string' ? (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
            ) : (
              title
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>

      {/* TABS */}
      {tabs && tabs.length > 0 && (
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => onTabChange?.(tab.key)}
              >
                <div className="flex items-center">
                  {tab.icon && <span className="h-4 w-4 mr-2">{tab.icon}</span>}
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-1">({tab.count})</span>
                  )}
                </div>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* CONTENT */}
      {children}
    </div>
  );
};

export default DetailsPageLayout; 