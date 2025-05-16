export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[] | { _id: string; name: string; code: string }[];
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