import api from './config';
import {
  FamilyApiParams,
  Family,
  ApiResponse,
  CreateFamilyDto
} from '../../types/family';
import { ItemTypeOptions } from './itemTypeService';

// Family servisi
const familyService = {
  // Tüm aileleri getir (filtre, sayfalama ve sıralama desteği ile)
  getFamilies: async (params?: FamilyApiParams): Promise<{
    families: Family[];
    total: number;
    page: number;
    limit: number;
  }> => {
    try {
      const response = await api.get<ApiResponse<Family[]>>('/families', { 
        params 
      });
      
      return {
        families: response.data.data,
        total: response.data.total || response.data.count || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 10
      };
    } catch (error) {
      console.error('Aileler getirilirken hata oluştu:', error);
      throw error;
    }
  },
  
  // Belirli bir aileyi ID'ye göre getir
  getFamilyById: async (id: string, options?: ItemTypeOptions): Promise<any> => {
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
      
      const response = await api.get<ApiResponse<any>>(`/families/${id}`, { params });
      return response.data.data;
    } catch (error: any) {
      console.error(`${id} ID'li aile getirilirken hata oluştu:`, error);
      throw error;
    }
  },
  
  // Yeni aile oluştur
  createFamily: async (familyData: CreateFamilyDto): Promise<Family> => {
    try {
      const response = await api.post<ApiResponse<Family>>('/families', familyData);
      return response.data.data;
    } catch (error) {
      console.error('Aile oluşturulurken hata oluştu:', error);
      throw error;
    }
  },
  
  // Mevcut aileyi güncelle
  updateFamily: async (id: string, familyData: Partial<CreateFamilyDto>): Promise<Family> => {
    try {
      const response = await api.put<ApiResponse<Family>>(`/families/${id}`, familyData);
      return response.data.data;
    } catch (error) {
      console.error(`${id} ID'li aile güncellenirken hata oluştu:`, error);
      throw error;
    }
  },
  
  // Aileyi sil
  deleteFamily: async (id: string): Promise<void> => {
    try {
      await api.delete(`/families/${id}`);
    } catch (error) {
      console.error(`${id} ID'li aile silinirken hata oluştu:`, error);
      throw error;
    }
  }
};

export default familyService; 