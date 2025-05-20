import React from 'react';

const DashboardOverview: React.FC = () => {
  // Örnek pazarlama performans verileri
  const stats = [
    { label: 'Toplam Kampanya', value: '24', change: '+4', color: 'pink' },
    { label: 'Web Ziyaretçileri', value: '145,892', change: '+12%', color: 'blue' },
    { label: 'Yeni Müşteriler', value: '2,847', change: '+5%', color: 'green' },
    { label: 'Dönüşüm Oranı', value: '3.6%', change: '+0.8%', color: 'purple' },
  ];

  const performanceMetrics = [
    { id: 1, channel: 'E-posta Pazarlama', sent: 45200, opened: 18080, clickRate: 6.2, conversionRate: 2.1 },
    { id: 2, channel: 'Sosyal Medya', sent: 124500, opened: 22410, clickRate: 8.4, conversionRate: 1.6 },
    { id: 3, channel: 'Arama Motoru', sent: 89300, opened: 51874, clickRate: 4.9, conversionRate: 3.8 },
    { id: 4, channel: 'İçerik Pazarlama', sent: 28500, opened: 11115, clickRate: 7.1, conversionRate: 2.3 },
  ];

  const campaigns = [
    { id: 1, name: 'Yaz Sezonu Kampanyası', status: 'active', reach: 28500, engagement: 4.2, conversion: 3.1, roi: 2.8 },
    { id: 2, name: 'Yeni Üye Promosyonu', status: 'active', reach: 12800, engagement: 5.6, conversion: 4.2, roi: 3.5 },
    { id: 3, name: 'Marka Bilinirliği', status: 'completed', reach: 45800, engagement: 2.8, conversion: 1.9, roi: 1.4 },
    { id: 4, name: 'Özel İndirim Günleri', status: 'scheduled', reach: 0, engagement: 0, conversion: 0, roi: 0 },
  ];

  return (
    <div className="w-full">
      {/* Üst başlık ve filtreler */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Pazarlama Performansı</h1>
          <p className="text-gray-600 dark:text-gray-400">Kampanya ve müşteri ilişkileri performans metrikleri</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <select className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md px-3 py-2 text-sm">
            <option>Son 7 Gün</option>
            <option>Son 30 Gün</option>
            <option>Son 90 Gün</option>
            <option>Son 12 Ay</option>
          </select>
          <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Rapor İndir
          </button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`text-${stat.color}-500 dark:text-${stat.color}-400 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 p-3 rounded-full`}>
                {stat.label === 'Toplam Kampanya' && (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                  </svg>
                )}
                {stat.label === 'Web Ziyaretçileri' && (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 15a1 1 0 000-2H6a1 1 0 000 2h8z" />
                  </svg>
                )}
                {stat.label === 'Yeni Müşteriler' && (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                )}
                {stat.label === 'Dönüşüm Oranı' && (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${stat.change.startsWith('+') ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
                {stat.change.startsWith('+') ? (
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                  </svg>
                )}
                {stat.change}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">son 30 günde</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pazarlama Kanalları Performansı */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Pazarlama Kanalları Performansı</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-4 py-3">Kanal</th>
                <th scope="col" className="px-4 py-3">Gönderim</th>
                <th scope="col" className="px-4 py-3">Görüntülenme</th>
                <th scope="col" className="px-4 py-3">Tıklama Oranı</th>
                <th scope="col" className="px-4 py-3">Dönüşüm Oranı</th>
                <th scope="col" className="px-4 py-3">Performans</th>
              </tr>
            </thead>
            <tbody>
              {performanceMetrics.map((metric) => (
                <tr key={metric.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{metric.channel}</td>
                  <td className="px-4 py-3">{metric.sent.toLocaleString()}</td>
                  <td className="px-4 py-3">{metric.opened.toLocaleString()}</td>
                  <td className="px-4 py-3">{metric.clickRate}%</td>
                  <td className="px-4 py-3">{metric.conversionRate}%</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            metric.conversionRate > 3 ? 'bg-green-500' : 
                            metric.conversionRate > 2 ? 'bg-blue-500' : 
                            metric.conversionRate > 1 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} 
                          style={{ width: `${metric.conversionRate * 10}%` }}
                        ></div>
                      </div>
                      <span className="text-xs">{metric.conversionRate * 10}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grafik ve Kampanya Panelleri */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Grafik */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">Müşteri Etkileşim Trendi</h2>
            <div className="inline-flex rounded-md shadow-sm">
              <button type="button" className="py-1.5 px-3 text-xs font-medium rounded-l-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Günlük</button>
              <button type="button" className="py-1.5 px-3 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">Haftalık</button>
              <button type="button" className="py-1.5 px-3 text-xs font-medium rounded-r-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Aylık</button>
            </div>
          </div>
          <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Burada müşteri etkileşim trend grafiği gösterilecek</p>
          </div>
        </div>

        {/* Aktif Kampanyalar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">Aktif Kampanyalar</h2>
            <button className="text-sm text-pink-600 dark:text-pink-400 hover:underline">Tümünü Gör</button>
          </div>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{campaign.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    campaign.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {campaign.status === 'active' ? 'Aktif' : campaign.status === 'scheduled' ? 'Planlanmış' : 'Tamamlandı'}
                  </span>
                </div>

                {campaign.status !== 'scheduled' && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Erişim</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{campaign.reach.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Etkileşim</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{campaign.engagement}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Dönüşüm</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{campaign.conversion}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">ROI</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{campaign.roi}x</p>
                    </div>
                  </div>
                )}

                {campaign.status === 'scheduled' && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Başlangıç tarihi: 15 Ağustos 2023</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alt Bölüm - Hedef Kitle ve Müşteri Segmentleri */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hedef Kitle */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Hedef Kitle Demografik Dağılımı</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Yaş Grupları</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">18-24</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">18%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '18%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">25-34</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">32%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '32%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">35-44</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">27%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '27%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">45-54</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">16%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '16%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">55+</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">7%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '7%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Cinsiyet Dağılımı</h3>
              <div className="relative h-40 flex items-center justify-center">
                <div className="bg-pink-500 dark:bg-pink-600 h-40 w-40 rounded-full absolute opacity-20"></div>
                <div className="bg-blue-500 dark:bg-blue-600 h-40 w-40 rounded-full absolute opacity-20 transform translate-x-4"></div>
                <div className="z-10 grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">46%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Kadın</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">54%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Erkek</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Müşteri Segmentleri */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Müşteri Segmentleri</h2>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Düzenli Müşteriler</h3>
                <div className="mt-1 flex justify-between items-center">
                  <p className="text-xs text-blue-700 dark:text-blue-400">Toplam müşterilerin %38'i</p>
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-300">15,842</span>
                </div>
              </div>
            </div>

            <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Yeni Müşteriler</h3>
                <div className="mt-1 flex justify-between items-center">
                  <p className="text-xs text-green-700 dark:text-green-400">Son 30 günde kazanılan</p>
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">2,847</span>
                </div>
              </div>
            </div>

            <div className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-sm font-medium text-purple-800 dark:text-purple-300">VIP Müşteriler</h3>
                <div className="mt-1 flex justify-between items-center">
                  <p className="text-xs text-purple-700 dark:text-purple-400">En yüksek harcama yapan %5</p>
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-300">2,085</span>
                </div>
              </div>
            </div>

            <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Kaybolma Riski Taşıyan</h3>
                <div className="mt-1 flex justify-between items-center">
                  <p className="text-xs text-red-700 dark:text-red-400">90+ gün aktif olmayan</p>
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">4,628</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview; 