import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../../context/i18nContext';
import systemSettingsService from '../../../../services/api/systemSettingsService';
import { toast } from 'react-toastify';

const NotificationSettings: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    enableSystemNotifications: true,
    enableEmailNotifications: true,
    enablePushNotifications: false,
    
    // Kullanıcı bildirimleri
    notifyUserOnLogin: true,
    notifyUserOnPasswordChange: true,
    notifyUserOnRoleChange: true,
    
    // Veri bildirimleri
    notifyOnDataImport: true,
    notifyOnDataExport: true,
    notifyOnBulkChanges: true,
    
    // Sistem bildirimleri
    notifyOnSystemUpdates: true,
    notifyOnBackupComplete: true,
    notifyOnSystemErrors: true,
    
    // Bildirim alacak email adresleri
    adminEmails: [] as string[]
  });

  // Ayarları yükle
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settings = await systemSettingsService.getSettings();
        setFormData(settings.notifications);
      } catch (error) {
        console.error('Bildirim ayarları yüklenirken hata:', error);
        toast.error(t('notification_settings_load_error', 'system'));
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let newValue: any = value;
    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'adminEmails') {
      newValue = value.split(',').map(email => email.trim()).filter(email => email);
    }
    
    setFormData(prev => ({ ...prev, [name]: newValue }));

    try {
      await systemSettingsService.updateSection('notifications', {
        ...formData,
        [name]: newValue
      });
      toast.success(t('notification_setting_updated', 'system'));
    } catch (error) {
      console.error('Bildirim ayarı güncellenirken hata:', error);
      toast.error(t('notification_setting_update_error', 'system'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light dark:border-primary-dark"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white">
          {t('notifications', 'system')}
        </h2>
      </div>
      
      <div className="space-y-8">
        {/* Bildirim Kanalları */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('notification_channels', 'system')}
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableSystemNotifications"
                name="enableSystemNotifications"
                checked={formData.enableSystemNotifications}
                onChange={handleChange}
                className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded"
              />
              <label htmlFor="enableSystemNotifications" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('enable_system_notifications', 'system')}
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableEmailNotifications"
                name="enableEmailNotifications"
                checked={formData.enableEmailNotifications}
                onChange={handleChange}
                className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded"
              />
              <label htmlFor="enableEmailNotifications" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('enable_email_notifications', 'system')}
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enablePushNotifications"
                name="enablePushNotifications"
                checked={formData.enablePushNotifications}
                onChange={handleChange}
                className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded"
              />
              <label htmlFor="enablePushNotifications" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('enable_push_notifications', 'system')}
              </label>
            </div>
          </div>
        </div>
        
        {/* Kullanıcı Bildirimleri */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('user_notifications', 'system')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyUserOnLogin"
                name="notifyUserOnLogin"
                checked={formData.notifyUserOnLogin}
                onChange={handleChange}
                className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded"
              />
              <label htmlFor="notifyUserOnLogin" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('notify_user_on_login', 'system')}
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyUserOnPasswordChange"
                name="notifyUserOnPasswordChange"
                checked={formData.notifyUserOnPasswordChange}
                onChange={handleChange}
                className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded"
              />
              <label htmlFor="notifyUserOnPasswordChange" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('notify_user_on_password_change', 'system')}
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyUserOnRoleChange"
                name="notifyUserOnRoleChange"
                checked={formData.notifyUserOnRoleChange}
                onChange={handleChange}
                className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded"
              />
              <label htmlFor="notifyUserOnRoleChange" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('notify_user_on_role_change', 'system')}
              </label>
            </div>
          </div>
        </div>
        
        {/* Veri Değişikliği Bildirimleri */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('data_change_notifications', 'system')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyOnDataImport"
                name="notifyOnDataImport"
                checked={formData.notifyOnDataImport}
                onChange={handleChange}
                className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded"
              />
              <label htmlFor="notifyOnDataImport" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('notify_on_data_import', 'system')}
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyOnDataExport"
                name="notifyOnDataExport"
                checked={formData.notifyOnDataExport}
                onChange={handleChange}
                className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded"
              />
              <label htmlFor="notifyOnDataExport" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('notify_on_data_export', 'system')}
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyOnBulkChanges"
                name="notifyOnBulkChanges"
                checked={formData.notifyOnBulkChanges}
                onChange={handleChange}
                className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded"
              />
              <label htmlFor="notifyOnBulkChanges" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('notify_on_bulk_changes', 'system')}
              </label>
            </div>
          </div>
        </div>
        
        {/* Sistem Bildirimleri */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('system_notifications', 'system')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyOnSystemUpdates"
                name="notifyOnSystemUpdates"
                checked={formData.notifyOnSystemUpdates}
                onChange={handleChange}
                className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded"
              />
              <label htmlFor="notifyOnSystemUpdates" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('notify_on_system_updates', 'system')}
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyOnBackupComplete"
                name="notifyOnBackupComplete"
                checked={formData.notifyOnBackupComplete}
                onChange={handleChange}
                className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded"
              />
              <label htmlFor="notifyOnBackupComplete" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('notify_on_backup_complete', 'system')}
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyOnSystemErrors"
                name="notifyOnSystemErrors"
                checked={formData.notifyOnSystemErrors}
                onChange={handleChange}
                className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded"
              />
              <label htmlFor="notifyOnSystemErrors" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('notify_on_system_errors', 'system')}
              </label>
            </div>
          </div>
        </div>
        
        {/* Bildirim Alacak Adminler */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('notification_recipients', 'system')}
          </h3>
          
          <div>
            <label htmlFor="adminEmails" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin_emails', 'system')}
            </label>
            <textarea
              id="adminEmails"
              name="adminEmails"
              value={formData.adminEmails.join(', ')}
              onChange={handleChange}
              rows={3}
              placeholder="admin@example.com, manager@example.com"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
            ></textarea>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('admin_emails_help', 'system')}
            </p>
          </div>
          
          <div className="mt-4">
            <button 
              type="button"
              className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-lg hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-offset-2 transition-colors"
            >
              {t('send_test_notification', 'system')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings; 