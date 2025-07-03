export enum AttributeType {
  // Basic (Temel) Types
  TEXT = 'text',              // string - Metin değerleri
  NUMBER = 'number',          // number - Sayısal değerler
  BOOLEAN = 'boolean',        // boolean - Doğru / yanlış
  EMAIL = 'email',            // email - E-posta adresi
  PHONE = 'phone',            // phone - Telefon numarası
  URL = 'url',                // url - Web adresi
  DATE = 'date',              // date - Tarih
  DATETIME = 'datetime',      // datetime - Tarih + Saat
  TIME = 'time',              // time - Sadece saat
  
  // Enum / Seçilebilir Değerler
  SELECT = 'select',          // enum - Ön tanımlı seçeneklerden biri seçilir
  MULTISELECT = 'multiselect', // multi_enum - Çoklu seçim yapılabilir
  
  // Dosya / Medya Tipleri
  FILE = 'file',              // file - Tekli dosya yükleme
  IMAGE = 'image',            // image - Görsel yükleme
  ATTACHMENT = 'attachment',   // attachment - Birden fazla dosya
  
  // Kompozit / Gelişmiş Tipler
  OBJECT = 'object',          // object - İç içe veri nesneleri
  ARRAY = 'array',            // array - Tek tip dizi
  JSON = 'json',              // json - Serbest yapılandırılmış veri
  FORMULA = 'formula',        // formula - Dinamik hesaplama / formül
  EXPRESSION = 'expression',   // expression - Koşullu yapı, gösterim kuralları
  
  // UI / Görsel Bileşen Tipleri
  COLOR = 'color',            // color - Renk seçici
  RICH_TEXT = 'rich_text',    // rich_text - HTML destekli yazı
  RATING = 'rating',          // rating - Derecelendirme
  BARCODE = 'barcode',        // barcode - Barkod görselleştirme
  QR = 'qr',                  // qr - QR kod
  
  // Special Types
  READONLY = 'readonly'       // readonly - Sadece okunabilir (create'te set edilir)
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
  
  // Dosya tipi için
  maxFileSize?: number; // byte cinsinden
  allowedExtensions?: string[]; // ['.pdf', '.docx']
  maxFiles?: number; // attachment için
  
  // Görsel tipi için
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: string; // '16:9', '1:1'
  
  // Rating için
  minRating?: number;
  maxRating?: number;
  allowHalfStars?: boolean;
  
  // Array için
  minItems?: number;
  maxItems?: number;
  itemType?: string; // array içindeki elemanların tipi
  
  // Color için
  colorFormat?: 'hex' | 'rgb' | 'hsl'; // renk formatı
  
  // Rich text için
  allowedTags?: string[]; // izin verilen HTML tagları
  maxTextLength?: number;
  
  // Formula/Expression için
  variables?: string[]; // kullanılabilir değişkenler
  functions?: string[]; // kullanılabilir fonksiyonlar
  defaultFormula?: string; // varsayılan formül
  requireValidSyntax?: boolean; // geçerli sözdizimi zorunlu
  allowEmptyFormula?: boolean; // boş formüle izin ver
  
  // Object için
  requiredProperties?: string[]; // zorunlu özellikler
  jsonSchema?: string; // JSON schema tanımı
  strictMode?: boolean; // katı mod
  allowEmptyObject?: boolean; // boş nesneye izin ver
  
  // Array için
  uniqueItems?: boolean; // tekrar eden öğelere izin verme
  allowEmpty?: boolean; // boş diziye izin ver
  
  // Readonly için
  defaultValue?: any; // varsayılan değer
}

// Notification ayarları
export interface NotificationSettings {
  onUpdate?: boolean;
  onDelete?: boolean;
  onUsedInCategory?: boolean;
  onUsedInFamily?: boolean;
  onUsedInAttributeGroup?: boolean;
  onUsedInItemType?: boolean;
  onUsedInItem?: boolean;
}

// Translation objesi için tip
export interface TranslationObject {
  _id: string;
  key: string;
  namespace: string;
  translations: Record<string, string>;
}

// Attribute modeli
export interface Attribute {
  _id: string;
  name: TranslationObject;
  code: string;
  type: AttributeType;
  description?: TranslationObject;
  isRequired?: boolean;
  options?: Attribute[];
  optionType?: Attribute;
  attributeGroup?: string | AttributeGroupObject;
  validations?: AttributeValidation;
  notificationSettings?: NotificationSettings;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // Ek alanlar - details sayfası için
  usageCount?: number;
  relationships?: Array<{ entityType: string; count: number }>;
  history?: Array<{ action: string; date: string; user: string; type: string }>;
  examples?: string[];
}

