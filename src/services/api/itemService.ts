import api from './config';
import {
  ItemApiParams,
  AttributeValue,
  Item,
  ApiResponse,
  CreateItemDto
} from '../../types/item';

// Item servisi
const itemService = {
  // Tüm öğeleri getir (filtre, sayfalama ve sıralama desteği ile)
  getItems: async (params?: ItemApiParams): Promise<{
    items: Item[];
    total: number;
    page: number;
    limit: number;
  }> => {
    try {
      const response = await api.get<ApiResponse<Item[]>>('/items', { 
        params 
      });
      
      return {
        items: response.data.data,
        total: response.data.total || response.data.count || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 10
      };
    } catch (error) {
      console.error('Öğeler getirilirken hata oluştu:', error);
      throw error;
    }
  },
  
  // Belirli bir öğeyi ID'ye göre getir
  getItemById: async (id: string): Promise<Item> => {
    try {
      const response = await api.get<ApiResponse<Item>>(`/items/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`${id} ID'li öğe getirilirken hata oluştu:`, error);
      throw error;
    }
  },
  
  // Yeni öğe oluştur
  createItem: async (itemData: CreateItemDto): Promise<Item> => {
    try {
      const response = await api.post<ApiResponse<Item>>('/items', itemData);
      return response.data.data;
    } catch (error) {
      console.error('Öğe oluşturulurken hata oluştu:', error);
      throw error;
    }
  },
  
  // Mevcut öğeyi güncelle
  updateItem: async (id: string, itemData: Partial<CreateItemDto>): Promise<Item> => {
    try {
      const response = await api.put<ApiResponse<Item>>(`/items/${id}`, itemData);
      return response.data.data;
    } catch (error) {
      console.error(`${id} ID'li öğe güncellenirken hata oluştu:`, error);
      throw error;
    }
  },
  
  // Öğeyi sil
  deleteItem: async (id: string): Promise<void> => {
    try {
      await api.delete(`/items/${id}`);
    } catch (error) {
      console.error(`${id} ID'li öğe silinirken hata oluştu:`, error);
      throw error;
    }
  }
};

export default itemService; 