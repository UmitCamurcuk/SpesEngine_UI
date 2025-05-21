import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    console.log('Sidebar toggle çağrıldı. Mevcut durum:', sidebarOpen, '-> Yeni durum:', !sidebarOpen);
    setSidebarOpen(!sidebarOpen);
  };
  
  const closeSidebar = () => {
    console.log('Sidebar kapatılıyor');
    setSidebarOpen(false);
  };

  // Sayfa değiştiğinde sidebar'ı otomatik kapat (mobil görünüm için)
  useEffect(() => {
    if (window.innerWidth < 768) { // md breakpoint
      closeSidebar();
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Navbar - Sabit olarak üstte */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <Navbar toggleSidebar={toggleSidebar} />
      </div>
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      {/* Ana içerik - sidebardan bağımsız */}
      <div className="flex-1 pt-14 md:pl-64">
        <main className="h-full overflow-y-auto bg-gray-100 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default AppLayout; 