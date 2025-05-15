import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import permissionService from '../../../services/api/permissionService';
import permissionGroupService from '../../../services/api/permissionGroupService';
import type { CreatePermissionDto } from '../../../services/api/permissionService';
import type { PermissionGroup } from '../../../services/api/permissionGroupService';

const PermissionCreatePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState<CreatePermissionDto>({
    name: '',
    description: '',
    code: '',
    permissionGroup: '',
    isActive: true
  });
  
  // Grup seçenekleri
  const [groupOptions, setGroupOptions] = useState<PermissionGroup[]>([]);
  
  // Loading ve error state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingOptions, setIsFetchingOptions] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // İzin gruplarını yükle
  useEffect(() => {
    const fetchPermissionGroups = async () => {
      try {
        setIsFetchingOptions(true);
        const result = await permissionGroupService.getPermissionGroups({ limit: 100 });
        setGroupOptions(result.permissionGroups);
      } catch (err: any) {
        console.error('İzin grupları yüklenirken hata oluştu:', err);
      } finally {
        setIsFetchingOptions(false);
      }
    };
    
    fetchPermissionGroups();
  }, []);
  
  // Form input değişiklik handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Checkbox için özel işlem
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Form gönderme handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Form verisini hazırla
      const payload: CreatePermissionDto = {
        ...formData
      };
      
      // API'ye gönder
      await permissionService.createPermission(payload);
      
      setSuccess(true);
      
      // Başarılı olduğunda listeye yönlendir
      setTimeout(() => {
        navigate('/permissions/list');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'İzin oluşturulurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Kod oluşturma (Boşlukları tire ile değiştir ve büyük harfe çevir)
  const generateCode = (name: string) => {
    return name.replace(/\s+/g, '_').toUpperCase();
  };
  
  // İsim değiştiğinde otomatik kod oluştur
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      name,
      code: generateCode(name)
    }));
  };
  
  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-7 h-7 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yeni İzin Oluştur
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Yeni bir izin oluşturmak için aşağıdaki formu doldurun
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => navigate('/permissions/list')}
            className="flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Listeye Dön
          </Button>
        </div>
      </div>
      
      {/* Form */}
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
            <span>İzin başarıyla oluşturuldu! Yönlendiriliyorsunuz...</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Temel Bilgiler</h3>
            </div>
            
            {/* İzin Adı */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                İzin Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                required
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                placeholder="İzin adını girin"
              />
            </div>
            
            {/* İzin Kodu */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                İzin Kodu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                placeholder="İzin kodunu girin"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                İzin kodu otomatik oluşturulur, gerekirse düzenleyebilirsiniz
              </p>
            </div>
            
            {/* İzin Grubu */}
            <div>
              <label htmlFor="permissionGroup" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                İzin Grubu <span className="text-red-500">*</span>
              </label>
              <select
                id="permissionGroup"
                name="permissionGroup"
                value={formData.permissionGroup}
                onChange={handleChange}
                required
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
              >
                <option value="" disabled>Bir grup seçin</option>
                {isFetchingOptions ? (
                  <option value="" disabled>Yükleniyor...</option>
                ) : groupOptions.length > 0 ? (
                  groupOptions.map(group => (
                    <option key={group._id} value={group._id}>
                      {group.name} ({group.code})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Grup bulunamadı</option>
                )}
              </select>
            </div>
            
            {/* Açıklama */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Açıklama <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                placeholder="İzin hakkında açıklama girin"
              />
            </div>
            
            {/* Active/Inactive state */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive === undefined ? true : formData.isActive}
                    onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-primary-light bg-gray-100 border-gray-300 rounded focus:ring-primary-light dark:focus:ring-primary-dark dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Aktif
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                İznin aktif olup olmadığını belirler. Pasif izinler kullanıcıların erişimine kapalıdır.
              </p>
            </div>
            
            {/* Form Actions */}
            <div className="col-span-1 md:col-span-2 flex justify-end pt-4">
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="flex items-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Oluştur
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PermissionCreatePage; 