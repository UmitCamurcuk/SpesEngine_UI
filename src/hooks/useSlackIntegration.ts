import { useState, useEffect } from 'react';
import systemSettingsService from '../services/api/systemSettingsService';

export const useSlackIntegration = () => {
  const [isSlackEnabled, setIsSlackEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSlackIntegration = async () => {
      try {
        const settings = await systemSettingsService.getSettings();
        setIsSlackEnabled(!!(settings.integrations?.slack?.enabled && settings.integrations?.slack?.webhookUrl && settings.integrations.slack.webhookUrl.trim().length > 0));
      } catch (error) {
        console.error('Slack entegrasyonu kontrol edilirken hata:', error);
        setIsSlackEnabled(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSlackIntegration();
  }, []);

  return { isSlackEnabled, isLoading };
}; 