import { ISystemSettings } from './api/systemSettingsService';

class ThemeService {
  private updateCSSVariables(primaryColor: string, accentColor: string) {
    const root = document.documentElement;
    
    // Ana renk
    root.style.setProperty('--primary-light', primaryColor);
    
    // Primary dark - ana renkten %20 daha koyu
    const primaryDark = this.darkenColor(primaryColor, 0.8);
    root.style.setProperty('--primary-dark', primaryDark);
    
    // Primary lighter - ana renkten %15 daha açık
    const primaryLighter = this.lightenColor(primaryColor, 1.15);
    root.style.setProperty('--primary-lighter', primaryLighter);
    
    // Primary hover - ana renkten %10 daha koyu
    const primaryHover = this.darkenColor(primaryColor, 0.9);
    root.style.setProperty('--primary-hover', primaryHover);
    
    // Primary active - ana renkten %30 daha koyu
    const primaryActive = this.darkenColor(primaryColor, 0.7);
    root.style.setProperty('--primary-active', primaryActive);
    
    // Aksan rengi
    root.style.setProperty('--accent-light', accentColor);
    
    // Accent dark - aksan renkten %20 daha koyu
    const accentDark = this.darkenColor(accentColor, 0.8);
    root.style.setProperty('--accent-dark', accentDark);
    
    // Accent lighter - aksan renkten %15 daha açık
    const accentLighter = this.lightenColor(accentColor, 1.15);
    root.style.setProperty('--accent-lighter', accentLighter);
    
    // Accent hover - aksan renkten %10 daha koyu
    const accentHover = this.darkenColor(accentColor, 0.9);
    root.style.setProperty('--accent-hover', accentHover);
    
    // Accent active - aksan renkten %30 daha koyu
    const accentActive = this.darkenColor(accentColor, 0.7);
    root.style.setProperty('--accent-active', accentActive);
    
    // Renk skala değerlerini hesapla ve uygula (50-950 arası Tailwind benzeri)
    this.calculateAndApplyColorScale(primaryColor, 'primary');
    this.calculateAndApplyColorScale(accentColor, 'accent');
  }
  
  private calculateAndApplyColorScale(baseColor: string, prefix: 'primary' | 'accent') {
    const root = document.documentElement;
    const isDark = document.documentElement.classList.contains('dark');
    
    if (isDark) {
      // Karanlık tema için farklı skala hesaplama (koyu arka plan için daha açık renkler)
      root.style.setProperty(`--${prefix}-50`, this.darkenColor(baseColor, 0.15));
      root.style.setProperty(`--${prefix}-100`, this.darkenColor(baseColor, 0.3));
      root.style.setProperty(`--${prefix}-200`, this.darkenColor(baseColor, 0.45));
      root.style.setProperty(`--${prefix}-300`, this.darkenColor(baseColor, 0.6));
      root.style.setProperty(`--${prefix}-400`, this.darkenColor(baseColor, 0.75));
      root.style.setProperty(`--${prefix}-500`, baseColor);
      root.style.setProperty(`--${prefix}-600`, this.lightenColor(baseColor, 1.3));
      root.style.setProperty(`--${prefix}-700`, this.lightenColor(baseColor, 1.6));
      root.style.setProperty(`--${prefix}-800`, this.lightenColor(baseColor, 1.8));
      root.style.setProperty(`--${prefix}-900`, this.lightenColor(baseColor, 2.1));
      root.style.setProperty(`--${prefix}-950`, this.lightenColor(baseColor, 2.3));
    } else {
      // Aydınlık tema için normal skala
      root.style.setProperty(`--${prefix}-50`, this.lightenColor(baseColor, 2.3));
      root.style.setProperty(`--${prefix}-100`, this.lightenColor(baseColor, 2.1));
      root.style.setProperty(`--${prefix}-200`, this.lightenColor(baseColor, 1.8));
      root.style.setProperty(`--${prefix}-300`, this.lightenColor(baseColor, 1.6));
      root.style.setProperty(`--${prefix}-400`, this.lightenColor(baseColor, 1.3));
      root.style.setProperty(`--${prefix}-500`, baseColor);
      root.style.setProperty(`--${prefix}-600`, this.darkenColor(baseColor, 0.75));
      root.style.setProperty(`--${prefix}-700`, this.darkenColor(baseColor, 0.6));
      root.style.setProperty(`--${prefix}-800`, this.darkenColor(baseColor, 0.45));
      root.style.setProperty(`--${prefix}-900`, this.darkenColor(baseColor, 0.3));
      root.style.setProperty(`--${prefix}-950`, this.darkenColor(baseColor, 0.15));
    }
  }
  
