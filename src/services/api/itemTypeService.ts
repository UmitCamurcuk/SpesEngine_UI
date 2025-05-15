import api from './config';

// API parametreleri
export interface ItemTypeApiParams {
  page?: number;
  limit?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  search?: string;
  isActive?: boolean;
  [key: string]: any;
}

// ItemType modeli
export interface ItemType {
  _id: string;
  name: string;
  code: string;
  description: string;
  attributeGroups?: string[];
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

// Yeni ItemType için tip tanımı
export interface CreateItemTypeDto {
  name: string;
  code: string;
  description: string;
  attributeGroups?: string[];
  attributes?: string[];
  isActive?: boolean;
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
  getItemTypeById: async (id: string): Promise<ItemType> => {
    try {
      const response = await api.get<ApiResponse<ItemType>>(`/ItemTypes/${id}`);
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