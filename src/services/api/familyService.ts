import api from './config';

// API parametreleri
export interface FamilyApiParams {
  page?: number;
  limit?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  search?: string;
  isActive?: boolean;
  [key: string]: any;
}

// Family modeli
export interface Family {
  _id: string;
  name: string;
  code: string;
  description: string;
  parentFamily?: string;
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

// Yeni family için tip tanımı
export interface CreateFamilyDto {
  name: string;
  code: string;
  description: string;
  parentFamily?: string;
  attributes?: string[];
  isActive?: boolean;
}

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
  getFamilyById: async (id: string): Promise<Family> => {
    try {
      const response = await api.get<ApiResponse<Family>>(`/families/${id}`);
      return response.data.data;
    } catch (error) {
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