import React from 'react';

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
        <a href="/associations/list" className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-800/30 transition-colors">
          <h2 className="text-lg font-semibold text-purple-700 dark:text-purple-400 mb-2">İlişki Tipleri</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Varlık ilişki tiplerini yönetin.</p>
        </a>
      </div>
    </div>
  </div>
);

export default HomePage; 