  private applyBackgroundColor(backgroundColor: string, mode: string) {
    const root = document.documentElement;
    
    // Custom mode ise doğrudan arkaplan rengini uygula
    if (mode === 'custom') {
      root.style.setProperty('--background-light', backgroundColor);
      root.style.setProperty('--background-dark', this.darkenColor(backgroundColor, 0.95));
      
      // Body'e doğrudan stil uygula
      document.body.style.backgroundColor = backgroundColor;
      
      console.log('Custom arkaplan rengi uygulandı:', backgroundColor);
    } else {
      // Diğer modlarda varsayılan arkaplan renklerini kullan
      root.style.removeProperty('--background-light');
      root.style.removeProperty('--background-dark');
      document.body.style.removeProperty('backgroundColor');
    }
    
    // Renk değişikliklerini zorla uygula
    this.forceStyleUpdate();
  }

  // CSS sınıfları kullanarak tema uygulama
  private applyThemeClass(themeId: string) {
    const root = document.documentElement;
    const validThemes = ['default', 'greenish', 'blueish', 'redish', 'dark', 'emerald', 'purple', 'navy', 'teal', 'slate'];
    
    // Önce tüm tema sınıflarını temizle
    validThemes.forEach(theme => {
      root.classList.remove(`theme-${theme}`);
    });
    
    // Geçerli bir tema ise, sınıfı ekle
    if (validThemes.includes(themeId)) {
      root.classList.add(`theme-${themeId}`);
      console.log(`Tema sınıfı uygulandı: theme-${themeId}`);
    } else {
      // Geçerli tema değilse varsayılan temayı uygula
      root.classList.add('theme-default');
      console.warn(`Geçersiz tema ID: ${themeId}, varsayılan tema uygulandı.`);
    }
    
    // Renk değişikliklerini zorla uygula
    this.forceStyleUpdate();
  }
  
  applyTheme(theme: Partial<ISystemSettings['theme']>) {
    try {
      // Karanlık mod durumunu ayarla
      const isDark = theme.mode === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
      
      // CSS sınıfı yaklaşımını kullanarak tema renk şemasını uygula
      if (theme.themeName) {
        // themeName mevcutsa, CSS sınıfı yaklaşımını kullan
        this.applyThemeClass(theme.themeName);
      } else if (theme.primaryColor && theme.accentColor) {
        // Presets içinde olup olmadığını kontrol et
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
        
        // Renklere göre uygun tema presetini bul
        const preset = themePresets.find(p => 
          p.primaryColor === theme.primaryColor && 
          p.accentColor === theme.accentColor
        );
        
        if (preset) {
          // Eşleşen preset bulundu, CSS sınıfını uygula
          this.applyThemeClass(preset.id);
        } else {
          // Eşleşen preset bulunamadı, CSS değişkenlerini doğrudan uygula
          this.updateCSSVariables(theme.primaryColor, theme.accentColor);
          console.log('Özel renk kombinasyonu uygulandı.');
        }
      } else {
        console.warn('Tema renkleri eksik:', theme);
      }
      
      // Arkaplan rengini custom mod için uygula
      if (theme.backgroundColor && theme.mode === 'custom') {
        this.applyBackgroundColor(theme.backgroundColor, theme.mode);
      }
    } catch (error) {
      console.error('Tema uygulanırken hata:', error);
    }
  }
  
  // Yardımcı metotlar
  private lightenColor(color: string, factor: number): string {
    const hex = color.replace('#', '');
    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);
    
    r = Math.min(255, Math.round(r * factor));
    g = Math.min(255, Math.round(g * factor));
    b = Math.min(255, Math.round(b * factor));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  private darkenColor(color: string, factor: number): string {
    const hex = color.replace('#', '');
    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);
    
    r = Math.round(r * factor);
    g = Math.round(g * factor);
    b = Math.round(b * factor);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  private forceStyleUpdate() {
    // Stil güncellemesini zorlamak için gereksiz bir stil değişikliği yapabiliriz
    document.body.style.zoom = '100.00001%';
    setTimeout(() => {
      document.body.style.zoom = '100%';
    }, 10);
  }
}

export default new ThemeService(); 