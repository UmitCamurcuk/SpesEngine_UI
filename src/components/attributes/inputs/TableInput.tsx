import React, { useState, useCallback, useEffect } from 'react';
import Button from '../../ui/Button';

interface TableColumn {
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  required?: boolean;
  options?: string[];
  width?: number;
}

interface TableInputProps {
  value?: any[][];
  onChange: (value: any[][]) => void;
  columns: TableColumn[];
  minRows?: number;
  maxRows?: number;
  allowAddRows?: boolean;
  allowDeleteRows?: boolean;
  allowEditRows?: boolean;
  disabled?: boolean;
  error?: string;
}

const TableInput: React.FC<TableInputProps> = ({
  value = [],
  onChange,
  columns = [],
  minRows = 1,
  maxRows = 100,
  allowAddRows = true,
  allowDeleteRows = true,
  allowEditRows = true,
  disabled = false,
  error
}) => {
  // Use value directly without automatic initialization to prevent infinite loops
  const currentValue = value;

  // Initialize with one empty row if completely empty (only once)
  useEffect(() => {
    if (currentValue.length === 0 && minRows > 0 && columns.length > 0) {
      const newRow = Array.from({ length: columns.length }, () => '');
      onChange([newRow]);
    }
  }, []); // Empty dependency array - only run once on mount

  const handleCellChange = useCallback((rowIndex: number, colIndex: number, cellValue: any) => {
    if (!allowEditRows || disabled) return;

    const newValue = [...currentValue];
    // Ensure the row exists
    if (!newValue[rowIndex]) {
      newValue[rowIndex] = Array.from({ length: columns.length }, () => '');
    }
    // Only update if value actually changed
    if (newValue[rowIndex][colIndex] !== cellValue) {
      newValue[rowIndex] = [...newValue[rowIndex]];
      newValue[rowIndex][colIndex] = cellValue;
      onChange(newValue);
    }
  }, [currentValue, columns.length, allowEditRows, disabled, onChange]);

  const addRow = useCallback(() => {
    if (!allowAddRows || disabled || currentValue.length >= maxRows) return;

    const newRow = Array.from({ length: columns.length }, () => '');
    const newValue = [...currentValue, newRow];
    onChange(newValue);
  }, [allowAddRows, disabled, currentValue, maxRows, columns.length, onChange]);

  const deleteRow = useCallback((rowIndex: number) => {
    if (!allowDeleteRows || disabled || currentValue.length <= minRows) return;

    const newValue = currentValue.filter((_, index) => index !== rowIndex);
    onChange(newValue);
  }, [allowDeleteRows, disabled, currentValue, minRows, onChange]);

  const renderCell = useCallback((rowIndex: number, colIndex: number, column: TableColumn) => {
    const cellValue = currentValue[rowIndex]?.[colIndex] || '';
    const cellId = `cell-${rowIndex}-${colIndex}`;

    const commonProps = {
      value: cellValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => 
        handleCellChange(rowIndex, colIndex, e.target.value),
      disabled: disabled || !allowEditRows,
      className: "w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
      style: column.width ? { width: `${column.width}px` } : undefined
    };

    switch (column.type) {
      case 'number':
        return (
          <input
            key={cellId}
            type="number"
            {...commonProps}
          />
        );
      
      case 'date':
        return (
          <input
            key={cellId}
            type="date"
            {...commonProps}
          />
        );
      
      case 'select':
        return (
          <select key={cellId} {...commonProps}>
            <option value="">Seçiniz</option>
            {column.options?.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      default: // 'text'
        return (
          <input
            key={cellId}
            type="text"
            {...commonProps}
          />
        );
    }
  }, [currentValue, handleCellChange, disabled, allowEditRows]);

  return (
    <div className="space-y-3">
      {/* Table */}
      <div className="overflow-x-auto border border-gray-300 dark:border-gray-600 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          {/* Header */}
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((column, colIndex) => (
                <th
                  key={colIndex}
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  style={column.width ? { width: `${column.width}px` } : undefined}
                >
                  {column.name}
                  {column.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </th>
              ))}
              {allowDeleteRows && (
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">
                  İşlem
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
            {currentValue.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-3 py-2 whitespace-nowrap">
                    {renderCell(rowIndex, colIndex, column)}
                  </td>
                ))}
                {allowDeleteRows && (
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                                         <Button
                       size="sm"
                       variant="secondary"
                       type="button"
                       onClick={() => deleteRow(rowIndex)}
                       disabled={disabled || currentValue.length <= minRows}
                       className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                     >
                       <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Add Row Button */}
      {allowAddRows && (
        <div className="flex justify-start">
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={addRow}
            disabled={disabled || currentValue.length >= maxRows}
            className="flex items-center space-x-1"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Satır Ekle</span>
          </Button>
        </div>
      )}

      {/* Row count info */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {currentValue.length} satır ({minRows} min, {maxRows} max)
      </div>

      {/* Error message */}
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
};

export default TableInput; 