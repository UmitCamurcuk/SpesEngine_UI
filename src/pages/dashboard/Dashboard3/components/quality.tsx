import React from 'react';

const DataQualityDashboard: React.FC = () => {
  return (
    <div className="w-full">
      {/* Üst başlık ve filtreler */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Müşteri Veri Kalitesi</h1>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <select className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md px-3 py-2 text-sm">
            <option>Tüm Müşteri Segmentleri</option>
            <option>Yeni Müşteriler</option>
            <option>Düzenli Müşteriler</option>
            <option>VIP Müşteriler</option>
          </select>
          <select className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md px-3 py-2 text-sm">
            <option>Son 30 Gün</option>
            <option>Son 90 Gün</option>
            <option>Son 12 Ay</option>
            <option>Tüm Zamanlar</option>
          </select>
        </div>
      </div>

      {/* Genel veri kalitesi skoru */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">Müşteri Veri Kalitesi Skoru</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Müşteri segmentleri ve demografik bilgilerin kalite değerlendirmesi</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="inline-flex items-center text-green-600 dark:text-green-400">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">+2.5%</span>
              <span className="text-gray-600 dark:text-gray-400 ml-1">son 30 günde</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 mb-6">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-gray-200 dark:text-gray-700"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
              <circle
                className="text-pink-600 dark:text-pink-400"
                strokeWidth="10"
                strokeDasharray={250}
                strokeDashoffset={250 * (1 - 0.84)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-gray-800 dark:text-white">84</span>
              <span className="text-lg text-gray-600 dark:text-gray-400">/ 100</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">91%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tamamlık</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">87%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Doğruluk</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">82%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tutarlılık</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">76%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Güncellik</div>
            </div>
          </div>
        </div>
      </div>

      {/* Müşteri Veri Kalitesi Dağılımı */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Veri kalitesi dağılımı grafik */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Müşteri Segmentlerine Göre Veri Kalitesi</h2>
          <div className="h-72 bg-gray-50 dark:bg-gray-700 rounded flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Burada müşteri segmentlerine göre veri kalitesi grafik olarak gösterilecek</p>
          </div>
        </div>

        {/* Veri kalitesi istatistikleri */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Veri Kalitesi İstatistikleri</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Yeni Müşteriler</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Düzenli Müşteriler</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">86%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '86%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">VIP Müşteriler</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">94%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kaybolma Riski Taşıyan</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">68%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-red-600 h-2.5 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Yukarıdaki veriler müşteri segmentlerine göre veri kalitesi skorlarını göstermektedir. VIP müşterilerde en yüksek veri kalitesi sağlanırken, kaybolma riski taşıyan müşterilerde ise veri kalitesi düşüktür.
            </p>
          </div>
        </div>
      </div>

      {/* Veri kalitesi sorunları ve çözüm önerileri */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Veri Kalitesi Sorunları */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Tespit Edilen Veri Kalitesi Sorunları</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Sorun</th>
                  <th scope="col" className="px-6 py-3">Segment</th>
                  <th scope="col" className="px-6 py-3">Etki</th>
                  <th scope="col" className="px-6 py-3">Durum</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-6 py-4">Eksik iletişim bilgileri</td>
                  <td className="px-6 py-4">Yeni Müşteriler</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Yüksek</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Devam ediyor</span>
                  </td>
                </tr>
                <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-6 py-4">Tekrarlanan müşteri profilleri</td>
                  <td className="px-6 py-4">Tüm Segmentler</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Orta</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Tespit edildi</span>
                  </td>
                </tr>
                <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-6 py-4">Güncel olmayan adres bilgileri</td>
                  <td className="px-6 py-4">Kaybolma Riski Taşıyan</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Yüksek</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Çözüldü</span>
                  </td>
                </tr>
                <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-6 py-4">Eksik demografik bilgiler</td>
                  <td className="px-6 py-4">Düzenli Müşteriler</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Düşük</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Devam ediyor</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* İyileştirme Önerileri */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">İyileştirme Önerileri</h2>
          <div className="space-y-4">
            <div className="p-4 bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800 rounded-lg">
              <h3 className="text-sm font-medium text-pink-800 dark:text-pink-300 mb-2">Müşteri Profil Tamamlama Kampanyası</h3>
              <p className="text-xs text-pink-700 dark:text-pink-400">Eksik bilgilerin tamamlanması için müşterilere özel indirim kuponları sunulması.</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Veri Doğrulama Araçları</h3>
              <p className="text-xs text-blue-700 dark:text-blue-400">CRM sistemindeki veri giriş formlarına doğrulama kurallarının eklenmesi.</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">Otomatik Veri Zenginleştirme</h3>
              <p className="text-xs text-green-700 dark:text-green-400">Üçüncü parti veri kaynakları kullanılarak müşteri profillerinin otomatik zenginleştirilmesi.</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg">
              <h3 className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">Müşteri Veri Birleştirme</h3>
              <p className="text-xs text-purple-700 dark:text-purple-400">Tekrarlanan müşteri kayıtlarının otomatik tespit edilip birleştirilmesi.</p>
            </div>
          </div>
          <button className="w-full mt-4 bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            İyileştirme planını başlat
          </button>
        </div>
      </div>

      {/* Veri Kalitesi Trendleri */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white">Veri Kalitesi Trendi (Son 12 Ay)</h2>
          <div className="flex space-x-2">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-pink-500 mr-1"></span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Genel Skor</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Tamamlık</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Doğruluk</span>
            </div>
          </div>
        </div>
        <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Burada 12 aylık veri kalitesi trend grafiği gösterilecek</p>
        </div>
      </div>

      {/* Veri Kalitesi Eğitimi ve Bilgi Kutusu */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <div className="p-3 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 mr-4">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">Müşteri Veri Kalitesi Hakkında</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Müşteri veri kalitesi puanları nasıl hesaplanır?</p>
          </div>
        </div>
        <div className="pl-14">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Müşteri veri kalitesi skorları, dört temel metriğin ağırlıklı ortalamasıdır:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
            <li><strong>Tamamlık:</strong> Müşteri profilindeki zorunlu ve isteğe bağlı alanların doldurulma oranı</li>
            <li><strong>Doğruluk:</strong> Müşteri verilerinin doğru ve güncel olma durumu</li>
            <li><strong>Tutarlılık:</strong> Farklı sistemlerdeki müşteri verilerinin uyuşma oranı</li>
            <li><strong>Güncellik:</strong> Müşteri verilerinin ne sıklıkta güncellendiği</li>
          </ul>
          <button className="text-pink-600 dark:text-pink-400 hover:underline text-sm font-medium">
            Veri kalitesi kılavuzunu görüntüle
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataQualityDashboard; 