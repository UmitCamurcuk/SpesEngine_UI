import React from 'react';

// İK ve Finansal veriler için kalite dashboard modülü
const DataQualityDashboard: React.FC = () => {
  return (
    <div className="w-full">
      {/* Üst başlık ve filtreler */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">İK ve Finans Veri Kalitesi Paneli</h1>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <select className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md px-3 py-2 text-sm">
            <option>Tüm Departmanlar</option>
            <option>Finans</option>
            <option>İnsan Kaynakları</option>
            <option>Muhasebe</option>
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
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">Finansal Veri Kalitesi Skoru</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">4 kategoride tüm finansal verilerin kalite değerlendirmesi</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="inline-flex items-center text-green-600 dark:text-green-400">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">+3.2%</span>
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
                className="text-blue-600 dark:text-blue-400"
                strokeWidth="10"
                strokeDasharray={250}
                strokeDashoffset={250 * (1 - 0.89)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-gray-800 dark:text-white">89</span>
              <span className="text-lg text-gray-600 dark:text-gray-400">/ 100</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">94%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tamamlık</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">91%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Doğruluk</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">85%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tutarlılık</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">87%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Güncellik</div>
            </div>
          </div>
        </div>
      </div>

      {/* İK Verileri Kalitesi */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">İK Veri Kalitesi Skoru</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Personel, performans ve özlük verilerinin kalite değerlendirmesi</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="inline-flex items-center text-red-600 dark:text-red-400">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">-1.8%</span>
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
                className="text-purple-600 dark:text-purple-400"
                strokeWidth="10"
                strokeDasharray={250}
                strokeDashoffset={250 * (1 - 0.82)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-gray-800 dark:text-white">82</span>
              <span className="text-lg text-gray-600 dark:text-gray-400">/ 100</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">88%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tamamlık</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">86%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Doğruluk</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">76%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tutarlılık</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">79%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Güncellik</div>
            </div>
          </div>
        </div>
      </div>

      {/* Veri Kalitesi Trendleri */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Finans Kalite Trendleri</h2>
          <div className="h-72 bg-gray-50 dark:bg-gray-700 rounded flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Bu alanda finans verisi kalite trend grafiği gösterilecek</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">İK Kalite Trendleri</h2>
          <div className="h-72 bg-gray-50 dark:bg-gray-700 rounded flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Bu alanda İK verisi kalite trend grafiği gösterilecek</p>
          </div>
        </div>
      </div>

      {/* Veri kalitesi sorunları ve öneriler */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Veri Kalitesi Sorunları</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Sorun</th>
                  <th scope="col" className="px-6 py-3">Departman</th>
                  <th scope="col" className="px-6 py-3">Etki</th>
                  <th scope="col" className="px-6 py-3">Durum</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-6 py-4">Eksik personel özlük bilgileri</td>
                  <td className="px-6 py-4">İnsan Kaynakları</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Yüksek</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Devam ediyor</span>
                  </td>
                </tr>
                <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-6 py-4">Tutarsız finansal raporlar</td>
                  <td className="px-6 py-4">Finans</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Yüksek</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Çözüldü</span>
                  </td>
                </tr>
                <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-6 py-4">Performans değerlendirme eksiklikleri</td>
                  <td className="px-6 py-4">İnsan Kaynakları</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Orta</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Devam ediyor</span>
                  </td>
                </tr>
                <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-6 py-4">Eksik fatura bilgileri</td>
                  <td className="px-6 py-4">Muhasebe</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Düşük</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Planlı</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">İyileştirme Önerileri</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">Otomatik veri doğrulama sistemi</h3>
              <p className="text-xs text-green-700 dark:text-green-400">Finans ve muhasebe verilerinin girildiği anda doğrulama yapılması için otomatik kontrol mekanizmalarının kurulması.</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">İK veri giriş standartları</h3>
              <p className="text-xs text-blue-700 dark:text-blue-400">Personel bilgilerinin daha standart ve eksiksiz girilmesi için zorunlu alanların ve format kontrollerinin iyileştirilmesi.</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg">
              <h3 className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">Veri kalitesi eğitimi</h3>
              <p className="text-xs text-purple-700 dark:text-purple-400">İK ve finans departmanı çalışanlarına veri kalitesi ve veri girişi konusunda eğitim verilmesi.</p>
            </div>
          </div>
          <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Tüm önerileri görüntüle
          </button>
        </div>
      </div>

      {/* Bilgi panosu */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 mr-4">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">Finansal Veri Kalitesi Hakkında</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Finansal ve İK veri kalitesi puanları nasıl hesaplanır?</p>
          </div>
        </div>
        <div className="pl-14">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Finansal ve İK veri kalitesi skorları, dört temel metriğin ağırlıklı ortalamasıdır:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
            <li><strong>Tamamlık:</strong> Zorunlu verilerin eksiksiz olarak girilmiş olması</li>
            <li><strong>Doğruluk:</strong> Finansal ve İK verilerinin gerçeği yansıtması ve doğru hesaplanması</li>
            <li><strong>Tutarlılık:</strong> İK ve finans modülleri arasındaki çapraz veri tutarlılığı</li>
            <li><strong>Güncellik:</strong> Finansal raporların ve İK verilerinin güncellenme sıklığı</li>
          </ul>
          <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
            Daha fazla bilgi edinin
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataQualityDashboard; 