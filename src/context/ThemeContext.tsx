import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';

// Light ve dark tema için varsayılan değerler
const lightTheme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#10b981',
    background: '#f9fafb',
    card: '#ffffff',
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
    },
    border: '#e5e7eb',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
};

const darkTheme = {
  colors: {
    primary: '#60a5fa',
    secondary: '#34d399',
    background: '#111827',
    card: '#1f2937',
    text: {
      primary: '#f9fafb',
      secondary: '#9ca3af',
    },
    border: '#374151',
    error: '#f87171',
    success: '#34d399',
    warning: '#fbbf24',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
  },
};

type Theme = typeof lightTheme;
type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  themeType: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [themeType, setThemeType] = useState<ThemeType>('light');
  const [theme, setTheme] = useState<Theme>(lightTheme);

  useEffect(() => {
    // Sistem tercihini kontrol et veya localStorage'dan oku
    const savedTheme = localStorage.getItem('theme') as ThemeType | null;
    
    if (savedTheme) {
      setThemeType(savedTheme);
      setTheme(savedTheme === 'light' ? lightTheme : darkTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeType('dark');
      setTheme(darkTheme);
    }
    
    // Tema değiştiğinde body sınıfını güncelle
    document.documentElement.classList.toggle('dark', themeType === 'dark');
  }, [themeType]);

  const toggleTheme = () => {
    const newThemeType = themeType === 'light' ? 'dark' : 'light';
    setThemeType(newThemeType);
    setTheme(newThemeType === 'light' ? lightTheme : darkTheme);
    localStorage.setItem('theme', newThemeType);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeType, toggleTheme }}>
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