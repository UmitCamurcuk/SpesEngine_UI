import React, { useState } from 'react';

interface DragDropColumnProps {
  column: {
    attributeId: string;
    displayName: string;
    formatType?: string;
    order?: number;
  };
  index: number;
  onMove: (fromIndex: number, toIndex: number) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

const DragDropColumn: React.FC<DragDropColumnProps> = ({
  column,
  index,
  onMove,
  onRemove,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedOver, setDraggedOver] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    if (disabled) return;
    e.dataTransfer.setData('text/plain', index.toString());
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    setDraggedOver(true);
  };

  const handleDragLeave = () => {
    setDraggedOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const toIndex = index;
    
    if (fromIndex !== toIndex) {
      onMove(fromIndex, toIndex);
    }
    
    setDraggedOver(false);
  };

  return (
    <div
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex items-center justify-between p-3 rounded border transition-all duration-200 ${
        isDragging 
          ? 'opacity-50 scale-95' 
          : draggedOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
      } ${
        disabled 
          ? 'cursor-default opacity-60' 
          : 'cursor-move hover:bg-gray-50 dark:hover:bg-gray-600'
      }`}
    >
      <div className="flex items-center space-x-3">
        {/* Drag Handle */}
        {!disabled && (
          <div className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM17 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"></path>
            </svg>
          </div>
        )}
        
        {/* Order Number */}
        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium flex items-center justify-center">
          {(column.order || index + 1)}
        </div>
        
        {/* Column Info */}
        <div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {column.displayName}
          </span>
          <span className="text-xs text-gray-500 ml-2">
            ({column.formatType || 'text'})
          </span>
        </div>
      </div>

      {/* Remove Button */}
      {!disabled && (
        <button
          onClick={() => onRemove(index)}
          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          title="Kaldır"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default DragDropColumn;