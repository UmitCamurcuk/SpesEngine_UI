import React, { useState } from 'react';
import { AttributeValidation } from '../../../types/attribute';
import Button from '../../ui/Button';

interface TableValidationProps {
  validation: Partial<AttributeValidation>;
  onChange: (validation: Partial<AttributeValidation>) => void;
}

interface TableColumn {
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  required?: boolean;
  options?: string[];
  width?: number;
}

const TableValidation: React.FC<TableValidationProps> = ({ validation, onChange }) => {
  const [columns, setColumns] = useState<TableColumn[]>(
    validation.columns || [
      { name: 'Sıra No', type: 'number', required: true, width: 80 },
      { name: 'En (cm)', type: 'number', required: true, width: 100 },
      { name: 'Boy (cm)', type: 'number', required: true, width: 100 }
    ]
  );

  const handleColumnChange = (index: number, field: keyof TableColumn, value: any) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setColumns(newColumns);
    
    onChange({
      ...validation,
      columns: newColumns
    });
  };

  const addColumn = () => {
    const newColumn: TableColumn = {
      name: 'Yeni Sütun',
      type: 'text',
      required: false,
      width: 150
    };
    const newColumns = [...columns, newColumn];
    setColumns(newColumns);
    
    onChange({
      ...validation,
      columns: newColumns
    });
  };

  const removeColumn = (index: number) => {
    const newColumns = columns.filter((_, i) => i !== index);
    setColumns(newColumns);
    
    onChange({
      ...validation,
      columns: newColumns
    });
  };

  const addOption = (columnIndex: number) => {
    const newColumns = [...columns];
    if (!newColumns[columnIndex].options) {
      newColumns[columnIndex].options = [];
    }
    newColumns[columnIndex].options!.push('Yeni Seçenek');
    setColumns(newColumns);
    
    onChange({
      ...validation,
      columns: newColumns
    });
  };

  const removeOption = (columnIndex: number, optionIndex: number) => {
    const newColumns = [...columns];
    newColumns[columnIndex].options!.splice(optionIndex, 1);
    setColumns(newColumns);
    
    onChange({
      ...validation,
      columns: newColumns
    });
  };

  const handleOptionChange = (columnIndex: number, optionIndex: number, value: string) => {
    const newColumns = [...columns];
    newColumns[columnIndex].options![optionIndex] = value;
    setColumns(newColumns);
    
    onChange({
      ...validation,
      columns: newColumns
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Tablo Validasyon Kuralları</h3>
      
      {/* Sütun Ayarları */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Sütun Tanımları</h4>
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={addColumn}
            className="flex items-center space-x-1"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Sütun Ekle</span>
          </Button>
        </div>

        <div className="space-y-3">
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Sütun Adı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sütun Adı
                  </label>
                  <input
                    type="text"
                    value={column.name}
                    onChange={(e) => handleColumnChange(columnIndex, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
                    placeholder="Sütun adı"
                  />
                </div>

                {/* Sütun Tipi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tip
                  </label>
                  <select
                    value={column.type}
                    onChange={(e) => handleColumnChange(columnIndex, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
                  >
                    <option value="text">Metin</option>
                    <option value="number">Sayı</option>
                    <option value="date">Tarih</option>
                    <option value="select">Seçim</option>
                  </select>
                </div>

                {/* Genişlik */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Genişlik (px)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="500"
                    value={column.width || 150}
                    onChange={(e) => handleColumnChange(columnIndex, 'width', parseInt(e.target.value) || 150)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
                    placeholder="150"
                  />
                </div>

                {/* Zorunlu */}
                <div className="flex items-end">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={column.required || false}
                      onChange={(e) => handleColumnChange(columnIndex, 'required', e.target.checked)}
                      className="h-4 w-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Zorunlu</span>
                  </label>
                </div>
              </div>

              {/* Select seçenekleri */}
              {column.type === 'select' && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Seçenekler
                    </label>
                                         <Button
                       size="sm"
                       variant="outline"
                       type="button"
                       onClick={() => addOption(columnIndex)}
                       className="flex items-center space-x-1"
                     >
                       <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                       </svg>
                       <span>Seçenek Ekle</span>
                     </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {(column.options || []).map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(columnIndex, optionIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
                          placeholder="Seçenek değeri"
                        />
                                                 <Button
                           size="sm"
                           variant="secondary"
                           type="button"
                           onClick={() => removeOption(columnIndex, optionIndex)}
                           className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                         >
                           <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                           </svg>
                         </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sütun Silme */}
              <div className="mt-4 flex justify-end">
                                 <Button
                   size="sm"
                   variant="secondary"
                   type="button"
                   onClick={() => removeColumn(columnIndex)}
                   className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                 >
                   <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                   </svg>
                   Sütunu Sil
                 </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tablo Ayarları */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Tablo Ayarları</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Minimum Satır */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Minimum Satır Sayısı
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={validation.minRows || 1}
              onChange={(e) => {
                const minRows = parseInt(e.target.value) || 1;
                onChange({
                  ...validation,
                  minRows
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
              placeholder="1"
            />
          </div>

          {/* Maksimum Satır */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Maksimum Satır Sayısı
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={validation.maxRows || 100}
              onChange={(e) => {
                const maxRows = parseInt(e.target.value) || 100;
                onChange({
                  ...validation,
                  maxRows
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light dark:bg-gray-700 dark:text-white"
              placeholder="100"
            />
          </div>

          {/* İzinler */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              İzinler
            </label>
            
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={validation.allowAddRows !== false}
                  onChange={(e) => {
                    onChange({
                      ...validation,
                      allowAddRows: e.target.checked
                    });
                  }}
                  className="h-4 w-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded border-gray-300 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Satır Ekleme</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={validation.allowDeleteRows !== false}
                  onChange={(e) => {
                    onChange({
                      ...validation,
                      allowDeleteRows: e.target.checked
                    });
                  }}
                  className="h-4 w-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded border-gray-300 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Satır Silme</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={validation.allowEditRows !== false}
                  onChange={(e) => {
                    onChange({
                      ...validation,
                      allowEditRows: e.target.checked
                    });
                  }}
                  className="h-4 w-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark rounded border-gray-300 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Satır Düzenleme</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableValidation; 