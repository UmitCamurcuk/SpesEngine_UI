import React from 'react';
import { Link } from 'react-router-dom';
// Overview, Quality ve Governance dashboardlarının gerekli bileşenlerini içe aktaralım
import DashboardOverview from './dashboard/Dashboard1/components/overview';
import DataQualityDashboard from './dashboard/Dashboard1/components/quality';
import DashboardGovernance from './dashboard/Dashboard1/components/governance';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">SpesEngine Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Ürün, kategori ve öznitelik verilerinizi tek bir yerden yönetin.</p>
      </div>

      {/* Hızlı Erişim Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link to="/items/create" className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-300">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Yeni Öğe</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Öğeleri oluştur</p>
            </div>
          </div>
        </Link>
        
        <Link to="/items/list" className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-300">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Öğeler</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Öğeleri yönet</p>
            </div>
          </div>
        </Link>
        
        <Link to="/attributes" className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-300">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Öznitelikler</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Öznitelikleri yönet</p>
            </div>
          </div>
        </Link>
        
        <Link to="/categories" className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600 dark:text-yellow-300">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Kategoriler</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Kategorileri yönet</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Dashboard Overview */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Genel Bakış</h2>
          <Link 
            to="/dashboard/overview" 
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Tüm detayları görüntüle
          </Link>
        </div>
        <DashboardOverview />
      </div>

      {/* Data Quality Dashboard */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Veri Kalitesi</h2>
          <Link 
            to="/dashboard/quality" 
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Tüm detayları görüntüle
          </Link>
        </div>
        <DataQualityDashboard />
      </div>

      {/* Governance Dashboard */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Veri Yönetişimi</h2>
          <Link 
            to="/dashboard/governance" 
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Tüm detayları görüntüle
          </Link>
        </div>
        <DashboardGovernance />
      </div>
    </div>
  );
};

export default Home; 