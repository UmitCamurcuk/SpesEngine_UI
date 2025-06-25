import api from './config';
import {
  AttributeGroupApiParams,
  AttributeGroup,
  ApiResponse,
  CreateAttributeGroupDto
} from '../../types/attributeGroup';

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
      const response = await api.get<any>('/attributeGroups', { 
        params 
      });
      
      return {
        attributeGroups: response.data.attributeGroups || [],
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
  getAttributeGroupById: async (id: string, options?: { includeAttributes?: boolean }): Promise<AttributeGroup> => {
    try {
      const response = await api.get<any>(`/attributeGroups/${id}`, { params: options });
      return response.data.data || response.data;
    } catch (error) {
      console.error(`${id} ID'li öznitelik grubu getirilirken hata oluştu:`, error);
      throw error;
    }
  },
  
  // Yeni öznitelik grubu oluştur
  createAttributeGroup: async (attributeGroupData: CreateAttributeGroupDto): Promise<AttributeGroup> => {
    try {
      const response = await api.post<any>('/attributeGroups', attributeGroupData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Öznitelik grubu oluşturulurken hata oluştu:', error);
      throw error;
    }
  },
  
  // Mevcut öznitelik grubunu güncelle
  updateAttributeGroup: async (id: string, attributeGroupData: any): Promise<AttributeGroup> => {
    try {
      const response = await api.put<any>(`/attributeGroups/${id}`, attributeGroupData);
      return response.data.data || response.data;
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
  },
  
  // AttributeGroup içindeki öznitelikleri kontrol et
  testAttributeGroupAttributes: async (id: string): Promise<{
    _id: string;
    name: string;
    attributesLength: number;
    attributes: any[];
  }> => {
    try {
      const response = await api.get<any>(`/attributeGroups/test/${id}`);
      return response.data.result || response.data;
    } catch (error) {
      console.error(`${id} ID'li öznitelik grubu test edilirken hata oluştu:`, error);
      throw error;
    }
  }
};

export default attributeGroupService; 