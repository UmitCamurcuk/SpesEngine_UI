import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from './redux/store';
import { initializeAuth } from './redux/features/auth/authSlice';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import DashboardOverview from './pages/dashboard/Dashboard1/components/overview';
import DataQualityDashboard from './pages/dashboard/Dashboard1/components/quality';
import DashboardGovernance from './pages/dashboard/Dashboard1/components/governance';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Uygulama başladığında auth durumunu initialize et
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <Router>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300 pt-16 lg:pt-0 overflow-auto">
          <main className="h-full overflow-y-auto pb-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard/overview" element={<DashboardOverview />} />
              <Route path="/dashboard/quality" element={<DataQualityDashboard />} />
              <Route path="/dashboard/governance" element={<DashboardGovernance />} />
              {/* Placeholder rotalar - ileride gerçek sayfalarla değiştirilecek */}
              <Route path="/products" element={<PlaceholderPage title="Ürünler" />} />
              <Route path="/categories" element={<PlaceholderPage title="Kategoriler" />} />
              <Route path="/attributes" element={<PlaceholderPage title="Öznitelikler" />} />
              <Route path="/suppliers" element={<PlaceholderPage title="Tedarikçiler" />} />
              <Route path="/relationships" element={<PlaceholderPage title="İlişkiler" />} />
              <Route path="/settings" element={<PlaceholderPage title="Ayarlar" />} />
              <Route path="/help" element={<PlaceholderPage title="Yardım" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

// Geçici bir sayfa bileşeni - ileride gerçek sayfalarla değiştirilecek
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{title}</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">
              {title} sayfası geliştirme aşamasında
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Bu sayfa şu anda yapım aşamasındadır. Yakında kullanıma sunulacaktır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App; 