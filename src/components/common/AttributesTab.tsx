import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import attributeService from '../../services/api/attributeService';
import { useTranslation } from '../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../utils/translationUtils';

interface Attribute {
  _id: string;
  id?: string;
  name: any;
  code?: string;
  description?: any;
  type: string;
  isActive?: boolean;
  isRequired?: boolean;
  options?: string[];
}

interface AttributesTabProps {
  attributes: Attribute[];
  isEditing?: boolean;
  onUpdate?: (updatedAttributes: Attribute[]) => void;
  onAdd?: (attributeId: string) => void;
  onRemove?: (attributeId: string) => void;
  title?: string;
  emptyMessage?: string;
  showAddButton?: boolean;
}

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

const AttributesTab: React.FC<AttributesTabProps> = ({
  attributes = [],
  isEditing = false,
  onUpdate,
  onAdd,
  onRemove,
  title = "Öznitelikler",
  emptyMessage = "Henüz öznitelik eklenmemiş.",
  showAddButton = true
}) => {
  const { currentLanguage } = useTranslation();
  const [availableAttributes, setAvailableAttributes] = useState<Attribute[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mevcut öznitelikleri yükle
  useEffect(() => {
    if (isEditing && showAddButton) {
      fetchAvailableAttributes();
    }
  }, [isEditing, showAddButton]);

  const fetchAvailableAttributes = async () => {
    try {
      setLoading(true);
      const response = await attributeService.getAttributes({ isActive: true });
      if (response && response.attributes) {
        setAvailableAttributes(response.attributes);
      }
    } catch (error) {
      console.error('Öznitelikler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttribute = (attributeId: string) => {
    if (onAdd) {
      onAdd(attributeId);
    }
    setShowAddModal(false);
  };

  const handleRemoveAttribute = (attributeId: string) => {
    if (onRemove) {
      onRemove(attributeId);
    }
  };

  // Henüz eklenmemiş öznitelikleri filtrele
  const getAvailableAttributesToAdd = () => {
    const currentAttributeIds = attributes.map(a => a._id || a.id);
    return availableAttributes.filter(a => !currentAttributeIds.includes(a._id || a.id));
  };

  // Öznitelik türü ikonu
  const getAttributeTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'number':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 0l4 16M6 9h14M4 15h14" />
          </svg>
        );
      case 'boolean':
        return (
          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'date':
        return (
          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'select':
      case 'multiselect':
        return (
          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
    }
  };

  if (attributes.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
          {isEditing && showAddButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Öznitelik Ekle
            </Button>
          )}
        </div>
        
        <div className="text-center py-8">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {emptyMessage}
          </p>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Öznitelik Ekle
                </h3>
                
                {loading ? (
                  <div className="py-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {getAvailableAttributesToAdd().map(attribute => (
                      <div
                        key={attribute._id}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-center">
                          {getAttributeTypeIcon(attribute.type)}
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {getEntityName(attribute, currentLanguage)}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Tip: {attribute.type} | Kod: {attribute.code}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddAttribute(attribute._id)}
                        >
                          Ekle
                        </Button>
                      </div>
                    ))}
                    {getAvailableAttributesToAdd().length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        Eklenebilecek öznitelik bulunamadı.
                      </p>
                    )}
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                  >
                    İptal
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
          {isEditing && showAddButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Öznitelik Ekle
            </Button>
          )}
        </div>

        {/* Table Layout */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Öznitelik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Açıklama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Durum
                </th>
                {isEditing && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    İşlemler
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {attributes.map((attribute) => (
                <tr key={attribute._id || attribute.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getAttributeTypeIcon(attribute.type)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {getEntityName(attribute, currentLanguage)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Kod: {attribute.code}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {attribute.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {getEntityDescription(attribute, currentLanguage) || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {attribute.isRequired && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 mr-2">
                          Zorunlu
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        attribute.isActive !== false 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {attribute.isActive !== false ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                  </td>
                  {isEditing && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveAttribute(attribute._id || attribute.id!)}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Öznitelik Ekle
              </h3>
              
              {loading ? (
                <div className="py-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {getAvailableAttributesToAdd().map(attribute => (
                    <div
                      key={attribute._id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center">
                        {getAttributeTypeIcon(attribute.type)}
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {getEntityName(attribute, currentLanguage)}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Tip: {attribute.type} | Kod: {attribute.code}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddAttribute(attribute._id)}
                      >
                        Ekle
                      </Button>
                    </div>
                  ))}
                  {getAvailableAttributesToAdd().length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      Eklenebilecek öznitelik bulunamadı.
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  İptal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttributesTab; 