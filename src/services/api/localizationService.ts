import api from './config';
import { API_URL } from '../../constants/apiConfig';

// Çeviri API'leri için service
const localizationService = {
  // Belirli bir dil için tüm çevirileri getir
  getTranslations: async (lang: string) => {
    try {
      console.log(`[localizationService] ${lang} dili için çeviriler isteniyor`);
      
      const requestUrl = `${API_URL}/localizations/${lang}`;
      console.log(`[localizationService] İstek URL: ${requestUrl}`);
      
      // Ortak API yapılandırmasını kullan
      const response = await api.get(requestUrl, {
        withCredentials: true
      });
      
      console.log(`[localizationService] Çeviriler başarıyla alındı. Durum kodu: ${response.status}`);
      console.log(`[localizationService] Çeviri verisi:`, response.data);
      
      return response.data;
    } catch (error) {
      console.error('[localizationService] Çeviriler getirilirken hata oluştu:', error);
      throw error;
    }
  },
  
  // Desteklenen dilleri getir
  getSupportedLanguages: async () => {
    try {
      console.log('[localizationService] Desteklenen diller isteniyor');
      
      const response = await api.get(`${API_URL}/localizations/languages`, {
        withCredentials: true
      });
      
      console.log('[localizationService] Desteklenen diller alındı:', response.data);
      return response.data;
    } catch (error) {
      console.error('[localizationService] Desteklenen diller getirilirken hata oluştu:', error);
      throw error;
    }
  },
  
  // Çeviri ekle/güncelle (admin için)
  upsertTranslation: async (data: { key: string, namespace?: string, translations: Record<string, string> }) => {
    try {
      console.log('[localizationService] Çeviri ekleniyor/güncelleniyor:', data);
      
      const response = await api.post(`${API_URL}/localizations`, data, {
        withCredentials: true
      });
      
      console.log('[localizationService] Çeviri başarıyla eklendi/güncellendi:', response.data);
      return response.data;
    } catch (error) {
      console.error('[localizationService] Çeviri eklenirken/güncellenirken hata oluştu:', error);
      throw error;
    }
  }
};

export default localizationService; 