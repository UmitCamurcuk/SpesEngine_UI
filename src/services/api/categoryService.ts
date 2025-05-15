import api from './config';

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
  parentCategory?: string;
  attributes?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Response için tip tanımı
interface ApiResponse<T> {
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
  parentCategory?: string;
  attributes?: string[];
  isActive?: boolean;
}

// Category servisi
const categoryService = {
  // Tüm kategorileri getir (filtre, sayfalama ve sıralama desteği ile)
  getCategories: async (params?: CategoryApiParams): Promise<{
    categories: Category[];
    total: number;
    page: number;
    limit: number;
  }> => {
    try {
      const response = await api.get<ApiResponse<Category[]>>('/categories', { 
        params 
      });
      
      return {
        categories: response.data.data,
        total: response.data.total || response.data.count || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 10
      };
    } catch (error) {
      console.error('Kategoriler getirilirken hata oluştu:', error);
      throw error;
    }
  },
  
  // Belirli bir kategoriyi ID'ye göre getir
  getCategoryById: async (id: string): Promise<Category> => {
    try {
      const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`${id} ID'li kategori getirilirken hata oluştu:`, error);
      throw error;
    }
  },
  
  // Yeni kategori oluştur
  createCategory: async (categoryData: CreateCategoryDto): Promise<Category> => {
    try {
      const response = await api.post<ApiResponse<Category>>('/categories', categoryData);
      return response.data.data;
    } catch (error) {
      console.error('Kategori oluşturulurken hata oluştu:', error);
      throw error;
    }
  },
  
  // Mevcut kategoriyi güncelle
  updateCategory: async (id: string, categoryData: Partial<CreateCategoryDto>): Promise<Category> => {
    try {
      const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, categoryData);
      return response.data.data;
    } catch (error) {
      console.error(`${id} ID'li kategori güncellenirken hata oluştu:`, error);
      throw error;
    }
  },
  
  // Kategoriyi sil
  deleteCategory: async (id: string): Promise<void> => {
    try {
      await api.delete(`/categories/${id}`);
    } catch (error) {
      console.error(`${id} ID'li kategori silinirken hata oluştu:`, error);
      throw error;
    }
  }
};

export default categoryService; 