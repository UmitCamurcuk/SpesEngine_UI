export enum AttributeType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTISELECT = 'multiselect'
}

// API parametreleri
export interface AttributeApiParams {
  page?: number;
  limit?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  search?: string;
  [key: string]: any;
}

// Validation tipi
export interface AttributeValidation {
  // Metin tipi için
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  placeholder?: string;
  
  // Sayı tipi için
  min?: number;
  max?: number;
  step?: number;
  isInteger?: boolean;
  isPositive?: boolean;
  isNegative?: boolean;
  isZero?: boolean;
  
  // Tarih tipi için
  minDate?: string; // ISO string formatında
  maxDate?: string; // ISO string formatında
  
  // Select/MultiSelect için
  minSelections?: number;
  maxSelections?: number;
}

// Attribute modeli
export interface Attribute {
  _id: string;
  name: string;
  code: string;
  type: AttributeType;
  description: string;
  isRequired: boolean;
  options: string[];
  attributeGroup?: string;
  validations?: AttributeValidation;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Response için tip tanımı
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
}

// Yeni attribute için tip tanımı
export interface CreateAttributeDto {
  name: string;
  code: string;
  type: AttributeType;
  description?: string;
  isRequired?: boolean;
  options?: string[];
  attributeGroup?: string;
  validations?: AttributeValidation;
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