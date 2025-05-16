export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[] | { _id: string; name: string; code: string }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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