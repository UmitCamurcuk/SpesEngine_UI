import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { useTranslation } from '../../context/i18nContext';
import { useSlackIntegration } from '../../hooks/useSlackIntegration';
import { NotificationSettings } from '../../types/itemType';

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
  tempNotificationSettings?: NotificationSettings;
  onUpdatePermissions?: (roleId: string, permissions: string[]) => void;
  onCreateRole?: () => void;
  onDeleteRole?: (roleId: string) => void;
  onManageUsers?: (roleId: string) => void;
  onUpdateNotifications?: (settings: NotificationSettings) => void;
  onNotificationSettingsChange?: (settings: NotificationSettings) => void;
  isEditing?: boolean;
  isLoading?: boolean;
  onEditRole?: (roleId: string) => void;
}

const PermissionsTab: React.FC<PermissionsTabProps> = ({
  entityId,
  entityType,
  roles = [],
  notificationSettings = {},
  tempNotificationSettings: propTempNotificationSettings,
  onUpdatePermissions,
  onCreateRole,
  onDeleteRole,
  onManageUsers,
  onUpdateNotifications,
  onNotificationSettingsChange,
  onEditRole,
  isEditing = false,
  isLoading = false
}) => {
  const { t } = useTranslation();
  const { isSlackEnabled } = useSlackIntegration();
  const [activeSection, setActiveSection] = useState<'roles' | 'matrix' | 'audit' | 'notifications'>('roles');
  
  // Notification settings prop'tan gelir veya yerel state
  const tempNotificationSettings = propTempNotificationSettings || notificationSettings;

  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    const newSettings = {
      ...tempNotificationSettings,
      [key]: !tempNotificationSettings[key]
    };
    onNotificationSettingsChange?.(newSettings);
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
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mr-3">
              <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                İzin Yönetimi
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Roller, izinler ve erişim kontrolü
              </p>
            </div>
          </div>
{isEditing && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onCreateRole}
              className="flex items-center"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yeni Rol
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'roles', label: 'Roller', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
            { id: 'matrix', label: 'İzin Matrisi', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
            { id: 'audit', label: 'Denetim Günlüğü', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            ...(isSlackEnabled ? [{ id: 'notifications', label: 'Bildirimler', icon: 'M15 17h5l-5 5v-5zM4.868 7.75L6.5 9.5l1.632-1.75m0 0L10 6l-1.868 1.75M9.5 12.5V17' }] : [])
          ].map((tab) => (
            <button
              key={tab.id}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeSection === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveSection(tab.id as any)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeSection === 'roles' && (
          <div className="space-y-4">
            
            <div className="grid gap-4">
              {displayRoles.map((role) => (
                <div key={role.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{role.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{role.description}</p>
                          {role.userCount && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">{role.userCount} kullanıcı</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {isEditing && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => onEditRole?.(role.id)}
                              >
                                Düzenle
                              </Button>
                              {!role.isSystem && (
                                <Button 
                                  variant="secondary" 
                                  size="sm"
                                  onClick={() => onDeleteRole?.(role.id)}
                                >
                                  Sil
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Permission Checkboxes */}
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['read', 'write', 'delete', 'admin'].map((permission) => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={role.permissions.includes(permission)}
                              onChange={(e) => {
                                if (isEditing) {
                                  const newPermissions = e.target.checked
                                    ? [...role.permissions, permission]
                                    : role.permissions.filter(p => p !== permission);
                                  onUpdatePermissions?.(role.id, newPermissions);
                                }
                              }}
                              disabled={!isEditing}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                              {permission === 'read' && 'Okuma'}
                              {permission === 'write' && 'Yazma'}
                              {permission === 'delete' && 'Silme'}
                              {permission === 'admin' && 'Yönetici'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'matrix' && (
          <div className="space-y-4">
            
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
                      checked={isEditing ? (tempNotificationSettings.onUpdate || false) : (notificationSettings.onUpdate || false)}
                      onChange={() => isEditing && handleNotificationToggle('onUpdate')}
                      disabled={!isEditing}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Güncellendiğinde bildirim gönder
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isEditing ? (tempNotificationSettings.onDelete || false) : (notificationSettings.onDelete || false)}
                      onChange={() => isEditing && handleNotificationToggle('onDelete')}
                      disabled={!isEditing}
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
                      checked={isEditing ? (tempNotificationSettings.onUsedInCategory || false) : (notificationSettings.onUsedInCategory || false)}
                      onChange={() => isEditing && handleNotificationToggle('onUsedInCategory')}
                      disabled={!isEditing}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Kategori'de kullanıldığında
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isEditing ? (tempNotificationSettings.onUsedInFamily || false) : (notificationSettings.onUsedInFamily || false)}
                      onChange={() => isEditing && handleNotificationToggle('onUsedInFamily')}
                      disabled={!isEditing}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Family'de kullanıldığında
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isEditing ? (tempNotificationSettings.onUsedInAttributeGroup || false) : (notificationSettings.onUsedInAttributeGroup || false)}
                      onChange={() => isEditing && handleNotificationToggle('onUsedInAttributeGroup')}
                      disabled={!isEditing}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Öznitelik Grubu'nda kullanıldığında
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isEditing ? (tempNotificationSettings.onUsedInItemType || false) : (notificationSettings.onUsedInItemType || false)}
                      onChange={() => isEditing && handleNotificationToggle('onUsedInItemType')}
                      disabled={!isEditing}
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Item Type'da kullanıldığında
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isEditing ? (tempNotificationSettings.onUsedInItem || false) : (notificationSettings.onUsedInItem || false)}
                      onChange={() => isEditing && handleNotificationToggle('onUsedInItem')}
                      disabled={!isEditing}
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