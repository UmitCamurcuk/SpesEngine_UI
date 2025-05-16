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