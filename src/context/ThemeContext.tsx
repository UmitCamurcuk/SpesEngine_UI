import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { useAppSelector } from '../redux/store';
import systemSettingsService from '../services/api/systemSettingsService';
import themeService from '../services/themeService';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  primaryColor: string;
  accentColor: string;
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
  accentColor: '#f97316'
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
    return (savedMode as ThemeMode) || 'light';
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
      if (mode === 'system') {
        setIsDark(mediaQuery.matches);
        document.documentElement.classList.toggle('dark', mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  // Auth durumu değiştiğinde tema ayarlarını yükle
  useEffect(() => {
    const loadThemeSettings = async () => {
      try {
        // Eğer kullanıcı giriş yapmışsa backend'den ayarları al
        if (isAuthenticated) {
          const settings = await systemSettingsService.getSettings();
          const themeSettings = settings.theme;

          // Backend'den gelen ayarları localStorage'a kaydet
          if (themeSettings.mode) {
            localStorage.setItem('themeMode', themeSettings.mode);
            setMode(themeSettings.mode as ThemeMode);
          }

          if (themeSettings.primaryColor && themeSettings.accentColor) {
            const newColors = {
              primaryColor: themeSettings.primaryColor,
              accentColor: themeSettings.accentColor
            };
            localStorage.setItem('themeColors', JSON.stringify(newColors));
            setColors(newColors);
          }

          // Karanlık mod durumunu belirle
          const shouldBeDark = 
            themeSettings.mode === 'dark' || 
            (themeSettings.mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ||
            themeSettings.defaultDarkMode;

          setIsDark(shouldBeDark);
          document.documentElement.classList.toggle('dark', shouldBeDark);
        } else {
          // Kullanıcı giriş yapmamışsa localStorage'dan yükle
          const savedMode = getInitialMode();
          const savedColors = getInitialColors();
          
          setMode(savedMode);
          setColors(savedColors);
          
          const shouldBeDark = 
            savedMode === 'dark' || 
            (savedMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
          
          setIsDark(shouldBeDark);
          document.documentElement.classList.toggle('dark', shouldBeDark);
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

    const shouldBeDark = 
      mode === 'dark' || 
      (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);

    // Tema servisini güncelle
    themeService.applyTheme({
      mode,
      primaryColor: colors.primaryColor,
      accentColor: colors.accentColor,
      enableDarkMode: true,
      defaultDarkMode: shouldBeDark
    });
  }, [mode, colors, isInitialized]);

  // Renkler değiştiğinde
  useEffect(() => {
    if (!isInitialized) return;

    localStorage.setItem('themeColors', JSON.stringify(colors));
    
    // Tema servisini güncelle
    themeService.applyTheme({
      mode,
      primaryColor: colors.primaryColor,
      accentColor: colors.accentColor,
      enableDarkMode: true,
      defaultDarkMode: isDark
    });
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