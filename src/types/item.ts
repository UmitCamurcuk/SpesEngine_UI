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

// Item modeli
export interface Item {
  _id: string;
  name: string;
  code: string;
  description: string;
  itemType: string;
  family?: string;
  category?: string;
  attributeValues: AttributeValue[];
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

// Yeni Item için tip tanımı
export interface CreateItemDto {
  name: string;
  code: string;
  description: string;
  itemType: string;
  family?: string;
  category?: string;
  attributeValues?: AttributeValue[];
  isActive?: boolean;
} 