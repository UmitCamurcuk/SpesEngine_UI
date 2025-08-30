# Attribute Display Components

Bu klasör, tüm attribute type'ları için display component'lerini içerir.

## Yapı

```
display/
├── DynamicDisplay/           # Her attribute type için ayrı dosyalar
│   ├── TextAttribute.tsx
│   ├── NumberAttribute.tsx
│   ├── BooleanAttribute.tsx
│   └── ... (30 attribute type)
├── index.tsx                 # Ana component ve switch case logic
└── README.md                 # Bu dosya
```

## Kullanım

### Ana Component (Önerilen)

```tsx
import { AttributeDisplay } from '../../../components/attributes';

// Table display için
<AttributeDisplay
  attribute={attribute}
  value={value}
  displayType="table"
/>

// Edit input için
<AttributeDisplay
  attribute={attribute}
  value={value}
  onChange={handleChange}
  displayType="edit"
/>

// Detail display için
<AttributeDisplay
  attribute={attribute}
  value={value}
  isEditing={isEditing}
  onChange={handleChange}
  displayType="detail"
/>
```

### Convenience Components

```tsx
import { 
  AttributeTableDisplay, 
  AttributeEditInput, 
  AttributeDetailDisplay 
} from '../../../components/attributes';

// Table display
<AttributeTableDisplay attribute={attribute} value={value} />

// Edit input
<AttributeEditInput 
  attribute={attribute} 
  value={value} 
  onChange={handleChange} 
/>

// Detail display
<AttributeDetailDisplay 
  attribute={attribute} 
  value={value} 
  isEditing={isEditing}
  onChange={handleChange}
/>
```

### Doğrudan Component Kullanımı

```tsx
import { TextTableDisplay, TextEditInput, TextDetailDisplay } from '../../../components/attributes';

<TextTableDisplay value={value} />
<TextEditInput attribute={attribute} value={value} onChange={handleChange} />
<TextDetailDisplay attribute={attribute} value={value} isEditing={isEditing} />
```

## Display Types

- **table**: Tablo sütunlarında kısa gösterim
- **edit**: Edit modunda input field
- **detail**: Item detay sayfasında gösterim (view + edit)

## Desteklenen Attribute Types

1. **Text** (`text`, `string`)
2. **Number** (`number`, `integer`, `decimal`)
3. **Boolean** (`boolean`)
4. **Email** (`email`)
5. **URL** (`url`)
6. **Date** (`date`)
7. **DateTime** (`datetime`)
8. **Time** (`time`)
9. **Select** (`select`)
10. **MultiSelect** (`multiselect`)
11. **Table** (`table`)
12. **Textarea** (`textarea`, `multiline`)
13. **File** (`file`)
14. **Image** (`image`)
15. **Attachment** (`attachment`)
16. **Color** (`color`)
17. **Rating** (`rating`)
18. **Readonly** (`readonly`)
19. **Phone** (`phone`)
20. **Password** (`password`)
21. **RichText** (`rich_text`)
22. **Barcode** (`barcode`)
23. **QR** (`qr`)
24. **Object** (`object`)
25. **Array** (`array`)
26. **JSON** (`json`)
27. **Formula** (`formula`)
28. **Expression** (`expression`)

## Component Props

```tsx
interface AttributeDisplayProps {
  attribute: any;                    // Attribute bilgisi
  value: any;                        // Attribute değeri
  onChange?: (value: any) => void;   // Değişiklik handler'ı
  error?: string;                    // Hata mesajı
  disabled?: boolean;                // Disabled durumu
  isEditing?: boolean;               // Edit modu (sadece detail için)
}
```

## Örnekler

### Table Display
```tsx
// Basit text gösterimi
<AttributeTableDisplay 
  attribute={{ type: 'text', name: 'Başlık' }} 
  value="Örnek başlık" 
/>

// Boolean gösterimi
<AttributeTableDisplay 
  attribute={{ type: 'boolean', name: 'Aktif' }} 
  value={true} 
/>
```

### Edit Input
```tsx
// Text input
<AttributeEditInput 
  attribute={{ type: 'text', name: 'Başlık' }} 
  value="Örnek başlık"
  onChange={(value) => console.log(value)}
/>

// Select input
<AttributeEditInput 
  attribute={{ 
    type: 'select', 
    name: 'Kategori',
    options: ['A', 'B', 'C']
  }} 
  value="A"
  onChange={(value) => console.log(value)}
/>
```

### Detail Display
```tsx
// View mode
<AttributeDetailDisplay 
  attribute={{ type: 'text', name: 'Başlık' }} 
  value="Örnek başlık"
  isEditing={false}
/>

// Edit mode
<AttributeDetailDisplay 
  attribute={{ type: 'text', name: 'Başlık' }} 
  value="Örnek başlık"
  isEditing={true}
  onChange={(value) => console.log(value)}
/>
```

## Avantajlar

1. **Tek Component**: Tüm attribute type'ları için tek component
2. **Type Safety**: TypeScript desteği
3. **Flexibility**: Display type'a göre uygun component
4. **Consistency**: Tutarlı görünüm ve davranış
5. **Maintainability**: Kolay bakım ve güncelleme
6. **Reusability**: Yeniden kullanılabilir component'ler
