import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface TreeNode {
  id: string;
  name: string;
  label?: string; // Görüntülenecek etiket
  children?: TreeNode[];
  data?: any;
}

interface UnifiedTreeViewProps {
  data: TreeNode[];
  onNodeClick?: (node: TreeNode) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  defaultExpandedIds?: string[];
  defaultSelectedIds?: string[];
  activeNodeId?: string;
  className?: string;
  expandAll?: boolean;
  maxHeight?: string;
  showRelationLines?: boolean;
  variant?: 'default' | 'spectrum';
  mode?: 'select' | 'view'; // select mode checkbox'ları gösterir, view mode sadece görüntüler
  selectionMode?: 'single' | 'multiple'; // single: tek seçim, multiple: çoklu seçim
  showHeader?: boolean; // Başlık gösterilsin mi
  headerTitle?: string; // Başlık metni
}

const UnifiedTreeView: React.FC<UnifiedTreeViewProps> = ({
  data,
  onNodeClick,
  onSelectionChange,
  defaultExpandedIds = [],
  defaultSelectedIds = [],
  activeNodeId,
  className = '',
  expandAll = false,
  maxHeight,
  showRelationLines = false,
  variant = 'default',
  mode = 'view',
  selectionMode = 'single',
  showHeader = true,
  headerTitle
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(defaultExpandedIds));
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set(defaultSelectedIds));
  const nodeRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const treeContainerRef = useRef<HTMLDivElement | null>(null);

  // expandAll seçeneği true ise, tüm düğümleri otomatik olarak genişlet
  useEffect(() => {
    if (expandAll) {
      const allIds = getAllNodeIds(data);
      setExpandedNodes(new Set(allIds));
    }
  }, [expandAll, data]);

  // Belirli bir düğüme scroll yap ve ortala
  const scrollToNode = useCallback((nodeId: string) => {
    if (nodeRefs.current[nodeId] && treeContainerRef.current) {
      const nodeElement = nodeRefs.current[nodeId];
      nodeElement?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, []);
  
  // İlk yüklendiğinde varsayılan seçilen düğüme scroll yap
  useEffect(() => {
    if (defaultSelectedIds.length > 0) {
      setTimeout(() => {
        scrollToNode(defaultSelectedIds[defaultSelectedIds.length - 1]);
      }, 300);
    } else if (activeNodeId) {
      setTimeout(() => {
        scrollToNode(activeNodeId);
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Seçili düğümler değiştiğinde callback'i çağır
  useEffect(() => {
    if (onSelectionChange && mode === 'select') {
      onSelectionChange(Array.from(selectedNodes));
    }
  }, [selectedNodes, onSelectionChange, mode]);

  // Ağaçtaki tüm düğüm ID'lerini al
  const getAllNodeIds = (nodes: TreeNode[]): string[] => {
    let ids: string[] = [];
    nodes.forEach(node => {
      ids.push(node.id);
      if (node.children && node.children.length > 0) {
        ids = [...ids, ...getAllNodeIds(node.children)];
      }
    });
    return ids;
  };

  // Belirli bir düğüme giden yoldaki tüm üst düğümlerin ID'lerini bul
  const findPathToNode = (nodes: TreeNode[], targetId: string, path: string[] = []): string[] => {
    for (const node of nodes) {
      if (node.id === targetId) {
        return path;
      }
      
      if (node.children && node.children.length > 0) {
        const newPath = [...path, node.id];
        const result = findPathToNode(node.children, targetId, newPath);
        if (result.length > 0) {
          return result;
        }
      }
    }
    return [];
  };

  const toggleNode = (nodeId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newExpandedNodes = new Set(expandedNodes);
    if (newExpandedNodes.has(nodeId)) {
      newExpandedNodes.delete(nodeId);
    } else {
      newExpandedNodes.add(nodeId);
    }
    setExpandedNodes(newExpandedNodes);
  };

  const handleSelection = (node: TreeNode, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (mode === 'select') {
      const newSelectedNodes = new Set(selectedNodes);
      
      if (selectionMode === 'single') {
        // Tek seçim modu
        if (selectedNodes.has(node.id)) {
          newSelectedNodes.clear(); // Seçili ise kaldır
        } else {
          newSelectedNodes.clear(); // Önceki seçimleri temizle
          newSelectedNodes.add(node.id); // Yeni seçimi ekle
        }
      } else {
        // Çoklu seçim modu
        if (selectedNodes.has(node.id)) {
          newSelectedNodes.delete(node.id);
        } else {
          newSelectedNodes.add(node.id);
        }
      }
      
      setSelectedNodes(newSelectedNodes);
    }
    
    // View mode'da veya ek olarak onNodeClick callback'i çağır
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  const renderNode = (node: TreeNode, level: number = 0, isLastChild: boolean = false, pathLineIndices: number[] = []) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNodes.has(node.id);
    const isActive = activeNodeId === node.id;
    const isSpectrum = variant === 'spectrum';
    
    // Style değişkenleri
    const baseIndent = isSpectrum ? 25 : 20;
    const lineColor = isSpectrum 
      ? 'border-blue-300 dark:border-blue-700' 
      : 'border-gray-300 dark:border-gray-600';
    const nodeHeight = isSpectrum ? 'py-2.5' : 'py-2.5';
    const chevronSize = isSpectrum ? 'w-5 h-5' : 'w-4 h-4';
    const itemSpacing = isSpectrum ? 'mt-2' : 'mt-1.5';
    
    // Highlight durumu - seçim veya aktif düğüm
    const isHighlighted = mode === 'select' ? isSelected : isActive;
    
    return (
      <div 
        key={node.id} 
        className={`select-none relative ${isSpectrum ? 'font-sans' : ''}`}
        ref={(element) => { nodeRefs.current[node.id] = element; }}
      >
        {/* İlişki çizgileri */}
        {level > 0 && showRelationLines && (
          <div className="absolute left-0 top-0 bottom-0">
            {/* Dikey çizgiler */}
            {pathLineIndices.map((lineIndex, idx) => (
              <div 
                key={idx}
                className={`absolute h-full ${isSpectrum ? 'border-l-2' : 'border-l-2'} ${lineColor}`} 
                style={{ left: `${(lineIndex * baseIndent) + (baseIndent/2)}px` }}
              ></div>
            ))}
            {/* Düğüme bağlanan yatay çizgi */}
            <div 
              className={`absolute ${isSpectrum ? 'border-t-2' : 'border-t-2'} ${lineColor}`} 
              style={{ 
                left: `${((level - 1) * baseIndent) + (baseIndent/2)}px`, 
                width: `${baseIndent/2}px`,
                top: '16px' 
              }}
            ></div>
          </div>
        )}
        
        {/* Düğüm içeriği */}
        <div 
          className={`flex items-center ${nodeHeight} px-2 rounded-md transition-colors duration-150 cursor-pointer ${
            isHighlighted 
              ? isSpectrum
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                : 'bg-primary-light/20 dark:bg-primary-dark/30 text-primary-light dark:text-primary-dark font-medium' 
              : isSpectrum
                ? 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
          style={{ paddingLeft: `${(level * baseIndent) + 12}px` }}
          onClick={(e) => handleSelection(node, e)}
        >
          {/* Açılabilir düğme veya alt kategori belirteci */}
          {hasChildren ? (
            <button
              onClick={(e) => toggleNode(node.id, e)}
              className={`p-1 mr-2 rounded-md ${
                isSpectrum 
                  ? 'hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none'
              }`}
            >
              <svg 
                className={`${chevronSize} ${
                  isSpectrum 
                    ? isExpanded 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-400'
                    : 'text-gray-500 dark:text-gray-400'
                } transition-transform duration-200 ${isExpanded ? 'transform rotate-90' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={isSpectrum ? 1.5 : 2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </button>
          ) : (
            <span className="w-7 h-5 mr-2 flex justify-center items-center">
              <span className={`h-1.5 w-1.5 rounded-full ${
                isHighlighted 
                  ? isSpectrum ? 'bg-blue-500' : 'bg-primary-light dark:bg-primary-dark' 
                  : 'bg-gray-400 dark:bg-gray-500'
              }`}></span>
            </span>
          )}
          
          {/* Checkbox (sadece select mode'da) */}
          {mode === 'select' && (
            <div className="mr-2">
              <input 
                type="checkbox" 
                checked={isSelected}
                onChange={() => {}}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 text-primary-light bg-gray-100 border-gray-300 rounded focus:ring-primary-light dark:focus:ring-primary-dark dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          )}
          
          {/* İçerik ikonu ve metin */}
          <div className="flex items-center">
            <svg 
              className={`w-5 h-5 mr-2 ${isHighlighted ? 'text-primary-light dark:text-primary-dark' : 'text-gray-500 dark:text-gray-400'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" 
              />
            </svg>
            
            <span className={`text-sm ${isHighlighted ? 'font-medium' : ''}`}>
              {/* Ana/Alt kategori belirteci */}
              {level === 0 && (
                <span className={`mr-1.5 px-1.5 py-0.5 text-xs font-medium rounded ${
                  isSpectrum 
                    ? isHighlighted 
                      ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200' 
                      : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  Ana
                </span>
              )}
              {level > 0 && (
                <span className={`mr-1.5 px-1.5 py-0.5 text-xs font-medium rounded ${
                  isSpectrum 
                    ? isHighlighted 
                      ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' 
                      : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  Alt
                </span>
              )}
              {node.label || node.name}
            </span>
            
            {/* Alt kategori sayısı belirteci */}
            {hasChildren && (
              <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                isSpectrum 
                  ? isHighlighted 
                    ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200' 
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {node.children!.length}
              </span>
            )}
          </div>
        </div>
        
        {/* Alt düğümler */}
        {hasChildren && isExpanded && (
          <div className={itemSpacing}>
            {node.children!.map((childNode, index) => {
              const isLastChildItem = index === node.children!.length - 1;
              const newPathLineIndices = level > 0 
                ? [...pathLineIndices.filter(idx => idx < level), ...(isLastChild ? [] : [level])]
                : [];
                
              return renderNode(
                childNode, 
                level + 1, 
                isLastChildItem,
                newPathLineIndices
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Başlık metnini belirle
  const getHeaderTitle = () => {
    if (headerTitle) return headerTitle;
    
    // Mode'a göre varsayılan başlık
    if (mode === 'select') {
      return selectionMode === 'single' ? 'Seçim Yapın' : 'Çoklu Seçim';
    }
    return 'Hiyerarşi';
  };

  return (
    <div 
      className={`rounded-lg border border-gray-200 dark:border-gray-700 ${
        variant === 'spectrum' 
          ? 'bg-white dark:bg-gray-900' 
          : 'bg-white dark:bg-gray-800'
      } ${className}`}
      style={{ maxHeight: maxHeight, overflow: maxHeight ? 'auto' : 'visible' }}
    >
      {/* Başlık */}
      {showHeader && (
        <div className="mb-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-t-lg text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span>{getHeaderTitle()}</span>
            <div className="flex space-x-2">
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-blue-500 mr-1"></span>
                <span>Ana</span>
              </div>
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                <span>Alt</span>
              </div>
              {mode === 'select' && (
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-primary-light dark:bg-primary-dark mr-1"></span>
                  <span>Seçili</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* İçerik */}
      <div 
        className={`p-4 overflow-y-auto ${variant === 'spectrum' ? 'space-y-2' : ''}`}
        ref={treeContainerRef}
      >
        {data.length > 0 ? (
          data.map((node, index) => renderNode(node, 0, index === data.length - 1))
        ) : (
          <div className="py-3 px-4 text-gray-500 dark:text-gray-400 text-center">
            Görüntülenecek öğe bulunamadı
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedTreeView; 