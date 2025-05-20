import React from 'react';

const DashboardGovernance: React.FC = () => {
  // Örnek veri - Pazarlama ve CRM departmanı için yönetişim metrikleri
  const complianceMetrics = [
    { metric: 'KVKK Uyum Oranı', value: '96%', status: 'success' },
    { metric: 'İzin Yönetimi', value: '91%', status: 'success' },
    { metric: 'Veri Saklama Politikası', value: '87%', status: 'warning' },
    { metric: 'Pazarlama Onayları', value: '94%', status: 'success' },
    { metric: 'Çerez Politikası', value: '89%', status: 'warning' },
  ];

  const policyDocuments = [
    { id: 1, name: 'Müşteri Veri İşleme Politikası', department: 'Pazarlama & CRM', updated: '15 Mart 2023', status: 'Aktif' },
    { id: 2, name: 'Pazarlama İzinleri Prosedürü', department: 'Pazarlama', updated: '8 Nisan 2023', status: 'Aktif' },
    { id: 3, name: 'Veri Saklama ve İmha Politikası', department: 'CRM & Veri Yönetimi', updated: '22 Şubat 2023', status: 'Revizyon Bekliyor' },
    { id: 4, name: 'Sosyal Medya Veri Kullanım Prosedürü', department: 'Pazarlama', updated: '3 Haziran 2023', status: 'Aktif' },
  ];

  const auditHistory = [
    { id: 1, name: 'KVKK Veri Envanteri Denetimi', date: '10 Ocak 2023', result: 'Başarılı', findings: 2 },
    { id: 2, name: 'Pazarlama İzinleri Denetimi', date: '5 Mart 2023', result: 'Koşullu Başarılı', findings: 7 },
    { id: 3, name: 'CRM Veri Güvenliği Denetimi', date: '12 Mayıs 2023', result: 'Beklemede', findings: null },
    { id: 4, name: 'Dijital Pazarlama Uyum Denetimi', date: '30 Nisan 2023', result: 'Başarılı', findings: 1 },
  ];

  const dataSubjectRequests = [
    { id: 1, type: 'Erişim Talebi', channel: 'E-posta', date: '15 Haziran 2023', status: 'Tamamlandı', responseTime: '6 gün' },
    { id: 2, type: 'Silme Talebi', channel: 'Web Formu', date: '22 Haziran 2023', status: 'İşleniyor', responseTime: '2 gün' },
    { id: 3, type: 'Veri Taşıma', channel: 'Çağrı Merkezi', date: '10 Haziran 2023', status: 'Tamamlandı', responseTime: '8 gün' },
    { id: 4, type: 'Pazarlama İzni İptali', channel: 'Web Formu', date: '25 Haziran 2023', status: 'Beklemede', responseTime: '1 gün' },
    { id: 5, type: 'Düzeltme Talebi', channel: 'E-posta', date: '18 Haziran 2023', status: 'Tamamlandı', responseTime: '5 gün' },
  ];

  // Metrik kartı renk sınıfları
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'warning':
        return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'danger':
        return 'text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'text-gray-700 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="w-full">
      {/* Üst başlık ve filtreler */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Pazarlama & CRM Yönetişimi</h1>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Uyum Raporu İndir
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Uyum Ayarları
          </button>
        </div>
      </div>

      {/* Uyum Metrikleri */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {complianceMetrics.map((metric, index) => (
          <div key={index} className={`rounded-lg p-4 ${getStatusClass(metric.status)}`}>
            <h3 className="text-sm font-medium mb-1">{metric.metric}</h3>
            <p className="text-3xl font-bold">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Veri Gizliliği ve Politikalar Bölümü */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Veri Politikaları */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">Veri ve Pazarlama Politikaları</h2>
            <button className="text-sm bg-pink-600 hover:bg-pink-700 text-white py-1 px-3 rounded-md">Yeni Politika</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-4 py-3">Politika</th>
                  <th scope="col" className="px-4 py-3">Departman</th>
                  <th scope="col" className="px-4 py-3">Son Güncelleme</th>
                  <th scope="col" className="px-4 py-3">Durum</th>
                </tr>
              </thead>
              <tbody>
                {policyDocuments.map(policy => (
                  <tr key={policy.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{policy.name}</td>
                    <td className="px-4 py-3">{policy.department}</td>
                    <td className="px-4 py-3">{policy.updated}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        policy.status === 'Aktif' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {policy.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Denetim Geçmişi */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">Denetim Geçmişi</h2>
            <a href="#" className="text-sm text-pink-600 dark:text-pink-400 hover:underline">Tüm Denetimler</a>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-4 py-3">Denetim</th>
                  <th scope="col" className="px-4 py-3">Tarih</th>
                  <th scope="col" className="px-4 py-3">Sonuç</th>
                  <th scope="col" className="px-4 py-3">Bulgular</th>
                </tr>
              </thead>
              <tbody>
                {auditHistory.map(audit => (
                  <tr key={audit.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{audit.name}</td>
                    <td className="px-4 py-3">{audit.date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        audit.result === 'Başarılı' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        audit.result === 'Koşullu Başarılı' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      }`}>
                        {audit.result}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {audit.findings !== null ? (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          audit.findings > 5 ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                          audit.findings > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                          {audit.findings} bulgu
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Veri Sahibi Hakları */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">Veri Sahibi Hak Talepleri</h2>
          <div className="flex space-x-2 text-sm">
            <span className="px-2 py-1 rounded-md bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              Tamamlanan: 18
            </span>
            <span className="px-2 py-1 rounded-md bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
              İşleniyor: 3
            </span>
            <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              Beklemede: 2
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-4 py-3">Talep Tipi</th>
                <th scope="col" className="px-4 py-3">Kanal</th>
                <th scope="col" className="px-4 py-3">Tarih</th>
                <th scope="col" className="px-4 py-3">Durum</th>
                <th scope="col" className="px-4 py-3">Yanıt Süresi</th>
              </tr>
            </thead>
            <tbody>
              {dataSubjectRequests.map(request => (
                <tr key={request.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{request.type}</td>
                  <td className="px-4 py-3">{request.channel}</td>
                  <td className="px-4 py-3">{request.date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      request.status === 'Tamamlandı' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      request.status === 'İşleniyor' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{request.responseTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alt Paneller */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pazarlama İzinleri Paneli */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Pazarlama İzinleri Durumu</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">78%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">E-posta İzni Oranı</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">65%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">SMS İzni Oranı</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">42%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Telefon İzni Oranı</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">91%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Çerez İzni Oranı</div>
            </div>
          </div>
          <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg border border-pink-100 dark:border-pink-800">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-pink-600 dark:text-pink-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-pink-800 dark:text-pink-300">İzin Yönetimi Önerisi</h3>
                <div className="mt-1 text-xs text-pink-700 dark:text-pink-400">
                  <p>Telefon izni oranının düşük olduğu tespit edildi. SMS ve E-posta kanalları üzerinden telefon arama izninin faydalarını anlatacak bir kampanya başlatmayı düşünebilirsiniz.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KVKK ve GDPR Uyumluluk Paneli */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Düzenleyici Mevzuat Uyumluluğu</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg mr-4">
                <span className="font-bold text-lg">TR</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">KVKK Uyumluluğu</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">96%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-12 h-12 flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg mr-4">
                <span className="font-bold text-lg">EU</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">GDPR Uyumluluğu</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">88%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg mr-4">
                <span className="font-bold text-lg">US</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CCPA Uyumluluğu</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
              <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-2">GDPR Uyumluluk Aksiyonları</h3>
              <ul className="list-disc pl-5 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>Veri işleme faaliyetleri kaydının tamamlanması</li>
                <li>Uluslararası veri transferi için yeterli güvencelerin sağlanması</li>
                <li>Veri koruma etki değerlendirmelerinin güncellenmesi</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGovernance; 