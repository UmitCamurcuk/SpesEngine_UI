import api from './config';
import {
  ActionType,
  HistoryChange,
  History,
  HistoryApiParams,
  ApiResponse
} from '../../types/history';

// History servisi
const historyService = {
  // Tüm history kayıtlarını getir
  getHistory: async (params?: HistoryApiParams): Promise<{
    history: History[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> => {
    try {
      const response = await api.get<ApiResponse<History[]>>('/history', { 
        params 
      });
      
      return {
        history: response.data.data,
        total: response.data.pagination?.total || 0,
        page: response.data.pagination?.page || 1,
        limit: response.data.pagination?.limit || 10,
        pages: response.data.pagination?.pages || 1
      };
    } catch (error) {
      console.error('History kayıtları getirilirken hata oluştu:', error);
      throw error;
    }
  },
  
  // Belirli bir entity'nin history kayıtlarını getir
  getEntityHistory: async (entityId: string, params?: HistoryApiParams): Promise<{
    history: History[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> => {
    try {
      const response = await api.get<ApiResponse<History[]>>(`/history/${entityId}`, { 
        params 
      });
      
      return {
        history: response.data.data,
        total: response.data.pagination?.total || 0,
        page: response.data.pagination?.page || 1,
        limit: response.data.pagination?.limit || 10,
        pages: response.data.pagination?.pages || 1
      };
    } catch (error) {
      console.error(`${entityId} ID'li varlığın history kayıtları getirilirken hata oluştu:`, error);
      throw error;
    }
  }
};

export default historyService; 