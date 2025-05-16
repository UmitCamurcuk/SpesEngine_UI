// API parametreleri
export interface AttributeGroupApiParams {
  page?: number;
  limit?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  search?: string;
  isActive?: boolean;
  [key: string]: any;
}

// AttributeGroup modeli
export interface AttributeGroup {
  _id: string;
  name: string;
  code: string;
  description: string;
  attributes: string[];
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

// Yeni attributeGroup için tip tanımı
export interface CreateAttributeGroupDto {
  name: string;
  code: string;
  description: string;
  attributes?: string[];
  isActive?: boolean;
} 