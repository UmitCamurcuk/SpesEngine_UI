import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { NotificationProvider } from '../notifications';

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const location = useLocation();

  // Ekran boyutu değişikliklerini takip et
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };
  
  const closeSidebar = () => {
    console.log('closeSidebar called, current state:', sidebarOpen);
    setSidebarOpen(false);
    console.log('setSidebarOpen(false) called');
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />
        
        <div className="flex pt-14">
          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
          
          {/* Ana içerik */}
          <main className={`
            flex-1
            transition-all duration-300
            ${sidebarOpen ? 'ml-64' : ''}
          `}>
            <div className="p-4 md:p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default AppLayout;