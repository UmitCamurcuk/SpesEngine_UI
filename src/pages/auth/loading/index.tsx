import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch } from '../../../redux/store';
import systemSettingsService from '../../../services/api/systemSettingsService';
import { TokenService } from '../../../services/auth/tokenService';

const LoadingPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loadingStep, setLoadingStep] = useState(1);
  const [loadingText, setLoadingText] = useState('Giriş yapıldı');

  useEffect(() => {
    const initializeSystem = async () => {
      // Token kontrolü
      if (!TokenService.hasValidTokens()) {
        navigate('/auth/login');
        return;
      }

      // Adım 1: Giriş yapıldı mesajı
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Adım 2: Sistem ayarları yükleniyor
      setLoadingStep(2);
      setLoadingText('Sistem ayarları yükleniyor');
      
      try {
        const settings = await systemSettingsService.getSettings();
        console.log('Yüklenen sistem ayarları:', settings);
        
        // Tema ayarlarını güvenli bir şekilde kaydet
        const defaultTheme = {
          primaryColor: '#1f6feb',
          accentColor: '#f97316',
          mode: 'light',
          enableDarkMode: true,
          defaultDarkMode: false,
          enableCustomFonts: false,
          customFont: 'Inter',
          customLogoUrl: '',
          enableCustomStyles: false,
          customCSS: '',
          showLogo: true,
          showUserAvatar: true,
          menuStyle: 'side'
        };

        // Mevcut tema ayarlarını al veya varsayılan temayı kullan
        const currentTheme = settings?.theme || defaultTheme;
        
        // Sistem ayarlarını localStorage'a kaydet
        localStorage.setItem('systemSettings', JSON.stringify(settings));
        console.log('localStorage\'a kaydedilen sistem ayarları:', settings);
        
        // Tema ayarlarını ayrıca kaydet
        localStorage.setItem('themeSettings', JSON.stringify(currentTheme));

        // Adım 3: Yönlendirme
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate('/');
      } catch (error) {
        console.error('Sistem ayarları yüklenirken hata:', error);
        
        // Hata durumunda mevcut localStorage'daki tema ayarlarını koru
        const savedThemeSettings = localStorage.getItem('themeSettings');
        if (!savedThemeSettings) {
          // Eğer localStorage'da tema ayarları yoksa varsayılan temayı kullan
          const defaultTheme = {
            primaryColor: '#1f6feb',
            accentColor: '#f97316',
            mode: 'light',
            enableDarkMode: true,
            defaultDarkMode: false,
            enableCustomFonts: false,
            customFont: 'Inter',
            customLogoUrl: '',
            enableCustomStyles: false,
            customCSS: '',
            showLogo: true,
            showUserAvatar: true,
            menuStyle: 'side'
          };
          
          localStorage.setItem('themeSettings', JSON.stringify(defaultTheme));
        }
        
        setLoadingText('Hata oluştu, yönlendiriliyorsunuz...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        navigate('/');
      }
    };

    initializeSystem();
  }, [navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-semibold text-white mb-4"
        >
          {loadingText}
        </motion.h2>
        
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: loadingStep === 1 ? "50%" : "100%" }}
          transition={{ duration: 0.5 }}
          className="h-1 bg-white rounded-full mx-auto max-w-xs"
        />
      </div>
    </div>
  );
};

export default LoadingPage; 