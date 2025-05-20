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
    <div className="w-full">
      {/* Üst başlık ve filtreler */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Veri Yönetişimi</h1>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <select className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md px-3 py-2 text-sm">
            <option>Tüm Öğe Tipleri</option>
            <option>Ürünler</option>
            <option>Kategoriler</option>
            <option>Öznitelikler</option>
          </select>
          <select className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md px-3 py-2 text-sm">
            <option>Son 30 Gün</option>
            <option>Son 90 Gün</option>
            <option>Son 12 Ay</option>
            <option>Tüm Zamanlar</option>
          </select>
        </div>
      </div>
      
      {/* Veri Yönetişimi Özeti */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Yönetişim Skoru</h2>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">78%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Politika Uyumu</h2>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">84%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Aktif Sorumlular</h2>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">24</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-300">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">Kritik Sorunlar</h2>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">8</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Veri Sorumlulukları */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Veri Alanı Sorumlulukları</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full mr-3 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-300">P</div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Ürünler</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">12 veri kümesi</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800 dark:text-white">Ahmet Yılmaz</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Ürün Yöneticisi</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full mr-3 bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-300">C</div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Kategoriler</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">5 veri kümesi</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800 dark:text-white">Ayşe Demir</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Kategori Uzmanı</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full mr-3 bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-300">A</div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Öznitelikler</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">8 veri kümesi</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800 dark:text-white">Mehmet Kaya</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Veri Analisti</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full mr-3 bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-300">R</div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">İlişkiler</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">4 veri kümesi</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800 dark:text-white">Zeynep Şahin</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">İlişki Yöneticisi</p>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
            Tüm sorumlulukları görüntüle
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Veri Yönetişimi Politikaları</h2>
          <div className="space-y-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Veri Kalitesi Standartları</h3>
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-300 rounded-full">Aktif</span>
              </div>
              <p className="mt-2 text-xs text-blue-700 dark:text-blue-400">
                Ürün verilerinin tamamlık, doğruluk, tutarlılık ve güncellik standartları
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Veri Erişim Kuralları</h3>
                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-300 rounded-full">Aktif</span>
              </div>
              <p className="mt-2 text-xs text-green-700 dark:text-green-400">
                Kullanıcı rollerine dayalı veri erişim izinleri ve kısıtlamaları
              </p>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-100 dark:border-yellow-800">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Veri Değişiklik Onay Süreci</h3>
                <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-300 rounded-full">Güncelleniyor</span>
              </div>
              <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-400">
                Kritik veri değişikliklerinin çift onay gerektirmesi
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-300">KVKK Uyumluluğu</h3>
                <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-300 rounded-full">Taslak</span>
              </div>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                Kişisel verilerin korunmasına yönelik standartlar ve süreçler
              </p>
            </div>
          </div>
          
          <button className="w-full mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
            Tüm politikaları görüntüle
          </button>
        </div>
      </div>
      
      {/* Veri Yönetişimi İzleme ve İhlaller */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Politika İhlalleri</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-4 py-3">İhlal Tipi</th>
                  <th scope="col" className="px-4 py-3">İlgili Alan</th>
                  <th scope="col" className="px-4 py-3">Tarih</th>
                  <th scope="col" className="px-4 py-3">Kullanıcı</th>
                  <th scope="col" className="px-4 py-3">Durum</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-4 py-3">Veri Değişikliği Onayı Eksik</td>
                  <td className="px-4 py-3">Ürün Fiyatları</td>
                  <td className="px-4 py-3">12.05.2023</td>
                  <td className="px-4 py-3">ali.yilmaz</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Çözülmedi</span>
                  </td>
                </tr>
                <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-4 py-3">Veri Erişim İhlali</td>
                  <td className="px-4 py-3">Tedarikçi Bilgileri</td>
                  <td className="px-4 py-3">10.05.2023</td>
                  <td className="px-4 py-3">mehmet.demir</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">İnceleniyor</span>
                  </td>
                </tr>
                <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-4 py-3">Veri Kalitesi Standardı İhlali</td>
                  <td className="px-4 py-3">Ürün Açıklamaları</td>
                  <td className="px-4 py-3">08.05.2023</td>
                  <td className="px-4 py-3">ayse.kaya</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Çözüldü</span>
                  </td>
                </tr>
                <tr className="bg-white dark:bg-gray-800">
                  <td className="px-4 py-3">Geçersiz Veri Girişi</td>
                  <td className="px-4 py-3">Öznitelik Değerleri</td>
                  <td className="px-4 py-3">05.05.2023</td>
                  <td className="px-4 py-3">can.ozturk</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Çözüldü</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <button className="w-full mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
            Tüm ihlalleri görüntüle
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Yönetişim Değerlendirme</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Politika Uyumluluğu</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">84%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '84%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Veri Sorumluluğu</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">İhlal Yönetimi</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">76%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: '76%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Erişim Kontrolü</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">88%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Veri Yaşam Döngüsü</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">65%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-red-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">İyileştirme Önerileri</h3>
            <ul className="list-disc ml-5 text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <li>Veri yaşam döngüsü yönetimi süreçlerini geliştirin</li>
              <li>İhlal yönetimi için daha hızlı yanıt süreci oluşturun</li>
              <li>Veri sorumluları için periyodik eğitimler düzenleyin</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Veri Sözlüğü */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">Veri Sözlüğü Durumu</h2>
          <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            Veri Sözlüğünü Görüntüle
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Toplam Veri Öğesi</h3>
              <span className="text-lg font-bold text-gray-900 dark:text-white">1,245</span>
            </div>
            <div className="flex items-center text-green-600 dark:text-green-400 text-xs">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              <span>+38 son 30 günde</span>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Tanımlı Öğeler</h3>
              <span className="text-lg font-bold text-gray-900 dark:text-white">964</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '77%' }}></div>
              </div>
              <span className="ml-2 text-xs text-gray-700 dark:text-gray-300">77%</span>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Standartlaştırılmış</h3>
              <span className="text-lg font-bold text-gray-900 dark:text-white">812</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <span className="ml-2 text-xs text-gray-700 dark:text-gray-300">65%</span>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">İyileştirilmesi Gerekenler</h3>
              <span className="text-lg font-bold text-gray-900 dark:text-white">98</span>
            </div>
            <div className="flex items-center text-yellow-600 dark:text-yellow-400 text-xs">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm-1-5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm-1-8H9a1 1 0 112 0v4a1 1 0 11-2 0V3z" clipRule="evenodd" />
              </svg>
              <span>Öncelikli olarak düzeltilmeli</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGovernance; 