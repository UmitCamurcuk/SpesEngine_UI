import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { useTranslation } from '../../context/i18nContext';
import { useSlackIntegration } from '../../hooks/useSlackIntegration';
import { NotificationSettings } from '../../types/attribute';

interface Permission {
  id: string;
  name: string;
  description: string;
  type: 'read' | 'write' | 'delete' | 'admin';
}

interface Role {
  id: string;
  name: string;
  description: string;
  userCount?: number;
  permissions: string[];
  isSystem?: boolean;
}

interface PermissionsTabProps {
  entityId: string;
  entityType: 'attribute' | 'attributeGroup' | 'category' | 'family' | 'itemType' | 'item';
  roles?: Role[];
  notificationSettings?: NotificationSettings;
  onUpdatePermissions?: (roleId: string, permissions: string[]) => void;
  onCreateRole?: () => void;
  onDeleteRole?: (roleId: string) => void;
  onManageUsers?: (roleId: string) => void;
  onUpdateNotifications?: (settings: NotificationSettings) => void;
  isEditing?: boolean;
  isLoading?: boolean;
}

const PermissionsTab: React.FC<PermissionsTabProps> = ({
  entityId,
  entityType,
  roles = [],
  notificationSettings = {},
  onUpdatePermissions,
  onCreateRole,
  onDeleteRole,
  onManageUsers,
  onUpdateNotifications,
  isEditing = false,
  isLoading = false
}) => {
  const { t } = useTranslation();
  const { isSlackEnabled } = useSlackIntegration();
  const [activeSection, setActiveSection] = useState<'roles' | 'matrix' | 'audit' | 'notifications'>('roles');
  
  // Notification settings için editing state
  const [isEditingNotifications, setIsEditingNotifications] = useState(false);
  const [tempNotificationSettings, setTempNotificationSettings] = useState<NotificationSettings>(notificationSettings);

  // NotificationSettings prop değiştiğinde temp state'i güncelle
  useEffect(() => {
    setTempNotificationSettings(notificationSettings);
  }, [notificationSettings]);

  // Notification settings handlers
  const handleEditNotifications = () => {
    console.log('Current notificationSettings:', notificationSettings);
    setIsEditingNotifications(true);
    setTempNotificationSettings({ ...notificationSettings });
  };

  const handleSaveNotifications = () => {
    onUpdateNotifications?.(tempNotificationSettings);
    setIsEditingNotifications(false);
  };

  const handleCancelNotifications = () => {
    setTempNotificationSettings(notificationSettings);
    setIsEditingNotifications(false);
  };

  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    setTempNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getDefaultRoles = (): Role[] => {
    return [
      {
        id: 'admin',
        name: 'Administrators',
        description: 'Tam sistem erişimi ve yönetim yetkisi',
        userCount: 3,
        permissions: ['read', 'write', 'delete', 'admin'],
        isSystem: true
      },
      {
        id: 'editor',
        name: 'Content Editors',
        description: 'İçerik düzenleme ve yönetim yetkisi',
        userCount: 8,
        permissions: ['read', 'write'],
        isSystem: false
      },
      {
        id: 'viewer',
        name: 'Viewers',
        description: 'Sadece görüntüleme yetkisi',
        userCount: 25,
        permissions: ['read'],
        isSystem: false
      }
    ];
  };

  const displayRoles = roles.length > 0 ? roles : getDefaultRoles();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <nav className="-mb-px flex space-x-8 px-4">
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSection === 'roles'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveSection('roles')}
          >
            Roller
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSection === 'matrix'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveSection('matrix')}
          >
            İzin Matrisi
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSection === 'audit'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveSection('audit')}
          >
            Denetim Günlüğü
          </button>
          {isSlackEnabled && (
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeSection === 'notifications'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveSection('notifications')}
            >
              Bildirimler
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        {activeSection === 'roles' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Rol Yönetimi</h3>
              <Button variant="primary" size="sm" onClick={onCreateRole}>
                Yeni Rol Ekle
              </Button>
            </div>
            
            <div className="grid gap-4">
              {displayRoles.map((role) => (
                <div key={role.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{role.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{role.description}</p>
                      {role.userCount && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">{role.userCount} kullanıcı</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">Düzenle</Button>
                      {!role.isSystem && (
                        <Button variant="secondary" size="sm">Sil</Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'matrix' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">İzin Matrisi</h3>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  İzin matrisi özelliği yakında gelecek
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'audit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Denetim Günlüğü</h3>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Denetim günlüğü özelliği yakında gelecek
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'notifications' && isSlackEnabled && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Bildirim Ayarları</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Bu {entityType === 'attribute' ? 'öznitelik' : entityType} ile ilgili olaylarda bildirim almak için aşağıdaki seçenekleri işaretleyebilirsiniz.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {isEditingNotifications ? (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveNotifications}
                      className="flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Kaydet
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelNotifications}
                      className="flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      İptal
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditNotifications}
                    className="flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Düzenle
                  </Button>
                )}
              </div>
            </div>
              
            <div className="space-y-6">
              {/* Temel İşlemler */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Temel İşlemler
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isEditingNotifications ? (tempNotificationSettings.onUpdate || false) : (notificationSettings.onUpdate || false)}
                      onChange={() => isEditingNotifications && handleNotificationToggle('onUpdate')}
                      disabled={!isEditingNotifications}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Güncellendiğinde bildirim gönder
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isEditingNotifications ? (tempNotificationSettings.onDelete || false) : (notificationSettings.onDelete || false)}
                      onChange={() => isEditingNotifications && handleNotificationToggle('onDelete')}
                      disabled={!isEditingNotifications}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Silindiğinde bildirim gönder
                    </span>
                  </label>
                </div>
              </div>

              {/* Kullanım Bildirimleri */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Kullanım Bildirimleri
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Bu {entityType === 'attribute' ? 'öznitelik' : entityType} başka varlıklarda kullanıldığında bildirim al
                </p>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isEditingNotifications ? (tempNotificationSettings.onUsedInCategory || false) : (notificationSettings.onUsedInCategory || false)}
                      onChange={() => isEditingNotifications && handleNotificationToggle('onUsedInCategory')}
                      disabled={!isEditingNotifications}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Kategori'de kullanıldığında
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isEditingNotifications ? (tempNotificationSettings.onUsedInFamily || false) : (notificationSettings.onUsedInFamily || false)}
                      onChange={() => isEditingNotifications && handleNotificationToggle('onUsedInFamily')}
                      disabled={!isEditingNotifications}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Family'de kullanıldığında
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isEditingNotifications ? (tempNotificationSettings.onUsedInAttributeGroup || false) : (notificationSettings.onUsedInAttributeGroup || false)}
                      onChange={() => isEditingNotifications && handleNotificationToggle('onUsedInAttributeGroup')}
                      disabled={!isEditingNotifications}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Öznitelik Grubu'nda kullanıldığında
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isEditingNotifications ? (tempNotificationSettings.onUsedInItemType || false) : (notificationSettings.onUsedInItemType || false)}
                      onChange={() => isEditingNotifications && handleNotificationToggle('onUsedInItemType')}
                      disabled={!isEditingNotifications}
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Item Type'da kullanıldığında
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isEditingNotifications ? (tempNotificationSettings.onUsedInItem || false) : (notificationSettings.onUsedInItem || false)}
                      onChange={() => isEditingNotifications && handleNotificationToggle('onUsedInItem')}
                      disabled={!isEditingNotifications}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Item'da kullanıldığında
                    </span>
                  </label>
                </div>
              </div>

              {/* Bildirim Kanalları Bilgisi */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h5 className="text-sm font-medium text-blue-900 dark:text-blue-200">
                      Dinamik Bildirim Sistemi
                    </h5>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Bildirimler sistem ayarlarından aktif olan tüm entegrasyon kanallarına (Slack, WhatsApp vb.) gönderilecektir. 
                      Yeni entegrasyonlar eklendiğinde otomatik olarak devreye girer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionsTab; 