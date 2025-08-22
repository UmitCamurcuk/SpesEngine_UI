import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux/store';
import { useTranslation } from '../../context/i18nContext';
import { useNotification } from '../../components/notifications';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ListPageLayout from '../../components/layout/ListPageLayout';
import authService from '../../services/auth/authService';
import { updateProfile } from '../../redux/features/auth/authSlice';
import Avatar from '../../components/common/Avatar';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  position: string;
  department: string;
  location: string;
  website: string;
  socialLinks: {
    linkedin: string;
    twitter: string;
    github: string;
  };
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

const ProfilePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { t, currentLanguage } = useTranslation();
  const { showToast } = useNotification();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    position: user?.position || '',
    department: user?.department || '',
    location: user?.location || '',
    website: user?.website || '',
    socialLinks: {
      linkedin: user?.socialLinks?.linkedin || '',
      twitter: user?.socialLinks?.twitter || '',
      github: user?.socialLinks?.github || ''
    },
    preferences: {
      language: user?.preferences?.language || 'tr',
      theme: user?.preferences?.theme || 'auto',
      notifications: {
        email: user?.preferences?.notifications?.email ?? true,
        push: user?.preferences?.notifications?.push ?? true,
        sms: user?.preferences?.notifications?.sms ?? false
      }
    }
  });

  useEffect(() => {
    if (user?.avatar) {
      setAvatarPreview(user.avatar);
    }
  }, [user?.avatar]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ProfileFormData],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      // Avatar yükleme
      if (avatarFile) {
        // Burada gerçek dosya yükleme işlemi yapılacak
        // Şimdilik base64 olarak gönderiyoruz
        const formDataAvatar = new FormData();
        formDataAvatar.append('avatarUrl', avatarPreview);
        
        await authService.uploadAvatar(formDataAvatar);
      }

      // Profil güncelleme
      await dispatch(updateProfile(formData)).unwrap();

      showToast({
        type: 'success',
        title: 'Başarılı!',
        message: 'Profil bilgileriniz başarıyla güncellendi.'
      });

      setIsEditing(false);
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Hata!',
        message: error.message || 'Profil güncellenirken bir hata oluştu.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email || 'Kullanıcı';
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      position: user?.position || '',
      department: user?.department || '',
      location: user?.location || '',
      website: user?.website || '',
      socialLinks: {
        linkedin: user?.socialLinks?.linkedin || '',
        twitter: user?.socialLinks?.twitter || '',
        github: user?.socialLinks?.github || ''
      },
      preferences: {
        language: user?.preferences?.language || 'tr',
        theme: user?.preferences?.theme || 'auto',
        notifications: {
          email: user?.preferences?.notifications?.email ?? true,
          push: user?.preferences?.notifications?.push ?? true,
          sms: user?.preferences?.notifications?.sms ?? false
        }
      }
    });
    setAvatarFile(null);
    setAvatarPreview(user?.avatar || '');
    setIsEditing(false);
  };



  return (
    <ListPageLayout
      title="Profil"
      description="Kişisel bilgilerinizi ve tercihlerinizi yönetin"
      icon={
        <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      }
      breadcrumbItems={[
        { label: 'Profil' }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon - Avatar ve Temel Bilgiler */}
        <div className="lg:col-span-1">
          <Card>
            <div className="text-center">
              {/* Avatar */}
              <div className="mb-6">
                <Avatar
                  user={{
                    avatar: avatarPreview || user?.avatar,
                    firstName: user?.firstName,
                    lastName: user?.lastName,
                    name: user?.name,
                    email: user?.email
                  }}
                  size="2xl"
                  showEditButton={isEditing}
                  editable={isEditing}
                  onEditClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const target = e.target as HTMLInputElement;
                      if (target.files?.[0]) {
                        handleAvatarChange({ target } as React.ChangeEvent<HTMLInputElement>);
                      }
                    };
                    input.click();
                  }}
                />
              </div>

              {/* Kullanıcı Adı */}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {getDisplayName()}
              </h2>
              
              {/* Pozisyon */}
              {user?.position && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {user.position}
                </p>
              )}

              {/* Departman */}
              {user?.department && (
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                  {user.department}
                </p>
              )}

              {/* Rol */}
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {user?.role?.name || 'Kullanıcı'}
              </div>
            </div>
          </Card>

          {/* İstatistikler */}
          <Card className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Hesap İstatistikleri
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Son Giriş</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString('tr-TR') : 'Hiç giriş yapılmamış'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Hesap Durumu</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  user?.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {user?.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Kayıt Tarihi</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '-'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Sağ Kolon - Form */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Profil Bilgileri
              </h3>
              {!isEditing ? (
                <Button
                  variant="primary"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Düzenle
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    İptal
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center"
                  >
                    {isLoading ? (
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    Kaydet
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Temel Bilgiler */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Temel Bilgiler</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ad
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Soyad
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">E-posta adresi değiştirilemez</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>
              </div>

              {/* İş Bilgileri */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">İş Bilgileri</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pozisyon
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Departman
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Konum
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* Biyografi */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Biyografi
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing}
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                placeholder="Kendiniz hakkında kısa bir açıklama..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.bio.length}/500 karakter
              </p>
            </div>

            {/* Sosyal Medya */}
            {isEditing && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sosyal Medya</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={formData.socialLinks.linkedin}
                      onChange={(e) => handleInputChange('socialLinks.linkedin', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Twitter
                    </label>
                    <input
                      type="url"
                      value={formData.socialLinks.twitter}
                      onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      GitHub
                    </label>
                    <input
                      type="url"
                      value={formData.socialLinks.github}
                      onChange={(e) => handleInputChange('socialLinks.github', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Tercihler */}
          <Card className="mt-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Tercihler
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tema Tercihi */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Görünüm</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="theme"
                      value="light"
                      checked={formData.preferences.theme === 'light'}
                      onChange={(e) => handleInputChange('preferences.theme', e.target.value)}
                      disabled={!isEditing}
                      className="mr-3"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Açık Tema</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="theme"
                      value="dark"
                      checked={formData.preferences.theme === 'dark'}
                      onChange={(e) => handleInputChange('preferences.theme', e.target.value)}
                      disabled={!isEditing}
                      className="mr-3"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Koyu Tema</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="theme"
                      value="auto"
                      checked={formData.preferences.theme === 'auto'}
                      onChange={(e) => handleInputChange('preferences.theme', e.target.value)}
                      disabled={!isEditing}
                      className="mr-3"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Sistem Tercihi</span>
                  </label>
                </div>
              </div>

              {/* Bildirim Tercihleri */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Bildirimler</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.preferences.notifications.email}
                      onChange={(e) => handleInputChange('preferences.notifications.email', e.target.checked)}
                      disabled={!isEditing}
                      className="mr-3"
                    />
                    <span className="text-gray-700 dark:text-gray-300">E-posta Bildirimleri</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.preferences.notifications.push}
                      onChange={(e) => handleInputChange('preferences.notifications.push', e.target.checked)}
                      disabled={!isEditing}
                      className="mr-3"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Push Bildirimleri</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.preferences.notifications.sms}
                      onChange={(e) => handleInputChange('preferences.notifications.sms', e.target.checked)}
                      disabled={!isEditing}
                      className="mr-3"
                    />
                    <span className="text-gray-700 dark:text-gray-300">SMS Bildirimleri</span>
                  </label>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ListPageLayout>
  );
};

export default ProfilePage; 