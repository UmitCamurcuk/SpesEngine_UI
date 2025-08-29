import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface CascadeTreeNode {
  id: string;
  name: string;
  label?: string; // Görüntülenecek etiket
  children?: CascadeTreeNode[];
  data?: any;
  parentId?: string; // Cascade mantığı için parent bilgisi
}

interface CascadeTreeSelectorProps {
  data: CascadeTreeNode[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onCategorySelectionChange?: (selectedCategoryIds: string[]) => void; // Sadece kategoriler için
  onFamilySelectionChange?: (selectedFamilyIds: string[]) => void; // Sadece aileler için
  defaultExpandedIds?: string[];
  defaultSelectedIds?: string[];
  className?: string;
  expandAll?: boolean;
  maxHeight?: string;
  showRelationLines?: boolean;
  variant?: 'default' | 'spectrum';
  showHeader?: boolean; // Başlık gösterilsin mi
  headerTitle?: string; // Başlık metni
  placeholder?: string; // Seçim yapılmadığında gösterilecek metin
  mode?: 'unified' | 'category-only' | 'family-only'; // Hangi tipte selection yapılacağı
}

const CascadeTreeSelector: React.FC<CascadeTreeSelectorProps> = ({
  data,
  onSelectionChange,
  onCategorySelectionChange,
  onFamilySelectionChange,
  defaultExpandedIds = [],
  defaultSelectedIds = [],
  className = '',
  expandAll = false,
  maxHeight = '400px',
  showRelationLines = false,
  variant = 'default',
  showHeader = true,
  headerTitle = 'Seçim Yapın',
  placeholder = 'Henüz seçim yapılmadı',
  mode = 'unified'
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(defaultExpandedIds));
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set(defaultSelectedIds));
  const nodeRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const treeContainerRef = useRef<HTMLDivElement | null>(null);

  // Flatten tree structure to get all nodes with parent relationships
  const flattenTree = useCallback((nodes: CascadeTreeNode[], parentId?: string): CascadeTreeNode[] => {
    let flattened: CascadeTreeNode[] = [];
    
    nodes.forEach(node => {
      const nodeWithParent = { ...node, parentId };
      flattened.push(nodeWithParent);
      
      if (node.children && node.children.length > 0) {
        flattened = flattened.concat(flattenTree(node.children, node.id));
      }
    });
    
    return flattened;
  }, []);

  // Get all descendant IDs of a node
  const getDescendantIds = useCallback((nodeId: string, allNodes: CascadeTreeNode[]): string[] => {
    const descendants: string[] = [];
    const children = allNodes.filter(node => node.parentId === nodeId);
    
    children.forEach(child => {
      descendants.push(child.id);
      descendants.push(...getDescendantIds(child.id, allNodes));
    });
    
    return descendants;
  }, []);

  // Get all ancestor IDs of a node
  const getAncestorIds = useCallback((nodeId: string, allNodes: CascadeTreeNode[]): string[] => {
    const ancestors: string[] = [];
    const node = allNodes.find(n => n.id === nodeId);
    
    if (node && node.parentId) {
      ancestors.push(node.parentId);
      ancestors.push(...getAncestorIds(node.parentId, allNodes));
    }
    
    return ancestors;
  }, []);

  // Initialize expanded nodes
  useEffect(() => {
    if (expandAll) {
      const allNodeIds = flattenTree(data).map(node => node.id);
      setExpandedNodes(new Set(allNodeIds));
    } else if (defaultExpandedIds.length > 0) {
      setExpandedNodes(new Set(defaultExpandedIds));
    }
  }, [data, expandAll, defaultExpandedIds, flattenTree]);

  // Initialize selected nodes
  useEffect(() => {
    if (defaultSelectedIds.length > 0) {
      setSelectedNodes(new Set(defaultSelectedIds));
    }
  }, [defaultSelectedIds]);

