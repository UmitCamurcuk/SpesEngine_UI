import api from './api';

interface User {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  roles?: string[];
}

const userService = {
  // Tüm kullanıcıları getir
  getUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
    try {
      const response = await api.get('/users', { params });
      return response.data;
    } catch (error: any) {
      throw error?.response?.data || error;
    }
  },

  // Belirli bir role atanmış kullanıcıları getir
  getUsersByRole: async (roleId: string) => {
    try {
      const response = await api.get(`/users/by-role/${roleId}`);
      return response.data;
    } catch (error: any) {
      throw error?.response?.data || error;
    }
  },

  // Belirli bir role atanmamış kullanıcıları getir
  getUsersNotInRole: async (roleId: string) => {
    try {
      const response = await api.get(`/users/not-in-role/${roleId}`);
      return response.data;
    } catch (error: any) {
      throw error?.response?.data || error;
    }
  },

  // Kullanıcıya rol ata
  assignRoleToUser: async (userId: string, roleId: string, comment?: string) => {
    try {
      const response = await api.post(`/users/${userId}/assign-role`, { 
        roleId,
        comment 
      });
      return response.data;
    } catch (error: any) {
      throw error?.response?.data || error;
    }
  },

  // Kullanıcıdan rol kaldır
  removeRoleFromUser: async (userId: string, roleId: string, comment?: string) => {
    try {
      const response = await api.delete(`/users/${userId}/remove-role/${roleId}`, {
        data: { comment }
      });
      return response.data;
    } catch (error: any) {
      throw error?.response?.data || error;
    }
  },

  // Belirli kullanıcıyı getir
  getUserById: async (id: string) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      throw error?.response?.data || error;
    }
  }
};

export default userService; 