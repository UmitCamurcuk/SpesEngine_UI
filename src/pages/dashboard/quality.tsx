import React from 'react';

const DataQualityDashboard: React.FC = () => {
  // Örnek veriler
  const dataQualityScores = [
    { domain: 'Ürünler', completeness: 92, accuracy: 89, consistency: 84, timeliness: 95 },
    { domain: 'Kategoriler', completeness: 96, accuracy: 91, consistency: 88, timeliness: 90 },
    { domain: 'Öznitelikler', completeness: 87, accuracy: 82, consistency: 79, timeliness: 85 },
    { domain: 'Aileler', completeness: 94, accuracy: 90, consistency: 86, timeliness: 92 },
    { domain: 'İlişkiler', completeness: 82, accuracy: 78, consistency: 75, timeliness: 80 },
  ];

  const issues = [
    { id: 1, domain: 'Ürünler', entity: 'Buzdolabı XYZ', issue: 'Eksik öznitelik değerleri', severity: 'high', date: '2023-05-15' },
    { id: 2, domain: 'Kategoriler', entity: 'Elektronik Eşyalar', issue: 'Tutarsız hiyerarşi', severity: 'medium', date: '2023-05-16' },
    { id: 3, domain: 'Öznitelikler', entity: 'Renk', issue: 'Standartlaştırılmamış değerler', severity: 'high', date: '2023-05-14' },
    { id: 4, domain: 'Ürünler', entity: 'Televizyon ABC', issue: 'Eksik ilişkiler', severity: 'low', date: '2023-05-17' },
    { id: 5, domain: 'İlişkiler', entity: 'Üretici bağlantısı', issue: 'Kopuk referans', severity: 'high', date: '2023-05-13' },
  ];

  const recentScans = [
    { id: 1, scanType: 'Tam Tarama', startTime: '2023-05-18T08:30:00', endTime: '2023-05-18T09:45:00', status: 'completed', issuesFound: 27 },
    { id: 2, scanType: 'Hızlı Kontrol', startTime: '2023-05-17T14:20:00', endTime: '2023-05-17T14:50:00', status: 'completed', issuesFound: 12 },
    { id: 3, scanType: 'Öznitelik Doğrulama', startTime: '2023-05-16T10:15:00', endTime: '2023-05-16T11:30:00', status: 'completed', issuesFound: 8 },
  ];

  // Severity renklerini belirle
  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default: return '';
    }
  };

  // Tarih formatlama
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  // Saat formatlama
  const formatTime = (dateTimeStr: string) => {
    return new Date(dateTimeStr).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between mb-6 items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Veri Kalitesi Gösterge Paneli</h1>
        <div className="mt-4 md:mt-0">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            Yeni Kalite Taraması Başlat
          </button>
        </div>
      </div>

      {/* Genel Kalite Özeti */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Genel Veri Kalitesi Özeti</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Tamamlanma</h3>
              <span className="text-2xl font-bold text-blue-800 dark:text-blue-300">90%</span>
            </div>
            <div className="mt-4">
              <div className="w-full bg-blue-200 dark:bg-blue-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Doğruluk</h3>
              <span className="text-2xl font-bold text-green-800 dark:text-green-300">86%</span>
            </div>
            <div className="mt-4">
              <div className="w-full bg-green-200 dark:bg-green-700 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '86%' }}></div>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-100 dark:border-yellow-800">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Tutarlılık</h3>
              <span className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">82%</span>
            </div>
            <div className="mt-4">
              <div className="w-full bg-yellow-200 dark:bg-yellow-700 rounded-full h-2.5">
                <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-purple-800 dark:text-purple-300">Güncellik</h3>
              <span className="text-2xl font-bold text-purple-800 dark:text-purple-300">88%</span>
            </div>
            <div className="mt-4">
              <div className="w-full bg-purple-200 dark:bg-purple-700 rounded-full h-2.5">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Veri Alanlarına göre Kalite */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Veri Alanları Kalite Tablosu */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Veri Alanlarına Göre Kalite</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Veri Alanı
                  </th>
                  <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tamamlanma
                  </th>
                  <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Doğruluk
                  </th>
                  <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tutarlılık
                  </th>
                  <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Güncellik
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {dataQualityScores.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : ''}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {item.domain}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <span className="mr-2">{item.completeness}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${item.completeness}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <span className="mr-2">{item.accuracy}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                          <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${item.accuracy}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <span className="mr-2">{item.consistency}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                          <div className="bg-yellow-600 h-1.5 rounded-full" style={{ width: `${item.consistency}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <span className="mr-2">{item.timeliness}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                          <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${item.timeliness}%` }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kalite Sorunları */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Önemli Kalite Sorunları</h2>
          <div className="space-y-3">
            {issues.map(issue => (
              <div key={issue.id} className={`p-3 rounded-lg ${getSeverityClass(issue.severity)}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium">{issue.entity}</h3>
                    <p className="text-xs mt-1">{issue.issue}</p>
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">{issue.domain}</span>
                    <span className="block mt-1">{formatDate(issue.date)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Tüm sorunları görüntüle
            </button>
          </div>
        </div>
      </div>

      {/* Son Kalite Taramaları */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Son Kalite Taramaları</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tarama Tipi
                </th>
                <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Başlangıç
                </th>
                <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Bitiş
                </th>
                <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Bulunan Sorunlar
                </th>
                <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {recentScans.map(scan => (
                <tr key={scan.id}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    {scan.scanType}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(scan.startTime)} {formatTime(scan.startTime)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(scan.endTime)} {formatTime(scan.endTime)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">
                      {scan.status === 'completed' ? 'Tamamlandı' : 'Devam Ediyor'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {scan.issuesFound}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button className="text-blue-600 dark:text-blue-400 hover:underline mr-3">
                      Detaylar
                    </button>
                    <button className="text-blue-600 dark:text-blue-400 hover:underline">
                      Rapor
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Tüm tarama geçmişini görüntüle
          </button>
        </div>
      </div>

      {/* İyileştirme Önerileri */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6">
        <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Veri Kalitesi İyileştirme Önerileri</h2>
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Ürün Verilerini Güncelleyin</h3>
            <p className="text-xs mt-1 text-blue-700 dark:text-blue-400">
              Son 6 aydır güncellenmemiş 18 ürün bulundu. Güncel verileri sağlayarak veri güncelliğini artırın.
            </p>
            <button className="mt-2 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors">
              Güncellenecek Ürünleri Görüntüle
            </button>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Kategori Hiyerarşilerini Standardize Edin</h3>
            <p className="text-xs mt-1 text-green-700 dark:text-green-400">
              Kategori hiyerarşilerinde 5 tutarsızlık tespit edildi. Hiyerarşi yapısını düzenleyerek tutarlılığı artırın.
            </p>
            <button className="mt-2 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors">
              Tutarsız Hiyerarşileri Görüntüle
            </button>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
            <h3 className="text-sm font-medium text-purple-800 dark:text-purple-300">Öznitelik Değerlerini Tamamlayın</h3>
            <p className="text-xs mt-1 text-purple-700 dark:text-purple-400">
              32 ürün için eksik öznitelik değerleri bulundu. Bu değerleri ekleyerek veri tamamlama oranını artırın.
            </p>
            <button className="mt-2 text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded transition-colors">
              Eksik Öznitelikleri Görüntüle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataQualityDashboard; 