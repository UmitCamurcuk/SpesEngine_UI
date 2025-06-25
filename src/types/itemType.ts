import { Attribute } from './attribute';

// API parametreleri
export interface ItemTypeApiParams {
  page?: number;
  limit?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  search?: string;
  isActive?: boolean;
  [key: string]: any;
}

// ItemType modeli
export interface ItemType {
  _id: string;
  name: string;
  code: string;
  description: string;
  category?: string;
  attributeGroups?: string[];
  attributes?: Attribute[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Response için tip tanımı
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
}

// Yeni ItemType için tip tanımı
export interface CreateItemTypeDto {
  name: string;
  code: string;
  description: string;
  category?: string;
  attributeGroups?: string[];
  attributes?: string[];
  isActive?: boolean;
} 