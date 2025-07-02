import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface User {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface UsersTabProps {
  roleId: string;
  roleName?: string;
  users?: User[];
  onAddUser?: (userId: string) => void;
  onRemoveUser?: (userId: string) => void;
  isEditing?: boolean;
  isLoading?: boolean;
}

const UsersTab: React.FC<UsersTabProps> = ({
  roleId,
  roleName,
  users = [],
  onAddUser,
  onRemoveUser,
  isEditing = false,
  isLoading = false
}) => {
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Hiç giriş yapmamış';
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const getDefaultUsers = (): User[] => {
    return [
      {
        _id: '1',
        name: 'Admin Kullanıcı',
        email: 'admin@demo.com',
        isActive: true,
        lastLogin: '2024-01-15T10:30:00Z',
        createdAt: '2024-01-01T09:00:00Z'
      },
      {
        _id: '2',
        name: 'Ali Yıldız',
        email: 'ali@demo.com',
        isActive: true,
        lastLogin: '2024-01-14T15:45:00Z',
        createdAt: '2024-01-02T11:30:00Z'
      },
      {
        _id: '3',
        name: 'Ayşe Kara',
        email: 'ayse@demo.com',
        isActive: false,
        lastLogin: '2024-01-10T08:20:00Z',
        createdAt: '2024-01-03T14:15:00Z'
      }
    ];
  };

  const displayUsers = users.length > 0 ? users : getDefaultUsers();

  const handleUserToggle = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleAddUsers = () => {
    selectedUserIds.forEach(userId => {
      onAddUser?.(userId);
    });
    setSelectedUserIds([]);
    setShowUserSelector(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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
              Bu role atanmış kullanıcıları görüntüleyin ve yönetin
            </p>
          </div>
          {isEditing && (
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
        {displayUsers.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Kullanıcı Bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Bu role henüz atanmış kullanıcı bulunmamaktadır.
            </p>
            {isEditing && (
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
            {displayUsers.map((user) => (
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
                  
                  {isEditing && (
                    <div className="ml-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveUser?.(user._id)}
                        className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableUsers.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Eklenebilir kullanıcı bulunamadı</p>
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
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
                  Seçilenleri Ekle
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