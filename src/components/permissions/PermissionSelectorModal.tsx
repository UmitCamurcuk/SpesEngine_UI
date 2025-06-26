import React, { useState, useEffect } from 'react';
import { Permission } from '../../types/permission';
import { Button } from '../ui';
import { useTranslation } from '../../context/i18nContext';

interface PermissionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedPermissionIds: string[]) => void;
  allPermissions: Permission[];
  selectedPermissionIds: string[];
  title?: string;
}

const PermissionSelectorModal: React.FC<PermissionSelectorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  allPermissions,
  selectedPermissionIds,
  title = 'İzin Seçimi'
}) => {
  const { currentLanguage } = useTranslation();
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedPermissionIds);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLocalSelectedIds(selectedPermissionIds);
  }, [selectedPermissionIds]);

  const handleToggle = (permissionId: string) => {
    setLocalSelectedIds(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAll = () => {
    if (localSelectedIds.length === filteredPermissions.length) {
      setLocalSelectedIds([]);
    } else {
      setLocalSelectedIds(filteredPermissions.map(p => p._id));
    }
  };

  const handleSave = () => {
    onSave(localSelectedIds);
    onClose();
  };

  const handleCancel = () => {
    setLocalSelectedIds(selectedPermissionIds);
    onClose();
  };

  const filteredPermissions = allPermissions.filter(permission => {
    const name = (currentLanguage === 'tr' ? permission.name.tr : permission.name.en).toLowerCase();
    const description = (currentLanguage === 'tr' ? permission.description.tr : permission.description.en).toLowerCase();
    const code = permission.code.toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || 
           description.includes(searchTerm.toLowerCase()) || 
           code.includes(searchTerm.toLowerCase());
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleCancel} />
        
        {/* Modal */}
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {localSelectedIds.length} / {filteredPermissions.length} izin seçildi
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="py-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="İzin ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Select All */}
          <div className="pb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSelectedIds.length === filteredPermissions.length && filteredPermissions.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                Tümünü Seç / Hiçbirini Seçme
              </span>
            </label>
          </div>

          {/* Permissions Table */}
          <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Seç
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    İzin Adı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Açıklama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Kod
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Durum
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPermissions.map((permission) => (
                  <tr key={permission._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={localSelectedIds.includes(permission._id)}
                        onChange={() => handleToggle(permission._id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {currentLanguage === 'tr' ? permission.name.tr : permission.name.en}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {currentLanguage === 'tr' ? permission.description.tr : permission.description.en}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                        {permission.code}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        permission.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {permission.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredPermissions.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">İzin bulunamadı</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Arama kriterlerinize uygun izin bulunmamaktadır.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end pt-6 space-x-3 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              İptal
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
            >
              Seçilenleri Kaydet ({localSelectedIds.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionSelectorModal; 