import axios from 'axios';
import { API_URL } from '../../constants/apiConfig';

// Çeviri API'leri için service
const localizationService = {
  // Belirli bir dil için tüm çevirileri getir
  getTranslations: async (lang: string) => {
    try {
      console.log(`[localizationService] ${lang} dili için çeviriler isteniyor`);
      const token = localStorage.getItem('accessToken');
      console.log(`[localizationService] Token durumu:`, token ? 'Token var' : 'Token yok');
      
      const requestUrl = `${API_URL}/localizations/${lang}`;
      console.log(`[localizationService] İstek URL: ${requestUrl}`);
      
      const response = await axios.get(requestUrl, {
        headers: {
          'Accept-Language': lang,
          'Authorization': token ? `Bearer ${token}` : ''
        },
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
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.get(`${API_URL}/localizations/languages`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
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
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.post(`${API_URL}/localizations`, data, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
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