// Association ile ilgili type tanımları

export interface IAssociationRule {
  targetItemTypeCode: string;           // Hedef ItemType kodu (örn: "customer")
  targetItemTypeName?: string;          // Display name
  association: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  cardinality: {
    min?: number;                       // Minimum ilişki sayısı
    max?: number;                       // Maximum ilişki sayısı (null = unlimited)
  };
  isRequired: boolean;                  // İlişki zorunlu mu?
  cascadeDelete?: boolean;              // İlgili kayıt silindiğinde ne olsun?
  displayField?: string;                // Hangi attribute gösterilsin?
  searchableFields?: string[];          // Hangi attribute'larda arama yapılsın?
  filterBy?: Record<string, any>;       // Ek filtreleme kriterleri
  validationRules?: Record<string, any>; // İlişki validation kuralları
  uiConfig?: {
    showInList?: boolean;               // Liste ekranında göster
    showInDetail?: boolean;             // Detay ekranında göster
    allowInlineCreate?: boolean;        // Inline oluşturma izni
    allowInlineEdit?: boolean;          // Inline düzenleme izni
    displayMode?: 'dropdown' | 'modal' | 'popup' | 'inline';
  };
}

export interface IItemTypeAssociations {
  // Giden ilişkiler (bu itemType'dan diğerlerine)
  outgoing?: IAssociationRule[];
  // Gelen ilişkiler (diğer itemType'lardan buna)  
  incoming?: IAssociationRule[];
}

// Association selector için props
export interface AssociationSelectorProps {
  rule: IAssociationRule;
  value: string | string[] | null;
  onChange: (value: string | string[] | null) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
  displayConfig?: {
    enabled: boolean;
    columns: Array<{
      attributeId: string;
      displayName: string;
      width?: number;
      sortable?: boolean;
      filterable?: boolean;
      isRequired?: boolean;
      formatType?: 'text' | 'date' | 'number' | 'select' | 'table' | 'custom';
    }>;
    defaultSortBy?: string;
    defaultSortOrder?: 'asc' | 'desc';
    pageSize?: number;
    showSearch?: boolean;
    searchableColumns?: string[];
  };
}

// Association input component'ı için item tipi
export interface AssociationItem {
  _id: string;
  displayValue: string;      // Rule'daki displayField'dan gelecek değer
  searchableText: string;    // Arama için birleştirilmiş text
  item: any;                 // Tam item objesi
}

// Association form validation sonuçları
export interface AssociationValidationResult {
  isValid: boolean;
  errors: Array<{
    associationKey: string;
    rule: IAssociationRule;
    message: string;
  }>;
  warnings: Array<{
    associationKey: string;
    rule: IAssociationRule;
    message: string;
  }>;
}

// Association context için state
export interface AssociationFormState {
  associations: Record<string, any>;
  rules: IAssociationRule[];
  loading: boolean;
  errors: Record<string, string>;
  validationResult?: AssociationValidationResult;
}