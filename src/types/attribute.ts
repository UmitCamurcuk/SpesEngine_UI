export enum AttributeType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTISELECT = 'multiselect'
}

// Type-safe attribute tip kontrolleri için yardımcı fonksiyonlar

/**
 * Bir değerin AttributeType enum'unun geçerli bir değeri olup olmadığını kontrol eder
 */
export function isValidAttributeType(value: any): value is AttributeType {
  return Object.values(AttributeType).includes(value as AttributeType);
}

/**
 * AttributeType için insan tarafından okunabilir etiketler
 */
export const AttributeTypeLabels: Record<AttributeType, { namespace: string; key: string }> = {
  [AttributeType.TEXT]: { namespace: 'attribute_types', key: 'text' },
  [AttributeType.NUMBER]: { namespace: 'attribute_types', key: 'number' },
  [AttributeType.DATE]: { namespace: 'attribute_types', key: 'date' },
  [AttributeType.BOOLEAN]: { namespace: 'attribute_types', key: 'boolean' },
  [AttributeType.SELECT]: { namespace: 'attribute_types', key: 'select' },
  [AttributeType.MULTISELECT]: { namespace: 'attribute_types', key: 'multiselect' }
};

/**
 * Belirli bir öznitelik tipi için varsayılan değer döndürür
 */
export function getDefaultValueForType(type: AttributeType): any {
  switch (type) {
    case AttributeType.TEXT:
      return '';
    case AttributeType.NUMBER:
      return 0;
    case AttributeType.DATE:
      return new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatında bugünün tarihi
    case AttributeType.BOOLEAN:
      return false;
    case AttributeType.SELECT:
      return '';
    case AttributeType.MULTISELECT:
      return [];
    default:
      return null;
  }
} 