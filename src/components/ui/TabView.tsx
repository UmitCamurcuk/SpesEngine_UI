import React, { useState } from 'react';

export interface TabItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
  badge?: number | string;
}

interface TabViewProps {
  tabs: TabItem[];
  defaultActiveTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

const TabView: React.FC<TabViewProps> = ({
  tabs,
  defaultActiveTab,
  onTabChange,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<string>(
    defaultActiveTab || (tabs.length > 0 ? tabs[0].id : '')
  );

  if (tabs.length === 0) {
    return null;
  }

  const handleTabClick = (tabId: string) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId);
      if (onTabChange) {
        onTabChange(tabId);
      }
    }
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          {tabs.map(tab => (
            <li key={tab.id} className="mr-2">
              <button
                onClick={() => !tab.disabled && handleTabClick(tab.id)}
                disabled={tab.disabled}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-t-lg ${
                  activeTab === tab.id
                    ? 'border-b-2 border-primary-light text-primary-light dark:text-primary-dark dark:border-primary-dark bg-white dark:bg-gray-800'
                    : 'border-b-2 border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {tab.title}
                {tab.badge !== undefined && (
                  <span className="ml-2 bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">
                    {tab.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-3">
        <div key={`tab-content-${activeTab}`}>
          {activeTabContent}
        </div>
      </div>
    </div>
  );
};

export default TabView; 