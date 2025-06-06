import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { useTranslation } from '../../context/i18nContext';

interface RelationshipItem {
  entityType: string;
  entityId: string;
  entityName: string;
  relationshipType: string;
  count?: number;
  description?: string;
  isActive?: boolean;
}

interface AccessControlItem {
  role: string;
  permission: string;
  description: string;
  userCount?: number;
}

interface RelationshipsTabProps {
  entityId: string;
  entityType: 'attribute' | 'attributeGroup' | 'category' | 'family' | 'itemType' | 'item';
  relationships?: RelationshipItem[];
  accessControls?: AccessControlItem[];
  onViewRelated?: (entityType: string, entityId: string) => void;
  onManagePermissions?: () => void;
  isLoading?: boolean;
}

const RelationshipsTab: React.FC<RelationshipsTabProps> = ({
  entityId,
  entityType,
  relationships = [],
  accessControls = [],
  onViewRelated,
  onManagePermissions,
  isLoading = false
}) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<'relationships' | 'access' | 'usage'>('relationships');

  const getEntityIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      product: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      catalog: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      attribute: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
      category: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
      family: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
    };
    return iconMap[type] || iconMap.attribute;
  };

  const getRelationshipColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      'core_attribute': 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
      'display_attribute': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      'parent': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'child': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'referenced_by': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getPermissionColor = (permission: string) => {
    const colorMap: { [key: string]: string } = {
      'full_access': 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
      'read_write': 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
      'read_only': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };
    return colorMap[permission] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getDefaultRelationships = (): RelationshipItem[] => {
    // Mock data for demonstration
    return [
      {
        entityType: 'product',
        entityId: '1',
        entityName: 'Ürün Varlıkları',
        relationshipType: 'core_attribute',
        count: 1245,
        description: 'Temel varlık ilişkisi'
      },
      {
        entityType: 'catalog',
        entityId: '2', 
        entityName: 'Katalog Varlıkları',
        relationshipType: 'display_attribute',
        count: 18,
        description: 'Görüntüleme varlığı ilişkisi'
      }
    ];
  };

  const getDefaultAccessControls = (): AccessControlItem[] => {
    return [
      {
        role: 'Administrators',
        permission: 'full_access',
        description: 'Tam sistem erişimi',
        userCount: 5
      },
      {
        role: 'Content Editors',
        permission: 'read_write',
        description: 'İçerik okuma ve yazma',
        userCount: 12
      },
      {
        role: 'Viewers',
        permission: 'read_only',
        description: 'Sadece okuma erişimi',
        userCount: 45
      }
    ];
  };

  const displayRelationships = relationships.length > 0 ? relationships : getDefaultRelationships();
  const displayAccessControls = accessControls.length > 0 ? accessControls : getDefaultAccessControls();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-light border-t-transparent dark:border-primary-dark dark:border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mr-3">
              <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                İlişkiler ve Erişim Kontrolü
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Varlık ilişkileri ve izin yapılandırması
              </p>
            </div>
          </div>
          {onManagePermissions && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onManagePermissions}
              className="flex items-center"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              İzinleri Yönet
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'relationships', label: 'Varlık İlişkileri', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
            { id: 'access', label: 'Erişim Kontrolü', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
            { id: 'usage', label: 'Kullanım İstatistikleri', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeSection === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveSection(tab.id as any)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeSection === 'relationships' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Varlık İlişkileri</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Varlık Türü
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        İlişki Türü
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Sayı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {displayRelationships.map((rel, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-3">
                              <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getEntityIcon(rel.entityType)} />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {rel.entityName}
                              </div>
                              {rel.description && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {rel.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRelationshipColor(rel.relationshipType)}`}>
                            {rel.relationshipType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">{rel.count}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">örnekler</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onViewRelated?.(rel.entityType, rel.entityId)}
                          >
                            Görüntüle
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'access' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Erişim Kontrolü</h3>
              <div className="space-y-4">
                {displayAccessControls.map((access, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {access.role}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {access.description}
                        </div>
                        {access.userCount && (
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {access.userCount} kullanıcı
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPermissionColor(access.permission)}`}>
                      {access.permission.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'usage' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Kullanım İstatistikleri</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-3">
                      <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">1,245</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Toplam Kullanım</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-3">
                      <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">18</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Bu Ay</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mr-3">
                      <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">85%</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Aktif Kullanım</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-gray-900 dark:text-white font-medium mb-4">Kullanım Trendi</h4>
                <div className="space-y-3">
                  {['Son 7 gün', 'Son 30 gün', 'Son 90 gün'].map((period, index) => (
                    <div key={period} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{period}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full" 
                            style={{ width: `${85 - (index * 15)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {85 - (index * 15)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RelationshipsTab; 