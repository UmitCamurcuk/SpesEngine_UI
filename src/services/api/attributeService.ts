import api from './config';
import { AttributeType } from '../../types/attribute';
// API parametreleri
export interface AttributeApiParams {
  page?: number;
  limit?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  search?: string;
  [key: string]: any;
}

// Validation tipi
export interface AttributeValidation {
  // Metin tipi için
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  
  // Sayı tipi için
  min?: number;
  max?: number;
  isInteger?: boolean;
  isPositive?: boolean;
  isNegative?: boolean;
  isZero?: boolean;
  
  // Tarih tipi için
  minDate?: string; // ISO string formatında
  maxDate?: string; // ISO string formatında
  
  // Select/MultiSelect için
  minSelections?: number;
  maxSelections?: number;
}

// Attribute modeli
export interface Attribute {
  _id: string;
  name: string;
  code: string;
  type: AttributeType;
  description: string;
  isRequired: boolean;
  options: string[];
  attributeGroup?: string;
  validations?: AttributeValidation;
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

// Yeni attribute için tip tanımı
export interface CreateAttributeDto {
  name: string;
  code: string;
  type: AttributeType;
  description?: string;
  isRequired?: boolean;
  options?: string[];
  attributeGroup?: string;
  validations?: AttributeValidation;
}

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
      console.log('API isteği (tüm parametreler):', JSON.stringify(params, null, 2));
      
      if (params?.sort) {
        console.log(`Sıralama alanı: "${params.sort}", Yön: "${params.direction}"`);
      }
      
      const response = await api.get<ApiResponse<Attribute[]>>('/attributes', { 
        params 
      });
      
      console.log('API ham yanıt:', response.status, response.statusText);
      console.log('API veri yapısı:', {
        success: response.data.success,
        dataLength: response.data.data?.length || 0,
        total: response.data.total,
        count: response.data.count,
        page: response.data.page,
        limit: response.data.limit
      });
      
      // İlk ve son öğeleri göster
      if (response.data.data?.length > 0) {
        console.log('İlk öğe:', response.data.data[0]);
        if (response.data.data.length > 1) {
          console.log('Son öğe:', response.data.data[response.data.data.length - 1]);
        }
      }
      
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
  
  // Yeni öznitelik oluştur
  createAttribute: async (attributeData: CreateAttributeDto): Promise<Attribute> => {
    try {
      console.log('[AttributeService] Öznitelik oluşturma isteği:', JSON.stringify(attributeData, null, 2));
      
      // Validasyonları kontrol et
      if (attributeData.validations) {
        console.log('[AttributeService] Validasyon içeriği:', attributeData.validations);
        console.log('[AttributeService] İşlenmemiş validasyon verisi:', JSON.stringify(attributeData.validations, null, 2));
      } else {
        console.log('[AttributeService] Validasyon verisi yok!');
      }
      
      const response = await api.post<ApiResponse<Attribute>>('/attributes', attributeData);
      
      console.log('[AttributeService] API yanıtı:', response.status, response.statusText);
      console.log('[AttributeService] Oluşturulan kayıt:', response.data.data);
      
      return response.data.data;
    } catch (error) {
      console.error('Öznitelik oluşturulurken hata oluştu:', error);
      throw error;
    }
  },
  
  // Mevcut özniteliği güncelle
  updateAttribute: async (id: string, attributeData: Partial<CreateAttributeDto>): Promise<Attribute> => {
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
  }
};

export default attributeService; 