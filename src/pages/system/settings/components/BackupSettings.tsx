import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../../context/i18nContext';
import systemSettingsService, { ISystemSettings } from '../../../../services/api/systemSettingsService';
import { toast } from 'react-toastify';

type BackupSchedule = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'manual';
type BackupLocation = 'local' | 's3';
type CompressionLevel = 'none' | 'low' | 'medium' | 'high';

interface BackupFormData {
  backupSchedule: BackupSchedule;
  backupTime: string;
  retentionPeriod: number;
  backupLocation: BackupLocation;
  s3Bucket: string;
  s3Region: string;
  backupDatabase: boolean;
  backupUploads: boolean;
  backupLogs: boolean;
  compressionLevel: CompressionLevel;
}

const BackupSettings: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BackupFormData>({
    backupSchedule: 'daily',
    backupTime: '03:00',
    retentionPeriod: 30,
    backupLocation: 'local',
    s3Bucket: '',
    s3Region: 'eu-central-1',
    backupDatabase: true,
    backupUploads: true,
    backupLogs: false,
    compressionLevel: 'medium'
  });

  // Ayarları yükle
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settings = await systemSettingsService.getSettings();
        setFormData({
          backupSchedule: settings.backup.backupSchedule,
          backupTime: settings.backup.backupTime,
          retentionPeriod: settings.backup.retentionPeriod,
          backupLocation: settings.backup.backupLocation,
          s3Bucket: settings.backup.s3Bucket,
          s3Region: settings.backup.s3Region,
          backupDatabase: settings.backup.backupDatabase,
          backupUploads: settings.backup.backupUploads,
          backupLogs: settings.backup.backupLogs,
          compressionLevel: settings.backup.compressionLevel
        });
      } catch (error) {
        console.error('Yedekleme ayarları yüklenirken hata:', error);
        toast.error(t('backup_settings_load_error', 'system'));
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let newValue: any = value;
    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      newValue = parseInt(value, 10);
    }
    
    const updatedFormData = { ...formData, [name]: newValue };
    setFormData(updatedFormData);

    try {
      const backupUpdate: Partial<ISystemSettings['backup']> = {
        ...updatedFormData,
        lastBackupTime: undefined
      };

      await systemSettingsService.updateSection('backup', backupUpdate);
      toast.success(t('backup_setting_updated', 'system'));
    } catch (error) {
      console.error('Yedekleme ayarı güncellenirken hata:', error);
      toast.error(t('backup_setting_update_error', 'system'));
    }
  };

  const handleBackupNow = async () => {
    try {
      setLoading(true);
      const backupUpdate: Partial<ISystemSettings['backup']> = {
        ...formData,
        lastBackupTime: new Date().toISOString()
      };

      await systemSettingsService.updateSection('backup', backupUpdate);
      toast.success(t('backup_started', 'system'));
    } catch (error) {
      console.error('Manuel yedekleme başlatılırken hata:', error);
      toast.error(t('backup_start_error', 'system'));
    } finally {
      setLoading(false);
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
          {t('backup_restore', 'system')}
        </h2>
        <button
          type="button"
          onClick={handleBackupNow}
          disabled={loading}
          className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-lg hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('backup_in_progress', 'system') : t('backup_now', 'system')}
        </button>
      </div>
      
      <div className="space-y-8">
        {/* Zamanlanmış Yedeklemeler */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('scheduled_backups', 'system')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="backupSchedule" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('backup_frequency', 'system')}
              </label>
              <select
                id="backupSchedule"
                name="backupSchedule"
                value={formData.backupSchedule}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
              >
                <option value="hourly">{t('hourly', 'system')}</option>
                <option value="daily">{t('daily', 'system')}</option>
                <option value="weekly">{t('weekly', 'system')}</option>
                <option value="monthly">{t('monthly', 'system')}</option>
                <option value="manual">{t('manual_only', 'system')}</option>
              </select>
            </div>
            
            {formData.backupSchedule !== 'manual' && (
              <div>
                <label htmlFor="backupTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('backup_time', 'system')}
                </label>
                <input
                  type="time"
                  id="backupTime"
                  name="backupTime"
                  value={formData.backupTime}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t('backup_time_help', 'system')}
                </p>
              </div>
            )}
            
            <div>
              <label htmlFor="retentionPeriod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('retention_period', 'system')} ({t('days', 'common')})
              </label>
              <input
                type="number"
                id="retentionPeriod"
                name="retentionPeriod"
                value={formData.retentionPeriod}
                onChange={handleChange}
                min="1"
                max="365"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('retention_period_help', 'system')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Yedekleme Depolama Yeri */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('backup_storage', 'system')}
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="storageLocal"
                  name="backupLocation"
                  value="local"
                  checked={formData.backupLocation === 'local'}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark"
                />
                <label htmlFor="storageLocal" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('local_storage', 'system')}
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="storageS3"
                  name="backupLocation"
                  value="s3"
                  checked={formData.backupLocation === 's3'}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark"
                />
                <label htmlFor="storageS3" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Amazon S3
                </label>
              </div>
            </div>
            
            {formData.backupLocation === 's3' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <label htmlFor="s3Bucket" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    S3 {t('bucket_name', 'system')}
                  </label>
                  <input
                    type="text"
                    id="s3Bucket"
                    name="s3Bucket"
                    value={formData.s3Bucket}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                  />
                </div>
                
                <div>
                  <label htmlFor="s3Region" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    S3 {t('region', 'system')}
                  </label>
                  <select
                    id="s3Region"
                    name="s3Region"
                    value={formData.s3Region}
                    onChange={handleChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                  >
                    <option value="eu-west-1">EU (Ireland)</option>
                    <option value="eu-central-1">EU (Frankfurt)</option>
                    <option value="us-east-1">US East (N. Virginia)</option>
                    <option value="us-west-1">US West (N. California)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Yedekleme İçeriği */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('backup_content', 'system')}
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="backupDatabase"
                name="backupDatabase"
                checked={formData.backupDatabase}
                onChange={handleChange}
                className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded"
              />
              <label htmlFor="backupDatabase" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('database', 'system')}
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="backupUploads"
                name="backupUploads"
                checked={formData.backupUploads}
                onChange={handleChange}
                className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded"
              />
              <label htmlFor="backupUploads" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('uploaded_files', 'system')}
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="backupLogs"
                name="backupLogs"
                checked={formData.backupLogs}
                onChange={handleChange}
                className="w-4 h-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded"
              />
              <label htmlFor="backupLogs" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('system_logs', 'system')}
              </label>
            </div>
          </div>
        </div>
        
        {/* Yedekleme Ayarları */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('backup_settings', 'system')}
          </h3>
          
          <div>
            <label htmlFor="compressionLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('compression_level', 'system')}
            </label>
            <select
              id="compressionLevel"
              name="compressionLevel"
              value={formData.compressionLevel}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
            >
              <option value="none">{t('none', 'common')}</option>
              <option value="low">{t('low', 'system')}</option>
              <option value="medium">{t('medium', 'system')}</option>
              <option value="high">{t('high', 'system')}</option>
            </select>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('compression_level_help', 'system')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupSettings; 