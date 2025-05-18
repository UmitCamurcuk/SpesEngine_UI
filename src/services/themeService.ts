import { ISystemSettings } from './api/systemSettingsService';

class ThemeService {
  private updateCSSVariables(primaryColor: string, accentColor: string) {
    const root = document.documentElement;
    
    // Ana renk varyasyonları
    root.style.setProperty('--primary-light', primaryColor);
    root.style.setProperty('--primary-dark', this.adjustColor(primaryColor, -20));
    root.style.setProperty('--primary-lighter', this.adjustColor(primaryColor, 20));
    
    // Aksan renk varyasyonları
    root.style.setProperty('--accent-light', accentColor);
    root.style.setProperty('--accent-dark', this.adjustColor(accentColor, -20));
    root.style.setProperty('--accent-lighter', this.adjustColor(accentColor, 20));

    // Hover ve active durumları
    root.style.setProperty('--primary-hover', this.adjustColor(primaryColor, -10));
    root.style.setProperty('--primary-active', this.adjustColor(primaryColor, -30));
    root.style.setProperty('--accent-hover', this.adjustColor(accentColor, -10));
    root.style.setProperty('--accent-active', this.adjustColor(accentColor, -30));

    // Tailwind sınıfları için özel değişkenler
    root.style.setProperty('--tw-primary', primaryColor);
    root.style.setProperty('--tw-accent', accentColor);

    // Renk değişikliklerini zorla uygula
    this.forceStyleUpdate();
  }

  private adjustColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    
    r = Math.min(Math.max(0, r), 255);
    g = Math.min(Math.max(0, g), 255);
    b = Math.min(Math.max(0, b), 255);
    
    return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')}`;
  }

  private forceStyleUpdate() {
    // Tailwind'in stil önbelleğini temizle
    const style = document.createElement('style');
    style.textContent = ' ';
    document.head.appendChild(style);
    requestAnimationFrame(() => {
      document.head.removeChild(style);
    });
  }

  applyTheme(theme: Partial<ISystemSettings['theme']>) {
    try {
      if (theme.primaryColor && theme.accentColor) {
        this.updateCSSVariables(theme.primaryColor, theme.accentColor);
      } else {
        console.warn('Tema renkleri eksik:', theme);
        
        // LocalStorage'dan renkleri almayı dene
        const savedThemeColors = localStorage.getItem('themeColors');
        if (savedThemeColors) {
          const colors = JSON.parse(savedThemeColors);
          console.log('LocalStorage\'dan yüklenen renkler:', colors);
          this.updateCSSVariables(colors.primaryColor, colors.accentColor);
        }
      }

      // Karanlık mod ayarları
      const shouldBeDark = 
        theme.mode === 'dark' || 
        (theme.mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ||
        theme.defaultDarkMode;

      document.documentElement.classList.toggle('dark', shouldBeDark);
    } catch (error) {
      console.error('Tema uygulama hatası:', error);
    }
  }
}

export default new ThemeService(); 