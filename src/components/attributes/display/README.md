# Attribute Display Components

Bu klasör, her attribute type için 3 farklı component içerir:

## Component Yapısı

Her attribute type için 3 component oluşturulmuştur:

1. **TableDisplay** - Tablo sütunlarında kullanılır
2. **EditInput** - Edit modunda kullanılır  
3. **DetailDisplay** - Item detay sayfalarında kullanılır

## Kullanım Örnekleri

### Text Attribute
```tsx
import { TextTableDisplay, TextEditInput, TextDetailDisplay } from '../../../components/attributes';

// Tablo sütununda
<TextTableDisplay value={item.textField} />

// Edit modunda
<TextEditInput 
  attribute={attribute}
  value={value}
  onChange={handleChange}
  error={error}
  disabled={disabled}
/>

// Item detay sayfasında
<TextDetailDisplay
  attribute={attribute}
  value={value}
  isEditing={isEditing}
  onChange={handleChange}
  error={error}
  disabled={disabled}
/>
```

### Number Attribute
```tsx
import { NumberTableDisplay, NumberEditInput, NumberDetailDisplay } from '../../../components/attributes';

// Tablo sütununda
<NumberTableDisplay value={item.numberField} />

// Edit modunda
<NumberEditInput 
  attribute={attribute}
  value={value}
  onChange={handleChange}
  error={error}
  disabled={disabled}
/>

// Item detay sayfasında
<NumberDetailDisplay
  attribute={attribute}
  value={value}
  isEditing={isEditing}
  onChange={handleChange}
  error={error}
  disabled={disabled}
/>
```

### Select Attribute
```tsx
import { SelectTableDisplay, SelectEditInput, SelectDetailDisplay } from '../../../components/attributes';

// Tablo sütununda
<SelectTableDisplay attribute={attribute} value={item.selectField} />

// Edit modunda
<SelectEditInput 
  attribute={attribute}
  value={value}
  onChange={handleChange}
  error={error}
  disabled={disabled}
/>

// Item detay sayfasında
<SelectDetailDisplay
  attribute={attribute}
  value={value}
  isEditing={isEditing}
  onChange={handleChange}
  error={error}
  disabled={disabled}
/>
```

### Table Attribute
```tsx
import { TableTableDisplay, TableEditInput, TableDetailDisplay } from '../../../components/attributes';

// Tablo sütununda
<TableTableDisplay value={item.tableField} />

// Edit modunda
<TableEditInput 
  attribute={attribute}
  value={value}
  onChange={handleChange}
  error={error}
  disabled={disabled}
/>

// Item detay sayfasında
<TableDetailDisplay
  attribute={attribute}
  value={value}
  isEditing={isEditing}
  onChange={handleChange}
  error={error}
  disabled={disabled}
/>
```

## Mevcut Attribute Types

- **TextAttribute** - Metin alanları
- **NumberAttribute** - Sayısal alanlar
- **BooleanAttribute** - Boolean değerler
- **EmailAttribute** - E-posta adresleri
- **UrlAttribute** - URL'ler
- **DateAttribute** - Tarih alanları
- **DateTimeAttribute** - Tarih ve saat alanları
- **TimeAttribute** - Saat alanları
- **SelectAttribute** - Tek seçim alanları
- **MultiSelectAttribute** - Çoklu seçim alanları
- **TableAttribute** - Tablo alanları
- **TextareaAttribute** - Çok satırlı metin alanları
- **FileAttribute** - Dosya yükleme alanları
- **ImageAttribute** - Görsel yükleme alanları
- **AttachmentAttribute** - Çoklu dosya yükleme alanları
- **ColorAttribute** - Renk seçici alanları
- **RatingAttribute** - Derecelendirme alanları
- **ReadonlyAttribute** - Salt okunur alanlar
- **PhoneAttribute** - Telefon numarası alanları
- **PasswordAttribute** - Şifre alanları
- **RichTextAttribute** - Zengin metin alanları
- **BarcodeAttribute** - Barkod alanları
- **QrAttribute** - QR kod alanları
- **ObjectAttribute** - Nesne alanları
- **ArrayAttribute** - Dizi alanları
- **JsonAttribute** - JSON alanları
- **FormulaAttribute** - Formül alanları
- **ExpressionAttribute** - İfade alanları

## Ortak Props

Tüm component'ler aşağıdaki ortak props'ları kabul eder:

```tsx
interface AttributeProps {
  attribute: any;           // Attribute tanımı
  value: any;              // Değer
  onChange?: (value: any) => void;  // Değişiklik handler'ı
  error?: string;          // Hata mesajı
  disabled?: boolean;      // Disabled durumu
  isEditing?: boolean;     // Edit modu (sadece DetailDisplay için)
}
```

## Stil ve Tema

Tüm component'ler Tailwind CSS kullanır ve dark mode desteği vardır. Component'ler aşağıdaki stil sınıflarını kullanır:

- **Base Input Classes**: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2`
- **Error State**: `border-red-500 focus:ring-red-500`
- **Disabled State**: `bg-gray-100 dark:bg-gray-700 cursor-not-allowed`
- **Dark Mode**: `dark:bg-gray-800 dark:text-white dark:border-gray-600`
