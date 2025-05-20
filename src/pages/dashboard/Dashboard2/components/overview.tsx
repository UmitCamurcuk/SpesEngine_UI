import React from 'react';

const DashboardOverview: React.FC = () => {
  // Örnek finansal veriler
  const stats = [
    { label: 'Toplam Gelir', value: '₺1,428,750', change: '+12%', color: 'blue' },
    { label: 'Toplam Gider', value: '₺986,420', change: '-4%', color: 'green' },
    { label: 'Net Kâr', value: '₺442,330', change: '+16%', color: 'indigo' },
    { label: 'Nakit Akışı', value: '₺328,560', change: '+9%', color: 'purple' },
  ];

  const recentActivities = [
    { id: 1, type: 'create', entity: 'Fatura', name: 'XYZ Müşteri Faturası', user: 'Ahmet Yılmaz', time: '2 saat önce' },
    { id: 2, type: 'update', entity: 'Bütçe', name: 'Pazarlama Bütçesi Q2', user: 'Fatma Demir', time: '3 saat önce' },
    { id: 3, type: 'delete', entity: 'Ödeme', name: 'Tedarikçi Ödemesi XYZ', user: 'Mehmet Kaya', time: '5 saat önce' },
    { id: 4, type: 'update', entity: 'Maaş', name: 'Temmuz Maaş Ödemeleri', user: 'Ayşe Şahin', time: '6 saat önce' },
    { id: 5, type: 'create', entity: 'Rapor', name: 'Q2 Finansal Rapor', user: 'Ali Yıldız', time: '1 gün önce' },
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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Finans Dashboard</h1>
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
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
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
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">Finansal Trend</h2>
            <div className="flex space-x-2">
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Gelir</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Gider</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Kâr</span>
              </div>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded">
            <p className="text-gray-500 dark:text-gray-400">Burada finansal trend grafiği gösterilecek</p>
          </div>
        </div>

        {/* Son Aktiviteler */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Son Finansal İşlemler</h2>
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
              Tüm işlemleri görüntüle
            </button>
          </div>
        </div>
      </div>

      {/* Alt Bölüm */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bütçe Durumu */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Bütçe Durumu</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pazarlama</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">₺85,000 / ₺100,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AR-GE</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">₺192,000 / ₺200,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">İnsan Kaynakları</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">₺78,000 / ₺100,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Operasyon</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">₺89,000 / ₺100,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '89%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Yaklaşan Ödemeler */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Yaklaşan Ödemeler</h2>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800">
              <div className="flex-shrink-0 text-yellow-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">ABC Tedarikçi Ödemesi</h3>
                <div className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">₺12,500 - Son ödeme tarihi: 15 Temmuz</div>
              </div>
            </div>
            <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
              <div className="flex-shrink-0 text-red-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">XYZ Şirketi Faturası</h3>
                <div className="mt-1 text-xs text-red-700 dark:text-red-300">₺8,750 - Son ödeme tarihi: 10 Temmuz (Gecikmiş!)</div>
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
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Personel Maaş Ödemeleri</h3>
                <div className="mt-1 text-xs text-blue-700 dark:text-blue-300">₺145,000 - Son ödeme tarihi: 30 Temmuz</div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Tüm ödemeleri görüntüle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview; 