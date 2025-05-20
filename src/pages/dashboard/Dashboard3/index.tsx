import React from 'react';
import { Link } from 'react-router-dom';
// Overview, Quality ve Governance dashboardlarının gerekli bileşenlerini içe aktaralım
import DashboardOverview from './components/overview';
import DataQualityDashboard from './components/quality';
import DashboardGovernance from './components/governance';

const Dashboard3: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Pazarlama & Müşteri İlişkileri</h1>
        <p className="text-gray-600 dark:text-gray-400">Müşteri verilerinizi ve pazarlama kampanyalarınızı tek bir yerden yönetin.</p>
      </div>

      {/* Hızlı Erişim Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link to="/marketing/campaigns" className="bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-full text-pink-600 dark:text-pink-300">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Kampanyalar</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Kampanya yönetimi</p>
            </div>
          </div>
        </Link>
        
        <Link to="/crm/customers" className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-full text-cyan-600 dark:text-cyan-300">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Müşteriler</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Müşteri verileri</p>
            </div>
          </div>
        </Link>
        
        <Link to="/analytics/insights" className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-300">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Analizler</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pazarlama analizleri</p>
            </div>
          </div>
        </Link>
        
        <Link to="/social/channels" className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-300">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Sosyal Medya</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sosyal medya yönetimi</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Dashboard Overview */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Pazarlama Performansı</h2>
          <Link 
            to="/dashboard/Dashboard3/overview" 
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
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Müşteri Veri Kalitesi</h2>
          <Link 
            to="/dashboard/Dashboard3/quality" 
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
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Pazarlama Yönetişimi</h2>
          <Link 
            to="/dashboard/Dashboard3/governance" 
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

export default Dashboard3; 