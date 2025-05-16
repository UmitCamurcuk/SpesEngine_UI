import api from './config';
import {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  RoleListParams
} from '../../types/role';

const roleService = {
  /**
   * Rolleri getir
   */
  getRoles: async (params?: RoleListParams): Promise<{
    roles: Role[];
    total: number;
    pagination: {
      currentPage: number;
      totalPages: number;
    };
  }> => {
    const response = await api.get('/roles', { params });
    return {
      roles: response.data.roles,
      total: response.data.total,
      pagination: response.data.pagination
    };
  },

  /**
   * Belirli bir rolü ID'ye göre getir
   */
  getRoleById: async (id: string): Promise<Role> => {
    const response = await api.get(`/roles/${id}`);
    return response.data.role;
  },

  /**
   * Yeni bir rol oluştur
   */
  createRole: async (roleData: CreateRoleDto): Promise<Role> => {
    const response = await api.post('/roles', roleData);
    return response.data.role;
  },

  /**
   * Bir rolü güncelle
   */
  updateRole: async (id: string, updateData: UpdateRoleDto): Promise<Role> => {
    const response = await api.put(`/roles/${id}`, updateData);
    return response.data.role;
  },

  /**
   * Bir rolü sil
   */
  deleteRole: async (id: string): Promise<void> => {
    await api.delete(`/roles/${id}`);
  }
};

export default roleService; 