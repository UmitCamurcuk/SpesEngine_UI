import api from './config';

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
interface ApiResponse<T> {
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

// AttributeGroup servisi
const attributeGroupService = {
  // Tüm öznitelik gruplarını getir (filtre, sayfalama ve sıralama desteği ile)
  getAttributeGroups: async (params?: AttributeGroupApiParams): Promise<{
    attributeGroups: AttributeGroup[];
    total: number;
    page: number;
    limit: number;
  }> => {
    try {
      const response = await api.get<ApiResponse<AttributeGroup[]>>('/attributeGroups', { 
        params 
      });
      
      return {
        attributeGroups: response.data.data,
        total: response.data.total || response.data.count || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 10
      };
    } catch (error) {
      console.error('Öznitelik grupları getirilirken hata oluştu:', error);
      throw error;
    }
  },
  
  // Belirli bir öznitelik grubunu ID'ye göre getir
  getAttributeGroupById: async (id: string): Promise<AttributeGroup> => {
    try {
      const response = await api.get<ApiResponse<AttributeGroup>>(`/attributeGroups/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`${id} ID'li öznitelik grubu getirilirken hata oluştu:`, error);
      throw error;
    }
  },
  
  // Yeni öznitelik grubu oluştur
  createAttributeGroup: async (attributeGroupData: CreateAttributeGroupDto): Promise<AttributeGroup> => {
    try {
      const response = await api.post<ApiResponse<AttributeGroup>>('/attributeGroups', attributeGroupData);
      return response.data.data;
    } catch (error) {
      console.error('Öznitelik grubu oluşturulurken hata oluştu:', error);
      throw error;
    }
  },
  
  // Mevcut öznitelik grubunu güncelle
  updateAttributeGroup: async (id: string, attributeGroupData: Partial<CreateAttributeGroupDto>): Promise<AttributeGroup> => {
    try {
      const response = await api.put<ApiResponse<AttributeGroup>>(`/attributeGroups/${id}`, attributeGroupData);
      return response.data.data;
    } catch (error) {
      console.error(`${id} ID'li öznitelik grubu güncellenirken hata oluştu:`, error);
      throw error;
    }
  },
  
  // Öznitelik grubunu sil
  deleteAttributeGroup: async (id: string): Promise<void> => {
    try {
      await api.delete(`/attributeGroups/${id}`);
    } catch (error) {
      console.error(`${id} ID'li öznitelik grubu silinirken hata oluştu:`, error);
      throw error;
    }
  }
};

export default attributeGroupService; 