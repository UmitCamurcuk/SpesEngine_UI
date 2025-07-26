import React, { useState } from 'react';
import { TableInput } from './inputs';

interface TableDisplayProps {
  value: any[][];
  columns: any[];
  isEditing: boolean;
  onChange?: (value: any[][]) => void;
  disabled?: boolean;
}

const TableDisplay: React.FC<TableDisplayProps> = ({
  value = [],
  columns = [],
  isEditing,
  onChange,
  disabled = false
}) => {
  const [showFullTable, setShowFullTable] = useState(false);

  if (isEditing) {
    return (
      <TableInput
        value={value}
        columns={columns}
        onChange={onChange || (() => {})}
        disabled={disabled}
      />
    );
  }

  if (!Array.isArray(value) || value.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tablo verisi bulunmuyor</p>
        </div>
      </div>
    );
  }

  const displayRows = showFullTable ? value : value.slice(0, 5);
  const hasMoreRows = value.length > 5;

  return (
    <div className="space-y-4">
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

      {/* Modern Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                {columns.map((column: any, idx: number) => (
                  <th
                    key={idx}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600 last:border-r-0"
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
                        className="px-6 py-4 whitespace-nowrap border-r border-gray-100 dark:border-gray-700 last:border-r-0"
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
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
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
  );
};

export default TableDisplay; 