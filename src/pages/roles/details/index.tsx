import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { roleService, permissionService } from '../../../services';
import { Role, UpdateRoleDto, HistoryEntry, RolePermissionGroup } from '../../../types/role';
import { Permission } from '../../../types/permission';
import { useTranslation } from '../../../context/i18nContext';
import Button from '../../../components/ui/Button';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { 
  EntityHistoryList, 
  PermissionsTab, 
  UsersTab,
  DocumentationTab,
  APITab,
  StatisticsTab,
  SystemPermissionsTab
} from '../../../components/common';
import { useNotification } from '../../../components/notifications';
import { usePermissions } from '../../../hooks/usePermissions';

// UTILITY COMPONENTS
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const RoleDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast, showModal, showCommentModal } = useNotification();
  const permissions = usePermissions();
  const { canUpdate, canDelete } = permissions;
  
  // Aktif tab state'i
  const [activeTab, setActiveTab] = useState<'details' | 'permissions' | 'users' | 'system' | 'documentation' | 'api' | 'statistics' | 'history'>('details');
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  
  // Veri state'i
  const [role, setRole] = useState<Role | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Form state
  const [formData, setFormData] = useState<UpdateRoleDto>({
    name: '',
    description: '',
    permissions: [],
    isActive: true
  });
  
  // İzin seçenekleri
  const [permissionOptions, setPermissionOptions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});
  
  // Loading ve error state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetchingOptions, setIsFetchingOptions] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Breadcrumb items
  const breadcrumbItems = [
    { label: t('dashboard', 'common') || 'Ana Sayfa', path: '/' },
    { label: t('roles', 'roles') || 'Roller', path: '/roles/list' },
    { label: role?.name || t('role_details', 'roles') || 'Rol Detayları' }
  ];

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('tr-TR');
  };

  // İzinleri yükle ve grupla - useCallback ile sarmalayalım
  const fetchPermissions = useCallback(async () => {
    try {
      setIsFetchingOptions(true);
      const result = await permissionService.getPermissions({ limit: 100 });
      setPermissionOptions(result.permissions);
      
      // İzinleri grupla
      const grouped: Record<string, Permission[]> = {};
      result.permissions.forEach((permission: Permission) => {
        const category = permission.code.split('.')[0] || 'other';
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(permission);
      });
      
      setGroupedPermissions(grouped);
    } catch (err: any) {
      console.error('İzinler yüklenirken hata oluştu:', err);
    } finally {
      setIsFetchingOptions(false);
    }
  }, []);

  // Rol verilerini getir - useCallback ile sarmalayalım
  const fetchRoleDetails = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const roleData = await roleService.getRoleById(id);
      setRole(roleData);
      
      // İzinleri string array'e dönüştür
      const permissionIds = roleData.permissionGroups.reduce((acc: string[], pg: RolePermissionGroup) => {
        const grantedPermissions = pg.permissions
          .filter((p: { permission: Permission; granted: boolean; _id: string }) => p.granted)
          .map((p: { permission: Permission; granted: boolean; _id: string }) => p.permission._id);
        return [...acc, ...grantedPermissions];
      }, []);
      
      console.log('Role permissions:', roleData.permissionGroups);
      console.log('Parsed permission IDs:', permissionIds);
      
      setFormData({
        name: roleData.name,
        description: roleData.description,
        permissions: permissionIds,
        isActive: roleData.isActive
      });
      
      setSelectedPermissions(permissionIds);
      
    } catch (err: any) {
      setError('Rol verileri yüklenirken bir hata oluştu: ' + (err.message || err));
    } finally {
      setIsLoading(false);
    }
  }, [id]);
  
  // Veriyi getir - sadece id değiştiğinde
  useEffect(() => {
    fetchRoleDetails();
  }, [fetchRoleDetails]);
  
  // İzinleri permissions tab'ına geçildiğinde yükle
  useEffect(() => {
    if (activeTab === 'permissions' && permissionOptions.length === 0 && !isFetchingOptions) {
      fetchPermissions();
    }
  }, [activeTab, permissionOptions.length, isFetchingOptions, fetchPermissions]);
  
  // Form input değişiklik handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Checkbox için özel işlem
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // İzin seçimi değişiklik handler
  const handlePermissionChange = (permissionId: string, isChecked: boolean) => {
    let newSelectedPermissions: string[];
    
    if (isChecked) {
      newSelectedPermissions = [...selectedPermissions, permissionId];
    } else {
      newSelectedPermissions = selectedPermissions.filter(id => id !== permissionId);
    }
    
    setSelectedPermissions(newSelectedPermissions);
    setFormData(prev => ({ ...prev, permissions: newSelectedPermissions }));
  };

  // Sistem izinleri değişiklik handler
  const handleSystemPermissionsChange = (permissions: string[]) => {
    console.log('System permissions changed:', permissions);
    setSelectedPermissions(permissions);
    setFormData(prev => ({ ...prev, permissions: permissions }));
  };
  
  // Kategori bazlı tüm izinleri seç/kaldır
  const handleCategorySelectAll = (category: string, isSelected: boolean) => {
    const categoryPermissionIds = groupedPermissions[category].map(p => p._id);
    
    let newSelectedPermissions: string[];
    
    if (isSelected) {
      // Zaten seçili olmayanları ekle
      const permissionsToAdd = categoryPermissionIds.filter(id => !selectedPermissions.includes(id));
      newSelectedPermissions = [...selectedPermissions, ...permissionsToAdd];
    } else {
      // Bu kategorideki tüm izinleri kaldır
      newSelectedPermissions = selectedPermissions.filter(id => !categoryPermissionIds.includes(id));
    }
    
    setSelectedPermissions(newSelectedPermissions);
    setFormData(prev => ({ ...prev, permissions: newSelectedPermissions }));
  };
  
  // Form gönderme handler - Comment modal ile
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!id || !formData) return;

    // Değişiklikleri tespit et
    const changes: string[] = [];
    const updateData: any = {};
    
    if (role?.name !== formData.name) {
      changes.push(`İsim: "${role?.name}" → "${formData.name}"`);
      updateData.name = formData.name;
    }
    if (role?.description !== formData.description) {
      changes.push(`Açıklama: "${role?.description}" → "${formData.description}"`);
      updateData.description = formData.description;
    }
    if (role?.isActive !== formData.isActive) {
      changes.push(`Durum: ${role?.isActive ? 'Aktif' : 'Pasif'} → ${formData.isActive ? 'Aktif' : 'Pasif'}`);
      updateData.isActive = formData.isActive;
    }
    
    // Permission değişikliklerini kontrol et
    const currentPermissionIds = role?.permissionGroups.reduce((acc: string[], pg: RolePermissionGroup) => {
      const grantedPermissions = pg.permissions
        .filter((p: { permission: Permission; granted: boolean; _id: string }) => p.granted)
        .map((p: { permission: Permission; granted: boolean; _id: string }) => p.permission._id);
      return [...acc, ...grantedPermissions];
    }, []) || [];
    
    const newPermissionIds = formData.permissions || [];
    const addedPermissions = newPermissionIds.filter(p => !currentPermissionIds.includes(p));
    const removedPermissions = currentPermissionIds.filter(p => !newPermissionIds.includes(p));
    
    if (addedPermissions.length > 0 || removedPermissions.length > 0) {
      if (addedPermissions.length > 0) {
        changes.push(`Eklenen izinler: ${addedPermissions.length} adet`);
      }
      if (removedPermissions.length > 0) {
        changes.push(`Kaldırılan izinler: ${removedPermissions.length} adet`);
      }
      updateData.permissions = newPermissionIds;
    }

    // Eğer hiç değişiklik yoksa uyarı ver
    if (changes.length === 0) {
      showToast({
        type: 'info',
        title: 'Bilgi',
        message: 'Hiçbir değişiklik yapılmadı',
        duration: 3000
      });
      return;
    }

    // Comment modal göster
    showCommentModal({
      title: 'Rol Güncelleme',
      changes: changes,
      onSave: async (comment: string) => {
        setIsSaving(true);
        setError(null);
        
        try {
          // Comment'i update data'ya ekle
          updateData.comment = comment;
          
          // Sadece değişen verileri gönder
          await roleService.updateRole(id, updateData);
          
          // Güncel veriyi yeniden yükle
          await fetchRoleDetails();
          
          setIsEditing(false);
          
          showToast({
            type: 'success',
            title: 'Başarılı',
            message: 'Rol başarıyla güncellendi',
            duration: 3000
          });
          
        } catch (err: any) {
          setError(err.message || 'Rol güncellenirken bir hata oluştu');
          showToast({
            type: 'error',
            title: 'Hata',
            message: err.message || 'Rol güncellenirken bir hata oluştu',
            duration: 5000
          });
        } finally {
          setIsSaving(false);
        }
      },
      isLoading: isSaving
    });
  };
  
  // Rolü silme handler
  const handleDelete = async () => {
    if (!id) return;
    
    showModal({
      title: 'Rol Sil',
      message: 'Bu rolü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      type: 'warning',
      primaryButton: {
        text: 'Sil',
        variant: 'error',
        onClick: async () => {
          setIsLoading(true);
          setError(null);
          
          try {
            await roleService.deleteRole(id);
            showToast({
              type: 'success',
              title: 'Başarılı',
              message: 'Rol başarıyla silindi',
              duration: 3000
            });
            navigate('/roles/list');
          } catch (err: any) {
            setError(err.message || 'Rol silinirken bir hata oluştu');
            setIsLoading(false);
            showToast({
              type: 'error',
              title: 'Hata',
              message: err.message || 'Rol silinirken bir hata oluştu',
              duration: 5000
            });
          }
        }
      },
      secondaryButton: {
        text: 'İptal',
        onClick: () => {
          // Modal otomatik olarak kapanacak
        }
      }
    });
  };

  // Tab değiştirme
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as 'details' | 'permissions' | 'users' | 'system' | 'documentation' | 'api' | 'statistics' | 'history');
  };

  // Action buttons
  const actions = (
    <>
      {isEditing ? (
        <>
          <Button
            variant="outline"
            onClick={() => setIsEditing(false)}
            disabled={isSaving}
          >
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="ml-2"
          >
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </>
      ) : (
        <>
          {canDelete('ROLES') && (
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
            >
              Sil
            </Button>
          )}
          {canUpdate('ROLES') && (
            <Button
              onClick={() => setIsEditing(true)}
              className="ml-2"
            >
              Düzenle
            </Button>
          )}
        </>
      )}
    </>
  );

  // Tab definitions
  const tabs = [
    {
      key: 'general',
      label: 'Genel Bilgiler',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      )
    },
    {
      key: 'permissions',
      label: 'İzinler',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
      )
    },
    {
      key: 'history',
      label: 'Geçmiş',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-light border-t-transparent dark:border-primary-dark dark:border-t-transparent"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-2">
          <svg className="w-6 h-6 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold">Hata</h3>
        </div>
        <p className="mb-3">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/roles/list')}
          className="mt-2"
        >
          Geri Dön
        </Button>
      </div>
    );
  }
  
  if (!role) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 px-6 py-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-2">
          <svg className="w-6 h-6 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold">Bulunamadı</h3>
        </div>
        <p className="mb-3">Rol bulunamadı</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/roles/list')}
          className="mt-2"
        >
          Geri Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumb 
          items={[
            { label: 'Roller', path: '/roles/list' },
            { label: role?.name || 'Rol Detayları' }
          ]} 
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Link to="/roles/list" className="mr-4">
            <Button variant="outline" size="sm" className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Geri
            </Button>
          </Link>
          <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/50 
                         flex items-center justify-center mr-3">
            <svg className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{role?.name}</h1>
            <div className="flex items-center mt-1">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                role?.isActive 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              }`}>
                {role?.isActive ? 'Aktif' : 'Pasif'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={() => setShowJsonPreview(!showJsonPreview)}
          >
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            JSON Göster
          </Button>
          
          {isEditing ? (
            <>
              <Button
                variant="outline"
                className="flex items-center"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                İptal
              </Button>
              {canUpdate('roles') && (
                <Button
                  variant="primary"
                  className="flex items-center"
                  onClick={handleSubmit}
                  disabled={isSaving}
                >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              )}
            </>
          ) : (
            <>
              {canUpdate('roles') && (
                <Button
                  variant="primary"
                  className="flex items-center"
                  onClick={() => setIsEditing(true)}
                >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Düzenle
                </Button>
              )}
              {canDelete('roles') && (
                <Button
                  variant="secondary"
                  className="flex items-center text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
                  onClick={handleDelete}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                  Sil
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('details')}
          >
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Detaylar
            </div>
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('permissions')}
          >
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              İzinler
            </div>
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('users')}
          >
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              Kullanıcılar
            </div>
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'system'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('system')}
          >
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Sistem İzinleri
            </div>
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'documentation'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('documentation')}
          >
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Dokümantasyon
            </div>
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'api'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('api')}
          >
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              API
            </div>
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'statistics'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('statistics')}
          >
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              İstatistikler
            </div>
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('history')}
          >
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Geçmiş
            </div>
          </button>
        </nav>
      </div>

      {showJsonPreview && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">JSON Önizleme</h2>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center"
              onClick={() => navigator.clipboard.writeText(JSON.stringify(role, null, 2))}
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Kopyala
            </Button>
          </CardHeader>
          <CardBody>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{JSON.stringify(role, null, 2)}</code>
            </pre>
          </CardBody>
        </Card>
      )}

      {activeTab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Genel Bakış</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Rol Adı</h3>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => navigate(`/localizations/details/role_name_${role?._id}`)}
                          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Çevirileri Yönet"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Rol adını girin"
                      />
                    ) : (
                      <p className="mt-2 text-gray-900 dark:text-gray-100">
                        {role?.name || 'Rol adı mevcut değil'}
                      </p>
                    )}
                  </div>

                  {/* Description Field */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Açıklama</h3>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => navigate(`/localizations/details/role_description_${role?._id}`)}
                          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Çevirileri Yönet"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {isEditing ? (
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Rol açıklaması girin"
                      />
                    ) : (
                      <p className="mt-2 text-gray-900 dark:text-gray-100">
                        {role?.description || 'Açıklama mevcut değil'}
                      </p>
                    )}
                  </div>

                  {/* Status Field */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Durum</h3>
                    {isEditing ? (
                      <div className="mt-2 flex items-center">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-900 dark:text-gray-100">
                          Aktif
                        </span>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          role?.isActive 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {role?.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">İzin Sayısı</h3>
                      <p className="mt-2 text-gray-900 dark:text-gray-100">
                        {Array.isArray(role?.permissions) ? role.permissions.length : 0} izin
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Oluşturulma Tarihi</h3>
                      <p className="mt-2 text-gray-900 dark:text-gray-100">{formatDate(role?.createdAt)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Güncellenme Tarihi</h3>
                      <p className="mt-2 text-gray-900 dark:text-gray-100">{formatDate(role?.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
          
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Metadata
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-750 p-4">
                    <div className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      ID
                    </div>
                    <div className="text-gray-800 dark:text-gray-200 font-mono text-sm break-all">
                      {role?._id}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
      
      {activeTab === 'permissions' && (
        <PermissionsTab
          entityId={id!}
          entityType={"role" as any}
        />
      )}

      {activeTab === 'users' && (
        <UsersTab
          roleId={id!}
          roleName={role?.name}
          isEditing={isEditing}
        />
      )}

      {activeTab === 'system' && (
        <SystemPermissionsTab
          editMode={isEditing}
          currentPermissions={selectedPermissions}
          onPermissionsChange={handleSystemPermissionsChange}
        />
      )}

      {activeTab === 'documentation' && (
        <DocumentationTab
          entityType={"role" as any}
          entityName={role?.name || 'Rol'}
        />
      )}

      {activeTab === 'api' && (
        <APITab
          entityType={"role" as any}
          entityId={id}
        />
      )}

      {activeTab === 'statistics' && (
        <StatisticsTab
          entityType={"role" as any}
          entityId={id}
        />
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Değişiklik Geçmişi</h2>
          </CardHeader>
          <CardBody>
            <EntityHistoryList entityId={id!} entityType="role" title="Rol Geçmişi" />
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default RoleDetailsPage; 