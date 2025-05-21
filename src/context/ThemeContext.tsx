import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { useAppSelector } from '../redux/store';
import systemSettingsService, { ISystemSettings } from '../services/api/systemSettingsService';
import themeService from '../services/themeService';

type ThemeMode = 'light' | 'dark' | 'system' | 'custom';

interface ThemeColors {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  themeName?: string; // Hangi renk şeması seçildi bilgisi
}

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
  setColors: (colors: ThemeColors) => void;
  toggleTheme: () => void;
}

const defaultColors: ThemeColors = {
  primaryColor: '#1f6feb',
  accentColor: '#f97316',
  backgroundColor: '#ffffff',
  themeName: 'default'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  // LocalStorage'dan başlangıç değerlerini al
  const getInitialMode = (): ThemeMode => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode === 'light' || savedMode === 'dark') {
      return savedMode as ThemeMode;
    }
    // Varsayılan tarayıcı tercihi
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const getInitialColors = (): ThemeColors => {
    const savedColors = localStorage.getItem('themeColors');
    return savedColors ? JSON.parse(savedColors) : defaultColors;
  };

  const [mode, setMode] = useState<ThemeMode>(getInitialMode());
  const [isDark, setIsDark] = useState(false);
  const [colors, setColors] = useState<ThemeColors>(getInitialColors());
  const [isInitialized, setIsInitialized] = useState(false);

  // Sistem tercihini takip et
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      // Sadece tarayıcı tercihi değiştiğinde
      const isDarkMode = mediaQuery.matches;
      const newMode = isDarkMode ? 'dark' : 'light';
      
      // Kullanıcı tercihi henüz ayarlanmadıysa (ilk yükleme)
      const savedMode = localStorage.getItem('themeMode') as ThemeMode | null;
      if (!savedMode) {
        setMode(newMode);
        setIsDark(isDarkMode);
        document.documentElement.classList.toggle('dark', isDarkMode);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Auth durumu değiştiğinde tema ayarlarını yükle
  useEffect(() => {
    const loadThemeSettings = async () => {
      try {
        // Eğer kullanıcı giriş yapmışsa backend'den ayarları al
        if (isAuthenticated) {
          const settings = await systemSettingsService.getSettings();
          const themeSettings = settings.theme;

          // Backend'den gelen ayarları localStorage'a kaydet
          if (themeSettings.mode && (themeSettings.mode === 'light' || themeSettings.mode === 'dark')) {
            localStorage.setItem('themeMode', themeSettings.mode);
            setMode(themeSettings.mode as ThemeMode);
          } else {
            // Varsayılan tercih
            const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const defaultMode = prefersDarkMode ? 'dark' : 'light';
            setMode(defaultMode);
            localStorage.setItem('themeMode', defaultMode);
          }

          if (themeSettings.primaryColor && themeSettings.accentColor) {
            // Tema adını bul
            let themeName = 'default';
            const themePresets = [
              { id: 'default', primaryColor: '#1f6feb', accentColor: '#f97316' },
              { id: 'greenish', primaryColor: '#10b981', accentColor: '#6366f1' },
              { id: 'blueish', primaryColor: '#3b82f6', accentColor: '#ec4899' },
              { id: 'redish', primaryColor: '#ef4444', accentColor: '#8b5cf6' },
              { id: 'dark', primaryColor: '#6366f1', accentColor: '#ec4899' },
              { id: 'emerald', primaryColor: '#059669', accentColor: '#fbbf24' },
              { id: 'purple', primaryColor: '#7c3aed', accentColor: '#fb923c' },
              { id: 'navy', primaryColor: '#1e3a8a', accentColor: '#f43f5e' },
              { id: 'teal', primaryColor: '#0d9488', accentColor: '#e11d48' },
              { id: 'slate', primaryColor: '#475569', accentColor: '#f97316' }
            ];
            
            const foundTheme = themePresets.find(theme => 
              theme.primaryColor === themeSettings.primaryColor && 
              theme.accentColor === themeSettings.accentColor
            );
            
            if (foundTheme) {
              themeName = foundTheme.id;
            }
            
            const newColors = {
              primaryColor: themeSettings.primaryColor,
              accentColor: themeSettings.accentColor,
              backgroundColor: themeSettings.backgroundColor || '#ffffff',
              themeName
            };
            localStorage.setItem('themeColors', JSON.stringify(newColors));
            setColors(newColors);
          }

          // Karanlık mod durumunu belirle - navbar'da buton olmadığı için 
          // varsayılan olarak mode değerini kullan
          const isDarkMode = themeSettings.mode === 'dark';
          setIsDark(isDarkMode);
          document.documentElement.classList.toggle('dark', isDarkMode);
        } else {
          // Kullanıcı giriş yapmamışsa localStorage'dan yükle
          const savedMode = getInitialMode();
          const savedColors = getInitialColors();
          
          setMode(savedMode);
          setColors(savedColors);
          
          const isDarkMode = savedMode === 'dark';
          setIsDark(isDarkMode);
          document.documentElement.classList.toggle('dark', isDarkMode);
        }
      } catch (error) {
        console.error('Tema ayarları yüklenirken hata:', error);
        // Hata durumunda varsayılan değerleri kullan
        const savedMode = getInitialMode();
        const savedColors = getInitialColors();
        
        setMode(savedMode);
        setColors(savedColors);
      } finally {
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      loadThemeSettings();
    }
  }, [isAuthenticated, isInitialized]);

  // Mode değiştiğinde
  useEffect(() => {
    if (!isInitialized) return;

    localStorage.setItem('themeMode', mode);
    setIsDark(mode === 'dark');
    document.documentElement.classList.toggle('dark', mode === 'dark');

    // Tema servisini güncelle
    const savedSettings = localStorage.getItem('offlineSettings');
    let themeSettings: Partial<ISystemSettings['theme']> = {
      mode,
      primaryColor: colors.primaryColor,
      accentColor: colors.accentColor,
      backgroundColor: colors.backgroundColor,
      enableDarkMode: true,
      defaultDarkMode: mode === 'dark'
    };
    
    // LocalStorage'dan ek ayarları ekle
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.theme) {
          themeSettings = {
            ...themeSettings,
            enableCustomFonts: settings.theme.enableCustomFonts,
            customFont: settings.theme.customFont,
            enableCustomStyles: settings.theme.enableCustomStyles,
            customCSS: settings.theme.customCSS,
            showLogo: settings.theme.showLogo,
            showUserAvatar: settings.theme.showUserAvatar,
            menuStyle: settings.theme.menuStyle
          };
        }
      } catch (e) {
        console.error('LocalStorage tema ayarları okunamadı:', e);
      }
    }
    
    themeService.applyTheme(themeSettings);
  }, [colors, mode, isDark, isInitialized]);

  const toggleTheme = () => {
    const newMode = isDark ? 'light' : 'dark';
    setMode(newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, isDark, colors, setMode, setColors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 