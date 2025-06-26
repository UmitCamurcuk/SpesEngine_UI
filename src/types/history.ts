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
  comment?: string;
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
export interface ApiResponse<T> {
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