  // Handle selection change
  const handleSelectionChange = useCallback((nodeId: string, isSelected: boolean) => {
    const allNodes = flattenTree(data);
    const newSelectedNodes = new Set(selectedNodes);

    if (isSelected) {
      // Add node and all its descendants
      newSelectedNodes.add(nodeId);
      const descendants = getDescendantIds(nodeId, allNodes);
      descendants.forEach(id => newSelectedNodes.add(id));
    } else {
      // Remove only this node (not its descendants or ancestors)
      newSelectedNodes.delete(nodeId);
    }

    setSelectedNodes(newSelectedNodes);
    
    // Call general selection change
    onSelectionChange?.(Array.from(newSelectedNodes));
    
    // If mode is unified, separate categories and families
    if (mode === 'unified') {
      const selectedCategories: string[] = [];
      const selectedFamilies: string[] = [];
      
      Array.from(newSelectedNodes).forEach(id => {
        if (id.startsWith('category_')) {
          selectedCategories.push(id.replace('category_', ''));
        } else if (id.startsWith('family_')) {
          selectedFamilies.push(id.replace('family_', ''));
        }
      });
      
      onCategorySelectionChange?.(selectedCategories);
      onFamilySelectionChange?.(selectedFamilies);
    }
  }, [selectedNodes, onSelectionChange, onCategorySelectionChange, onFamilySelectionChange, data, flattenTree, getDescendantIds, mode]);

  // Toggle expanded state
  const toggleExpanded = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId);
      } else {
        newExpanded.add(nodeId);
      }
      return newExpanded;
    });
  }, []);

  // Render node
  const renderNode = useCallback((node: CascadeTreeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const displayLabel = node.label || node.name;

    const nodeIndentation = level * 20;

    return (
      <div key={node.id} className="select-none">
        {/* Node Content */}
        <div
          ref={el => nodeRefs.current[node.id] = el}
          className={`
            flex items-center py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer
            ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500' : ''}
            ${variant === 'spectrum' ? 'rounded-md mb-1' : ''}
          `}
          style={{ 
            paddingLeft: `${nodeIndentation + 12}px`,
            position: 'relative'
          }}
        >
          {/* Relation Lines */}
          {showRelationLines && level > 0 && (
            <>
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600" style={{ left: `${(level - 1) * 20 + 10}px` }} />
              <div className="absolute top-1/2 w-3 h-px bg-gray-300 dark:bg-gray-600" style={{ left: `${(level - 1) * 20 + 10}px` }} />
            </>
          )}

          {/* Expand/Collapse Toggle */}
          <div className="flex items-center justify-center w-5 h-5 mr-2">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(node.id);
                }}
                className="flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <svg
                  className={`w-3 h-3 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>

          {/* Checkbox */}
          <div className="flex items-center mr-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => handleSelectionChange(node.id, e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>

          {/* Node Icon */}
          <div className="flex items-center justify-center w-5 h-5 mr-2">
            {hasChildren ? (
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v0" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
          </div>

          {/* Node Label */}
          <span className={`text-sm ${isSelected ? 'text-primary-700 dark:text-primary-300 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
            {displayLabel}
          </span>

          {/* Selected indicator */}
          {isSelected && (
            <div className="ml-auto flex items-center">
              <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-0">
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  }, [expandedNodes, selectedNodes, showRelationLines, variant, toggleExpanded, handleSelectionChange]);

  // Get selected count
  const selectedCount = selectedNodes.size;

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {headerTitle}
            </h3>
            <div className="flex items-center space-x-2">
              {selectedCount > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                  {selectedCount} seçili
                </span>
              )}
              {expandAll !== undefined && (
                <button
                  onClick={() => {
                    if (expandedNodes.size > 0) {
                      setExpandedNodes(new Set());
                    } else {
                      const allNodeIds = flattenTree(data).map(node => node.id);
                      setExpandedNodes(new Set(allNodeIds));
                    }
                  }}
                  className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  {expandedNodes.size > 0 ? 'Tümünü Kapat' : 'Tümünü Aç'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tree Content */}
      <div 
        ref={treeContainerRef}
        className="overflow-auto"
        style={{ maxHeight }}
      >
        {data.length > 0 ? (
          <div className="p-2">
            {data.map(node => renderNode(node, 0))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v0" />
            </svg>
            <p className="text-sm">{placeholder}</p>
          </div>
        )}
      </div>

      {/* Selected Items Summary */}
      {selectedCount > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-md">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Toplam {selectedCount} öğe seçildi
            </span>
            <button
              onClick={() => {
                setSelectedNodes(new Set());
                onSelectionChange?.([]);
                
                // If mode is unified, clear categories and families separately
                if (mode === 'unified') {
                  onCategorySelectionChange?.([]);
                  onFamilySelectionChange?.([]);
                }
              }}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Tümünü Temizle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CascadeTreeSelector;
