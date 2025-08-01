import api from './config';
import {
  CategoryApiParams,
  Category,
  ApiResponse,
  CreateCategoryDto
} from '../../types/category';
import { ItemTypeOptions } from './itemTypeService';

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
  getCategoryById: async (id: string, options?: ItemTypeOptions): Promise<any> => {
    try {
      let params = {};
      if (options) {
        if (options.includeAttributes) {
          params = { ...params, includeAttributes: 'true' };
        }
        if (options.includeAttributeGroups) {
          params = { ...params, includeAttributeGroups: 'true' };
        }
        if (options.populateAttributeGroupsAttributes) {
          params = { ...params, populateAttributeGroupsAttributes: 'true' };
        }
        if (options.includeFamilies) {
          params = { ...params, includeFamilies: 'true' };
        }
      }
      
      const response = await api.get<ApiResponse<any>>(`/categories/${id}`, { params });
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
  },

  // ItemType'a göre kategorileri getir
  getCategoriesByItemType: async (itemTypeId: string): Promise<Category[]> => {
    try {
      const response = await api.get<ApiResponse<Category[]>>(`/categories/by-itemtype/${itemTypeId}`);
      return response.data.data;
    } catch (error) {
      console.error(`${itemTypeId} ItemType'ı için kategoriler getirilirken hata oluştu:`, error);
      throw error;
    }
  }
};

export default categoryService; 