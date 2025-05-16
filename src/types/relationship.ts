export interface IRelationshipType {
  _id: string;
  code: string;
  name: string;
  description?: string;
  isDirectional: boolean;
  allowedSourceTypes: string[];
  allowedTargetTypes: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRelationship {
  _id: string;
  relationshipTypeId: string;
  relationshipType?: IRelationshipType;
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