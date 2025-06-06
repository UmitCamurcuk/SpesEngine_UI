import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { useTranslation } from '../../context/i18nContext';

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

interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

interface PermissionsTabProps {
  entityId: string;
  entityType: 'attribute' | 'attributeGroup' | 'category' | 'family' | 'itemType' | 'item';
  roles?: Role[];
  permissionGroups?: PermissionGroup[];
  onUpdatePermissions?: (roleId: string, permissions: string[]) => void;
  onCreateRole?: () => void;
  onDeleteRole?: (roleId: string) => void;
  onManageUsers?: (roleId: string) => void;
  isEditing?: boolean;
  isLoading?: boolean;
}

const PermissionsTab: React.FC<PermissionsTabProps> = ({
  entityId,
  entityType,
  roles = [],
  permissionGroups = [],
  onUpdatePermissions,
  onCreateRole,
  onDeleteRole,
  onManageUsers,
  isEditing = false,
  isLoading = false
}) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<'roles' | 'matrix' | 'audit'>('roles');
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [tempPermissions, setTempPermissions] = useState<{ [roleId: string]: string[] }>({});

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
      },
      {
        id: 'contributor',
        name: 'Contributors',
        description: 'Katkıda bulunma yetkisi',
        userCount: 12,
        permissions: ['read', 'write'],
        isSystem: false
      }
    ];
  };

  const getDefaultPermissionGroups = (): PermissionGroup[] => {
    return [
      {
        id: 'basic',
        name: 'Temel İşlemler',
        description: 'Temel okuma ve görüntüleme işlemleri',
        permissions: [
          { id: 'read', name: 'Okuma', description: 'Veri görüntüleme yetkisi', type: 'read' },
          { id: 'list', name: 'Listeleme', description: 'Liste görüntüleme yetkisi', type: 'read' }
        ]
      },
      {
        id: 'content',
        name: 'İçerik Yönetimi',
        description: 'İçerik oluşturma ve düzenleme işlemleri',
        permissions: [
          { id: 'write', name: 'Yazma', description: 'Veri düzenleme yetkisi', type: 'write' },
          { id: 'create', name: 'Oluşturma', description: 'Yeni veri oluşturma yetkisi', type: 'write' },
          { id: 'update', name: 'Güncelleme', description: 'Mevcut veri güncelleme yetkisi', type: 'write' }
        ]
      },
      {
        id: 'management',
        name: 'Yönetim İşlemleri',
        description: 'Silme ve yönetim işlemleri',
        permissions: [
          { id: 'delete', name: 'Silme', description: 'Veri silme yetkisi', type: 'delete' },
          { id: 'admin', name: 'Yönetim', description: 'Tam yönetim yetkisi', type: 'admin' }
        ]
      }
    ];
  };

  const displayRoles = roles.length > 0 ? roles : getDefaultRoles();
  const displayPermissionGroups = permissionGroups.length > 0 ? permissionGroups : getDefaultPermissionGroups();
  const allPermissions = displayPermissionGroups.flatMap(group => group.permissions);

  const handleEditRole = (roleId: string) => {
    setEditingRole(roleId);
    const role = displayRoles.find(r => r.id === roleId);
    if (role) {
      setTempPermissions(prev => ({
        ...prev,
        [roleId]: [...role.permissions]
      }));
    }
  };

  const handleSaveRole = (roleId: string) => {
    const newPermissions = tempPermissions[roleId] || [];
    onUpdatePermissions?.(roleId, newPermissions);
    setEditingRole(null);
    setTempPermissions(prev => {
      const updated = { ...prev };
      delete updated[roleId];
      return updated;
    });
  };

  const handleCancelEdit = (roleId: string) => {
    setEditingRole(null);
    setTempPermissions(prev => {
      const updated = { ...prev };
      delete updated[roleId];
      return updated;
    });
  };

  const handlePermissionToggle = (roleId: string, permissionId: string) => {
    setTempPermissions(prev => {
      const currentPermissions = prev[roleId] || [];
      const updatedPermissions = currentPermissions.includes(permissionId)
        ? currentPermissions.filter(id => id !== permissionId)
        : [...currentPermissions, permissionId];
      
      return {
        ...prev,
        [roleId]: updatedPermissions
      };
    });
  };

  const getPermissionIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      read: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      write: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
      delete: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      admin: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
    };
    return iconMap[type] || iconMap.read;
  };

  const getPermissionColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      read: 'text-blue-600 dark:text-blue-400',
      write: 'text-green-600 dark:text-green-400',
      delete: 'text-red-600 dark:text-red-400',
      admin: 'text-purple-600 dark:text-purple-400'
    };
    return colorMap[type] || colorMap.read;
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-light border-t-transparent dark:border-primary-dark dark:border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-3">
              <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                İzinler ve Roller
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Rol bazlı erişim kontrolü yönetimi
              </p>
            </div>
          </div>
          {onCreateRole && (
            <Button 
              variant="primary" 
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
            { id: 'roles', label: 'Roller', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
            { id: 'matrix', label: 'İzin Matrisi', icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2' },
            { id: 'audit', label: 'Denetim Günlüğü', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
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
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Rol Yönetimi</h3>
              <div className="space-y-4">
                {displayRoles.map((role) => (
                  <div key={role.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                          <svg className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {role.name}
                            {role.isSystem && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                Sistem
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{role.description}</p>
                          {role.userCount && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {role.userCount} kullanıcı
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {editingRole === role.id ? (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleSaveRole(role.id)}
                            >
                              Kaydet
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelEdit(role.id)}
                            >
                              İptal
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditRole(role.id)}
                              disabled={!isEditing}
                            >
                              Düzenle
                            </Button>
                            {onManageUsers && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onManageUsers(role.id)}
                              >
                                Kullanıcılar
                              </Button>
                            )}
                            {!role.isSystem && onDeleteRole && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDeleteRole(role.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Sil
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                      <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">İzinler</h5>
                      <div className="space-y-2">
                        {displayPermissionGroups.map((group) => (
                          <div key={group.id}>
                            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              {group.name}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {group.permissions.map((permission) => {
                                const currentPermissions = editingRole === role.id 
                                  ? tempPermissions[role.id] || []
                                  : role.permissions;
                                const hasPermission = currentPermissions.includes(permission.id);
                                
                                return (
                                  <label key={permission.id} className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={hasPermission}
                                      onChange={() => editingRole === role.id && handlePermissionToggle(role.id, permission.id)}
                                      disabled={editingRole !== role.id}
                                      className="sr-only"
                                    />
                                    <div
                                      className={`flex items-center px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                                        hasPermission
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                      } ${editingRole === role.id ? 'hover:bg-green-200 dark:hover:bg-green-800' : ''}`}
                                      onClick={() => editingRole === role.id && handlePermissionToggle(role.id, permission.id)}
                                    >
                                      <svg className={`w-3 h-3 mr-1 ${getPermissionColor(permission.type)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getPermissionIcon(permission.type)} />
                                      </svg>
                                      {permission.name}
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'matrix' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">İzin Matrisi</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Rol
                      </th>
                      {allPermissions.map((permission) => (
                        <th key={permission.id} className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <div className="flex flex-col items-center">
                            <svg className={`w-4 h-4 mb-1 ${getPermissionColor(permission.type)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getPermissionIcon(permission.type)} />
                            </svg>
                            <span className="text-xs">{permission.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {displayRoles.map((role) => (
                      <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {role.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {role.userCount} kullanıcı
                          </div>
                        </td>
                        {allPermissions.map((permission) => (
                          <td key={permission.id} className="px-3 py-4 whitespace-nowrap text-center">
                            {role.permissions.includes(permission.id) ? (
                              <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'audit' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Denetim Günlüğü</h3>
              <div className="space-y-4">
                {/* Mock audit log entries */}
                {[
                  { action: 'İzin Güncellendi', user: 'admin@example.com', role: 'Content Editors', time: '2 dakika önce', type: 'update' },
                  { action: 'Yeni Rol Oluşturuldu', user: 'admin@example.com', role: 'Contributors', time: '1 saat önce', type: 'create' },
                  { action: 'Kullanıcı Eklendi', user: 'admin@example.com', role: 'Viewers', time: '3 saat önce', type: 'assign' },
                  { action: 'İzin Kaldırıldı', user: 'admin@example.com', role: 'Content Editors', time: '1 gün önce', type: 'remove' }
                ].map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center mr-3 ${
                        entry.type === 'create' ? 'bg-green-100 dark:bg-green-900/50' :
                        entry.type === 'update' ? 'bg-blue-100 dark:bg-blue-900/50' :
                        entry.type === 'remove' ? 'bg-red-100 dark:bg-red-900/50' :
                        'bg-purple-100 dark:bg-purple-900/50'
                      }`}>
                        <svg className={`h-4 w-4 ${
                          entry.type === 'create' ? 'text-green-600 dark:text-green-400' :
                          entry.type === 'update' ? 'text-blue-600 dark:text-blue-400' :
                          entry.type === 'remove' ? 'text-red-600 dark:text-red-400' :
                          'text-purple-600 dark:text-purple-400'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                            entry.type === 'create' ? 'M12 6v6m0 0v6m0-6h6m-6 0H6' :
                            entry.type === 'update' ? 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' :
                            entry.type === 'remove' ? 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' :
                            'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                          } />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {entry.action}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {entry.user} • {entry.role}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {entry.time}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <Button variant="outline" size="sm">
                  Daha Fazla Göster
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionsTab; 