export interface AttributeGroupObject {
  _id: string;
  name: string;
  code: string;
  description?: string;
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
  name: string | any; // Translation ID olabilir
  code: string;
  type: AttributeType;
  description?: string | any; // Translation ID olabilir
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
  // Basic Types
  [AttributeType.TEXT]: { namespace: 'attribute_types', key: 'text' },
  [AttributeType.NUMBER]: { namespace: 'attribute_types', key: 'number' },
  [AttributeType.BOOLEAN]: { namespace: 'attribute_types', key: 'boolean' },
  [AttributeType.EMAIL]: { namespace: 'attribute_types', key: 'email' },
  [AttributeType.PHONE]: { namespace: 'attribute_types', key: 'phone' },
  [AttributeType.URL]: { namespace: 'attribute_types', key: 'url' },
  [AttributeType.DATE]: { namespace: 'attribute_types', key: 'date' },
  [AttributeType.DATETIME]: { namespace: 'attribute_types', key: 'datetime' },
  [AttributeType.TIME]: { namespace: 'attribute_types', key: 'time' },
  
  // Enum Types
  [AttributeType.SELECT]: { namespace: 'attribute_types', key: 'select' },
  [AttributeType.MULTISELECT]: { namespace: 'attribute_types', key: 'multiselect' },
  
  // File Types
  [AttributeType.FILE]: { namespace: 'attribute_types', key: 'file' },
  [AttributeType.IMAGE]: { namespace: 'attribute_types', key: 'image' },
  [AttributeType.ATTACHMENT]: { namespace: 'attribute_types', key: 'attachment' },
  
  // Composite Types
  [AttributeType.OBJECT]: { namespace: 'attribute_types', key: 'object' },
  [AttributeType.ARRAY]: { namespace: 'attribute_types', key: 'array' },
  [AttributeType.JSON]: { namespace: 'attribute_types', key: 'json' },
  [AttributeType.FORMULA]: { namespace: 'attribute_types', key: 'formula' },
  [AttributeType.EXPRESSION]: { namespace: 'attribute_types', key: 'expression' },
  
  // UI Types
  [AttributeType.COLOR]: { namespace: 'attribute_types', key: 'color' },
  [AttributeType.RICH_TEXT]: { namespace: 'attribute_types', key: 'rich_text' },
  [AttributeType.RATING]: { namespace: 'attribute_types', key: 'rating' },
  [AttributeType.BARCODE]: { namespace: 'attribute_types', key: 'barcode' },
  [AttributeType.QR]: { namespace: 'attribute_types', key: 'qr' },
  
  // Special Types
  [AttributeType.READONLY]: { namespace: 'attribute_types', key: 'readonly' }
};

/**
 * Belirli bir öznitelik tipi için varsayılan değer döndürür
 */
export function getDefaultValueForType(type: AttributeType): any {
  switch (type) {
    // Basic Types
    case AttributeType.TEXT:
      return '';
    case AttributeType.NUMBER:
      return 0;
    case AttributeType.BOOLEAN:
      return false;
    case AttributeType.EMAIL:
    case AttributeType.PHONE:
    case AttributeType.URL:
      return '';
    case AttributeType.DATE:
      return new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatında bugünün tarihi
    case AttributeType.DATETIME:
      return new Date().toISOString(); // ISO string format
    case AttributeType.TIME:
      return new Date().toTimeString().split(' ')[0]; // HH:MM:SS format
    
    // Enum Types
    case AttributeType.SELECT:
      return '';
    case AttributeType.MULTISELECT:
      return [];
    
    // File Types
    case AttributeType.FILE:
    case AttributeType.IMAGE:
      return null;
    case AttributeType.ATTACHMENT:
      return [];
    
    // Composite Types
    case AttributeType.OBJECT:
      return {};
    case AttributeType.ARRAY:
      return [];
    case AttributeType.JSON:
      return {};
    case AttributeType.FORMULA:
    case AttributeType.EXPRESSION:
      return '';
    
    // UI Types
    case AttributeType.COLOR:
      return '#000000';
    case AttributeType.RICH_TEXT:
      return '';
    case AttributeType.RATING:
      return 0;
    case AttributeType.BARCODE:
    case AttributeType.QR:
      return '';
    
    // Special Types
    case AttributeType.READONLY:
      return '';
    
    default:
      return null;
  }
} 