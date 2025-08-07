import React, { useState, useEffect, useMemo } from 'react';
import { AssociationSelectorProps, AssociationItem } from './types';
import itemService from '../../services/api/itemService';
import { useTranslation } from '../../context/i18nContext';
import { getEntityName } from '../../utils/translationUtils';

const AssociationSelector: React.FC<AssociationSelectorProps> = ({
  rule,
  value,
  onChange,
  error,
  disabled = false,
  label,
  displayConfig
}) => {
  const { currentLanguage } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [availableItems, setAvailableItems] = useState<AssociationItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Association key oluştur (targetItemTypeCode veya sourceItemTypeCode + relationshipType)
  const itemTypeCode = rule.targetItemTypeCode || rule.sourceItemTypeCode;
  const relationshipType = rule.association || rule.relationshipType;
  const associationKey = `${itemTypeCode}_${relationshipType}`;
  
  // Display label
  const displayLabel = label || rule.targetItemTypeName || rule.sourceItemTypeName || itemTypeCode;



  // Load available items for target item type
  useEffect(() => {
    loadAvailableItems();
  }, [itemTypeCode, rule.filterBy]);

  const loadAvailableItems = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const queryParams: any = {
        limit: 1000,
        isActive: true,
        ...rule.filterBy
      };

      if (!itemTypeCode) {
        console.error('No itemTypeCode found in rule');
        setAvailableItems([]);
        return;
      }
      
      const response = await itemService.getItemsByType(itemTypeCode, queryParams);
      const items = response.items || response.data || response;

      // Transform items to AssociationItem format
      const transformedItems: AssociationItem[] = items.map((item: any) => {
        // Extract display value from rule.displayField
        let displayValue = '';
        if (rule.displayField && item.attributes) {
          const attrValue = item.attributes[rule.displayField];
          // Handle different types of attribute values
          if (typeof attrValue === 'string' || typeof attrValue === 'number') {
            displayValue = String(attrValue);
          } else if (attrValue && typeof attrValue === 'object') {
            // If it's an object (like select option), try to get the display value
            displayValue = attrValue.name || attrValue.label || attrValue.value || JSON.stringify(attrValue);
          } else {
            displayValue = String(attrValue || '');
          }
        }
        
        // If no display field specified or value not found, use first available attribute
        if (!displayValue && item.attributes) {
          const firstAttr = Object.values(item.attributes)[0];
          if (typeof firstAttr === 'string' || typeof firstAttr === 'number') {
            displayValue = String(firstAttr);
          } else if (firstAttr && typeof firstAttr === 'object') {
            displayValue = firstAttr.name || firstAttr.label || firstAttr.value || JSON.stringify(firstAttr);
          } else {
            displayValue = String(firstAttr || item._id);
          }
        }

        // Build searchable text from searchableFields
        let searchableText = displayValue;
        if (rule.searchableFields && item.attributes) {
          const searchValues = rule.searchableFields
            .map(field => item.attributes[field])
            .filter(Boolean)
            .join(' ');
          searchableText = `${displayValue} ${searchValues}`.toLowerCase();
        }

        return {
          _id: item._id,
          displayValue: displayValue || 'Unnamed Item',
          searchableText: searchableText.toLowerCase(),
          item
        };
      });

      setAvailableItems(transformedItems);
    } catch (error) {
      console.error('Association items yüklenirken hata:', error);
      setAvailableItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return availableItems;
    
    const term = searchTerm.toLowerCase();
    return availableItems.filter(item => 
      item.searchableText.includes(term)
    );
  }, [availableItems, searchTerm]);

  // Get selected items for display
  const selectedItems = useMemo(() => {
    if (!value) return [];
    
    if (Array.isArray(value)) {
      return availableItems.filter(item => value.includes(item._id));
    } else {
      const item = availableItems.find(item => item._id === value);
      return item ? [item] : [];
    }
  }, [value, availableItems]);

  // Handle single selection
  const handleSingleSelect = (itemId: string) => {
    onChange(itemId);
    setShowDropdown(false);
    setSearchTerm('');
  };

  // Handle multiple selection
  const handleMultipleSelect = (itemId: string) => {
    const currentValue = Array.isArray(value) ? value : (value ? [value] : []);
    
    if (currentValue.includes(itemId)) {
      // Remove from selection
      const newValue = currentValue.filter(id => id !== itemId);
      onChange(newValue.length > 0 ? newValue : null);
    } else {
      // Add to selection (check cardinality)
      const maxItems = rule.cardinality.max;
      if (maxItems && currentValue.length >= maxItems) {
        return; // Don't add more than max allowed
      }
      
      onChange([...currentValue, itemId]);
    }
  };

  // Handle remove from selection
  const handleRemove = (itemId: string) => {
    if (Array.isArray(value)) {
      const newValue = value.filter(id => id !== itemId);
      onChange(newValue.length > 0 ? newValue : null);
    } else if (value === itemId) {
      onChange(null);
    }
  };

  // Get input placeholder
  const getPlaceholder = () => {
    if (loading) return 'Yükleniyor...';
    if (rule.isRequired) return `${displayLabel} seçin (zorunlu)`;
    return `${displayLabel} seçin`;
  };

  // Check if max items reached
  const isMaxReached = () => {
    if (!rule.cardinality.max) return false;
    const currentCount = Array.isArray(value) ? value.length : (value ? 1 : 0);
    return currentCount >= rule.cardinality.max;
  };

  // Render based on relationship type and UI config
  const renderSelector = () => {
    // Many-to-one veya one-to-many ilişkilerde many tarafı seçiliyorsa çoklu seçim
    const relationshipType = rule.association || rule.relationshipType;
    const isMultiple = (relationshipType && relationshipType.includes('many')) || 
                      (rule.cardinality?.max && rule.cardinality.max > 1);
    
    
    return (
      <div className="space-y-4">
        {/* Selected items display */}
        {selectedItems.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Seçilen Öğeler
                </h4>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                  {selectedItems.length}
                </span>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                >
                  Tümünü Temizle
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedItems.map(item => (
                <div
                  key={item._id}
                  className="inline-flex items-center px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg text-sm border border-green-200 dark:border-green-700 shadow-sm"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="font-medium">{item.displayValue}</span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemove(item._id)}
                      className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search input */}
        {(!isMaxReached() || selectedItems.length === 0) && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder={getPlaceholder()}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={disabled || loading}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                error 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              } dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Table view for available items */}
        {filteredItems.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Mevcut Öğeler
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {filteredItems.length} öğe bulundu
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Aktif</span>
                </div>
              </div>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 sticky top-0 shadow-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <input
                          type={isMultiple ? "checkbox" : "radio"}
                          checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                          onChange={() => {
                            if (isMultiple) {
                              if (selectedItems.length === filteredItems.length) {
                                // Deselect all
                                onChange(null);
                              } else {
                                // Select all
                                onChange(filteredItems.map(item => item._id));
                              }
                            }
                          }}
                          className="text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <span>Seç</span>
                      </div>
                    </th>
                    {displayConfig?.enabled && displayConfig.columns.length > 0 ? (
                      // DisplayConfig varsa onun sütunlarını kullan
                      displayConfig.columns.map((column, index) => (
                        <th 
                          key={index}
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                          style={{ width: column.width || 'auto' }}
                        >
                          <div className="flex items-center space-x-2">
                            <span>{column.displayName}</span>
                            {column.isRequired && <span className="text-red-500">*</span>}
                            {column.sortable && (
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                              </svg>
                            )}
                          </div>
                        </th>
                      ))
                    ) : (
                      // Default sütunlar
                      <>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Kategori
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Aile
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Özellikler
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Tarih
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredItems.slice(0, 20).map((item, index) => {
                    const isSelected = selectedItems.some(s => s._id === item._id);
                    const itemData = item.item;
                    
                    // Extract category and family names
                    const categoryName = itemData.category?.name?.translations?.tr || 
                                       itemData.category?.name?.translations?.en || 
                                       itemData.category?.code || 'N/A';
                    const familyName = itemData.family?.name?.translations?.tr || 
                                     itemData.family?.name?.translations?.en || 
                                     itemData.family?.code || 'N/A';
                    
                    // Extract key attributes for display
                    const keyAttributes: string[] = [];
                    if (itemData.attributes) {
                      Object.values(itemData.attributes).forEach((attr: any) => {
                        if (attr.definition && attr.displayValue) {
                          const attrName = attr.definition.name?.translations?.tr || 
                                         attr.definition.name?.translations?.en || 
                                         attr.definition.code || '';
                          if (attrName && attr.displayValue !== 'N/A') {
                            keyAttributes.push(`${attrName}: ${attr.displayValue}`);
                          }
                        }
                      });
                    }
                    
                    return (
                      <tr 
                        key={item._id}
                        className={`hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer transition-colors duration-150 ${
                          isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
                        } ${index % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''}`}
                        onClick={() => isMultiple ? handleMultipleSelect(item._id) : handleSingleSelect(item._id)}
                      >
                        <td className="px-6 py-4">
                          <input
                            type={isMultiple ? "checkbox" : "radio"}
                            checked={isSelected}
                            onChange={() => {}} // Handled by row click
                            className="text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        {displayConfig?.enabled && displayConfig.columns.length > 0 ? (
                          // DisplayConfig varsa onun sütunlarını kullan
                          displayConfig.columns.map((column, colIndex) => {
                            let cellValue = '';
                            
                            // Column type'ına göre değer extract et
                            switch (column.attributeId) {
                              case 'category':
                                cellValue = categoryName;
                                break;
                              case 'family':
                                cellValue = familyName;
                                break;
                              case 'createdAt':
                                cellValue = new Date(itemData.createdAt).toLocaleDateString('tr-TR');
                                break;
                              default:
                                // Diğer attribute'lar için
                                if (itemData.attributes && itemData.attributes[column.attributeId]) {
                                  const attr = itemData.attributes[column.attributeId];
                                  cellValue = attr.displayValue || attr.value || '';
                                }
                                break;
                            }
                            
                            return (
                              <td 
                                key={colIndex} 
                                className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100"
                                style={{ width: column.width || 'auto' }}
                              >
                                {column.formatType === 'date' && cellValue ? 
                                  new Date(cellValue).toLocaleDateString('tr-TR') : 
                                  cellValue || 'N/A'
                                }
                              </td>
                            );
                          })
                        ) : (
                          // Default sütunlar
                          <>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="font-medium">{categoryName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="font-medium">{familyName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="space-y-2">
                                {keyAttributes.slice(0, 3).map((attr, index) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                    <span className="text-xs text-gray-700 dark:text-gray-300">
                                      {attr}
                                    </span>
                                  </div>
                                ))}
                                {keyAttributes.length > 3 && (
                                  <div className="flex items-center space-x-2 pt-1 border-t border-gray-100 dark:border-gray-700">
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                      +{keyAttributes.length - 3} daha...
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{new Date(itemData.createdAt).toLocaleDateString('tr-TR')}</span>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 font-medium">Öğeler yükleniyor...</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Lütfen bekleyin</p>
          </div>
        )}

        {/* No items found */}
        {!loading && filteredItems.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Öğe bulunamadı</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              "{searchTerm}" arama kriterlerine uygun öğe bulunamadı
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {displayLabel}
        {rule.isRequired && <span className="text-red-500 ml-1">*</span>}
        {rule.cardinality.max && (
          <span className="text-xs text-gray-500 ml-2">
            (maks. {rule.cardinality.max})
          </span>
        )}
      </label>

      {/* Selector */}
      {renderSelector()}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Help text */}
      {rule.cardinality.min && rule.cardinality.min > 0 && (
        <p className="text-xs text-gray-500">
          En az {rule.cardinality.min} seçim yapmalısınız
        </p>
      )}
    </div>
  );
};

export default AssociationSelector;