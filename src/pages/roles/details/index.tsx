import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import roleService from '../../../services/api/roleService';
import permissionService from '../../../services/api/permissionService';
import type { Role, UpdateRoleDto } from '../../../services/api/roleService';
import type { Permission } from '../../../services/api/permissionService';

const RoleDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
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
  
  // Loading ve error state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetchingOptions, setIsFetchingOptions] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
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
          ? roleData.permissions.map(p => typeof p === 'string' ? p : p._id)
          : [];
        
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
    };
    
    fetchRoleDetails();
  }, [id]);
  
  // İzinleri yükle
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setIsFetchingOptions(true);
        const result = await permissionService.getPermissions({ limit: 100 });
        setPermissionOptions(result.permissions);
      } catch (err: any) {
        console.error('İzinler yüklenirken hata oluştu:', err);
      } finally {
        setIsFetchingOptions(false);
      }
    };
    
    if (isEditing) {
      fetchPermissions();
    }
  }, [isEditing]);
  
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
  const handlePermissionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedValues: string[] = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    
    setSelectedPermissions(selectedValues);
    setFormData(prev => ({ ...prev, permissions: selectedValues }));
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
      await roleService.updateRole(id, formData);
      
      // Güncel veriyi yeniden yükle
      const updatedRole = await roleService.getRoleById(id);
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
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-primary-light dark:text-primary-dark mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  if (error && !role) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
        <h3 className="text-lg font-semibold mb-2">Hata Oluştu</h3>
        <p>{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate('/roles/list')}
        >
          Listeye Dön
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-7 h-7 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Rol Detayları
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {role?.name} rolünün detaylı bilgileri
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate('/roles/list')}
              className="flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Listeye Dön
            </Button>
            
            {isEditing ? (
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Düzenlemeyi İptal Et
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => setIsEditing(true)}
                className="flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Düzenle
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Ana İçerik */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Rol başarıyla güncellendi!</span>
          </div>
        )}
        
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Temel Bilgiler Başlığı */}
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Temel Bilgiler</h3>
              </div>
              
              {/* İsim */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rol Adı <span className="text-red-500">*</span>
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
              
              {/* İzinler */}
              <div>
                <label htmlFor="permissions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  İzinler
                </label>
                <select
                  id="permissions"
                  name="permissions"
                  multiple
                  size={5}
                  value={selectedPermissions}
                  onChange={handlePermissionChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                >
                  {isFetchingOptions ? (
                    <option value="" disabled>Yükleniyor...</option>
                  ) : permissionOptions.length > 0 ? (
                    permissionOptions.map(permission => (
                      <option key={permission._id} value={permission._id}>
                        {permission.name} ({permission.code})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>İzin bulunamadı</option>
                  )}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Birden fazla seçmek için CTRL (veya CMD) tuşunu basılı tutun
                </p>
              </div>
              
              {/* Açıklama */}
              <div className="col-span-1 md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Açıklama <span className="text-red-500">*</span>
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
              
              {/* Aktif/Pasif durumu */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-primary-light bg-gray-100 border-gray-300 rounded focus:ring-primary-light dark:focus:ring-primary-dark dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Aktif
                  </label>
                </div>
              </div>
              
              <div className="col-span-1 md:col-span-2 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                  className="flex items-center"
                  disabled={isSaving}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Sil
                </Button>
                
                <Button
                  type="submit"
                  variant="primary"
                  className="flex items-center"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Kaydet
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Bilgi görüntüleme */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Temel Bilgiler Başlığı */}
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Temel Bilgiler</h3>
              </div>
              
              {/* İsim */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Rol Adı</h4>
                <p className="mt-1 text-gray-900 dark:text-white">{role?.name}</p>
              </div>
              
              {/* Durum */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Durum</h4>
                <div className="mt-1">
                  {role?.isActive ? (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">
                      Aktif
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500">
                      Pasif
                    </span>
                  )}
                </div>
              </div>
              
              {/* Açıklama */}
              <div className="col-span-1 md:col-span-2">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Açıklama</h4>
                <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-wrap">{role?.description || '-'}</p>
              </div>
              
              {/* Oluşturulma Tarihi */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Oluşturulma Tarihi</h4>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {new Date(role?.createdAt || '').toLocaleString('tr-TR')}
                </p>
              </div>
              
              {/* Son Güncelleme */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Son Güncelleme</h4>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {new Date(role?.updatedAt || '').toLocaleString('tr-TR')}
                </p>
              </div>
            </div>
            
            {/* İzinler */}
            {role?.permissions && Array.isArray(role.permissions) && role.permissions.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">İzinler</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {role.permissions.map((permission: any) => (
                      <li 
                        key={typeof permission === 'string' ? permission : permission._id} 
                        className="flex items-center text-gray-700 dark:text-gray-300"
                      >
                        <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {typeof permission === 'string' 
                          ? permission 
                          : `${permission.name} (${permission.code})`
                        }
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleDetailsPage; 