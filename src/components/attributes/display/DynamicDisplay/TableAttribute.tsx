import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from '../../../../context/i18nContext';
import { getEntityName, getEntityDescription } from '../../../../utils/translationUtils';
import Button from '../../../../ui/Button';

interface TableAttributeProps {
  attribute: any;
  value: any;
  onChange?: (value: any) => void;
  error?: string;
  disabled?: boolean;
  isEditing?: boolean;
}

interface TableColumn {
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  required?: boolean;
  options?: string[];
  width?: number;
}

// Tablo sütununda gösterim için
export const TableTableDisplay: React.FC<TableAttributeProps> = ({ value }) => {
  if (!Array.isArray(value) || value.length === 0) {
    return <span className="text-gray-400 italic text-sm">Boş tablo</span>;
  }

  return (
    <span className="text-sm text-gray-600 dark:text-gray-400">
      {value.length} satır
    </span>
  );
};

// Edit modunda input için
export const TableEditInput: React.FC<TableAttributeProps> = ({
  attribute,
  value,
  onChange,
  error,
  disabled = false
}) => {
  const [showFullTable, setShowFullTable] = useState(false);

  // Table Input Logic
  const handleTableCellChange = useCallback((rowIndex: number, colIndex: number, cellValue: any) => {
    if (disabled) return;

    const currentValue = value || [];
    const newValue = [...currentValue];
    const columns = attribute.validations?.columns || [];
    
    // Ensure the row exists
    if (!newValue[rowIndex]) {
      newValue[rowIndex] = Array.from({ length: columns.length }, () => '');
    }
    // Only update if value actually changed
    if (newValue[rowIndex][colIndex] !== cellValue) {
      newValue[rowIndex] = [...newValue[rowIndex]];
      newValue[rowIndex][colIndex] = cellValue;
      onChange?.(newValue);
    }
  }, [value, attribute.validations?.columns, disabled, onChange]);

  const addTableRow = useCallback(() => {
    if (disabled) return;

    const currentValue = value || [];
    const columns = attribute.validations?.columns || [];
    const newRow = Array.from({ length: columns.length }, () => '');
    const newValue = [...currentValue, newRow];
    onChange?.(newValue);
  }, [value, attribute.validations?.columns, disabled, onChange]);

  const deleteTableRow = useCallback((rowIndex: number) => {
    if (disabled) return;

    const currentValue = value || [];
    const newValue = currentValue.filter((_: any, index: number) => index !== rowIndex);
    onChange?.(newValue);
  }, [value, disabled, onChange]);

  const renderTableCell = useCallback((rowIndex: number, colIndex: number, column: TableColumn) => {
    const currentValue = value || [];
    const cellValue = currentValue[rowIndex]?.[colIndex] || '';
    const cellId = `cell-${rowIndex}-${colIndex}`;

    const commonProps = {
      value: cellValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => 
        handleTableCellChange(rowIndex, colIndex, e.target.value),
      disabled: disabled,
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
  }, [value, handleTableCellChange, disabled]);

  const currentValue = value || [];
  const columns = attribute.validations?.columns || [];

  // Initialize with one empty row if completely empty
  useEffect(() => {
    if (currentValue.length === 0 && columns.length > 0) {
      const newRow = Array.from({ length: columns.length }, () => '');
      onChange?.([newRow]);
    }
  }, []); // Empty dependency array - only run once on mount

  return (
    <div className="space-y-3">
      {/* Table */}
      <div className="overflow-x-auto border border-gray-300 dark:border-gray-600 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          {/* Header */}
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((column: any, colIndex: number) => (
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
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">
                İşlem
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
            {currentValue.map((row: any[], rowIndex: number) => (
              <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {columns.map((column: any, colIndex: number) => (
                  <td key={colIndex} className="px-3 py-2 whitespace-nowrap">
                    {renderTableCell(rowIndex, colIndex, column)}
                  </td>
                ))}
                <td className="px-3 py-2 whitespace-nowrap text-center">
                  <Button
                    size="sm"
                    variant="secondary"
                    type="button"
                    onClick={() => deleteTableRow(rowIndex)}
                    disabled={disabled || currentValue.length <= 1}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Row Button */}
      <div className="flex justify-start">
        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={addTableRow}
          disabled={disabled}
          className="flex items-center space-x-1"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Satır Ekle</span>
        </Button>
      </div>

      {/* Row count info */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {currentValue.length} satır
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

// Item detay sayfasında gösterim için
export const TableDetailDisplay: React.FC<TableAttributeProps> = ({
  attribute,
  value,
  isEditing = false,
  onChange,
  error,
  disabled = false
}) => {
  const { currentLanguage } = useTranslation();
  const [showFullTable, setShowFullTable] = useState(false);

  if (isEditing) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {getEntityName(attribute, currentLanguage)}
          {attribute.isRequired && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
        <TableEditInput
          attribute={attribute}
          value={value}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
        {getEntityDescription(attribute, currentLanguage) && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getEntityDescription(attribute, currentLanguage)}
          </p>
        )}
      </div>
    );
  }

  // Table display logic
  if (!Array.isArray(value) || value.length === 0) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {getEntityName(attribute, currentLanguage)}
          {attribute.isRequired && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
        <div className="flex items-center justify-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600">
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tablo verisi bulunmuyor</p>
          </div>
        </div>
        {getEntityDescription(attribute, currentLanguage) && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getEntityDescription(attribute, currentLanguage)}
          </p>
        )}
      </div>
    );
  }

  const columns = attribute.validations?.columns || [];
  const displayRows = showFullTable ? value : value.slice(0, 5);
  const hasMoreRows = value.length > 5;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {getEntityName(attribute, currentLanguage)}
        {attribute.isRequired && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>
      
      <div className="space-y-3">
        {/* Table Header Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {value.length} satır
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {columns.length} sütun
              </span>
            </div>
          </div>
          {hasMoreRows && (
            <button
              onClick={() => setShowFullTable(!showFullTable)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium transition-colors"
            >
              {showFullTable ? 'Daha az göster' : `+${value.length - 5} satır daha`}
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                  {columns.map((column: any, idx: number) => (
                    <th
                      key={idx}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600 last:border-r-0"
                    >
                      <div className="flex items-center space-x-2">
                        <span>{column.name}</span>
                        {column.required && (
                          <span className="text-red-500 text-xs">*</span>
                        )}
                        <div className="text-xs text-gray-400 dark:text-gray-500 normal-case font-normal">
                          {column.type === 'number' ? '#' : 
                           column.type === 'text' ? 'Aa' : 
                           column.type === 'date' ? '📅' : 
                           '•'}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {displayRows.map((row: any[], rowIdx: number) => (
                  <tr key={rowIdx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    {row.map((cell: any, cellIdx: number) => {
                      const column = columns[cellIdx];
                      return (
                        <td
                          key={cellIdx}
                          className="px-4 py-3 whitespace-nowrap border-r border-gray-100 dark:border-gray-700 last:border-r-0"
                        >
                          <div className="flex items-center">
                            {cell || cell === 0 ? (
                              <span className={`text-sm ${
                                column?.type === 'number' 
                                  ? 'font-mono text-blue-600 dark:text-blue-400' 
                                  : 'text-gray-900 dark:text-white'
                              }`}>
                                {column?.type === 'number' && typeof cell === 'string' 
                                  ? parseFloat(cell).toLocaleString('tr-TR')
                                  : cell}
                              </span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500 italic text-sm">-</span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {hasMoreRows && !showFullTable && (
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center">
                <button
                  onClick={() => setShowFullTable(true)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium flex items-center space-x-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span>Tüm {value.length} satırı göster</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span>Toplam: {value.length} kayıt</span>
            {showFullTable && (
              <span>Tüm veriler gösteriliyor</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
            <span>Tablo verisi</span>
          </div>
        </div>
      </div>

      {getEntityDescription(attribute, currentLanguage) && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {getEntityDescription(attribute, currentLanguage)}
        </p>
      )}
    </div>
  );
};
