import React from 'react';

const DashboardGovernance: React.FC = () => {
  // Örnek veri - Finans departmanı için yönetişim metrikleri
  const complianceMetrics = [
    { metric: 'Finansal uyum oranı', value: '94%', status: 'success' },
    { metric: 'Raporlama zamanında tamamlanma', value: '89%', status: 'success' },
    { metric: 'Denetim hazırlık seviyesi', value: '92%', status: 'success' },
    { metric: 'Veri güvenliği uyum oranı', value: '78%', status: 'warning' },
    { metric: 'İç kontrol etkinliği', value: '81%', status: 'warning' },
  ];

  const recentAudits = [
    { id: 1, type: 'İç Denetim', name: 'Q1 Finansal Raporlama Denetimi', date: '15 Mart 2023', status: 'Tamamlandı', result: 'Başarılı' },
    { id: 2, type: 'Dış Denetim', name: 'Yıllık Mali Denetim', date: '22 Nisan 2023', status: 'Tamamlandı', result: 'Şartlı Olumlu' },
    { id: 3, type: 'İç Denetim', name: 'Bütçe Kontrol Denetimi', date: '10 Mayıs 2023', status: 'Devam Ediyor', result: 'Beklemede' },
    { id: 4, type: 'Uyumluluk', name: 'KVKK Uyum Denetimi', date: '5 Haziran 2023', status: 'Planlanan', result: 'Beklemede' },
  ];

  const policies = [
    { id: 1, name: 'Finansal Raporlama Politikası', department: 'Finans', updated: '12 Ocak 2023', status: 'Aktif' },
    { id: 2, name: 'Bütçe Onay Prosedürü', department: 'Finans', updated: '3 Şubat 2023', status: 'Aktif' },
    { id: 3, name: 'Harcama Yetkilendirme Politikası', department: 'Finans & İdari İşler', updated: '25 Mart 2023', status: 'Revizyon Bekliyor' },
    { id: 4, name: 'Finansal Risk Yönetimi Politikası', department: 'Finans', updated: '7 Nisan 2023', status: 'Aktif' },
  ];

  const riskItems = [
    { id: 1, name: 'Nakit akışı yetersizliği', severity: 'high', owner: 'Finans Direktörü', mitigation: 'Nakit akışı tahmini ve kredi limiti revizyonu', dueDate: '15 Temmuz 2023' },
    { id: 2, name: 'Kur riski', severity: 'medium', owner: 'Hazine Müdürü', mitigation: 'Forward kontratlar', dueDate: '30 Temmuz 2023' },
    { id: 3, name: 'Finansal raporlama hataları', severity: 'medium', owner: 'Muhasebe Müdürü', mitigation: 'İç kontrollerin güçlendirilmesi', dueDate: '10 Ağustos 2023' },
    { id: 4, name: 'Likidite riski', severity: 'high', owner: 'Finans Direktörü', mitigation: 'Ek likidite kaynakları ve acil durum fonları', dueDate: '1 Eylül 2023' },
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

  // Risk seviyesi renk sınıfları
  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  
  return (
    <div className="w-full">
      {/* Üst başlık ve filtreler */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Finansal Yönetişim Paneli</h1>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Rapor İndir
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Ayarlar
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

      {/* Denetim & Politika Bölümü */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Son Denetimler */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">Son Denetimler</h2>
            <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Tümünü Gör</a>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-4 py-3">Denetim</th>
                  <th scope="col" className="px-4 py-3">Tarih</th>
                  <th scope="col" className="px-4 py-3">Durum</th>
                  <th scope="col" className="px-4 py-3">Sonuç</th>
                </tr>
              </thead>
              <tbody>
                {recentAudits.map(audit => (
                  <tr key={audit.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{audit.name}</div>
                        <div className="text-xs">{audit.type}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{audit.date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        audit.status === 'Tamamlandı' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        audit.status === 'Devam Ediyor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {audit.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        audit.result === 'Başarılı' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        audit.result === 'Şartlı Olumlu' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {audit.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Politikalar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">Finansal Politikalar</h2>
            <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md">Yeni Ekle</button>
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
                {policies.map(policy => (
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
      </div>

      {/* Risk Yönetimi */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">Finansal Risk Yönetimi</h2>
          <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md">Risk Ekle</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-4 py-3">Risk</th>
                <th scope="col" className="px-4 py-3">Seviye</th>
                <th scope="col" className="px-4 py-3">Sorumlu</th>
                <th scope="col" className="px-4 py-3">Azaltma Stratejisi</th>
                <th scope="col" className="px-4 py-3">Son Tarih</th>
              </tr>
            </thead>
            <tbody>
              {riskItems.map(risk => (
                <tr key={risk.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{risk.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityClass(risk.severity)}`}>
                      {risk.severity === 'high' ? 'Yüksek' : risk.severity === 'medium' ? 'Orta' : 'Düşük'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{risk.owner}</td>
                  <td className="px-4 py-3">{risk.mitigation}</td>
                  <td className="px-4 py-3">{risk.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alt paneller bölümü */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mevzuat Takip */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Mevzuat Değişiklikleri</h2>
          <div className="space-y-4">
            <div className="p-4 border border-blue-100 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">TFRS 16 Güncelleme</h3>
                <span className="text-xs text-blue-600 dark:text-blue-400">5 Haziran 2023</span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-400">Kiralama işlemlerine ilişkin TFRS 16 standardında yapılan güncellemeler.</p>
              <a href="#" className="mt-2 inline-block text-xs text-blue-600 dark:text-blue-400 hover:underline">Detaylar</a>
            </div>

            <div className="p-4 border border-green-100 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Vergi Mevzuatı Değişikliği</h3>
                <span className="text-xs text-green-600 dark:text-green-400">20 Mayıs 2023</span>
              </div>
              <p className="text-xs text-green-700 dark:text-green-400">Kurumlar vergisi oranlarında yapılan güncellemeler ve yeni teşvik paketleri.</p>
              <a href="#" className="mt-2 inline-block text-xs text-green-600 dark:text-green-400 hover:underline">Detaylar</a>
            </div>

            <div className="p-4 border border-purple-100 dark:border-purple-800 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-purple-800 dark:text-purple-300">Bankacılık Düzenlemeleri</h3>
                <span className="text-xs text-purple-600 dark:text-purple-400">12 Nisan 2023</span>
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-400">BDDK tarafından yayınlanan yeni finansal raporlama düzenlemeleri.</p>
              <a href="#" className="mt-2 inline-block text-xs text-purple-600 dark:text-purple-400 hover:underline">Detaylar</a>
            </div>
          </div>
        </div>

        {/* Sorumluluk Matrisi */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Finansal Sorumluluk Matrisi</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-4 py-3">Süreç</th>
                  <th scope="col" className="px-4 py-3">Sorumlu</th>
                  <th scope="col" className="px-4 py-3">Onaylayan</th>
                  <th scope="col" className="px-4 py-3">Bilgilendirilen</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Bütçe Onayı</td>
                  <td className="px-4 py-3">Finans Müdürü</td>
                  <td className="px-4 py-3">CFO, CEO</td>
                  <td className="px-4 py-3">Departman Yöneticileri</td>
                </tr>
                <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Finansal Raporlama</td>
                  <td className="px-4 py-3">Muhasebe Müdürü</td>
                  <td className="px-4 py-3">CFO</td>
                  <td className="px-4 py-3">CEO, Yönetim Kurulu</td>
                </tr>
                <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Nakit Yönetimi</td>
                  <td className="px-4 py-3">Hazine Müdürü</td>
                  <td className="px-4 py-3">Finans Direktörü</td>
                  <td className="px-4 py-3">CFO</td>
                </tr>
                <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Yatırım Kararları</td>
                  <td className="px-4 py-3">CFO</td>
                  <td className="px-4 py-3">CEO, Yönetim Kurulu</td>
                  <td className="px-4 py-3">Finans Ekibi, İlgili Departmanlar</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGovernance; 