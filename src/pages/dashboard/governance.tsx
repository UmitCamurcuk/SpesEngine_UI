import React from 'react';

const DashboardGovernance: React.FC = () => {
  // Örnek veriler
  const governanceMetrics = [
    { name: 'Veri Sahipliği Oranı', value: '86%', trend: '+4%', status: 'positive' },
    { name: 'Politika Uyumluluğu', value: '92%', trend: '+2%', status: 'positive' },
    { name: 'Standart Uyumluluğu', value: '78%', trend: '-3%', status: 'negative' },
    { name: 'Veri Kontrolü', value: '81%', trend: '+5%', status: 'positive' },
  ];

  const dataStewards = [
    { id: 1, name: 'Ayşe Yılmaz', department: 'Ürün Yönetimi', domain: 'Ürünler', email: 'ayse.yilmaz@firma.com', performance: 95 },
    { id: 2, name: 'Mehmet Kaya', department: 'Pazarlama', domain: 'Kategoriler', email: 'mehmet.kaya@firma.com', performance: 88 },
    { id: 3, name: 'Zeynep Demir', department: 'Tedarik Zinciri', domain: 'Tedarikçiler', email: 'zeynep.demir@firma.com', performance: 92 },
    { id: 4, name: 'Ali Şahin', department: 'Satış', domain: 'Müşteriler', email: 'ali.sahin@firma.com', performance: 79 },
    { id: 5, name: 'Fatma Çelik', department: 'Finans', domain: 'Finansal Veriler', email: 'fatma.celik@firma.com', performance: 91 },
  ];

  const recentChanges = [
    { id: 1, type: 'policy', name: 'Ürün Veri Standardı v2.3', status: 'approved', date: '2023-05-18', approver: 'Hakan Öztürk' },
    { id: 2, type: 'workflow', name: 'Kategori Onay Süreci', status: 'pending', date: '2023-05-17', approver: 'Beklemede' },
    { id: 3, type: 'rule', name: 'Öznitelik Zorunluluğu', status: 'approved', date: '2023-05-15', approver: 'Seda Arslan' },
    { id: 4, type: 'policy', name: 'Tedarikçi Veri Protokolü', status: 'rejected', date: '2023-05-14', approver: 'Murat Yıldırım' },
    { id: 5, type: 'rule', name: 'Fiyat Veri Doğrulama', status: 'approved', date: '2023-05-12', approver: 'Hakan Öztürk' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-300';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-300';
      default: return '';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'policy':
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case 'workflow':
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        );
      case 'rule':
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between mb-6 items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Veri Yönetişimi</h1>
        <div className="mt-4 md:mt-0">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            Yeni Politika Ekle
          </button>
        </div>
      </div>

      {/* Yönetişim Metrikleri */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {governanceMetrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.name}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
              <div className="mt-4">
                <div className={`inline-flex items-center ${metric.status === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.status === 'positive' ? (
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span>{metric.trend}</span>
                </div>
                <span className="text-sm ml-2 text-gray-500 dark:text-gray-400">Son 30 gün</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ana İçerik Bölümü */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Son Politika Değişiklikleri */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Son Politika Değişiklikleri</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tür
                  </th>
                  <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ad
                  </th>
                  <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Onaylayan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentChanges.map((change) => (
                  <tr key={change.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(change.type)}
                        <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {change.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {change.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(change.status)}`}>
                        {change.status === 'approved' ? 'Onaylandı' : change.status === 'pending' ? 'Beklemede' : 'Reddedildi'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {change.date}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {change.approver}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Tüm değişiklikleri görüntüle
            </button>
          </div>
        </div>

        {/* Veri Sorumluları Performansı */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Veri Sorumluları</h2>
          <div className="space-y-4">
            {dataStewards.slice(0, 4).map((steward) => (
              <div key={steward.id} className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-medium">
                    {steward.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{steward.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{steward.domain}</p>
                  <div className="mt-1 flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                      <div 
                        className={`h-1.5 rounded-full ${
                          steward.performance >= 90 ? 'bg-green-600' : 
                          steward.performance >= 80 ? 'bg-blue-600' : 
                          steward.performance >= 70 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${steward.performance}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{steward.performance}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Tüm veri sorumlularını görüntüle
            </button>
          </div>
        </div>
      </div>

      {/* Politika ve Standartlar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">Veri Politikaları ve Standartları</h2>
          <div>
            <button className="text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors mr-2">
              Filtrele
            </button>
            <button className="text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
              Sırala
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="ml-2 text-sm font-medium text-gray-900 dark:text-white">Ürün Veri Standardı</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tüm ürün verilerinin nasıl yapılandırılacağını, hangi özniteliklerin zorunlu olduğunu belirleyen standartlar.
            </p>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">Güncellenme: 15.05.2023</span>
              <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                Görüntüle
              </button>
            </div>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="ml-2 text-sm font-medium text-gray-900 dark:text-white">Tedarikçi Veri Protokolü</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tedarikçi verilerinin yönetimi, gizliliği ve paylaşımıyla ilgili kurallar ve protokoller.
            </p>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">Güncellenme: 10.05.2023</span>
              <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                Görüntüle
              </button>
            </div>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="ml-2 text-sm font-medium text-gray-900 dark:text-white">Veri Kalite Kuralları</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Veri kalitesini sağlamak için uygulanması gereken kurallar ve doğrulama kriterleri.
            </p>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">Güncellenme: 20.05.2023</span>
              <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                Görüntüle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGovernance; 