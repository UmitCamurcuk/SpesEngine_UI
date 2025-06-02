import api from './config';
import { 
  AttributeType, 
  AttributeApiParams, 
  AttributeValidation, 
  Attribute, 
  ApiResponse,
  CreateAttributeDto 
} from '../../types/attribute';

// Attribute servisi
const attributeService = {
  // Tüm öznitelikleri getir (filtre, sayfalama ve sıralama desteği ile)
  getAttributes: async (params?: AttributeApiParams): Promise<{
    attributes: Attribute[];
    total: number;
    page: number;
    limit: number;
  }> => {
    try {
      const response = await api.get<ApiResponse<Attribute[]>>('/attributes', { 
        params 
      });
      return {
        attributes: response.data.data,
        total: response.data.total || response.data.count || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 10
      };
    } catch (error) {
      console.error('Öznitelikler getirilirken hata oluştu:', error);
      throw error;
    }
  },
  
  // Belirli bir özniteliği ID'ye göre getir
  getAttributeById: async (id: string): Promise<Attribute> => {
    try {
      const response = await api.get<ApiResponse<Attribute>>(`/attributes/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`${id} ID'li öznitelik getirilirken hata oluştu:`, error);
      throw error;
    }
  },
  
  // Belirli bir attribute group'a ait attributeları getir
  getAttributesByGroup: async (groupId: string): Promise<Attribute[]> => {
    try {
      const response = await api.get<ApiResponse<Attribute[]>>(`/attributes?attributeGroup=${groupId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Attribute group ID: ${groupId} için öznitelikler getirilirken hata oluştu:`, error);
      throw error;
    }
  },
  
  // Yeni öznitelik oluştur
  createAttribute: async (attributeData: CreateAttributeDto): Promise<Attribute> => {
    try {
      const response = await api.post<ApiResponse<Attribute>>('/attributes', attributeData);
      return response.data.data;
    } catch (error) {
      console.error('[AttributeService] Öznitelik oluşturulurken hata oluştu:', error);
      throw error;
    }
  },
  
  // Mevcut özniteliği güncelle
  updateAttribute: async (id: string, attributeData: any): Promise<Attribute> => {
    try {
      const response = await api.put<ApiResponse<Attribute>>(`/attributes/${id}`, attributeData);
      return response.data.data;
    } catch (error) {
      console.error(`${id} ID'li öznitelik güncellenirken hata oluştu:`, error);
      throw error;
    }
  },
  
  // Özniteliği sil
  deleteAttribute: async (id: string): Promise<void> => {
    try {
      await api.delete(`/attributes/${id}`);
    } catch (error) {
      console.error(`${id} ID'li öznitelik silinirken hata oluştu:`, error);
      throw error;
    }
  },

  // Özniteliğin bağlı olduğu grupları getir
  getAttributeGroups: async (id: string): Promise<any[]> => {
    try {
      const response = await api.get<ApiResponse<any[]>>(`/attributes/${id}/groups`);
      return response.data.data;
    } catch (error) {
      console.error(`${id} ID'li özniteliğin grupları getirilirken hata oluştu:`, error);
      throw error;
    }
  },

  // Özniteliğin bağlı olduğu grupları güncelle
  updateAttributeGroups: async (id: string, attributeGroups: string[]): Promise<any[]> => {
    try {
      const response = await api.put<ApiResponse<any[]>>(`/attributes/${id}/groups`, { attributeGroups });
      return response.data.data;
    } catch (error) {
      console.error(`${id} ID'li özniteliğin grupları güncellenirken hata oluştu:`, error);
      throw error;
    }
  }
};

export default attributeService; 