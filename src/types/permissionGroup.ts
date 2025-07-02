import { Permission } from './permission';

export interface PermissionGroup {
  _id: string;
  name: string;
  description: string;
  code: string;
  permissions: Permission[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
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
  permissions?: string[];
  isActive?: boolean;
  comment?: string;
}

export interface PermissionGroupListParams {
  page?: number;
  limit?: number;
  search?: string;
  includePermissions?: boolean;
}

export interface PermissionGroupResponse {
  success: boolean;
  permissionGroup: PermissionGroup;
  message?: string;
}

export interface PermissionGroupListResponse {
  success: boolean;
  count: number;
  total: number;
  pagination: {
    currentPage: number;
    totalPages: number;
  };
  permissionGroups: PermissionGroup[];
  message?: string;
} 