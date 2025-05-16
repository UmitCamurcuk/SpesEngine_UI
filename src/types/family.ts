// API parametreleri
export interface FamilyApiParams {
  page?: number;
  limit?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  search?: string;
  isActive?: boolean;
  [key: string]: any;
}

// Family modeli
export interface Family {
  _id: string;
  name: string;
  code: string;
  description: string;
  parentFamily?: string;
  attributes?: string[];
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

// Yeni family için tip tanımı
export interface CreateFamilyDto {
  name: string;
  code: string;
  description: string;
  parentFamily?: string;
  attributes?: string[];
  isActive?: boolean;
} 