import api from './config';

export interface Permission {
  _id: string;
  name: string;
  description: string;
  code: string;
  permissionGroup: string | { _id: string; name: string; code: string };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePermissionDto {
  name: string;
  description: string;
  code: string;
  permissionGroup: string;
  isActive?: boolean;
}

export interface UpdatePermissionDto {
  name?: string;
  description?: string;
  code?: string;
  permissionGroup?: string;
  isActive?: boolean;
}

export interface PermissionListParams {
  page?: number;
  limit?: number;
  search?: string;
}

const permissionService = {
  /**
   * İzinleri getir
   */
  getPermissions: async (params?: PermissionListParams): Promise<{
    permissions: Permission[];
    total: number;
    pagination: {
      currentPage: number;
      totalPages: number;
    };
  }> => {
    const response = await api.get('/permissions', { params });
    return {
      permissions: response.data.permissions,
      total: response.data.total,
      pagination: response.data.pagination
    };
  },

  /**
   * Belirli bir izni ID'ye göre getir
   */
  getPermissionById: async (id: string): Promise<Permission> => {
    const response = await api.get(`/permissions/${id}`);
    return response.data.permission;
  },

  /**
   * Yeni bir izin oluştur
   */
  createPermission: async (permissionData: CreatePermissionDto): Promise<Permission> => {
    const response = await api.post('/permissions', permissionData);
    return response.data.permission;
  },

  /**
   * Bir izni güncelle
   */
  updatePermission: async (id: string, updateData: UpdatePermissionDto): Promise<Permission> => {
    const response = await api.put(`/permissions/${id}`, updateData);
    return response.data.permission;
  },

  /**
   * Bir izni sil
   */
  deletePermission: async (id: string): Promise<void> => {
    await api.delete(`/permissions/${id}`);
  }
};

export default permissionService; 