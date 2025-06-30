# SpesEngine Icon System

Bu sistem, SpesEngine uygulamasında kullanılan tüm iconları merkezi bir şekilde yönetmek için tasarlanmıştır.

## Yapı

```
icons/
  ├── entity/              # Entity-specific icons
  │   ├── types.ts         # Common types
  │   ├── AttributeIcon.tsx
  │   ├── CategoryIcon.tsx
  │   └── ...
  ├── sizes.ts            # Icon size definitions
  ├── colors.ts           # Icon color schemes
  └── index.ts           # Main export file
```

## Kullanım

```tsx
import { AttributeIcon } from '@/components/icons';

// Basit kullanım (varsayılan boyut ve renk)
<AttributeIcon />

// Özel boyut ve renk ile
<AttributeIcon size="lg" color="primary" />

// Özel className ile
<AttributeIcon className="rotate-45" />
```

## Özellikler

### Boyutlar
- xs: 16x16px (w-4 h-4)
- sm: 20x20px (w-5 h-5)
- md: 24x24px (w-6 h-6)
- lg: 32x32px (w-8 h-8)
- xl: 40x40px (w-10 h-10)

### Renkler
- primary: Mavi tonları
- secondary: Gri tonları
- success: Yeşil tonları
- warning: Sarı tonları
- danger: Kırmızı tonları

## Yeni Icon Ekleme

1. `entity` klasöründe yeni bir component dosyası oluşturun
2. `EntityIconProps` interface'ini kullanın
3. SVG içeriğini ekleyin
4. `entity/index.ts` dosyasında export edin

## Örnek Kod

```tsx
import { EntityIconProps } from './types';
import { IconSizes } from '../sizes';
import { IconColors } from '../colors';

export const NewIcon: React.FC<EntityIconProps> = ({ 
  size = 'sm',
  color = 'secondary',
  className = ''
}) => {
  return (
    <svg 
      className={`${IconSizes[size]} ${IconColors[color]} ${className}`}
      fill="currentColor" 
      viewBox="0 0 20 20" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* SVG path here */}
    </svg>
  );
};
``` 