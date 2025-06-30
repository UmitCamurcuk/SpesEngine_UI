import React, { ReactNode } from 'react';
import Breadcrumb from '../common/Breadcrumb';
import Button from '../ui/Button';
import Stepper from '../ui/Stepper';

// INTERFACES
interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface Step {
  title: string;
  description: string;
}

interface CreatePageLayoutProps {
  // Header
  title: string;
  description: string;
  icon: ReactNode;
  breadcrumbItems: BreadcrumbItem[];
  
  // Navigation
  onBackClick: () => void;
  backButtonText: string;
  
  // Stepper (optional)
  steps?: Step[];
  currentStep?: number;
  completedSteps?: number[];
  
  // Content
  children: ReactNode;
  
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

// MAIN COMPONENT
const CreatePageLayout: React.FC<CreatePageLayoutProps> = ({
  title,
  description,
  icon,
  breadcrumbItems,
  onBackClick,
  backButtonText,
  steps,
  currentStep = 0,
  completedSteps = [],
  children,
  error
}) => {
  return (
    <div className="space-y-6">
      {/* BREADCRUMB */}
      <div className="flex items-center justify-between">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* HEADER */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                {icon}
                {title}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            </div>
            
            <Button
              variant="outline"
              className="flex items-center mt-4 md:mt-0"
              onClick={onBackClick}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>{backButtonText}</span>
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* STEPPER */}
      {steps && steps.length > 0 && (
        <Card>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <Stepper 
              steps={steps} 
              activeStep={currentStep} 
              completedSteps={completedSteps} 
            />
          </div>
          
          {/* FORM CONTENT */}
          <CardBody>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 mb-6 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            {children}
          </CardBody>
        </Card>
      )}

      {/* NO STEPPER - SIMPLE FORM */}
      {(!steps || steps.length === 0) && (
        <Card>
          <CardBody>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 mb-6 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            {children}
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default CreatePageLayout; 