import React, { useState } from 'react';
import { useAppSelector } from '../../redux/store';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const ProfilePage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'notifications' | 'sessions'>('info');
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    jobTitle: 'Yazılım Mühendisi', // Örnek değer
    department: 'Mühendislik', // Örnek değer
    company: 'SpesEngine', // Örnek değer
    phone: '+90 555 123 4567', // Örnek değer
  });
  
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    desktopNotifications: true,
    weeklyDigest: true,
    systemAlerts: true,
  });
  
  // Örnek aktif oturumlar
  const sessions = [
    {
      id: 1,
      device: 'Chrome on MacOS',
      location: 'İstanbul, Türkiye',
      ip: '192.168.1.1',
      lastActive: 'Şimdi',
      isCurrent: true,
    },
    {
      id: 2,
      device: 'Safari on iPhone',
      location: 'İstanbul, Türkiye',
      ip: '192.168.1.2',
      lastActive: '2 saat önce',
      isCurrent: false,
    },
    {
      id: 3,
      device: 'Firefox on Windows',
      location: 'Ankara, Türkiye',
      ip: '192.168.1.3',
      lastActive: '3 gün önce',
      isCurrent: false,
    },
  ];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassword({
      ...password,
      [name]: value,
    });
  };
  
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotifications({
      ...notifications,
      [name]: checked,
    });
  };
  
  const handleEditProfile = () => {
    setIsEditing(true);
  };
  
  const handleSaveProfile = () => {
    // Burada profil bilgilerini kaydetme işlemi yapılacak
    setIsEditing(false);
    // Başarılı kayıt mesajı göster
    alert('Profil bilgileriniz başarıyla güncellendi.');
  };
  
  const handleChangePassword = () => {
    // Burada şifre değiştirme işlemi yapılacak
    alert('Şifreniz başarıyla değiştirildi.');
    setPassword({
      current: '',
      new: '',
      confirm: '',
    });
  };
  
  const handleLogoutSession = (sessionId: number) => {
    // Burada oturumu kapatma işlemi yapılacak
    alert(`${sessionId} ID'li oturum kapatıldı.`);
  };
  
  const handleLogoutAllSessions = () => {
    // Burada tüm oturumları kapatma işlemi yapılacak
    alert('Tüm diğer oturumlar kapatıldı.');
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profil Bilgileri */}
        <div className="md:w-1/3 lg:w-1/4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 sticky top-20">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                <button className="absolute bottom-0 right-0 bg-gray-100 dark:bg-gray-700 p-2 rounded-full shadow hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              
              <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</h2>
              <p className="text-gray-600 dark:text-gray-400">{formData.jobTitle}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">{formData.department} - {formData.company}</p>
              
              <div className="w-full mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`flex items-center w-full px-3 py-2 text-left rounded-lg transition-colors ${activeTab === 'info' ? 'bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profil Bilgileri
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('password')}
                    className={`flex items-center w-full px-3 py-2 text-left rounded-lg transition-colors ${activeTab === 'password' ? 'bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Şifre Değiştir
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`flex items-center w-full px-3 py-2 text-left rounded-lg transition-colors ${activeTab === 'notifications' ? 'bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Bildirim Ayarları
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('sessions')}
                    className={`flex items-center w-full px-3 py-2 text-left rounded-lg transition-colors ${activeTab === 'sessions' ? 'bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Aktif Oturumlar
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
        
        {/* Aktif Panel İçeriği */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            {activeTab === 'info' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profil Bilgileri</h2>
                  {!isEditing ? (
                    <Button variant="outline" onClick={handleEditProfile}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Düzenle
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        İptal
                      </Button>
                      <Button onClick={handleSaveProfile}>
                        Kaydet
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Ad"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    fullWidth
                  />
                  
                  <Input
                    label="Soyad"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    fullWidth
                  />
                  
                  <Input
                    label="E-posta"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled
                    fullWidth
                    helperText="E-posta adresi değiştirilemez"
                  />
                  
                  <Input
                    label="Telefon"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    fullWidth
                  />
                  
                  <Input
                    label="Unvan"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    fullWidth
                  />
                  
                  <Input
                    label="Departman"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    fullWidth
                  />
                  
                  <Input
                    label="Şirket"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    fullWidth
                  />
                </div>
              </div>
            )}
            
            {activeTab === 'password' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Şifre Değiştir</h2>
                
                <div className="space-y-4 max-w-md">
                  <Input
                    label="Mevcut Şifre"
                    name="current"
                    type="password"
                    value={password.current}
                    onChange={handlePasswordChange}
                    fullWidth
                  />
                  
                  <Input
                    label="Yeni Şifre"
                    name="new"
                    type="password"
                    value={password.new}
                    onChange={handlePasswordChange}
                    fullWidth
                    helperText="En az 8 karakter, büyük-küçük harf ve sayı içermelidir"
                  />
                  
                  <Input
                    label="Yeni Şifre (Tekrar)"
                    name="confirm"
                    type="password"
                    value={password.confirm}
                    onChange={handlePasswordChange}
                    fullWidth
                  />
                  
                  <Button onClick={handleChangePassword} className="mt-2">
                    Şifreyi Değiştir
                  </Button>
                </div>
              </div>
            )}
            
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Bildirim Ayarları</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">E-posta Bildirimleri</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Önemli olaylar hakkında e-posta bildirimleri al</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="emailNotifications"
                        className="sr-only peer"
                        checked={notifications.emailNotifications}
                        onChange={handleNotificationChange}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">SMS Bildirimleri</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Kritik olaylar için SMS bildirimleri al</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="smsNotifications"
                        className="sr-only peer"
                        checked={notifications.smsNotifications}
                        onChange={handleNotificationChange}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Masaüstü Bildirimleri</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Web tarayıcısında masaüstü bildirimlerini görüntüle</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="desktopNotifications"
                        className="sr-only peer"
                        checked={notifications.desktopNotifications}
                        onChange={handleNotificationChange}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Haftalık Özet</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Her hafta aktivitelerinizin özetini e-posta olarak alın</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="weeklyDigest"
                        className="sr-only peer"
                        checked={notifications.weeklyDigest}
                        onChange={handleNotificationChange}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Sistem Uyarıları</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Sistem değişiklikleri ve bakım duyurularını al</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="systemAlerts"
                        className="sr-only peer"
                        checked={notifications.systemAlerts}
                        onChange={handleNotificationChange}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button>Ayarları Kaydet</Button>
                </div>
              </div>
            )}
            
            {activeTab === 'sessions' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Aktif Oturumlar</h2>
                  <Button variant="outline" onClick={handleLogoutAllSessions}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Diğer Tüm Oturumları Kapat
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-start justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-300">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium text-gray-900 dark:text-white">{session.device}</h3>
                            {session.isCurrent && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full">
                                Geçerli oturum
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <p>Konum: {session.location}</p>
                            <p>IP: {session.ip}</p>
                            <p>Son Aktivite: {session.lastActive}</p>
                          </div>
                        </div>
                      </div>
                      {!session.isCurrent && (
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => handleLogoutSession(session.id)}
                        >
                          Oturumu Kapat
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 