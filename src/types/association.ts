export interface IDisplayColumnConfig {
  attributeId: string;
  attributeName?: string;
  attributeCode?: string;
  displayName: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  isRequired?: boolean;
  formatType?: 'text' | 'date' | 'number' | 'select' | 'table' | 'custom';
  customFormat?: string;
}

export interface IDisplayConfig {
  sourceToTarget?: {
    enabled: boolean;
    columns: IDisplayColumnConfig[];
    defaultSortBy?: string;
    defaultSortOrder?: 'asc' | 'desc';
    pageSize?: number;
    showSearch?: boolean;
    searchableColumns?: string[];
  };
  targetToSource?: {
    enabled: boolean;
    columns: IDisplayColumnConfig[];
    defaultSortBy?: string;
    defaultSortOrder?: 'asc' | 'desc';
    pageSize?: number;
    showSearch?: boolean;
    searchableColumns?: string[];
  };
}

export interface IAssociationFilterCriteria {
  allowedTargetCategories: string[];
  allowedTargetFamilies: string[];
  targetAttributeFilters: {
    attributeCode: string;
    operator: 'equals' | 'contains' | 'in' | 'range' | 'exists';
    value: any;
    description?: string;
  }[];
  allowedSourceCategories: string[];
  allowedSourceFamilies: string[];
  sourceAttributeFilters: {
    attributeCode: string;
    operator: 'equals' | 'contains' | 'in' | 'range' | 'exists';
    value: any;
    description?: string;
  }[];
}

export interface IAssociation {
  _id: string;
  code: string;
  name: string;
  description?: string;
  isDirectional: boolean;
  association?: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  allowedSourceTypes: string[];
  allowedTargetTypes: string[];
  filterCriteria?: IAssociationFilterCriteria;
  metadata?: Record<string, any>;
  displayConfig?: IDisplayConfig; // YENİ ALAN
  createdBy?: any;
  updatedBy?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRelationship {
  _id: string;
  associationId: string;
  association?: IAssociation;
  sourceEntityId: string;
  sourceEntityType: string;
  targetEntityId: string;
  targetEntityType: string;
  startDate?: Date;
  endDate?: Date;
  status: 'active' | 'inactive' | 'pending' | 'archived';
  priority?: number;
  attributes?: Record<string, any>;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
} 