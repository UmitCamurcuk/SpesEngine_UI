import React, { useState, useEffect, useRef } from 'react';

export interface TreeNode {
  id: string;
  name: string;
  label?: string; // Görüntülenecek etiket
  children?: TreeNode[];
  data?: any;
}

interface TreeViewProps {
  data: TreeNode[];
  onNodeClick?: (node: TreeNode) => void;
  defaultExpandedIds?: string[];
  activeNodeId?: string;
  className?: string;
  expandAll?: boolean;
  maxHeight?: string;
  showRelationLines?: boolean;
  variant?: 'default' | 'spectrum';
}

const TreeView: React.FC<TreeViewProps> = ({
  data,
  onNodeClick,
  defaultExpandedIds = [],
  activeNodeId,
  className = '',
  expandAll = false,
  maxHeight,
  showRelationLines = false,
  variant = 'default'
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(defaultExpandedIds));
  const nodeRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const treeContainerRef = useRef<HTMLDivElement | null>(null);

  // expandAll seçeneği true ise, tüm düğümleri otomatik olarak genişlet
  useEffect(() => {
    if (expandAll) {
      const allIds = getAllNodeIds(data);
      setExpandedNodes(new Set(allIds));
    }
  }, [expandAll, data]);

  // activeNodeId varsa, o düğüme giden yolun tüm üst düğümlerini genişlet
  useEffect(() => {
    if (activeNodeId) {
      const pathIds = findPathToNode(data, activeNodeId);
      if (pathIds.length > 0) {
        setExpandedNodes(prev => {
          const newExpanded = new Set(prev);
          pathIds.forEach(id => newExpanded.add(id));
          return newExpanded;
        });
      }
    }
  }, [activeNodeId, data]);

  // Aktif düğüme scroll yap
  useEffect(() => {
    if (activeNodeId) {
      // Ağaç yapısının yüklenmesi için biraz bekleyelim
      setTimeout(() => {
        scrollToNode(activeNodeId);
      }, 300);
    }
  }, [activeNodeId]); // activeNodeId değiştiğinde çalışacak

  // Belirli bir düğüme scroll yap ve ortala
  const scrollToNode = (nodeId: string) => {
    if (nodeRefs.current[nodeId] && treeContainerRef.current) {
      // Düğümün pozisyonunu al
      const nodeElement = nodeRefs.current[nodeId];
      const containerElement = treeContainerRef.current;
      
      // Scroll yap - davranışı smooth olarak ayarla ve block'u 'center' yaparak ortalama sağla
      nodeElement?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

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

  const handleNodeClick = (node: TreeNode, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  const renderNode = (node: TreeNode, level: number = 0, isLastChild: boolean = false, pathLineIndices: number[] = []) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isActive = activeNodeId === node.id;
    const isSpectrum = variant === 'spectrum';
    
    // Daha belirgin girinti için değerleri artırıyoruz
    const baseIndent = isSpectrum ? 25 : 20;
    const lineColor = isSpectrum 
      ? 'border-blue-300 dark:border-blue-700' 
      : 'border-gray-300 dark:border-gray-600';
    const nodeHeight = isSpectrum ? 'py-2.5' : 'py-2.5';
    const chevronSize = isSpectrum ? 'w-5 h-5' : 'w-4 h-4';
    const itemSpacing = isSpectrum ? 'mt-2' : 'mt-1.5';
    
    return (
      <div 
        key={node.id} 
        className={`select-none relative ${isSpectrum ? 'font-sans' : ''}`}
        ref={(element) => { nodeRefs.current[node.id] = element; }}
      >
        {/* İlişki çizgileri - her zaman gösteriyoruz */}
        {level > 0 && (
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
          className={`flex items-center ${nodeHeight} px-2 rounded-md transition-colors duration-150 ${
            isActive 
              ? isSpectrum
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                : 'bg-primary-light/20 dark:bg-primary-dark/30 text-primary-light dark:text-primary-dark font-medium' 
              : isSpectrum
                ? 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
          style={{ paddingLeft: `${(level * baseIndent) + 12}px` }}
          onClick={(e) => handleNodeClick(node, e)}
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
              {/* Alt kategorisi olmayan ögeler için belirteç */}
              <span className={`h-1.5 w-1.5 rounded-full ${
                isActive 
                  ? isSpectrum ? 'bg-blue-500' : 'bg-primary-light dark:bg-primary-dark' 
                  : 'bg-gray-400 dark:bg-gray-500'
              }`}></span>
            </span>
          )}
          
          {/* İçerik ikonu ve metin */}
          <div className="flex items-center">
            {isSpectrum ? (
              <svg 
                className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d={hasChildren 
                    ? "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                    : "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  } 
                />
              </svg>
            ) : (
              <svg 
                className={`w-5 h-5 mr-2 ${isActive ? 'text-primary-light dark:text-primary-dark' : 'text-gray-500 dark:text-gray-400'}`} 
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
            )}
            
            <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>
              {/* Ana/Alt kategori belirteci */}
              {level === 0 && (
                <span className={`mr-1.5 px-1.5 py-0.5 text-xs font-medium rounded ${
                  isSpectrum 
                    ? isActive 
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
                    ? isActive 
                      ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' 
                      : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  Alt
                </span>
              )}
              {node.name}
            </span>
            
            {/* Alt kategori sayısı belirteci */}
            {hasChildren && (
              <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                isSpectrum 
                  ? isActive 
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

  return (
    <div 
      className={`relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${
        variant === 'spectrum' ? 'shadow-sm' : ''
      } ${className}`}
      style={{ maxHeight: maxHeight, overflow: maxHeight ? 'auto' : 'visible' }}
      ref={treeContainerRef}
    >
      <div className={`p-4 overflow-y-auto ${variant === 'spectrum' ? 'space-y-2' : ''}`}>
        {data.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
            Veri bulunamadı.
          </div>
        ) : (
          data.map((node, index) => renderNode(node, 0, index === data.length - 1, []))
        )}
      </div>
    </div>
  );
};

export default TreeView; 