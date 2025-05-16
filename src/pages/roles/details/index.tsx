import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { roleService, permissionService } from '../../../services';
import { Role, UpdateRoleDto, HistoryEntry } from '../../../types/role';
import { Permission } from '../../../types/permission';
import { useTranslation } from '../../../context/i18nContext';

const RoleDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // Aktif tab state'i
  const [activeTab, setActiveTab] = useState<'general' | 'permissions' | 'history'>('general');
  
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
  const [success, setSuccess] = useState<boolean>(false);
  
  // History state
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  
  // Veriyi getir
  useEffect(() => {
    const fetchRoleDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const roleData = await roleService.getRoleById(id);
        setRole(roleData);
        
        // İzinleri string array'e dönüştür
        const permissionIds = Array.isArray(roleData.permissions) 
          ? roleData.permissions.map((p: string | {_id: string}) => typeof p === 'string' ? p : p._id)
          : [];
        
        setFormData({
          name: roleData.name,
          description: roleData.description,
          permissions: permissionIds,
          isActive: roleData.isActive
        });
        
        setSelectedPermissions(permissionIds);
        
        // Eğer history varsa, düzenle
        if (roleData.history) {
          setHistory(roleData.history);
        }
      } catch (err: any) {
        setError(t('role_load_error', 'roles', {use: true}) || 'Rol verileri yüklenirken bir hata oluştu: ' + (err.message || err));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRoleDetails();
  }, [id, t]);
  
  // İzinleri yükle ve grupla
  useEffect(() => {
    const fetchPermissions = async () => {
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
    };
    
      fetchPermissions();
  }, []);
  
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
  
  // Form gönderme handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !formData) return;
    
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      // API'ye gönder
      const updatedRole = await roleService.updateRole(id, formData);
      
      // Güncel veriyi yeniden yükle
      setRole(updatedRole);
      
      setSuccess(true);
      setIsEditing(false);
      
      // Başarı mesajını belirli bir süre sonra kaldır
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'Rol güncellenirken bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Rolü silme handler
  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm('Bu rolü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      setIsLoading(true);
      setError(null);
      
      try {
        await roleService.deleteRole(id);
        navigate('/roles/list');
      } catch (err: any) {
        setError(err.message || 'Rol silinirken bir hata oluştu');
        setIsLoading(false);
      }
    }
  };
  
  // Tab switch handler
  const handleTabChange = (tab: 'general' | 'permissions' | 'history') => {
    setActiveTab(tab);
    
    if (tab === 'permissions' && permissionOptions.length === 0) {
      // Eğer tab permissions ise ve henüz izinler yüklenmemişse yükleyelim
      if (!isFetchingOptions) {
        const fetchPermissions = async () => {
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
        };
        
        fetchPermissions();
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 text-primary-light dark:text-primary-dark mx-auto border-4 border-t-primary-light dark:border-t-primary-dark border-gray-200 dark:border-gray-700 rounded-full"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('loading', 'common')}</p>
        </div>
      </div>
    );
  }
  
  if (error && !role) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
        <h3 className="text-lg font-semibold mb-2">{t('error', 'common')}</h3>
        <p>{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          onClick={() => navigate('/roles/list')}
        >
          {t('back_to_list', 'common')}
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Başlık ve Kontroller */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex justify-between flex-wrap gap-4 items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-7 h-7 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {role?.name || t('role_details', 'roles', {use: true})}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {role?.description || t('view_and_manage_role_details', 'roles', {use: true})}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/roles/list')}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('back_to_list', 'common', {use: true})}
            </button>
            
            {isEditing ? (
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {t('cancel', 'common', {use: true})}
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-light dark:bg-primary-dark hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                {t('edit', 'common', {use: true})}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Bildirimler */}
        {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        {success && (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 flex items-start animate-fadeIn">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          <span>{t('role_updated_success', 'roles', {use: true})}</span>
          </div>
        )}
      
      {/* Tab'lar ve İçerik */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        {/* Tab Bar */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => handleTabChange('general')}
            className={`relative flex items-center px-4 py-3 text-sm font-medium border-b-2 focus:outline-none transition-colors ${
              activeTab === 'general'
                ? 'border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {t('general_information', 'common', {use: true})}
            {activeTab === 'general' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-light dark:bg-primary-dark"></span>}
          </button>
          
          <button
            onClick={() => handleTabChange('permissions')}
            className={`relative flex items-center px-4 py-3 text-sm font-medium border-b-2 focus:outline-none transition-colors ${
              activeTab === 'permissions'
                ? 'border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            {t('permissions', 'permissions', {use: true})}
            {activeTab === 'permissions' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-light dark:bg-primary-dark"></span>}
          </button>
          
          <button
            onClick={() => handleTabChange('history')}
            className={`relative flex items-center px-4 py-3 text-sm font-medium border-b-2 focus:outline-none transition-colors ${
              activeTab === 'history'
                ? 'border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {t('history', 'common', {use: true})}
            {activeTab === 'history' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-light dark:bg-primary-dark"></span>}
          </button>
        </div>
        
        {/* Tab İçeriği */}
        <div className="p-6">
          {/* Genel Bilgiler Tab'ı */}
          {activeTab === 'general' && (
            <div>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* İsim */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('role_name', 'roles')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                />
              </div>
              
                    {/* Durum */}
              <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('status', 'common')}
                      </label>
                      <div className="flex items-center mt-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light/50 dark:peer-focus:ring-primary-dark/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-light dark:peer-checked:bg-primary-dark"></div>
                          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                            {formData.isActive ? t('active', 'common') : t('inactive', 'common')}
                          </span>
                </label>
                      </div>
              </div>
              
              {/* Açıklama */}
              <div className="col-span-1 md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('description', 'common')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                />
              </div>
              
              <div className="col-span-1 md:col-span-2 flex justify-end space-x-3">
                      <button
                  type="button"
                  onClick={handleDelete}
                        className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  disabled={isSaving}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                        {t('delete', 'common')}
                      </button>
                
                      <button
                  type="submit"
                        className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-light dark:bg-primary-dark hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                            {t('saving', 'common')}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                            {t('save', 'common')}
                    </>
                  )}
                      </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* İsim */}
              <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('role_name', 'roles')}</h4>
                <p className="mt-1 text-gray-900 dark:text-white">{role?.name}</p>
              </div>
              
              {/* Durum */}
              <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('status', 'common')}</h4>
                <div className="mt-1">
                  {role?.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">
                            <span className="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
                            {t('active', 'common')}
                    </span>
                  ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500">
                            <span className="w-2 h-2 mr-1 bg-red-500 rounded-full"></span>
                            {t('inactive', 'common')}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Açıklama */}
              <div className="col-span-1 md:col-span-2">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('description', 'common')}</h4>
                <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-wrap">{role?.description || '-'}</p>
              </div>
              
                    {/* Sistem Bilgileri */}
              <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('created_at', 'common')}</h4>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {new Date(role?.createdAt || '').toLocaleString('tr-TR')}
                </p>
              </div>
              
              <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('updated_at', 'common')}</h4>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {new Date(role?.updatedAt || '').toLocaleString('tr-TR')}
                </p>
              </div>
            </div>
                </div>
              )}
            </div>
          )}
          
          {/* İzinler Tab'ı */}
          {activeTab === 'permissions' && (
            <div>
              {isEditing ? (
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 mb-6">
                    <p className="text-sm">
                      <svg className="inline-block w-5 h-5 mr-2 -mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t('permissions_edit_info', 'roles')}
                    </p>
                  </div>
                  
                  {/* Kategori bazlı izinler */}
                  {isFetchingOptions ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-8 w-8 text-primary-light dark:text-primary-dark border-4 border-t-primary-light dark:border-t-primary-dark border-gray-200 dark:border-gray-700 rounded-full"></div>
                    </div>
                  ) : Object.keys(groupedPermissions).length > 0 ? (
                    <div className="space-y-8">
                      {Object.entries(groupedPermissions).map(([category, permissions]) => {
                        const allSelected = permissions.every(p => selectedPermissions.includes(p._id));
                        const someSelected = permissions.some(p => selectedPermissions.includes(p._id));
                        
                        return (
                          <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-700">
                              <div className="flex items-center justify-between">
                                <h3 className="text-md font-semibold text-gray-900 dark:text-white capitalize">{category}</h3>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={(e) => handleCategorySelectAll(category, e.target.checked)}
                                    className="sr-only peer"
                                  />
                                  <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light/50 dark:peer-focus:ring-primary-dark/50 rounded-full peer dark:bg-gray-700 ${
                                    someSelected ? 'peer-checked:bg-primary-light dark:peer-checked:bg-primary-dark' : 'peer-checked:bg-primary-light dark:peer-checked:bg-primary-dark'
                                  } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600`}></div>
                                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                    {allSelected ? t('select_none', 'common') : t('select_all', 'common')}
                                  </span>
                                </label>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                              {permissions.map(permission => (
                                <div key={permission._id} className="flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                      id={`permission-${permission._id}`}
                                      type="checkbox"
                                      checked={selectedPermissions.includes(permission._id)}
                                      onChange={(e) => handlePermissionChange(permission._id, e.target.checked)}
                                      className="w-4 h-4 text-primary-light dark:text-primary-dark bg-gray-100 border-gray-300 rounded focus:ring-primary-light dark:focus:ring-primary-dark dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label htmlFor={`permission-${permission._id}`} className="font-medium text-gray-900 dark:text-gray-300 cursor-pointer">
                                      {permission.name}
                                    </label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{permission.code}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleSubmit}
                          className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-light dark:bg-primary-dark hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {t('saving', 'common')}
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {t('save', 'common')}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                      <p className="text-gray-500 dark:text-gray-400">{t('no_permissions_found', 'permissions')}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('assigned_permissions', 'roles')}</h3>
                  
                  {role?.permissions && Array.isArray(role.permissions) && role.permissions.length > 0 ? (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {role.permissions.map((permission: any) => (
                          <div 
                        key={typeof permission === 'string' ? permission : permission._id} 
                            className="flex items-center text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm"
                      >
                            <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                            <div>
                              <div className="font-medium">
                        {typeof permission === 'string' 
                          ? permission 
                                  : permission.name
                                }
                              </div>
                              {typeof permission !== 'string' && 
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {permission.code}
                                </div>
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                      <p className="text-gray-500 dark:text-gray-400">{t('no_permissions_assigned', 'roles')}</p>
                      {!isEditing && (
                        <button
                          onClick={() => { setIsEditing(true); setActiveTab('permissions'); }}
                          className="mt-4 px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
                        >
                          {t('assign_permissions', 'roles')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Değişiklik Geçmişi Tab'ı */}
          {activeTab === 'history' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('change_history', 'common')}</h3>
              
              {history && history.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-7 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                  <ul className="space-y-6">
                    {history.map((entry) => (
                      <li key={entry._id} className="relative">
                        <div className="absolute left-0 top-5 -ml-3.5 h-7 w-7 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="pl-12 pr-4">
                          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {entry.action === 'create' ? t('created', 'common') : 
                                 entry.action === 'update' ? t('updated', 'common') : 
                                 entry.action === 'delete' ? t('deleted', 'common') : entry.action}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(entry.changedAt).toLocaleString('tr-TR')}
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              {t('changed_by', 'common')}: <span className="font-medium">{entry.changedBy}</span>
                            </div>
                            
                            {entry.changes && entry.changes.length > 0 && (
                              <div className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">
                                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">{t('changes', 'common')}</h4>
                                <div className="space-y-2">
                                  {entry.changes.map((change, idx) => (
                                    <div key={idx} className="text-sm">
                                      <div className="font-medium capitalize">{change.field}</div>
                                      <div className="grid grid-cols-2 gap-2 mt-1">
                                        <div className="bg-red-50 dark:bg-red-900/10 p-2 rounded text-xs text-red-600 dark:text-red-400">
                                          {typeof change.oldValue === 'object' ? JSON.stringify(change.oldValue) : change.oldValue?.toString() || '-'}
                                        </div>
                                        <div className="bg-green-50 dark:bg-green-900/10 p-2 rounded text-xs text-green-600 dark:text-green-400">
                                          {typeof change.newValue === 'object' ? JSON.stringify(change.newValue) : change.newValue?.toString() || '-'}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400">
                  <h4 className="text-sm font-medium flex items-center mb-1">
                    <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('no_history_available', 'common', {use: true})}
                  </h4>
                  <p className="text-sm mt-1">{t('history_implementation_info', 'roles', {use: true}) || 'Değişiklik geçmişi, rol üzerinde yapılan tüm değişiklikleri kayıt altına alan bir özelliktir. Bu özellik yakında aktif olacaktır.'}</p>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default RoleDetailsPage; 