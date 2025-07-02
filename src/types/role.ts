import { Permission } from './permission';

export interface RolePermissionGroup {
  permissionGroup: {
    _id: string;
    name: string | { tr: string; en: string };
    code: string;
    description?: string;
  };
  permissions: {
    permission: Permission;
    granted: boolean;
    _id: string;
  }[];
  _id: string;
}

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[] | { _id: string; name: string; code: string }[];
  permissionGroups: RolePermissionGroup[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  history?: HistoryEntry[];
}

export interface HistoryEntry {
  _id: string;
  action: string;
  changedBy: string;
  changedAt: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface CreateRoleDto {
  name: string;
  description: string;
  permissions: string[];
  isActive?: boolean;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface RoleListParams {
  page?: number;
  limit?: number;
  search?: string;
} 