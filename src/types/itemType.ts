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

// Notification Settings
export interface NotificationSettings {
  onUpdate?: boolean;
  onDelete?: boolean;
  onUsedInCategory?: boolean;
  onUsedInFamily?: boolean;
  onUsedInAttributeGroup?: boolean;
  onUsedInItemType?: boolean;
  onUsedInItem?: boolean;
}

// Notification Channels
export interface NotificationChannels {
  slack?: {
    enabled: boolean;
    webhook?: string;
    channel?: string;
  };
  email?: {
    enabled: boolean;
    recipients?: string[];
  };
  whatsapp?: {
    enabled: boolean;
    phoneNumbers?: string[];
  };
  teams?: {
    enabled: boolean;
    webhook?: string;
  };
}

// ItemType Settings
export interface ItemTypeSettings {
  notifications?: {
    settings?: NotificationSettings;
    channels?: NotificationChannels;
  };
  permissions?: {
    allowPublicAccess?: boolean;
    restrictedFields?: string[];
  };
  workflow?: {
    requireApproval?: boolean;
    autoPublish?: boolean;
  };
}

// ItemType modeli
export interface ItemType {
  _id: string;
  name: any; // Localization objesi olarak gelir
  code: string;
  description: any; // Localization objesi olarak gelir
  category?: any; // Category objesi olarak populate edilmiş
  attributeGroups?: any[]; // AttributeGroup objeleri olarak populate edilmiş
  attributes?: any[]; // Attribute objeleri olarak populate edilmiş
  settings?: ItemTypeSettings;
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
  isActive?: boolean;
} 