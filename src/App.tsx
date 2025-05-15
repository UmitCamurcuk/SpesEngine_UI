import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Layouts
import AppLayout from './components/layout/AppLayout';

// AttributeGroups
import AttributeGroupsListPage from './pages/attributeGroups/list';
import AttributeGroupCreatePage from './pages/attributeGroups/create';
import AttributeGroupDetailsPage from './pages/attributeGroups/details';

// Attributes
import AttributesListPage from './pages/attributes/list';
import AttributeCreatePage from './pages/attributes/create';
import AttributeDetailsPage from './pages/attributes/details';

// Families
import FamiliesListPage from './pages/families/list';
import FamilyCreatePage from './pages/families/create';
import FamilyDetailsPage from './pages/families/details';

// Auth Pages
import LoginPage from './pages/auth/login';
import RegisterPage from './pages/auth/register';

// Profile Page
import ProfilePage from './pages/profile';

// Ana Sayfa İçeriği
const HomePage = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">SpesEngine MDM</h1>
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Master Data Management sistemine hoş geldiniz.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <a href="/attributeGroups/list" className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors">
          <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-2">Öznitelik Grupları</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Öznitelik gruplarını yönetin.</p>
        </a>
        <a href="/families/list" className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-800/30 transition-colors">
          <h2 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">Ürün Aileleri</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Ürün ailelerini yönetin.</p>
        </a>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        
        {/* AppLayout ile sarılmış sayfalar */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        
        <Route path="/attributeGroups" element={<AppLayout />}>
          <Route path="list" element={<AttributeGroupsListPage />} />
          <Route path="create" element={<AttributeGroupCreatePage />} />
          <Route path="details/:id" element={<AttributeGroupDetailsPage />} />
        </Route>
        
        <Route path="/attributes" element={<AppLayout />}>
          <Route path="list" element={<AttributesListPage />} />
          <Route path="create" element={<AttributeCreatePage />} />
          <Route path=":id" element={<AttributeDetailsPage />} />
        </Route>
        
        <Route path="/families" element={<AppLayout />}>
          <Route path="list" element={<FamiliesListPage />} />
          <Route path="create" element={<FamilyCreatePage />} />
          <Route path="details/:id" element={<FamilyDetailsPage />} />
        </Route>
        
        {/* 404 Page */}
        <Route path="*" element={<div className="p-8">Sayfa bulunamadı.</div>} />
      </Routes>
    </Router>
  );
}

export default App;
