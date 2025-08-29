import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TableColumn {
  key: string;
  title: string;
  visible: boolean;
  order: number;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'system' | 'attribute' | 'association';
  sourceItemType?: string;
  sourceAttribute?: string;
}

interface TableColumnSettingsProps {
  columns: TableColumn[];
  onColumnsChange: (columns: TableColumn[]) => void;
  isEditing: boolean;
  availableAttributes: Array<{ id: string; name: string; type: string }>;
  availableAssociations?: Array<{ 
    id: string; 
    name: string; 
    targetItemType: string; 
    attributes: Array<{ id: string; name: string; type: string }> 
  }>;
}

const SortableColumn: React.FC<{
  column: TableColumn;
  index: number;
  isEditing: boolean;
  onColumnChange: (index: number, column: TableColumn) => void;
  onColumnRemove: (index: number) => void;
}> = ({ column, index, isEditing, onColumnChange, onColumnRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-3 p-3 bg-white dark:bg-gray-600 rounded border ${
        isDragging ? 'shadow-lg' : ''
      } ${column.type === 'system' ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/20' : ''}`}
    >
      {isEditing && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      )}
      
      <input
        type="checkbox"
        checked={column.visible}
        onChange={(e) => {
          onColumnChange(index, { ...column, visible: e.target.checked });
        }}
        disabled={!isEditing}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
      />
      
      <div className="flex-1">
        <input
          type="text"
          value={column.title}
          onChange={(e) => {
            onColumnChange(index, { ...column, title: e.target.value });
          }}
          disabled={!isEditing}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {column.type === 'association' && column.sourceItemType && (
          <div className="text-xs text-gray-500 mt-1">
            {column.sourceItemType} → {column.sourceAttribute}
          </div>
        )}
      </div>
      
      <input
        type="number"
        min="1"
        value={column.order}
        onChange={(e) => {
          onColumnChange(index, { ...column, order: parseInt(e.target.value) || 1 });
        }}
        disabled={!isEditing}
        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
      />
      
      <div className="flex space-x-2">
        <input
          type="checkbox"
          checked={column.sortable}
          onChange={(e) => {
            onColumnChange(index, { ...column, sortable: e.target.checked });
          }}
          disabled={!isEditing}
          className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
        />
        <span className="text-xs text-gray-500">Sıralanabilir</span>
      </div>
      
      <div className="flex space-x-2">
        <input
          type="checkbox"
          checked={column.filterable}
          onChange={(e) => {
            onColumnChange(index, { ...column, filterable: e.target.checked });
          }}
          disabled={!isEditing}
          className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
        />
        <span className="text-xs text-gray-500">Filtrelenebilir</span>
      </div>
      
      {isEditing && column.type !== 'system' && (
        <button
          onClick={() => onColumnRemove(index)}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

const TableColumnSettings: React.FC<TableColumnSettingsProps> = ({
  columns,
  onColumnsChange,
  isEditing,
  availableAttributes,
  availableAssociations = []
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = columns.findIndex(col => col.key === active.id);
      const newIndex = columns.findIndex(col => col.key === over?.id);

      const newColumns = arrayMove(columns, oldIndex, newIndex);
      
      // Update order numbers
      const updatedColumns = newColumns.map((col, index) => ({
        ...col,
        order: index + 1
      }));
      
      onColumnsChange(updatedColumns);
    }
  };

  const addAllAttributes = () => {
    const attributeColumns = availableAttributes.map((attr, index) => ({
      key: attr.id,
      title: attr.name,
      visible: true,
      order: columns.length + index + 1,
      sortable: true,
      filterable: true,
      type: 'attribute' as const
    }));
    
    onColumnsChange([...columns, ...attributeColumns]);
  };

  const addAssociationAttributes = () => {
    const associationColumns: TableColumn[] = [];
    
    availableAssociations.forEach((association, assocIndex) => {
      association.attributes.forEach((attr, attrIndex) => {
        associationColumns.push({
          key: `${association.id}_${attr.id}`,
          title: `${association.name} - ${attr.name}`,
          visible: true,
          order: columns.length + assocIndex * association.attributes.length + attrIndex + 1,
          sortable: true,
          filterable: true,
          type: 'association' as const,
          sourceItemType: association.targetItemType,
          sourceAttribute: attr.name
        });
      });
    });
    
    onColumnsChange([...columns, ...associationColumns]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Mevcut Öznitelikler: {availableAttributes.length} | 
          Mevcut İlişkiler: {availableAssociations.length}
        </span>
        {isEditing && (
          <div className="flex space-x-2">
            <button
              onClick={addAllAttributes}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Öznitelikleri Ekle
            </button>
            {availableAssociations.length > 0 && (
              <button
                onClick={addAssociationAttributes}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
              >
                İlişki Özniteliklerini Ekle
              </button>
            )}
          </div>
        )}
      </div>
      
      {isEditing ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={columns.map(col => col.key)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {columns.map((column, index) => (
                <SortableColumn
                  key={column.key}
                  column={column}
                  index={index}
                  isEditing={isEditing}
                  onColumnChange={(index, updatedColumn) => {
                    const newColumns = [...columns];
                    newColumns[index] = updatedColumn;
                    onColumnsChange(newColumns);
                  }}
                  onColumnRemove={(index) => {
                    const newColumns = columns.filter((_, i) => i !== index);
                    onColumnsChange(newColumns);
                  }}
                />
              ))}
              
              {columns.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Henüz sütun eklenmemiş. Yukarıdaki butonları kullanarak öznitelikleri ekleyebilirsiniz.
                </p>
              )}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-2">
          {columns
            .filter(col => col.visible)
            .sort((a, b) => a.order - b.order)
            .map((column) => (
              <div key={column.key} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded border">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {column.title}
                  </span>
                  <span className="text-xs text-gray-500">
                    Sıra: {column.order}
                  </span>
                  {column.sortable && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Sıralanabilir
                    </span>
                  )}
                  {column.filterable && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Filtrelenebilir
                    </span>
                  )}
                  {column.type === 'system' && (
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      Sistem
                    </span>
                  )}
                  {column.type === 'association' && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      İlişki
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default TableColumnSettings;





