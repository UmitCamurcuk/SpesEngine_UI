import api from './config';
import { IRelationship, IRelationshipType } from '../../types/relationship';

const RELATIONSHIP_URL = '/relationships';
const RELATIONSHIP_TYPE_URL = '/relationship-types';

const relationshipService = {
  // İlişki Tipleri API
  
  // Tüm ilişki tiplerini getir
  getAllRelationshipTypes: async (): Promise<IRelationshipType[]> => {
    const response = await api.get(RELATIONSHIP_TYPE_URL);
    return response.data.data || response.data;
  },
  
  // ID'ye göre ilişki tipini getir
  getRelationshipTypeById: async (id: string): Promise<IRelationshipType> => {
    const response = await api.get(`${RELATIONSHIP_TYPE_URL}/${id}`);
    return response.data.data || response.data;
  },
  
  // Yeni ilişki tipi oluştur
  createRelationshipType: async (data: Partial<IRelationshipType>): Promise<IRelationshipType> => {
    const response = await api.post(RELATIONSHIP_TYPE_URL, data);
    return response.data;
  },
  
  // İlişki tipini güncelle
  updateRelationshipType: async (id: string, data: Partial<IRelationshipType>): Promise<IRelationshipType> => {
    const response = await api.put(`${RELATIONSHIP_TYPE_URL}/${id}`, data);
    return response.data;
  },
  
  // İlişki tipini sil
  deleteRelationshipType: async (id: string): Promise<void> => {
    await api.delete(`${RELATIONSHIP_TYPE_URL}/${id}`);
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

export default relationshipService; 