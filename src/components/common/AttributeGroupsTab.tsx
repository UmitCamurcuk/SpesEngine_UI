import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import attributeGroupService from '../../services/api/attributeGroupService';
import { useTranslation } from '../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../utils/translationUtils';

// Local interfaces that match API responses with populated fields
interface AttributeGroupWithPopulatedAttributes {
  _id: string;
  name: any;
  code?: string;
  description?: any;
  attributes?: AttributeForComponent[];
  isActive?: boolean;
}

interface AttributeForComponent {
  _id: string;
  name: any;
  code?: string;
  description?: any;
  type: string;
  isRequired?: boolean;
  isActive?: boolean;
}

interface AttributeGroupsTabProps {
  attributeGroups: AttributeGroupWithPopulatedAttributes[];
  isEditing?: boolean;
  onUpdate?: (updatedGroups: AttributeGroupWithPopulatedAttributes[]) => void;
  onAdd?: (groupId: string) => void;
  onRemove?: (groupId: string) => void;
  title?: string;
  emptyMessage?: string;
  showAddButton?: boolean;
}

const AttributeGroupsTab: React.FC<AttributeGroupsTabProps> = ({
  attributeGroups = [],
  isEditing = false,
  onUpdate,
  onAdd,
  onRemove,
  title = "Öznitelik Grupları",
  emptyMessage = "Henüz öznitelik grubu eklenmemiş.",
  showAddButton = true
}) => {
  const { currentLanguage } = useTranslation();
  const navigate = useNavigate();
  const [availableGroups, setAvailableGroups] = useState<AttributeGroupWithPopulatedAttributes[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Mevcut öznitelik gruplarını yükle
  useEffect(() => {
    if (isEditing && showAddButton) {
      fetchAvailableGroups();
    }
  }, [isEditing, showAddButton]);

  const fetchAvailableGroups = async () => {
    try {
      setLoading(true);
      const response = await attributeGroupService.getAttributeGroups({ 
        isActive: true,
        includeAttributes: true 
      });
      if (response && response.attributeGroups) {
        // Convert API response to component interface
        const convertedGroups: AttributeGroupWithPopulatedAttributes[] = response.attributeGroups.map(group => ({
          _id: group._id,
          name: group.name,
          code: group.code,
          description: group.description,
          isActive: group.isActive,
          attributes: Array.isArray(group.attributes) ? 
            group.attributes.filter(attr => typeof attr === 'object' && attr && '_id' in attr).map(attr => ({
              _id: (attr as any)._id,
              name: (attr as any).name,
              code: (attr as any).code,
              description: (attr as any).description,
              type: (attr as any).type,
              isRequired: (attr as any).isRequired,
              isActive: (attr as any).isActive
            })) : []
        }));
        setAvailableGroups(convertedGroups);
      }
    } catch (error) {
      console.error('Öznitelik grupları yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGroup = (groupId: string) => {
    if (onAdd) {
      onAdd(groupId);
    }
    setShowAddModal(false);
  };

  const handleRemoveGroup = (groupId: string) => {
    if (onRemove) {
      onRemove(groupId);
    }
  };

  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  // Henüz eklenmemiş grupları filtrele
  const getAvailableGroupsToAdd = () => {
    const currentGroupIds = attributeGroups.map(g => g._id);
    return availableGroups.filter(g => !currentGroupIds.includes(g._id));
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

  if (attributeGroups.length === 0) {
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
              Grup Ekle
            </Button>
          )}
        </div>
        
        <div className="text-center py-8">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {emptyMessage}
          </p>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Öznitelik Grubu Ekle
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddModal(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {loading ? (
                  <div className="py-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getAvailableGroupsToAdd().map(group => (
                      <div
                        key={group._id}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {getEntityName(group, currentLanguage)}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Kod: {group.code} • {group.attributes?.length || 0} öznitelik
                            </p>
                            {getEntityDescription(group, currentLanguage) && (
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                                {getEntityDescription(group, currentLanguage)}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddGroup(group._id)}
                          >
                            Ekle
                          </Button>
                        </div>
                      </div>
                    ))}
                    {getAvailableGroupsToAdd().length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        Eklenebilecek grup bulunamadı.
                      </p>
                    )}
                  </div>
                )}
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
              Grup Ekle
            </Button>
          )}
        </div>

        {/* Attribute Groups List */}
        <div className="space-y-4">
          {attributeGroups.map((group) => (
            <div 
              key={group._id} 
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Group Header */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <button
                      onClick={() => toggleGroupExpansion(group._id)}
                      className="mr-3 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <svg 
                        className={`w-4 h-4 text-gray-500 transition-transform ${
                          expandedGroups.has(group._id) ? 'rotate-90' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 
                          className="text-lg font-medium text-gray-900 dark:text-white cursor-pointer hover:text-primary-600 dark:hover:text-primary-400"
                          onClick={() => navigate(`/attributeGroups/${group._id}`)}
                        >
                          {getEntityName(group, currentLanguage)}
                        </h4>
                        <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {group.attributes?.length || 0} öznitelik
                        </span>
                        {group.isActive && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Aktif
                          </span>
                        )}
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                          {group.code}
                        </span>
                        {getEntityDescription(group, currentLanguage) && (
                          <>
                            <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                            <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                              {getEntityDescription(group, currentLanguage)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/attributeGroups/${group._id}`)}
                      className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Görüntüle
                    </Button>
                    {isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveGroup(group._id)}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Group Attributes - Expanded View */}
              {expandedGroups.has(group._id) && (
                <div className="p-4">
                  {group.attributes && group.attributes.length > 0 ? (
                    <div className="space-y-3">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Bu Gruptaki Öznitelikler:
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {group.attributes.map((attribute) => (
                          <div
                            key={attribute._id}
                            className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                            onClick={() => navigate(`/attributes/${attribute._id}`)}
                          >
                            <div className="flex items-start">
                              <div className="mr-3 mt-0.5">
                                {getAttributeTypeIcon(attribute.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h6 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {getEntityName(attribute, currentLanguage)}
                                  </h6>
                                  <div className="flex items-center ml-2">
                                    {attribute.isRequired && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 mr-1">
                                        Zorunlu
                                      </span>
                                    )}
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                      {attribute.type}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Kod: {attribute.code}
                                </p>
                                {getEntityDescription(attribute, currentLanguage) && (
                                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                    {getEntityDescription(attribute, currentLanguage)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Bu grupta henüz öznitelik bulunmuyor.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Öznitelik Grubu Ekle
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddModal(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {loading ? (
                  <div className="py-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getAvailableGroupsToAdd().map(group => (
                      <div
                        key={group._id}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {getEntityName(group, currentLanguage)}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Kod: {group.code} • {group.attributes?.length || 0} öznitelik
                            </p>
                            {getEntityDescription(group, currentLanguage) && (
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                                {getEntityDescription(group, currentLanguage)}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddGroup(group._id)}
                          >
                            Ekle
                          </Button>
                        </div>
                      </div>
                    ))}
                    {getAvailableGroupsToAdd().length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        Eklenebilecek grup bulunamadı.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttributeGroupsTab; 