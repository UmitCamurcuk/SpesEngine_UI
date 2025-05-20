import React from 'react';
import { Link } from 'react-router-dom';
// Overview, Quality ve Governance dashboardlarının gerekli bileşenlerini içe aktaralım
import DashboardOverview from './components/overview';
import DataQualityDashboard from './components/quality';
import DashboardGovernance from './components/governance';

const Dashboard2: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Dashboard 2</h1>
        <p className="text-gray-600 dark:text-gray-400">Finans ve insan kaynakları verilerinizi tek bir yerden yönetin.</p>
      </div>

      {/* Hızlı Erişim Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link to="/finance/create" className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-300">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Yeni Finans Raporu</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Finans raporu oluştur</p>
            </div>
          </div>
        </Link>
        
        <Link to="/hr" className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-300">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">İnsan Kaynakları</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Personel verilerini yönet</p>
            </div>
          </div>
        </Link>
        
        <Link to="/budget" className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-300">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Bütçe</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bütçe planlaması</p>
            </div>
          </div>
        </Link>
        
        <Link to="/reports" className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600 dark:text-yellow-300">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Raporlar</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Finansal raporlar</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Dashboard Overview */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Finansal Genel Bakış</h2>
          <Link 
            to="/dashboard/Dashboard2/overview" 
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
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">İK Verileri Kalitesi</h2>
          <Link 
            to="/dashboard/Dashboard2/quality" 
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
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Finansal Yönetişim</h2>
          <Link 
            to="/dashboard/Dashboard2/governance" 
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

export default Dashboard2; 