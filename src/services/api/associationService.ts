import api from './config';
import { IRelationship, IAssociation } from '../../types/association';

const RELATIONSHIP_URL = '/associations';
const ASSOCIATION_URL = '/associations';

const associationService = {
  // İlişki Tipleri API
  
  // Tüm association'ları getir
  getAllAssociations: async (): Promise<IAssociation[]> => {
    const response = await api.get(ASSOCIATION_URL);
    return response.data.data || response.data;
  },
  
  // ID'ye göre association'ı getir
  getAssociationById: async (id: string): Promise<IAssociation> => {
    const response = await api.get(`${ASSOCIATION_URL}/${id}`);
    return response.data.data || response.data;
  },
  
  // Yeni association oluştur
  createAssociation: async (data: Partial<IAssociation>): Promise<IAssociation> => {
    const response = await api.post(ASSOCIATION_URL, data);
    return response.data.data || response.data;
  },
  
  // Association'ı güncelle
  updateAssociation: async (id: string, data: Partial<IAssociation>): Promise<IAssociation> => {
    const response = await api.put(`${ASSOCIATION_URL}/${id}`, data);
    return response.data.data || response.data;
  },
  
  // Association'ı sil
  deleteAssociation: async (id: string): Promise<void> => {
    await api.delete(`${ASSOCIATION_URL}/${id}`);
  },
  
  // İlişkiler API
  
  // ID'ye göre ilişkiyi getir
  getRelationshipById: async (id: string): Promise<IRelationship> => {
    const response = await api.get(`${RELATIONSHIP_URL}/${id}`);
    return response.data;
  },
  
  // Varlık için ilişkileri getir
  getRelationshipsByEntity: async (
    entityType: string,
    entityId: string,
    role: 'source' | 'target' | 'any' = 'any'
  ): Promise<IRelationship[]> => {
    const response = await api.get(
      `${RELATIONSHIP_URL}/entities/${entityType}/${entityId}?role=${role}`
    );
    return response.data;
  },
  
  // İlişki tipine göre ilişkileri getir
  getRelationshipsByType: async (typeId: string): Promise<IRelationship[]> => {
    const response = await api.get(`${RELATIONSHIP_URL}/by-type/${typeId}`);
    return response.data;
  },
  
  // Yeni ilişki oluştur
  createRelationship: async (data: Partial<IRelationship>): Promise<IRelationship> => {
    const response = await api.post(RELATIONSHIP_URL, data);
    return response.data;
  },
  
  // İlişkiyi güncelle
  updateRelationship: async (id: string, data: Partial<IRelationship>): Promise<IRelationship> => {
    const response = await api.put(`${RELATIONSHIP_URL}/${id}`, data);
    return response.data;
  },
  
  // İlişkiyi sil
  deleteRelationship: async (id: string): Promise<void> => {
    await api.delete(`${RELATIONSHIP_URL}/${id}`);
  },
  
  // İlişki durumunu değiştir
  changeRelationshipStatus: async (
    id: string,
    status: 'active' | 'inactive' | 'pending' | 'archived'
  ): Promise<IRelationship> => {
    const response = await api.patch(`${RELATIONSHIP_URL}/${id}/status`, { status });
    return response.data;
  }
};

export default associationService; 