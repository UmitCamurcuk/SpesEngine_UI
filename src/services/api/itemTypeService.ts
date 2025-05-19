import api from './config';
import {
  ItemTypeApiParams,
  ItemType,
  ApiResponse,
  CreateItemTypeDto
} from '../../types/itemType';

// ItemTypeOptions tipini tanımla
export interface ItemTypeOptions {
  includeAttributes?: boolean;
  includeAttributeGroups?: boolean;
  populateAttributeGroupsAttributes?: boolean;
}

// ItemType servisi
const itemTypeService = {
  // Tüm öğe tiplerini getir (filtre, sayfalama ve sıralama desteği ile)
  getItemTypes: async (params?: ItemTypeApiParams): Promise<{
    itemTypes: ItemType[];
    total: number;
    page: number;
    limit: number;
  }> => {
    try {
      const response = await api.get<ApiResponse<ItemType[]>>('/ItemTypes', { 
        params 
      });
      
      return {
        itemTypes: response.data.data,
        total: response.data.total || response.data.count || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 10
      };
    } catch (error) {
      console.error('Öğe tipleri getirilirken hata oluştu:', error);
      throw error;
    }
  },
  
  // Belirli bir öğe tipini ID'ye göre getir
  getItemTypeById: async (id: string, options?: ItemTypeOptions): Promise<any> => {
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
      }
      
      const response = await api.get<ApiResponse<any>>(`/itemTypes/${id}`, { params });
      return response.data.data;
    } catch (error) {
      console.error(`${id} ID'li öğe tipi getirilirken hata oluştu:`, error);
      throw error;
    }
  },
  
  // Yeni öğe tipi oluştur
  createItemType: async (itemTypeData: CreateItemTypeDto): Promise<ItemType> => {
    try {
      const response = await api.post<ApiResponse<ItemType>>('/ItemTypes', itemTypeData);
      return response.data.data;
    } catch (error) {
      console.error('Öğe tipi oluşturulurken hata oluştu:', error);
      throw error;
    }
  },
  
  // Mevcut öğe tipini güncelle
  updateItemType: async (id: string, itemTypeData: Partial<CreateItemTypeDto>): Promise<ItemType> => {
    try {
      const response = await api.put<ApiResponse<ItemType>>(`/ItemTypes/${id}`, itemTypeData);
      return response.data.data;
    } catch (error) {
      console.error(`${id} ID'li öğe tipi güncellenirken hata oluştu:`, error);
      throw error;
    }
  },
  
  // Öğe tipini sil
  deleteItemType: async (id: string): Promise<void> => {
    try {
      await api.delete(`/ItemTypes/${id}`);
    } catch (error) {
      console.error(`${id} ID'li öğe tipi silinirken hata oluştu:`, error);
      throw error;
    }
  }
};

export default itemTypeService; 