import React, { useState } from 'react';
import Button from '../ui/Button';
import { useTranslation } from '../../context/i18nContext';

interface HierarchyNode {
  id: string;
  name: string;
  type: string;
  level: number;
  hasChildren: boolean;
  isExpanded?: boolean;
  children?: HierarchyNode[];
  parent?: HierarchyNode;
  path?: string[];
}

interface HierarchyTabProps {
  entityId: string;
  entityType: 'attribute' | 'attributeGroup' | 'category' | 'family' | 'itemType' | 'item';
  currentNode?: HierarchyNode;
  hierarchyTree?: HierarchyNode[];
  onNodeSelect?: (nodeId: string) => void;
  onMoveNode?: (nodeId: string, newParentId: string) => void;
  isEditing?: boolean;
  isLoading?: boolean;
}

const HierarchyTab: React.FC<HierarchyTabProps> = ({
  entityId,
  entityType,
  currentNode,
  hierarchyTree = [],
  onNodeSelect,
  onMoveNode,
  isEditing = false,
  isLoading = false
}) => {
  const { t } = useTranslation();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'tree' | 'breadcrumb' | 'siblings'>('tree');

  const getDefaultHierarchy = (): HierarchyNode[] => {
    return [
      {
        id: 'root-1',
        name: 'Ana Kategori',
        type: 'category',
        level: 0,
        hasChildren: true,
        isExpanded: true,
        children: [
          {
            id: 'cat-1',
            name: 'Elektronik',
            type: 'category',
            level: 1,
            hasChildren: true,
            children: [
              {
                id: 'cat-1-1',
                name: 'Bilgisayar',
                type: 'category',
                level: 2,
                hasChildren: false
              },
              {
                id: 'cat-1-2',
                name: 'Telefon',
                type: 'category',
                level: 2,
                hasChildren: false
              }
            ]
          },
          {
            id: 'cat-2',
            name: 'Giyim',
            type: 'category',
            level: 1,
            hasChildren: true,
            children: [
              {
                id: 'cat-2-1',
                name: 'Erkek',
                type: 'category',
                level: 2,
                hasChildren: false
              },
              {
                id: 'cat-2-2',
                name: 'Kadın',
                type: 'category',
                level: 2,
                hasChildren: false
              }
            ]
          }
        ]
      }
    ];
  };

  const displayTree = hierarchyTree.length > 0 ? hierarchyTree : getDefaultHierarchy();

  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
    onNodeSelect?.(nodeId);
  };

  const getNodeIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      category: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
      family: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      itemType: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      attribute: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
      attributeGroup: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      item: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
    };
    return iconMap[type] || iconMap.category;
  };

  const renderTreeNode = (node: HierarchyNode, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id) || node.isExpanded;
    const isSelected = selectedNode === node.id;
    const hasChildren = node.hasChildren && node.children && node.children.length > 0;

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-colors ${
            isSelected 
              ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          style={{ marginLeft: `${depth * 20}px` }}
          onClick={() => handleNodeClick(node.id)}
        >
          {hasChildren && (
            <button
              className="mr-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeExpansion(node.id);
              }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={isExpanded ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} 
                />
              </svg>
            </button>
          )}
          
          <div className="h-6 w-6 rounded bg-gray-100 dark:bg-gray-600 flex items-center justify-center mr-3">
            <svg className="h-3 w-3 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getNodeIcon(node.type)} />
            </svg>
          </div>
          
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {node.name}
          </span>
          
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            ({node.type})
          </span>
        </div>
        
        {hasChildren && isExpanded && node.children && (
          <div className="ml-4">
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

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
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-3">
              <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Hiyerarşi Yapısı
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Varlık hiyerarşisi ve ilişki ağacı
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
              Genişlet
            </Button>
            <Button variant="outline" size="sm">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Daralt
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'tree', label: 'Ağaç Görünümü', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
            { id: 'breadcrumb', label: 'Yol Haritası', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            { id: 'siblings', label: 'Kardeş Düğümler', icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeView === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveView(tab.id as any)}
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
        {activeView === 'tree' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Hiyerarşi Ağacı</h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 max-h-96 overflow-y-auto">
              {displayTree.map(node => renderTreeNode(node))}
            </div>
          </div>
        )}

        {activeView === 'breadcrumb' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Mevcut Konum</h3>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li>
                    <div className="flex items-center">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                      <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">Kök</span>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Elektronik</span>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="ml-2 text-sm font-medium text-primary-600 dark:text-primary-400">Bilgisayar</span>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Üst Düzey</h4>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-3">
                    <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Elektronik</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Kategori</div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Alt Düzeyler</h4>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Laptop</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Masaüstü</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Tablet</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'siblings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Kardeş Düğümler</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { id: 'sibling-1', name: 'Telefon', type: 'category', isActive: false },
                { id: 'sibling-2', name: 'Bilgisayar', type: 'category', isActive: true },
                { id: 'sibling-3', name: 'Tablet', type: 'category', isActive: false },
                { id: 'sibling-4', name: 'TV & Ses', type: 'category', isActive: false }
              ].map((sibling) => (
                <div 
                  key={sibling.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    sibling.isActive 
                      ? 'border-primary-200 bg-primary-50 dark:border-primary-700 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => handleNodeClick(sibling.id)}
                >
                  <div className="flex items-center">
                    <div className={`h-8 w-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3 ${
                      sibling.isActive ? 'bg-primary-100 dark:bg-primary-900/50' : ''
                    }`}>
                      <svg className="h-4 w-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getNodeIcon(sibling.type)} />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {sibling.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {sibling.type}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-amber-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-amber-800 dark:text-amber-200 font-medium">Bilgi</h4>
                  <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                    Kardeş düğümler aynı üst seviyeye bağlı olan diğer varlıklardır. Bu görünüm mevcut düzeyinizdeki diğer seçenekleri gösterir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HierarchyTab; 