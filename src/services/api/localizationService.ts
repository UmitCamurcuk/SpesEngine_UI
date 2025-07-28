import api from './config';
import { API_URL } from '../../constants/apiConfig';

// Çeviri API'leri için service
const localizationService = {
  // Belirli bir dil için tüm çevirileri getir
  getTranslations: async (lang: string) => {
    try {
      
      const requestUrl = `${API_URL}/localizations/${lang}`;
      
      // Ortak API yapılandırmasını kullan
      const response = await api.get(requestUrl, {
        withCredentials: true
      });
      
      
      return response.data;
    } catch (error) {
      console.error('[localizationService] Çeviriler getirilirken hata oluştu:', error);
      throw error;
    }
  },
  
  // Desteklenen dilleri getir
  getSupportedLanguages: async () => {
    try {
      
      const response = await api.get(`${API_URL}/localizations/languages`, {
        withCredentials: true
      });
      
      return response.data;
    } catch (error) {
      console.error('[localizationService] Desteklenen diller getirilirken hata oluştu:', error);
      throw error;
    }
  },
  
  // Çeviri ekle/güncelle (admin için)
  upsertTranslation: async (data: { key: string, namespace?: string, translations: Record<string, string> }) => {
    try {
      
      const response = await api.post(`${API_URL}/localizations`, data, {
        withCredentials: true
      });
      
      return response.data;
    } catch (error) {
      console.error('[localizationService] Çeviri eklenirken/güncellenirken hata oluştu:', error);
      throw error;
    }
  },
  
  // Yeni çeviri oluştur (create sayfası için)
  createTranslation: async (formData: { key: string, namespace: string, translations: Record<string, string> }) => {
    try {
      // upsertTranslation metodunu kullan
      const response = await localizationService.upsertTranslation({
        key: formData.key,
        namespace: formData.namespace,
        translations: formData.translations
      });
      
      return response;
    } catch (error) {
      console.error('[localizationService] Yeni çeviri oluşturulurken hata oluştu:', error);
      throw error;
    }
  },

  // ID'ye göre çeviri getir
  getTranslationById: async (id: string) => {
    try {
      const response = await api.get(`${API_URL}/localizations/details/${id}`, {
        withCredentials: true
      });
      
      return response.data;
    } catch (error) {
      console.error('[localizationService] Çeviri getirilirken hata oluştu:', error);
      throw error;
    }
  },

  // ID'ye göre çeviri güncelle
  updateTranslationById: async (id: string, data: { key?: string, namespace?: string, translations?: Record<string, string> }) => {
    try {
      const response = await api.put(`${API_URL}/localizations/details/${id}`, data, {
        withCredentials: true
      });
      
      return response.data;
    } catch (error) {
      console.error('[localizationService] Çeviri güncellenirken hata oluştu:', error);
      throw error;
    }
  },

  // Tüm çevirileri getir (liste sayfası için)
  getLocalizations: async (params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    namespace?: string;
    key?: string;
    translationValue?: string;
    language?: string;
    sortBy?: string; 
    sortOrder?: 'asc' | 'desc' 
  }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.namespace) queryParams.append('namespace', params.namespace);
      if (params?.key) queryParams.append('key', params.key);
      if (params?.translationValue) queryParams.append('translationValue', params.translationValue);
      if (params?.language) queryParams.append('language', params.language);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      console.log('🔍 getLocalizations API call with params:', params);
      console.log('🔍 Query string:', queryParams.toString());
      
      const response = await api.get(`${API_URL}/localizations?${queryParams.toString()}`, {
        withCredentials: true
      });
      
      return response.data;
    } catch (error) {
      console.error('[localizationService] Çeviriler listesi getirilirken hata oluştu:', error);
      throw error;
    }
  },

  // Çeviri sil
  deleteLocalization: async (id: string) => {
    try {
      const response = await api.delete(`${API_URL}/localizations/details/${id}`, {
        withCredentials: true
      });
      
      return response.data;
    } catch (error) {
      console.error('[localizationService] Çeviri silinirken hata oluştu:', error);
      throw error;
    }
  }
};

export default localizationService; 