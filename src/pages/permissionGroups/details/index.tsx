import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import { useNotification } from '../../../components/notifications';
import Breadcrumb from '../../../components/common/Breadcrumb';
import EntityHistoryList from '../../../components/common/EntityHistoryList';
import PermissionSelectorModal from '../../../components/permissions/PermissionSelectorModal';
import { useTranslation } from '../../../context/i18nContext';
import permissionGroupService from '../../../services/api/permissionGroupService';
import permissionService from '../../../services/api/permissionService';
import { PermissionGroup } from '../../../types/permissionGroup';
import { Permission } from '../../../types/permission';
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

// MAIN COMPONENT
const PermissionGroupDetailsPage: React.FC = () => {
  // HOOKS
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast, showModal, showCommentModal } = useNotification();
  const { currentLanguage } = useTranslation();
  
  // STATE VARIABLES
  const [permissionGroup, setPermissionGroup] = useState<PermissionGroup | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  
  // Edit state'leri
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);
  
  // Edit form data
  const [editableFields, setEditableFields] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true
  });
  
  // HELPER FUNCTIONS
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return dayjs(dateString).locale('tr').format('DD MMMM YYYY HH:mm:ss');
  };

  const getStatusIcon = (isActive?: boolean) => {
    if (isActive) {
      return (
        <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else {
      return (
        <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
  };
  
  // EFFECTS
  useEffect(() => {
    let isMounted = true;
    
    const fetchPermissionGroupDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const [permissionGroupData, permissionsData] = await Promise.all([
          permissionGroupService.getPermissionGroupById(id),
          permissionService.getPermissions()
        ]);
        
        if (isMounted) {
          setPermissionGroup(permissionGroupData);
          setAllPermissions(permissionsData.permissions || []);
          
          // Initialize editable fields
          setEditableFields({
            name: permissionGroupData.name || '',
            code: permissionGroupData.code || '',
            description: permissionGroupData.description || '',
            isActive: permissionGroupData.isActive
          });
          
          // Initialize selected permissions
          setSelectedPermissionIds(
            permissionGroupData.permissions?.map((p: any) => p._id || p) || []
          );
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'İzin grubu bulunamadı');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchPermissionGroupDetails();
    
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
  
  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissionIds(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
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
    
    const changes: string[] = [];
    if (editableFields.name !== permissionGroup?.name) {
      changes.push(`İsim: ${permissionGroup?.name} → ${editableFields.name}`);
    }
    if (editableFields.code !== permissionGroup?.code) {
      changes.push(`Kod: ${permissionGroup?.code} → ${editableFields.code}`);
    }
    if (editableFields.description !== permissionGroup?.description) {
      changes.push(`Açıklama: ${permissionGroup?.description} → ${editableFields.description}`);
    }
    if (editableFields.isActive !== permissionGroup?.isActive) {
      changes.push(`Durum: ${permissionGroup?.isActive ? 'Aktif' : 'Pasif'} → ${editableFields.isActive ? 'Aktif' : 'Pasif'}`);
    }
    
    const originalPermissions = permissionGroup?.permissions?.map((p: any) => p._id || p) || [];
    if (JSON.stringify(selectedPermissionIds.sort()) !== JSON.stringify(originalPermissions.sort())) {
      changes.push('İzinler güncellendi');
    }

    if (changes.length === 0) {
      showToast({ 
        title: 'Bilgi', 
        message: 'Herhangi bir değişiklik yapılmadı',
        type: 'info'
      });
      setIsEditing(false);
      return;
    }

    // Comment modal göster
    showCommentModal({
      title: 'İzin Grubu Güncelleme',
      changes: changes,
      onSave: async (comment: string) => {
        await handleSaveWithComment(comment, changes);
      }
    });
  };
  
  const handleSaveWithComment = async (comment: string, changes: any) => {
    if (!id) return;
    
    setIsSaving(true);
    
    try {
      await permissionGroupService.updatePermissionGroup(id, {
        ...editableFields,
        permissions: selectedPermissionIds,
        comment: comment
      });
      
      // Veriyi yeniden yükle
      const updatedData = await permissionGroupService.getPermissionGroupById(id);
      setPermissionGroup(updatedData);
      
      setEditableFields({
        name: updatedData.name || '',
        code: updatedData.code || '',
        description: updatedData.description || '',
        isActive: updatedData.isActive
      });
      
      setSelectedPermissionIds(
        updatedData.permissions?.map((p: any) => p._id || p) || []
      );
      
      setIsEditing(false);
      showToast({ 
        title: 'Başarılı', 
        message: 'İzin grubu başarıyla güncellendi',
        type: 'success'
      });
    } catch (err: any) {
      showToast({ 
        title: 'Hata', 
        message: 'Güncelleme hatası: ' + err.message,
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteClick = () => {
    showModal({
      type: 'error',
      title: 'İzin Grubunu Sil',
      message: `"${permissionGroup?.name}" izin grubunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      primaryButton: {
        text: 'Sil',
        onClick: async () => {
          if (id) {
            try {
              await permissionGroupService.deletePermissionGroup(id);
              showToast({ 
                title: 'Başarılı', 
                message: 'İzin grubu başarıyla silindi',
                type: 'success'
              });
              navigate('/permissionGroups/list');
            } catch (err: any) {
              showToast({ 
                title: 'Hata', 
                message: 'Silme hatası: ' + err.message,
                type: 'error'
              });
            }
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
  
  // LOADING STATE
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-light border-t-transparent dark:border-primary-dark dark:border-t-transparent"></div>
      </div>
    );
  }
  
  // ERROR STATE
  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-2">
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium">Hata</h3>
        </div>
        <p className="mb-4">{error}</p>
        <Button variant="outline" onClick={() => navigate('/permissionGroups/list')}>
          Listeye Dön
        </Button>
      </div>
    );
  }
  
  if (!permissionGroup) {
    return null;
  }

  // RENDER
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* BREADCRUMB */}
      <div className="flex items-center justify-between">
        <Breadcrumb 
          items={[
            { label: 'İzin Grupları', path: '/permissionGroups/list' },
            { label: permissionGroup.name }
          ]} 
        />
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Link to="/permissionGroups/list" className="mr-4">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  name="name"
                  value={editableFields.name}
                  onChange={handleInputChange}
                  className={`text-2xl font-bold bg-transparent border-b-2 ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } text-gray-900 dark:text-white focus:outline-none focus:border-primary-500`}
                  placeholder="İzin grubu adı"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.name}</p>
                )}
              </div>
            ) : (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{permissionGroup.name}</h1>
            )}
            <div className="flex items-center mt-1">
              {isEditing ? (
                <input
                  type="text"
                  name="code"
                  value={editableFields.code}
                  onChange={handleInputChange}
                  className={`text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded ${
                    formErrors.code ? 'border border-red-500' : ''
                  } text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  placeholder="İzin grubu kodu"
                />
              ) : (
                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                  {permissionGroup.code}
                </span>
              )}
              {formErrors.code && (
                <p className="ml-2 text-sm text-red-500 dark:text-red-400">{formErrors.code}</p>
              )}
              <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
              <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                (isEditing ? editableFields.isActive : permissionGroup.isActive)
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
                  permissionGroup.isActive ? 'Aktif' : 'Pasif'
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
                loading={isSaving}
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
                onClick={() => setIsEditing(false)}
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
                onClick={handleDeleteClick}
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

      {/* TABS NAVIGATION */}
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
              activeTab === 'permissions'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('permissions')}
          >
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              İzinler
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
              onClick={() => navigator.clipboard.writeText(JSON.stringify(permissionGroup, null, 2))}
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Kopyala
            </Button>
          </CardHeader>
          <CardBody>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{JSON.stringify(permissionGroup, null, 2)}</code>
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
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Açıklama</h3>
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
                          placeholder="İzin grubu açıklaması"
                        />
                        {formErrors.description && (
                          <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.description}</p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-2 text-gray-900 dark:text-gray-100">
                        {permissionGroup.description || 'Açıklama bulunmuyor'}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Durum</h3>
                      <div className="mt-2 flex items-center">
                        {getStatusIcon(permissionGroup.isActive)}
                        <span className="ml-2 text-gray-900 dark:text-gray-100">
                          {permissionGroup.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">İzin Sayısı</h3>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          {permissionGroup.permissions?.length || 0} izin
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Oluşturulma Tarihi</h3>
                      <p className="mt-2 text-gray-900 dark:text-gray-100">{formatDate(permissionGroup.createdAt)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Son Güncelleme</h3>
                      <p className="mt-2 text-gray-900 dark:text-gray-100">{formatDate(permissionGroup.updatedAt)}</p>
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
                    {permissionGroup.code}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Toplam İzin</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {permissionGroup.permissions?.length || 0}
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
                    permissionGroup.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {permissionGroup.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT - PERMISSIONS */}
      {activeTab === 'permissions' && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Grup İzinleri</h2>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selectedPermissionIds.length} izin atanmış
              </span>
              {isEditing && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowPermissionModal(true)}
                  className="flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  İzin Ekle
                </Button>
              )}
            </div>
          </CardHeader>
          <CardBody>
            {selectedPermissionIds.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  {isEditing ? 'Henüz hiç izin eklenmemiş' : 'Bu grupta hiç izin yok'}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {isEditing 
                    ? 'İzin eklemek için yukarıdaki "İzin Ekle" butonunu kullanın.'
                    : 'Bu izin grubuna henüz hiç izin atanmamış.'
                  }
                </p>
                {isEditing && (
                  <div className="mt-6">
                    <Button
                      variant="primary"
                      onClick={() => setShowPermissionModal(true)}
                      className="flex items-center mx-auto"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      İzin Ekle
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {allPermissions
                  .filter(permission => selectedPermissionIds.includes(permission._id))
                  .map((permission) => (
                    <div
                      key={permission._id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {currentLanguage === 'tr' ? permission.name.tr : permission.name.en}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {currentLanguage === 'tr' ? permission.description.tr : permission.description.en}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-1">
                          {permission.code}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          permission.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {permission.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                        {isEditing && (
                          <button
                            onClick={() => handlePermissionToggle(permission._id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="İzni kaldır"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* TAB CONTENT - HISTORY */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Değişiklik Geçmişi</h2>
          </CardHeader>
          <CardBody>
            <EntityHistoryList
              entityId={id!}
              entityType="permissionGroup"
            />
          </CardBody>
        </Card>
      )}

      {/* Permission Selector Modal */}
      <PermissionSelectorModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        onSave={(newSelectedIds) => {
          setSelectedPermissionIds(newSelectedIds);
          setShowPermissionModal(false);
        }}
        allPermissions={allPermissions}
        selectedPermissionIds={selectedPermissionIds}
        title="İzin Grubuna İzin Ekle"
      />
    </div>
  );
};

export default PermissionGroupDetailsPage; 