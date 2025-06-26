import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { useNotification } from '../../../components/notifications';
import TranslationFields from '../../../components/common/TranslationFields';
import { useTranslationForm } from '../../../hooks/useTranslationForm';
import { useTranslation } from '../../../context/i18nContext';
import permissionGroupService from '../../../services/api/permissionGroupService';
import type { CreatePermissionGroupDto } from '../../../types/permissionGroup';

const PermissionGroupCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const { currentLanguage } = useTranslation();
  
  // Translation hook'unu kullan
  const {
    supportedLanguages,
    translationData,
    handleTranslationChange
  } = useTranslationForm();
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    isActive: true
  });
  
  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Form input değişiklik handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Form gönderme handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Name translation kontrolü
      if (!translationData.nameTranslations[currentLanguage]?.trim()) {
        showToast({
          type: 'error',
          title: 'Hata',
          message: 'Grup adı gereklidir',
          duration: 3000
        });
        setIsLoading(false);
        return;
      }
      
      // Code kontrolü
      if (!formData.code.trim()) {
        showToast({
          type: 'error',
          title: 'Hata',
          message: 'Grup kodu gereklidir',
          duration: 3000
        });
        setIsLoading(false);
        return;
      }
      
      // Form verisini hazırla (current language'ı kullan)
      const payload: CreatePermissionGroupDto = {
        name: translationData.nameTranslations[currentLanguage] || '',
        description: translationData.descriptionTranslations[currentLanguage] || '',
        code: formData.code,
        isActive: formData.isActive
      };
      
      // API'ye gönder
      await permissionGroupService.createPermissionGroup(payload);
      
      showToast({
        type: 'success',
        title: 'Başarılı',
        message: 'İzin grubu başarıyla oluşturuldu',
        duration: 3000
      });
      
      // Başarılı olduğunda listeye yönlendir
      navigate('/permissionGroups/list');
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Hata',
        message: err.message || 'İzin grubu oluşturulurken bir hata oluştu',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Kod oluşturma (Boşlukları tire ile değiştir ve büyük harfe çevir)
  const generateCode = (name: string) => {
    return name.replace(/\s+/g, '_').toUpperCase();
  };
  
  // TR isim değiştiğinde otomatik kod oluştur
  const handleNameChange = (language: string, value: string) => {
    if (language === 'tr') {
      setFormData(prev => ({
        ...prev,
        code: generateCode(value)
      }));
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'İzin Grupları', path: '/permissionGroups/list' },
          { label: 'Yeni İzin Grubu Oluştur' }
        ]} 
      />
      
      {/* Başlık */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-7 h-7 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yeni İzin Grubu Oluştur
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Yeni bir izin grubu oluşturmak için aşağıdaki formu doldurun
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => navigate('/permissionGroups/list')}
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
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Temel Bilgiler</h3>
            </div>
            
            {/* Grup Adı */}
            <div className="col-span-1 md:col-span-2">
              <TranslationFields
                label="Grup Adı"
                fieldType="input"
                translations={translationData.nameTranslations}
                supportedLanguages={supportedLanguages}
                currentLanguage={currentLanguage}
                onChange={(language, value) => {
                  handleTranslationChange('nameTranslations', language, value);
                  handleNameChange(language, value);
                }}
                placeholder="Grup adını girin"
                required
              />
            </div>
            
            {/* Grup Kodu */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Grup Kodu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                placeholder="Grup kodunu girin"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Grup kodu otomatik oluşturulur, gerekirse düzenleyebilirsiniz
              </p>
            </div>
            
            {/* Açıklama */}
            <div className="col-span-1 md:col-span-2">
              <TranslationFields
                label="Açıklama"
                fieldType="textarea"
                translations={translationData.descriptionTranslations}
                supportedLanguages={supportedLanguages}
                currentLanguage={currentLanguage}
                onChange={(language, value) => {
                  handleTranslationChange('descriptionTranslations', language, value);
                }}
                placeholder="Grup açıklamasını girin"
                rows={3}
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
                Grubun aktif olup olmadığını belirler. Pasif gruplar izin atamalarında kullanılamaz.
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

export default PermissionGroupCreatePage; 