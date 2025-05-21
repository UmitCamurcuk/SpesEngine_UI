import React from 'react';

const DashboardOverview: React.FC = () => {
  // Örnek veriler
  const stats = [
    { label: 'Toplam Ürün', value: '1,428', change: '+12%', color: 'blue' },
    { label: 'Aktif Kategori', value: '64', change: '+4%', color: 'green' },
    { label: 'Ürün Ailesi', value: '42', change: '+6%', color: 'indigo' },
    { label: 'Öznitelik', value: '128', change: '+9%', color: 'purple' },
  ];

  const recentActivities = [
    { id: 1, type: 'create', entity: 'Kategori', name: 'Elektronik Aletler', user: 'Ahmet Yılmaz', time: '2 saat önce' },
    { id: 2, type: 'update', entity: 'Öznitelik', name: 'Ağırlık', user: 'Fatma Demir', time: '3 saat önce' },
    { id: 3, type: 'delete', entity: 'İlişki Tipi', name: 'İçerir', user: 'Mehmet Kaya', time: '5 saat önce' },
    { id: 4, type: 'update', entity: 'Aile', name: 'Mutfak Gereçleri', user: 'Ayşe Şahin', time: '6 saat önce' },
    { id: 5, type: 'create', entity: 'Ürün', name: 'Bulaşık Makinesi X500', user: 'Ali Yıldız', time: '1 gün önce' },
  ];

  // Örnek popüler ürünler
  const popularProducts = [
    { id: 1, name: 'Akıllı Telefon Pro X', category: 'Elektronik', views: 1245, conversion: 4.8 },
    { id: 2, name: 'Kahve Makinesi M200', category: 'Ev Aletleri', views: 980, conversion: 3.6 },
    { id: 3, name: 'Spor Ayakkabı Air', category: 'Giyim', views: 876, conversion: 5.2 },
    { id: 4, name: 'Kablosuz Kulaklık', category: 'Aksesuarlar', views: 765, conversion: 4.1 },
  ];

  // Aktivite tipi ikonları
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create':
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'update':
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </div>
        );
      case 'delete':
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between mb-6 items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Ürün Yönetimi Dashboard</h1>
        <div className="mt-4 md:mt-0">
          <div className="inline-flex items-center rounded-lg bg-white dark:bg-gray-800 p-2 shadow">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white"
            >
              Günlük
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Haftalık
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Aylık
            </button>
          </div>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`flex items-center text-${stat.color}-600`}>
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className={`inline-flex items-center text-${stat.color}-600`}>
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                <span>{stat.change}</span>
              </div>
              <span className="text-sm ml-2 text-gray-500 dark:text-gray-400">Son 30 gün</span>
            </div>
          </div>
        ))}
      </div>

      {/* Grafik ve Aktivite Bölümü */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Grafik */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">Ürün Veri Büyümesi</h2>
            <div className="flex space-x-2">
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Ürünler</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Kategoriler</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-purple-500 mr-1"></span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Öznitelikler</span>
              </div>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded">
            <p className="text-gray-500 dark:text-gray-400">Burada ürün veri büyüme grafiği gösterilecek</p>
          </div>
        </div>

        {/* Son Aktiviteler */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Son Aktiviteler</h2>
          <div className="space-y-4">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex">
                {getActivityIcon(activity.type)}
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.name} ({activity.entity})
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.user} tarafından {activity.type === 'create' ? 'oluşturuldu' : activity.type === 'update' ? 'güncellendi' : 'silindi'} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Tüm aktiviteleri görüntüle
            </button>
          </div>
        </div>
      </div>

      {/* Popüler Ürünler */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">En Popüler Ürünler</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-6 py-3">Ürün Adı</th>
                <th scope="col" className="px-6 py-3">Kategori</th>
                <th scope="col" className="px-6 py-3">Görüntülenme</th>
                <th scope="col" className="px-6 py-3">Dönüşüm Oranı</th>
                <th scope="col" className="px-6 py-3">Durum</th>
              </tr>
            </thead>
            <tbody>
              {popularProducts.map(product => (
                <tr key={product.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{product.name}</td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4">{product.views.toLocaleString()}</td>
                  <td className="px-6 py-4">{product.conversion}%</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      product.conversion > 5 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      product.conversion > 4 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {product.conversion > 5 ? 'Mükemmel' : product.conversion > 4 ? 'İyi' : 'Ortalama'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alt Bölüm */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kalite Skoru */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Ürün Veri Kalite Skorları</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tamamlanma Oranı</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Doğruluk</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tutarlılık</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Güncellik</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">89%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '89%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Yapılacaklar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Yapılacaklar</h2>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800">
              <div className="flex-shrink-0 text-yellow-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Eksik ürün özniteliklerini tamamla</h3>
                <div className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">14 ürün özniteliği eksik bilgiye sahip</div>
              </div>
            </div>
            <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
              <div className="flex-shrink-0 text-red-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Kopuk ürün ilişkilerini düzelt</h3>
                <div className="mt-1 text-xs text-red-700 dark:text-red-300">8 ürün ilişkisi tutarsızlığı mevcut</div>
              </div>
            </div>
            <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex-shrink-0 text-blue-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Ürün kategorisi incelemesi yapılmalı</h3>
                <div className="mt-1 text-xs text-blue-700 dark:text-blue-300">5 ürün kategorisi 30 günden uzun süredir güncellenmedi</div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Tüm görevleri görüntüle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview; 