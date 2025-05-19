// API parametreleri
export interface CategoryApiParams {
  page?: number;
  limit?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  search?: string;
  isActive?: boolean;
  [key: string]: any;
}

// Category modeli
export interface Category {
  _id: string;
  name: string;
  code: string;
  description: string;
  family?: string;
  parentCategory?: string;
  parent?: any; // API'den gelen parent alanı
  parentId?: string | null; // Üst kategori ID'si
  attributes?: string[];
  attributeGroups?: string[];
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

// Yeni category için tip tanımı
export interface CreateCategoryDto {
  name: string;
  code: string;
  description: string;
  family?: string;
  parentCategory?: string;
  parent?: any; // API için parent alanı
  attributes?: string[];
  attributeGroups?: string[];
  isActive?: boolean;
} 