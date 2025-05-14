import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <Navbar toggleSidebar={toggleSidebar} />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      {/* Main Content */}
      <main className="pt-14 md:ml-64 w-full min-h-screen transition-all duration-200">
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout; 