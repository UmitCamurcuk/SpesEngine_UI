import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import userService from '../../services/api/userService';
import { usePermissions } from '../../hooks/usePermissions';
import { useNotification } from '../notifications';

interface User {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  roles?: string[];
}

interface UsersTabProps {
  roleId: string;
  roleName?: string;
  isEditing?: boolean;
}

const UsersTab: React.FC<UsersTabProps> = ({
  roleId,
  roleName,
  isEditing = false
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const permissions = usePermissions();
  const { showToast, showCommentModal, showModal } = useNotification();
  
  // ROLES_UPDATEUSERS iznini kontrol et
  const canManageUsers = permissions.canUpdate('ROLES_UPDATEUSERS') || permissions.hasPermission('ROLES_UPDATEUSERS');

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Hiç giriş yapmamış';
    return new Date(dateString).toLocaleString('tr-TR');
  };

  // Role atanmış kullanıcıları getir
  const fetchRoleUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await userService.getUsersByRole(roleId);
      setUsers(response.users || []);
    } catch (err: any) {
      console.error('Role kullanıcıları yüklenirken hata:', err);
      setError(err.message || 'Kullanıcılar yüklenirken bir hata oluştu');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Role atanmamış kullanıcıları getir
  const fetchAvailableUsers = async () => {
    if (!canManageUsers || !isEditing) return;
    
    try {
      setIsLoadingAvailable(true);
      const response = await userService.getUsersNotInRole(roleId);
      setAvailableUsers(response.users || []);
    } catch (err: any) {
      console.error('Kullanılabilir kullanıcılar yüklenirken hata:', err);
      showToast({
        type: 'error',
        title: 'Hata',
        message: 'Kullanılabilir kullanıcılar yüklenirken bir hata oluştu',
        duration: 5000
      });
    } finally {
      setIsLoadingAvailable(false);
    }
  };

  useEffect(() => {
    fetchRoleUsers();
  }, [roleId]);

  useEffect(() => {
    if (showUserSelector) {
      fetchAvailableUsers();
    }
  }, [showUserSelector, canManageUsers, isEditing]);

  const handleUserToggle = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleAddUsers = () => {
    if (selectedUserIds.length === 0) return;

    const selectedUsers = availableUsers.filter(user => selectedUserIds.includes(user._id));
    const userNames = selectedUsers.map(user => user.name).join(', ');

    showCommentModal({
      title: 'Kullanıcı Rolü Atama',
      changes: [`${selectedUserIds.length} kullanıcıya "${roleName}" rolü atanacak: ${userNames}`],
      onSave: async (comment: string) => {
        try {
          // Her seçili kullanıcı için rol atama işlemi yap
          await Promise.all(
            selectedUserIds.map(userId => 
              userService.assignRoleToUser(userId, roleId, comment)
            )
          );

          showToast({
            type: 'success',
            title: 'Başarılı',
            message: `${selectedUserIds.length} kullanıcıya rol başarıyla atandı`,
            duration: 3000
          });

          // Kullanıcı listesini yenile
          await fetchRoleUsers();
          
          // Modal'ı kapat ve seçimleri temizle
          setSelectedUserIds([]);
          setShowUserSelector(false);
          
        } catch (err: any) {
          showToast({
            type: 'error',
            title: 'Hata',
            message: err.message || 'Rol atama işlemi sırasında bir hata oluştu',
            duration: 5000
          });
        }
      }
    });
  };

  const handleRemoveUser = (user: User) => {
    showCommentModal({
      title: 'Kullanıcı Rolünü Kaldır',
      changes: [`"${user.name}" kullanıcısından "${roleName}" rolü kaldırılacak`],
      onSave: async (comment: string) => {
        try {
          await userService.removeRoleFromUser(user._id, roleId, comment);

          showToast({
            type: 'success',
            title: 'Başarılı',
            message: 'Kullanıcı rolü başarıyla kaldırıldı',
            duration: 3000
          });

          // Kullanıcı listesini yenile
          await fetchRoleUsers();
          
        } catch (err: any) {
          showToast({
            type: 'error',
            title: 'Hata',
            message: err.message || 'Rol kaldırma işlemi sırasında bir hata oluştu',
            duration: 5000
          });
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Kullanıcılar yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchRoleUsers}
              className="mt-2"
            >
              Tekrar Dene
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {roleName ? `${roleName} Rolündeki Kullanıcılar` : 'Rol Kullanıcıları'}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Bu role atanmış kullanıcıları görüntüleyin{canManageUsers && isEditing ? ' ve yönetin' : ''}
            </p>
            {!canManageUsers && isEditing && (
              <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded">
                ⚠️ Kullanıcı rollerini düzenlemek için ROLES_UPDATEUSERS iznine ihtiyacınız var
              </div>
            )}
          </div>
          {isEditing && canManageUsers && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowUserSelector(true)}
              className="flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Kullanıcı Ekle
            </Button>
          )}
        </div>
      </div>

      <div className="p-6">
        {users.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Kullanıcı Bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Bu role henüz atanmış kullanıcı bulunmamaktadır.
            </p>
            {isEditing && canManageUsers && (
              <div className="mt-6">
                <Button
                  variant="primary"
                  onClick={() => setShowUserSelector(true)}
                  className="flex items-center mx-auto"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  İlk Kullanıcıyı Ekle
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <div
                key={user._id}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                          <svg className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Durum:</span>
                        <Badge 
                          color={user.isActive ? 'success' : 'danger'} 
                          size="sm"
                        >
                          {user.isActive ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Son Giriş:</span>
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          {formatDate(user.lastLogin)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Üyelik:</span>
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {isEditing && canManageUsers && (
                    <div className="ml-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveUser(user)}
                        className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                        title="Kullanıcıyı bu rolden kaldır"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kullanıcı Seçici Modal */}
      {showUserSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Kullanıcı Seç
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowUserSelector(false);
                    setSelectedUserIds([]);
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {isLoadingAvailable ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Kullanıcılar yükleniyor...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableUsers.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">
                        Bu role eklenebilir kullanıcı bulunamadı
                      </p>
                    </div>
                  ) : (
                    availableUsers.map((user) => (
                      <div
                        key={user._id}
                        className={`relative rounded-lg border p-4 cursor-pointer transition-colors ${
                          selectedUserIds.includes(user._id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                        onClick={() => handleUserToggle(user._id)}
                      >
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              type="checkbox"
                              checked={selectedUserIds.includes(user._id)}
                              onChange={() => handleUserToggle(user._id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                            <div className="mt-1">
                              <Badge 
                                color={user.isActive ? 'success' : 'danger'} 
                                size="sm"
                              >
                                {user.isActive ? 'Aktif' : 'Pasif'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedUserIds.length > 0 && (
                  <span>{selectedUserIds.length} kullanıcı seçildi</span>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUserSelector(false);
                    setSelectedUserIds([]);
                  }}
                >
                  İptal
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAddUsers}
                  disabled={selectedUserIds.length === 0}
                >
                  Seçilenleri Ekle ({selectedUserIds.length})
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab; 