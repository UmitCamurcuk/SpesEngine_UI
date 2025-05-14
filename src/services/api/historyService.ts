import api from './config';

// History model tipleri
export enum ActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  RESTORE = 'restore'
}

export interface HistoryChange {
  old: any;
  new: any;
}

export interface History {
  _id: string;
  entityId: string;
  entityType: string;
  entityName: string;
  action: ActionType;
  changes: Record<string, HistoryChange>;
  previousData: any;
  newData: any;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

// API parametreleri
export interface HistoryApiParams {
  page?: number;
  limit?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  entityType?: string;
  action?: ActionType;
  startDate?: string;
  endDate?: string;
  createdBy?: string;
}

// Response için tip tanımı
interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  message?: string;
}

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