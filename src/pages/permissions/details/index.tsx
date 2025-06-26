import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Breadcrumb from '../../../components/common/Breadcrumb';
import EntityHistoryList from '../../../components/common/EntityHistoryList';
import { useNotification } from '../../../components/notifications';
import permissionService from '../../../services/api/permissionService';
import permissionGroupService from '../../../services/api/permissionGroupService';
import type { Permission, UpdatePermissionDto } from '../../../types/permission';
import type { PermissionGroup } from '../../../types/permissionGroup';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

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

interface EditablePermissionFields {
  name: string;
  description: string;
  code: string;
  isActive: boolean;
}

const PermissionDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast, showModal, showCommentModal } = useNotification();
  
  // STATE VARIABLES
  const [permission, setPermission] = useState<Permission | null>(null);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  
  // Edit state'leri
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Edit form data
  const [editableFields, setEditableFields] = useState<EditablePermissionFields>({
    name: '',
    description: '',
    code: '',
    isActive: true
  });

  // HELPER FUNCTIONS
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return dayjs(dateString).locale('tr').format('DD MMMM YYYY HH:mm:ss');
  };

  const getPermissionName = (permission: Permission | null) => {
    if (!permission) return '';
    return permission.name?.tr || permission.name?.en || '';
  };

  const getPermissionDescription = (permission: Permission | null) => {
    if (!permission) return '';
    return permission.description?.tr || permission.description?.en || '';
  };
  
  // EFFECTS
  useEffect(() => {
    let isMounted = true;
    
    const fetchPermissionDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const [permissionData, groupsResult] = await Promise.all([
          permissionService.getPermissionById(id),
          permissionGroupService.getPermissionGroups()
        ]);
        
        if (isMounted) {
          setPermission(permissionData);
          setPermissionGroups(groupsResult.permissionGroups || []);
          
          // Initialize editable fields
          setEditableFields({
            name: getPermissionName(permissionData),
            description: getPermissionDescription(permissionData),
            code: permissionData.code || '',
            isActive: permissionData.isActive
          });
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'İzin bulunamadı');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchPermissionDetails();
    
    return () => {
      isMounted = false;
    };
  }, [id]);
  
  // FORM HANDLERS
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEditableFields(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    setEditableFields(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!editableFields.name.trim()) {
      errors.name = 'İsim gereklidir';
    }
    
    if (!editableFields.code.trim()) {
      errors.code = 'Kod gereklidir';
    }
    
    if (!editableFields.description.trim()) {
      errors.description = 'Açıklama gereklidir';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!id) return;
    
    // Değişiklikleri kontrol et
    const changes: any = {};
    
    if (editableFields.name !== getPermissionName(permission)) {
      changes.name = editableFields.name;
    }
    if (editableFields.code !== permission!.code) {
      changes.code = editableFields.code;
    }
    if (editableFields.description !== getPermissionDescription(permission)) {
      changes.description = editableFields.description;
    }
    if (editableFields.isActive !== permission!.isActive) {
      changes.isActive = editableFields.isActive;
    }
    
    if (Object.keys(changes).length === 0) {
      showToast({
        type: 'info',
        title: 'Bilgi',
        message: 'Değişiklik yapılmadı',
        duration: 3000
      });
      return;
    }
    
    // Comment modal göster
    const changesList = Object.keys(changes).map(key => `${key}: ${changes[key]}`);
    showCommentModal({
      title: 'İzin Güncelleme',
      changes: changesList,
      onSave: async (comment: string) => {
        await handleSaveWithComment(comment, changes);
      }
    });
  };

  const handleSaveWithComment = async (comment: string, changes: any) => {
    if (!id) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const updateData: UpdatePermissionDto = {
        name: { tr: editableFields.name, en: editableFields.name },
        description: { tr: editableFields.description, en: editableFields.description },
        code: editableFields.code,
        isActive: editableFields.isActive,
        comment: comment
      };
      
      const updatedPermission = await permissionService.updatePermission(id, updateData);
      setPermission(updatedPermission);
      setIsEditing(false);
      
      showToast({
        type: 'success',
        title: 'Başarılı',
        message: 'İzin başarıyla güncellendi',
        duration: 3000
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Hata', 
        message: err.message || 'İzin güncellenirken bir hata oluştu',
        duration: 5000
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (!permission) return;
    
    setEditableFields({
      name: getPermissionName(permission),
      description: getPermissionDescription(permission),
      code: permission.code || '',
      isActive: permission.isActive
    });
    
    setFormErrors({});
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    
    showModal({
      type: 'error',
      title: 'İzin Silme Onayı',
      message: `"${getPermissionName(permission)}" iznini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      primaryButton: {
        text: 'Sil',
        onClick: async () => {
          try {
            await permissionService.deletePermission(id);
            showToast({
              type: 'success',
              title: 'Başarılı',
              message: 'İzin başarıyla silindi',
              duration: 3000
            });
            navigate('/permissions/list');
          } catch (error: any) {
            showToast({
              type: 'error',
              title: 'Hata',
              message: error.message || 'İzin silinirken bir hata oluştu',
              duration: 5000
            });
          }
        },
        variant: 'error'
      },
      secondaryButton: {
        text: 'İptal',
        onClick: () => {}
      }
    });
  };

  // Hangi permission groups bu permission'ı içeriyor
  const getPermissionGroupsContainingThisPermission = () => {
    return permissionGroups.filter(group => 
      Array.isArray(group.permissions) && 
      group.permissions.some(p => 
        typeof p === 'string' ? p === id : p._id === id
      )
    );
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

  if (error && !permission) {
    return (
      <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-800 dark:text-red-300 px-6 py-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-2">
          <svg className="w-6 h-6 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold">Hata</h3>
        </div>
        <p className="mb-3">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/permissions/list')}
          className="mt-2"
        >
          Listeye Dön
        </Button>
      </div>
    );
  }

  if (!permission) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 px-6 py-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-2">
          <svg className="w-6 h-6 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold">Bulunamadı</h3>
        </div>
        <p className="mb-3">İzin bulunamadı</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/permissions/list')}
          className="mt-2"
        >
          Listeye Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumb 
          items={[
            { label: 'İzinler', path: '/permissions/list' },
            { label: getPermissionName(permission) }
          ]} 
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Link to="/permissions/list" className="mr-4">
            <Button variant="outline" size="sm" className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Geri
            </Button>
          </Link>
          <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/50 
                         flex items-center justify-center mr-3">
            <svg className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <input
                    type="text"
                    name="name"
                    value={editableFields.name}
                    onChange={handleInputChange}
                    className={`text-2xl font-bold bg-transparent border-b-2 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 w-full`}
                    placeholder="İzin adı"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.name}</p>
                  )}
                </div>
                {permission?.name && typeof permission.name === 'object' && (permission.name as any)?._id && (
                  <Link
                    to={`/localizations/details/${(permission.name as any)._id}`}
                    className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    title="Çeviriyi düzenle"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                  </Link>
                )}
              </div>
            ) : (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{getPermissionName(permission)}</h1>
            )}
            <div className="flex items-center mt-1">
              <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                {permission.code}
              </span>
              <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
              <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                permission.isActive 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              }`}>
                {isEditing ? (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={editableFields.isActive}
                      onChange={handleInputChange}
                      className="h-3 w-3 text-primary-light focus:ring-primary-light border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-1 text-xs">
                      {editableFields.isActive ? 'Aktif' : 'Pasif'}
                    </label>
                  </div>
                ) : (
                  permission.isActive ? 'Aktif' : 'Pasif'
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button
                variant="primary"
                className="flex items-center"
                onClick={handleSave}
                disabled={isSaving}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Kaydet</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>İptal</span>
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={() => setShowJsonPreview(!showJsonPreview)}
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                JSON Görünümü
              </Button>
              <Button
                variant="primary"
                className="flex items-center"
                onClick={() => setIsEditing(true)}
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Düzenle
              </Button>
              <Button
                variant="secondary"
                className="flex items-center text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
                onClick={handleDelete}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Sil
              </Button>
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
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Detaylar
            </div>
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissionGroups'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('permissionGroups')}
          >
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              İzin Grupları ({getPermissionGroupsContainingThisPermission().length})
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
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Geçmiş
            </div>
          </button>
        </nav>
      </div>

      {/* JSON PREVIEW */}
      {showJsonPreview && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">JSON Görünümü</h2>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center"
              onClick={() => navigator.clipboard.writeText(JSON.stringify(permission, null, 2))}
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Kopyala
            </Button>
          </CardHeader>
          <CardBody>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{JSON.stringify(permission, null, 2)}</code>
            </pre>
          </CardBody>
        </Card>
      )}

      {/* TAB CONTENT - DETAILS */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Genel Bilgiler</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Açıklama</h3>
                      {isEditing && permission?.description && (
                        <Link
                          to={`/localizations/details/${(permission.description as any)?._id}`}
                          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                          title="Çeviriyi düzenle"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                        </Link>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="mt-2">
                        <textarea
                          name="description"
                          value={editableFields.description}
                          onChange={handleInputChange}
                          rows={4}
                          className={`w-full px-3 py-2 border ${
                            formErrors.description ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                          } rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark`}
                          placeholder="İzin açıklaması"
                        />
                        {formErrors.description && (
                          <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.description}</p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-2 text-gray-900 dark:text-gray-100">
                        {getPermissionDescription(permission) || 'Açıklama bulunmuyor'}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Durum</h3>
                      <div className="mt-2 flex items-center">
                        {permission.isActive ? (
                          <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        <span className="ml-2 text-gray-900 dark:text-gray-100">
                          {permission.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">İzin Grubu Sayısı</h3>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          {getPermissionGroupsContainingThisPermission().length} grup
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Oluşturulma Tarihi</h3>
                      <p className="mt-2 text-gray-900 dark:text-gray-100">{formatDate(permission.createdAt)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Son Güncelleme</h3>
                      <p className="mt-2 text-gray-900 dark:text-gray-100">{formatDate(permission.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
          
          {/* Sidebar - Quick Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Hızlı Bilgiler</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Kod</span>
                  </div>
                  <span className="text-sm font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                    {permission.code}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm text-gray-600 dark:text-gray-400">İzin Grupları</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {getPermissionGroupsContainingThisPermission().length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Durum</span>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    permission.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {permission.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT - PERMISSION GROUPS */}
      {activeTab === 'permissionGroups' && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Bu İzni İçeren Gruplar</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {getPermissionGroupsContainingThisPermission().length} grup bulundu
            </span>
          </CardHeader>
          <CardBody>
            {getPermissionGroupsContainingThisPermission().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getPermissionGroupsContainingThisPermission().map((group) => (
                  <div
                    key={group._id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => navigate(`/permissionGroups/details/${group._id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {group.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {group.description}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-mono bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                            {group.code}
                          </span>
                          <span className="mx-2">•</span>
                          <span className={`px-2 py-1 rounded-full ${
                            group.isActive 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {group.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                      </div>
                      <svg className="h-5 w-5 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Hiç İzin Grubu Bulunamadı</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Bu izin henüz hiçbir izin grubuna eklenmemiş.
                </p>
                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/permissionGroups/list')}
                    className="flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    İzin Gruplarını Görüntüle
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* TAB CONTENT - HISTORY */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">İzin Geçmişi</h2>
          </CardHeader>
          <CardBody>
            <EntityHistoryList entityId={id!} entityType="permission" title="İzin Geçmişi" />
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default PermissionDetailsPage; 