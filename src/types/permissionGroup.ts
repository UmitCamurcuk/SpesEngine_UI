import { Permission } from './permission';

export interface PermissionGroup {
  _id: string;
  name: string;
  description: string;
  code: string;
  permissions: Permission[] | string[];
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
  permissions?: string[];
  isActive?: boolean;
  comment?: string;
}

export interface PermissionGroupListParams {
  page?: number;
  limit?: number;
  search?: string;
} 