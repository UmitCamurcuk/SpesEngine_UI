export interface Permission {
  _id: string;
  name: {
    tr: string;
    en: string;
  };
  description: {
    tr: string;
    en: string;
  };
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePermissionDto {
  name: {
    tr: string;
    en: string;
  };
  description: {
    tr: string;
    en: string;
  };
  code: string;
  isActive?: boolean;
}

export interface UpdatePermissionDto {
  name?: {
    tr: string;
    en: string;
  };
  description?: {
    tr: string;
    en: string;
  };
  code?: string;
  isActive?: boolean;
  comment?: string;
}

export interface PermissionListParams {
  page?: number;
  limit?: number;
  search?: string;
} 