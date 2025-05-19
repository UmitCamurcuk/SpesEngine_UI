import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  // Örnek veriler
  const stats = [
    { id: 1, name: 'Toplam Ürün', value: '12,456', icon: 'package' },
    { id: 2, name: 'Toplam Kategori', value: '347', icon: 'folder' },
    { id: 3, name: 'Toplam Tedarikçi', value: '642', icon: 'truck' },
    { id: 4, name: 'Veri Kalitesi', value: '86%', icon: 'chart' },
  ];

  const recentActivities = [
    { id: 1, user: 'Ahmet Yılmaz', action: 'Yeni ürün ekledi', target: 'Akıllı Telefon X23', time: '15 dakika önce' },
    { id: 2, user: 'Ayşe Demir', action: 'Kategori güncelledi', target: 'Elektronik Eşyalar', time: '45 dakika önce' },
    { id: 3, user: 'Mehmet Kaya', action: 'Tedarikçi bilgilerini güncelledi', target: 'ABC Elektronik Ltd.', time: '2 saat önce' },
    { id: 4, user: 'Zeynep Şahin', action: 'Öznitelik ekledi', target: 'Enerji Verimliliği', time: '4 saat önce' },
  ];

  const quickLinks = [
    { id: 1, name: 'Yeni Ürün Ekle', icon: 'plus', color: 'blue' },
    { id: 2, name: 'Kalite Raporu', icon: 'chart', color: 'green' },
    { id: 3, name: 'Kategori Yönetimi', icon: 'folder', color: 'amber' },
    { id: 4, name: 'Veri İçe Aktar', icon: 'upload', color: 'purple' },
    { id: 5, name: 'Tedarikçi Ekle', icon: 'truck', color: 'indigo' },
    { id: 6, name: 'Raporlar', icon: 'document', color: 'red' },
  ];

  const dashboardCards = [
    {
      id: 1,
      title: 'Genel Bakış',
      description: 'Sistem geneline ait temel metrikler ve özet bilgiler',
      icon: 'chart-bar',
      color: 'blue',
      link: '/dashboard/overview'
    },
    {
      id: 2,
      title: 'Veri Kalitesi',
      description: 'Veri kalitesi metrikleri, sorunlar ve iyileştirme önerileri',
      icon: 'check-circle',
      color: 'green',
      link: '/dashboard/quality'
    },
    {
      id: 3,
      title: 'Veri Yönetişimi',
      description: 'Veri yönetişimi, politikalar ve standartlar',
      icon: 'shield-check',
      color: 'purple',
      link: '/dashboard/governance'
    }
  ];

  // İkon komponentleri
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'package':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17A3 3 0 015 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
            <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
          </svg>
        );
      case 'folder':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
        );
      case 'truck':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-2a1 1 0 00-1 1v6.05A2.5 2.5 0 0115 15.95V8a1 1 0 00-1-1z" />
          </svg>
        );
      case 'chart':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
          </svg>
        );
      case 'plus':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        );
      case 'upload':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'document':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'chart-bar':
        return (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        );
      case 'check-circle':
        return (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'shield-check':
        return (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Spesengine MDM</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Kurumunuzun tüm verilerini tek bir noktadan yönetin, veri kalitesini artırın ve iş süreçlerinizi iyileştirin.
        </p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map(stat => (
          <div key={stat.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center">
            <div className={`flex-shrink-0 mr-4 p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300`}>
              {getIcon(stat.icon)}
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard Kartları */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {dashboardCards.map(card => (
          <Link 
            key={card.id} 
            to={card.link}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-${card.color}-100 dark:bg-${card.color}-900/30 text-${card.color}-600 dark:text-${card.color}-300`}>
              {getIcon(card.icon)}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{card.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{card.description}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Son Aktiviteler */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Son Aktiviteler</h2>
          <div className="space-y-4">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-start border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-300">
                    {activity.user.charAt(0)}
                  </div>
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white">
                    <span className="font-medium">{activity.user}</span> {activity.action}{" "}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
              Tüm aktiviteleri görüntüle
            </button>
          </div>
        </div>

        {/* Hızlı Erişim */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Hızlı Erişim</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map(link => (
              <button
                key={link.id}
                className={`flex items-center p-3 rounded-lg bg-${link.color}-50 dark:bg-${link.color}-900/20 text-${link.color}-600 dark:text-${link.color}-300 hover:bg-${link.color}-100 dark:hover:bg-${link.color}-900/30 transition-colors`}
              >
                <div className="mr-2">{getIcon(link.icon)}</div>
                <span className="text-sm font-medium">{link.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alt Alan */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Veri Yönetimini Bir Adım İleriye Taşıyın</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Gelişmiş raporlama özellikleri ve veri entegrasyonları ile verilerinizi daha etkin yönetin.
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Hemen Başlayın
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home; 