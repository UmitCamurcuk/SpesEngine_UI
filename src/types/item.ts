// API parametreleri
export interface ItemApiParams {
  page?: number;
  limit?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  search?: string;
  isActive?: boolean;
  itemTypeId?: string;
  categoryId?: string;
  familyId?: string;
  [key: string]: any;
}

// Öznitelik değeri tipi
export interface AttributeValue {
  attributeId: string;
  value: any;
}

// Localization tipi
export interface Localization {
  _id: string;
  key: string;
  namespace: string;
  translations: Record<string, string>;
}

// Populate edilmiş attribute tipi
export interface PopulatedAttribute {
  _id: string;
  code: string;
  type: string;
  name: Localization;
  description?: Localization;
  isRequired: boolean;
  options: any[];
  validations?: any;
  notificationSettings?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  value: any;
  referencedValue?: any;
  error?: string;
}

// Item modeli
export interface Item {
  _id: string;
  itemType: string;
  family?: string | { 
    _id: string; 
    name: string | Localization; 
    code: string; 
    description?: string | Localization;
  };
  category?: string | { 
    _id: string; 
    name: string | Localization; 
    code: string; 
    description?: string | Localization;
  };
  attributes: PopulatedAttribute[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | { _id: string; name: string; email: string; firstName?: string; lastName?: string };
  updatedBy?: string | { _id: string; name: string; email: string; firstName?: string; lastName?: string };
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

// Yeni Item için tip tanımı
export interface CreateItemDto {
  itemType: string;
  family?: string;
  category?: string;
  attributes?: Record<string, any>;
  attributeValues?: AttributeValue[];
  isActive?: boolean;
} 