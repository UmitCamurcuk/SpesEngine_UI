import api from './config';

export interface PermissionGroup {
  _id: string;
  name: string;
  description: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePermissionGroupDto {
  name: string;
  description: string;
  code: string;
  isActive?: boolean;
}

export interface UpdatePermissionGroupDto {
  name?: string;
  description?: string;
  code?: string;
  isActive?: boolean;
}

export interface PermissionGroupListParams {
  page?: number;
  limit?: number;
  search?: string;
}

const permissionGroupService = {
  /**
   * İzin gruplarını getir
   */
  getPermissionGroups: async (params?: PermissionGroupListParams): Promise<{
    permissionGroups: PermissionGroup[];
    total: number;
    pagination: {
      currentPage: number;
      totalPages: number;
    };
  }> => {
    const response = await api.get('/permissionGroups', { params });
    return {
      permissionGroups: response.data.permissionGroups,
      total: response.data.total,
      pagination: response.data.pagination
    };
  },

  /**
   * Belirli bir izin grubunu ID'ye göre getir
   */
  getPermissionGroupById: async (id: string): Promise<PermissionGroup> => {
    const response = await api.get(`/permissionGroups/${id}`);
    return response.data.permissionGroup;
  },

  /**
   * Yeni bir izin grubu oluştur
   */
  createPermissionGroup: async (permissionGroupData: CreatePermissionGroupDto): Promise<PermissionGroup> => {
    const response = await api.post('/permissionGroups', permissionGroupData);
    return response.data.permissionGroup;
  },

  /**
   * Bir izin grubunu güncelle
   */
  updatePermissionGroup: async (id: string, updateData: UpdatePermissionGroupDto): Promise<PermissionGroup> => {
    const response = await api.put(`/permissionGroups/${id}`, updateData);
    return response.data.permissionGroup;
  },

  /**
   * Bir izin grubunu sil
   */
  deletePermissionGroup: async (id: string): Promise<void> => {
    await api.delete(`/permissionGroups/${id}`);
  }
};

export default permissionGroupService; 