import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { NotificationProvider } from '../notifications';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { toggleSidebar, setSidebarState } from '../../redux/features/layout/layoutSlice';

const AppLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isSidebarOpen } = useAppSelector(state => state.layout);
  const location = useLocation();

  // Ekran boyutu değişikliklerini takip et
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        dispatch(setSidebarState(true));
      } else {
        dispatch(setSidebarState(false));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };
  
  const handleCloseSidebar = () => {
    dispatch(setSidebarState(false));
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {/* Navbar */}
        <Navbar toggleSidebar={handleToggleSidebar} />
        
        <div className="flex pt-14">
          {/* Sidebar */}
          <Sidebar isOpen={isSidebarOpen} closeSidebar={handleCloseSidebar} />
          
          {/* Ana içerik */}
          <main className={`
            flex-1
            transition-all duration-300
            ${isSidebarOpen ? 'ml-64' : ''}
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