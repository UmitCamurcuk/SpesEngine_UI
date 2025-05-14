import React from 'react';

interface StepProps {
  title: string;
  description?: string;
  isActive: boolean;
  isCompleted: boolean;
  index: number;
  totalSteps: number;
}

const Step: React.FC<StepProps> = ({ 
  title, 
  description, 
  isActive, 
  isCompleted, 
  index, 
  totalSteps 
}) => {
  return (
    <div className="flex flex-col items-center">
      {/* Step indicator */}
      <div className="flex items-center">
        {/* Line before (not for the first step) */}
        {index > 0 && (
          <div 
            className={`h-1 w-12 md:w-24 ${
              isCompleted ? 'bg-primary-light dark:bg-primary-dark' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          />
        )}
        
        {/* Circle */}
        <div 
          className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 ${
            isActive 
              ? 'border-primary-light dark:border-primary-dark bg-primary-light/10 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark' 
              : isCompleted 
                ? 'border-primary-light dark:border-primary-dark bg-primary-light dark:bg-primary-dark text-white' 
                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400'
          }`}
        >
          {isCompleted ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span className="text-sm font-medium">{index + 1}</span>
          )}
        </div>
        
        {/* Line after (not for the last step) */}
        {index < totalSteps - 1 && (
          <div 
            className={`h-1 w-12 md:w-24 ${
              isCompleted ? 'bg-primary-light dark:bg-primary-dark' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          />
        )}
      </div>
      
      {/* Title and description */}
      <div className="mt-2 text-center">
        <div className={`text-sm font-medium ${
          isActive || isCompleted 
            ? 'text-gray-800 dark:text-white' 
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          {title}
        </div>
        {description && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

export interface StepperProps {
  steps: Array<{
    title: string;
    description?: string;
  }>;
  activeStep: number;
  completedSteps: number[];
}

const Stepper: React.FC<StepperProps> = ({ steps, activeStep, completedSteps }) => {
  return (
    <div className="flex justify-center items-start py-4 overflow-x-auto">
      <div className="flex items-center space-x-4 md:space-x-6">
        {steps.map((step, index) => (
          <Step
            key={index}
            title={step.title}
            description={step.description}
            isActive={activeStep === index}
            isCompleted={completedSteps.includes(index)}
            index={index}
            totalSteps={steps.length}
          />
        ))}
      </div>
    </div>
  );
};

export default Stepper; 