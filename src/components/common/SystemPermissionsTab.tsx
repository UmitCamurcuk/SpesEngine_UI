import React, { useEffect, useState } from 'react';
import { permissionGroupService } from '../../services';
import { PermissionGroup } from '../../types/permissionGroup';

interface SystemPermissionsTabProps {
  editMode: boolean;
  currentPermissions?: string[]; // Role'ün mevcut izin ID'leri
  onPermissionsChange?: (permissions: string[]) => void; // İzin değişikliklerini parent'a bildir
}

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`${className}`}>
    {children}
  </div>
);

const SystemPermissionsTab: React.FC<SystemPermissionsTabProps> = ({ 
  editMode, 
  currentPermissions = [], 
  onPermissionsChange 
}) => {
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermissionGroups = async () => {
      try {
        setLoading(true);
        console.log('Fetching permission groups...');
        
        const response = await permissionGroupService.getPermissionGroups({ 
          limit: 1000,
          page: 1 
        });
        console.log('Permission groups response:', response);
        
        if (!response.permissionGroups || response.permissionGroups.length === 0) {
          console.log('No permission groups found');
          setPermissionGroups([]);
          setError(null);
          setLoading(false);
          return;
        }

        setPermissionGroups(response.permissionGroups);
        // İlk grubu otomatik seç
        if (response.permissionGroups.length > 0) {
          setSelectedGroupId(response.permissionGroups[0]._id);
        }
        setError(null);
        console.log('Permission groups loaded:', response.permissionGroups.length);
      } catch (err: any) {
        console.error('Error fetching permission groups:', err);
        
        let errorMessage = 'İzin grupları yüklenirken bir hata oluştu.';
        
        if (err.response?.status === 401) {
          errorMessage = 'Yetkilendirme hatası: Oturum açmanız gerekiyor.';
        } else if (err.response?.status === 403) {
          errorMessage = 'Yetki hatası: Bu işlem için yetkiniz bulunmuyor.';
        } else if (err.response?.status === 404) {
          errorMessage = 'API endpoint\'i bulunamadı.';
        } else if (err.response?.status >= 500) {
          errorMessage = 'Sunucu hatası: Lütfen daha sonra tekrar deneyin.';
        } else if (err.message) {
          errorMessage += ' Detay: ' + err.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissionGroups();
  }, []);

  // currentPermissions değiştiğinde selectedPermissions'ı güncelle
  useEffect(() => {
    console.log('Current permissions updated:', currentPermissions);
    setSelectedPermissions([...currentPermissions]);
  }, [currentPermissions]);

  // Edit mode değiştiğinde selectedPermissions'ı currentPermissions'a sıfırla
  useEffect(() => {
    if (!editMode) {
      console.log('Edit mode disabled, resetting to current permissions:', currentPermissions);
      setSelectedPermissions([...currentPermissions]);
    }
  }, [editMode, currentPermissions]);

  const selectedGroup = permissionGroups.find(group => group._id === selectedGroupId);

  const handlePermissionToggle = (permissionId: string) => {
    if (!editMode) return;
    
    const newSelectedPermissions = selectedPermissions.includes(permissionId)
      ? selectedPermissions.filter(id => id !== permissionId)
      : [...selectedPermissions, permissionId];
    
    console.log('Permission toggled:', permissionId, 'New selections:', newSelectedPermissions);
    setSelectedPermissions(newSelectedPermissions);
    
    // Parent component'a değişiklikleri bildir
    if (onPermissionsChange) {
      onPermissionsChange(newSelectedPermissions);
    }
  };

  const handleGroupSelectAll = (selectAll: boolean) => {
    if (!editMode || !selectedGroup) return;
    
    const groupPermissionIds = selectedGroup.permissions.map(p => p._id);
    
    let newSelectedPermissions: string[];
    if (selectAll) {
      const toAdd = groupPermissionIds.filter(id => !selectedPermissions.includes(id));
      newSelectedPermissions = [...selectedPermissions, ...toAdd];
    } else {
      newSelectedPermissions = selectedPermissions.filter(id => !groupPermissionIds.includes(id));
    }
    
    console.log('Group select all:', selectAll, 'New selections:', newSelectedPermissions);
    setSelectedPermissions(newSelectedPermissions);
    
    // Parent component'a değişiklikleri bildir
    if (onPermissionsChange) {
      onPermissionsChange(newSelectedPermissions);
    }
  };

  const IOSSwitch: React.FC<{ 
    isSelected: boolean; 
    editMode: boolean; 
    onClick?: () => void 
  }> = ({ isSelected, editMode, onClick }) => {
    const getColors = () => {
      if (editMode) {
        return isSelected 
          ? 'bg-green-600 dark:bg-green-500' // Koyu yeşil
          : 'bg-red-600 dark:bg-red-500'; // Koyu kırmızı
      } else {
        return isSelected 
          ? 'bg-green-400 dark:bg-green-400' // Açık yeşil
          : 'bg-red-400 dark:bg-red-400'; // Açık kırmızı
      }
    };

    return (
      <div 
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick();
        }}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
          editMode ? 'cursor-pointer' : 'cursor-default'
        } ${getColors()}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
            isSelected ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardBody className="p-6">
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">İzin grupları yükleniyor...</span>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody className="p-6">
          <div className="text-red-500 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
            <p className="font-semibold">Hata:</p>
            <p>{error}</p>
            <div className="mt-4 space-x-2">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Sayfayı Yenile
              </button>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Sistem İzinleri</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {permissionGroups.length} grup
          </span>
        </div>
      </CardHeader>
      
      <CardBody className="p-0">
        {permissionGroups.length === 0 ? (
          <div className="text-center py-8 px-6">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Henüz izin grubu yok</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sistem izinlerini görüntülemek için önce izin grupları oluşturulmalıdır.
            </p>
          </div>
        ) : (
          <div className="flex"  style={{ maxHeight: '750px' }}>
            {/* Side Menu - Permission Groups */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">İzin Grupları</h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                {permissionGroups.map((group) => (
                  <button
                    key={group._id}
                    onClick={() => setSelectedGroupId(group._id)}
                    className={`w-full text-left p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectedGroupId === group._id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {group.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {group.code}
                        </p>
                      </div>
                      <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                        {group.permissions?.length || 0}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content - Selected Group Permissions */}
            <div className="flex-1 flex flex-col">
              {selectedGroup ? (
                <>
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {selectedGroup.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedGroup.description}
                        </p>
                      </div>
                      {editMode && selectedGroup.permissions.length > 0 && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleGroupSelectAll(true)}
                            className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                          >
                            Tümünü Seç
                          </button>
                          <button
                            onClick={() => handleGroupSelectAll(false)}
                            className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-500"
                          >
                            Tümünü Kaldır
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4">
                    {selectedGroup.permissions && selectedGroup.permissions.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {selectedGroup.permissions.map((permission) => {
                          const isSelected = selectedPermissions.includes(permission._id);
                          return (
                            <div
                              key={permission._id}
                              onClick={() => handlePermissionToggle(permission._id)}
                              className={`p-3 rounded-lg border transition-all duration-200 ${
                                editMode
                                  ? 'cursor-pointer hover:shadow-md'
                                  : 'cursor-default'
                              } ${
                                isSelected && editMode
                                  ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {permission.name.tr}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {permission.description.tr}
                                  </p>
                                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    {permission.code}
                                  </p>
                                </div>
                                <div className="ml-4" onClick={(e) => e.stopPropagation()}>
                                  <IOSSwitch
                                    isSelected={isSelected}
                                    editMode={editMode}
                                    onClick={() => handlePermissionToggle(permission._id)}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Bu grupta henüz izin tanımlanmamış.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Bir izin grubu seçin
                </div>
              )}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default SystemPermissionsTab; 