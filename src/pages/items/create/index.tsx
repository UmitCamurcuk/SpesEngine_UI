import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Stepper from '../../../components/ui/Stepper';
import itemService from '../../../services/api/itemService';
import itemTypeService from '../../../services/api/itemTypeService';
import familyService from '../../../services/api/familyService';
import categoryService from '../../../services/api/categoryService';
import attributeGroupService from '../../../services/api/attributeGroupService';
import type { CreateItemDto } from '../../../types/item';
import type { Attribute } from '../../../types/attribute';

interface ItemTypeOption {
  _id: string;
  name: string;
  code: string;
}

interface FamilyOption {
  _id: string;
  name: string;
  code: string;
}

interface CategoryOption {
  _id: string;
  name: string;
  code: string;
}

interface AttributeFormProps {
  attributes: Attribute[];
  values: Record<string, any>;
  onChange: (attributeId: string, value: any) => void;
  itemType?: ItemTypeOption | null;
  family?: FamilyOption | null;
  category?: CategoryOption | null;
  attributeGroupNames: Record<string, string>;
}

// Öznitelik bileşenini oluşturmak için yardımcı fonksiyon
const AttributeField: React.FC<{
  attribute: Attribute;
  value: any;
  onChange: (value: any) => void;
}> = ({ attribute, value, onChange }) => {
  const [error, setError] = useState<string | null>(null);
  
  // Validation kurallarını uygula
  const validateField = (value: any): boolean => {
    // Zorunlu alan kontrolü
    if (attribute.isRequired && (value === undefined || value === null || value === '')) {
      setError(`${attribute.name} alanı zorunludur`);
      return false;
    }
    
    // Tip bazlı validasyon
    if (value !== undefined && value !== null && value !== '') {
      switch (attribute.type) {
        case 'number':
          // Min/Max değer kontrolü
          if (attribute.validations?.min !== undefined && Number(value) < attribute.validations.min) {
            setError(`En az ${attribute.validations.min} olmalıdır`);
            return false;
          }
          if (attribute.validations?.max !== undefined && Number(value) > attribute.validations.max) {
            setError(`En fazla ${attribute.validations.max} olmalıdır`);
            return false;
          }
          break;
          
        case 'text':
          // Min/Max uzunluk kontrolü
          if (attribute.validations?.minLength !== undefined && String(value).length < attribute.validations.minLength) {
            setError(`En az ${attribute.validations.minLength} karakter olmalıdır`);
            return false;
          }
          if (attribute.validations?.maxLength !== undefined && String(value).length > attribute.validations.maxLength) {
            setError(`En fazla ${attribute.validations.maxLength} karakter olmalıdır`);
            return false;
          }
          // Regex pattern kontrolü
          if (attribute.validations?.pattern && !new RegExp(attribute.validations.pattern).test(String(value))) {
            setError(`Geçerli bir format girmelisiniz`);
            return false;
          }
          break;
          
        case 'date':
          // Min/Max tarih kontrolü
          if (attribute.validations?.minDate && new Date(value) < new Date(attribute.validations.minDate)) {
            setError(`En erken ${new Date(attribute.validations.minDate).toLocaleDateString()} tarihini seçebilirsiniz`);
            return false;
          }
          if (attribute.validations?.maxDate && new Date(value) > new Date(attribute.validations.maxDate)) {
            setError(`En geç ${new Date(attribute.validations.maxDate).toLocaleDateString()} tarihini seçebilirsiniz`);
            return false;
          }
          break;
      }
    }
    
    // Hata yoksa error state'i temizle
    setError(null);
    return true;
  };
  
  // Değer değiştiğinde doğrulama yap
  const handleChange = (newValue: any) => {
    onChange(newValue);
    validateField(newValue);
  };
  
  // Validasyon kurallarını açıklayan tooltip içeriğini oluştur
  const getValidationTooltip = () => {
    const rules: string[] = [];
    
    if (attribute.isRequired) {
      rules.push('Bu alan zorunludur');
    }
    
    if (attribute.validations) {
      switch (attribute.type) {
        case 'number':
          if (attribute.validations.min !== undefined) {
            rules.push(`En düşük değer: ${attribute.validations.min}`);
          }
          if (attribute.validations.max !== undefined) {
            rules.push(`En yüksek değer: ${attribute.validations.max}`);
          }
          if (attribute.validations.isInteger) {
            rules.push('Sadece tam sayı girilebilir');
          }
          if (attribute.validations.isPositive) {
            rules.push('Sadece pozitif sayı girilebilir');
          }
          break;
          
        case 'text':
          if (attribute.validations.minLength !== undefined) {
            rules.push(`En az ${attribute.validations.minLength} karakter`);
          }
          if (attribute.validations.maxLength !== undefined) {
            rules.push(`En fazla ${attribute.validations.maxLength} karakter`);
          }
          if (attribute.validations.pattern) {
            rules.push('Belirli bir format gerekli');
          }
          break;
          
        case 'date':
          if (attribute.validations.minDate) {
            rules.push(`En erken tarih: ${new Date(attribute.validations.minDate).toLocaleDateString()}`);
          }
          if (attribute.validations.maxDate) {
            rules.push(`En geç tarih: ${new Date(attribute.validations.maxDate).toLocaleDateString()}`);
          }
          break;
          
        case 'select':
        case 'multiselect':
          if (attribute.validations.minSelections !== undefined) {
            rules.push(`En az ${attribute.validations.minSelections} seçim yapılmalıdır`);
          }
          if (attribute.validations.maxSelections !== undefined) {
            rules.push(`En fazla ${attribute.validations.maxSelections} seçim yapılabilir`);
          }
          break;
      }
    }
    
    return rules.length > 0 ? rules.join('\n') : null;
  };
  
  const tooltipContent = getValidationTooltip();
  
  return (
    <div key={attribute._id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
      <div className="flex items-center mb-1">
        <label 
          htmlFor={`attr-${attribute._id}`} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {attribute.name} {attribute.isRequired && <span className="text-red-500">*</span>}
        </label>
        
        {tooltipContent && (
          <div className="relative flex ml-2 group">
            <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full hover:bg-blue-600 cursor-help">?</span>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10 invisible group-hover:visible whitespace-pre-line">
              <div className="font-semibold mb-1">Geçerlilik Kuralları:</div>
              {tooltipContent}
              <div className="h-2 w-2 bg-gray-800 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
            </div>
          </div>
        )}
      </div>
      
      {attribute.type === 'text' && (
        <div>
          <input
            type="text"
            id={`attr-${attribute._id}`}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            required={attribute.isRequired}
            minLength={attribute.validations?.minLength}
            maxLength={attribute.validations?.maxLength}
            pattern={attribute.validations?.pattern}
            placeholder={attribute.validations?.placeholder || `${attribute.name} girin`}
            className={`bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark`}
          />
        </div>
      )}
      
      {attribute.type === 'number' && (
        <div>
          <input
            type="number"
            id={`attr-${attribute._id}`}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            required={attribute.isRequired}
            min={attribute.validations?.min}
            max={attribute.validations?.max}
            step={attribute.validations?.step || 1}
            placeholder={attribute.validations?.placeholder || `${attribute.name} girin`}
            className={`bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark`}
          />
        </div>
      )}
      
      {attribute.type === 'date' && (
        <div>
          <input
            type="date"
            id={`attr-${attribute._id}`}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            required={attribute.isRequired}
            min={attribute.validations?.minDate}
            max={attribute.validations?.maxDate}
            className={`bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark`}
          />
        </div>
      )}
      
      {attribute.type === 'boolean' && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`attr-${attribute._id}`}
            checked={value || false}
            onChange={(e) => handleChange(e.target.checked)}
            className="w-4 h-4 text-primary-light bg-gray-100 border-gray-300 rounded focus:ring-primary-light dark:focus:ring-primary-dark dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor={`attr-${attribute._id}`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            {value ? 'Evet' : 'Hayır'}
          </label>
        </div>
      )}
      
      {attribute.type === 'select' && (
        <div>
          <select
            id={`attr-${attribute._id}`}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            required={attribute.isRequired}
            className={`bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark`}
          >
            <option value="">Seçim yapın</option>
            {attribute.options && attribute.options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {attribute.type === 'multiselect' && (
        <div>
          <select
            id={`attr-${attribute._id}`}
            value={value || []}
            onChange={(e) => {
              const options = Array.from(e.target.selectedOptions, option => option.value);
              handleChange(options);
            }}
            multiple
            required={attribute.isRequired}
            className={`bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark`}
            size={Math.min(attribute.options?.length || 3, 5)}
          >
            {attribute.options && attribute.options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Birden fazla seçim yapmak için Ctrl (veya Command) tuşuna basılı tutarak tıklayın
          </div>
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      
      {attribute.description && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {attribute.description}
        </p>
      )}
    </div>
  );
};

const AttributeForm: React.FC<AttributeFormProps> = ({ 
  attributes, 
  values, 
  onChange,
  itemType,
  family,
  category,
  attributeGroupNames
}) => {
  // Öznitelikleri gruplara ayır
  const groupedAttributes = useMemo(() => {
    const grouped: Record<string, Attribute[]> = {
      ungrouped: []
    };
    
    // Her özniteliği uygun gruba ekle
    attributes.forEach(attr => {
      if (attr.attributeGroup && attributeGroupNames[attr.attributeGroup]) {
        if (!grouped[attr.attributeGroup]) {
          grouped[attr.attributeGroup] = [];
        }
        grouped[attr.attributeGroup].push(attr);
      } else {
        grouped.ungrouped.push(attr);
      }
    });
    
    return grouped;
  }, [attributes, attributeGroupNames]);
  
  // Grup adını döndür
  const getGroupName = (groupId: string): string => {
    return attributeGroupNames[groupId] || 'Diğer Öznitelikler';
  };
  
  // Öznitelik kaynağına göre başlık rengini belirle
  const getSourceColor = (attributes: Attribute[]): string => {
    if (attributes.length === 0) return '';
    
    const source = (attributes[0] as any).source;
    if (source === 'family') return 'text-blue-600 dark:text-blue-400';
    if (source === 'category') return 'text-green-600 dark:text-green-400';
    return '';
  };
  
  // Öznitelik kaynağına göre etiket getir
  const getSourceLabel = (attributes: Attribute[]): string | null => {
    if (attributes.length === 0) return null;
    
    const source = (attributes[0] as any).source;
    if (source === 'family' && family) return `(${family.name})`;
    if (source === 'category' && category) return `(${category.name})`;
    return null;
  };
  
  // Öznitelikler var mı kontrol et
  if (attributes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Bu öğe için tanımlanmış öznitelik bulunamadı.</p>
      </div>
    );
  }
  
  return (
    <div>
      {/* Gruplar ve içlerindeki attributeları görüntüle */}
      {Object.keys(groupedAttributes).map(groupId => {
        const groupAttributes = groupedAttributes[groupId];
        
        // Boş grupları gösterme
        if (groupAttributes.length === 0) return null;
        
        const sourceColor = getSourceColor(groupAttributes);
        const sourceLabel = getSourceLabel(groupAttributes);
        
        return (
          <div key={groupId} className="mb-6">
            {/* Grup Başlığı */}
            <div className="flex items-center mb-3">
              <h3 className={`text-lg font-medium ${sourceColor}`}>
                {groupId === 'ungrouped' ? 'Genel Öznitelikler' : getGroupName(groupId)}
              </h3>
              {sourceLabel && (
                <span className={`ml-2 text-sm ${sourceColor}`}>{sourceLabel}</span>
              )}
            </div>
            
            {/* Grup içindeki öznitelikler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupAttributes.map(attribute => (
                <AttributeField
                  key={attribute._id}
                  attribute={attribute}
                  value={values[attribute._id]}
                  onChange={(value) => onChange(attribute._id, value)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Debug fonksiyonu - geliştirme aşamasında sorunları tespit etmek için
const DEBUG = true;

const debug = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`🔍 [DEBUG] ${message}`, data || '');
  }
};

const ItemCreatePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState<CreateItemDto>({
    name: '',
    code: '',
    description: '',
    itemType: '',
    attributeValues: []
  });
  
  // Seçenekler
  const [itemTypeOptions, setItemTypeOptions] = useState<ItemTypeOption[]>([]);
  const [familyOptions, setFamilyOptions] = useState<FamilyOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  
  // Attribute state
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, any>>({});
  const [attributeGroupNames, setAttributeGroupNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  
  // Loading ve error state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Stepper state
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Seçilen itemType, family ve category öğelerine ait tam bilgiler
  const [selectedItemType, setSelectedItemType] = useState<ItemTypeOption | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<FamilyOption | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);
  
  // Stepper adımları
  const steps = useMemo(() => [
    { title: 'Temel Bilgiler', description: 'Öğenin temel bilgilerini girin' },
    { title: 'Tür ve Kategori', description: 'Öğenin hiyerarşisini belirleyin' },
    { title: 'Öznitelikler', description: 'Öğeye ait öznitelikleri girin' },
  ], []);
  
  // Sadece öğe tiplerini yükle
  useEffect(() => {
    const fetchItemTypes = async () => {
      try {
        const itemTypesResult = await itemTypeService.getItemTypes({ limit: 100 });
        setItemTypeOptions(itemTypesResult.itemTypes.map(type => ({
          _id: type._id,
          name: type.name,
          code: type.code
        })));
      } catch (err) {
        console.error('Öğe tipleri yüklenirken hata oluştu:', err);
      }
    };
    
    fetchItemTypes();
  }, []);

  // ItemType, Family ve Category seçildikçe attributeleri yükle
  useEffect(() => {
    const fetchAllAttributes = async () => {
      if (!formData.itemType) return;
      
      setLoading(true);
      try {
        // Tüm öznitelikleri saklayacak dizi
        let allAttributes: Attribute[] = [];
        let attributeGroupNamesMap: Record<string, string> = {};
        
        // Tüm öznitelik ID'lerini saklayacak Set
        const existingIds = new Set<string>();
        
        // Yardımcı fonksiyon: Öznitelikleri ekleme
        const addAttributesToCollection = (attributes: any[], source: string, groupId?: string) => {
          if (!attributes || !Array.isArray(attributes) || attributes.length === 0) return;
          
          for (const attr of attributes) {
            if (attr && typeof attr === 'object' && '_id' in attr) {
              if (!existingIds.has(attr._id)) {
                const newAttr = {
                  ...attr,
                  source,
                  ...(groupId ? { attributeGroup: groupId } : {})
                };
                allAttributes.push(newAttr);
                existingIds.add(attr._id);
              }
            }
          }
        };
        
        // Yardımcı fonksiyon: Öznitelik gruplarını işleme
        const processAttributeGroups = async (groups: any[], source: string) => {
          if (!groups || !Array.isArray(groups) || groups.length === 0) return;
          
          for (const group of groups) {
            if (group && typeof group === 'object' && '_id' in group) {
              // Grup adını kaydet
              attributeGroupNamesMap[group._id] = group.name;
              
              // Grup içindeki attributeları ekle
              if (group.attributes && Array.isArray(group.attributes) && group.attributes.length > 0) {
                console.log(`${source} - ${group.name} grubunda ${group.attributes.length} öznitelik var`);
                addAttributesToCollection(group.attributes, source, group._id);
              } else {
                console.log(`${source} - ${group.name} grubunda öznitelik yok veya geçersiz format`);
                
                // Grup içinde attributes yoksa veya boşsa, API'den doğrudan kontrol et
                try {
                  const groupData = await attributeGroupService.testAttributeGroupAttributes(group._id);
                  
                  if (groupData.attributes && groupData.attributes.length > 0) {
                    console.log(`${source} - ${group.name} grubu API testi: ${groupData.attributesLength} öznitelik bulundu`);
                    addAttributesToCollection(groupData.attributes, source, group._id);
                  }
                } catch (err) {
                  console.error(`${source} AttributeGroup test API hatası:`, err);
                }
              }
            }
          }
        };
        
        // -----------------------------------------------
        // ADIM 1: ItemType attributelerini ve gruplarını getir
        // -----------------------------------------------
        const itemTypeDetails = await itemTypeService.getItemTypeById(formData.itemType, { 
          includeAttributes: true, 
          includeAttributeGroups: true,
          populateAttributeGroupsAttributes: true
        });
        
        console.log("İtem Tipi detayları:", itemTypeDetails);
        
        // ItemType'ın doğrudan bağlı öznitelikleri
        addAttributesToCollection(itemTypeDetails.attributes, 'itemType');
        
        // ItemType'ın öznitelik grupları
        await processAttributeGroups(itemTypeDetails.attributeGroups, 'itemType');
        
        // -----------------------------------------------
        // ADIM 2: Family attributelerini ve gruplarını getir
        // -----------------------------------------------
        if (formData.family) {
          try {
            const familyDetails = await familyService.getFamilyById(formData.family, { 
              includeAttributes: true, 
              includeAttributeGroups: true,
              populateAttributeGroupsAttributes: true 
            });
            
            console.log("Aile detayları:", familyDetails);
            
            // Family'nin doğrudan bağlı öznitelikleri
            addAttributesToCollection(familyDetails.attributes, 'family');
            
            // Family'nin öznitelik grupları
            await processAttributeGroups(familyDetails.attributeGroups, 'family');
            
            // ÖNEMLİ: Family'nin category bilgisini işle
            if (familyDetails.category) {
              
              // Category'nin doğrudan bağlı öznitelikleri
              addAttributesToCollection(familyDetails.category.attributes, 'category');
              
              // Category'nin öznitelik grupları
              await processAttributeGroups(familyDetails.category.attributeGroups, 'category');
            }
          } catch (err) {
            console.error('Aile öznitelikleri yüklenirken hata:', err);
          }
        }
        
        // -----------------------------------------------
        // ADIM 3: Category attributelerini ve gruplarını getir
        // -----------------------------------------------
        if (formData.category) {
          try {
            const categoryDetails = await categoryService.getCategoryById(formData.category, { 
              includeAttributes: true, 
              includeAttributeGroups: true,
              populateAttributeGroupsAttributes: true
            });
            
            
            // Category'nin doğrudan bağlı öznitelikleri
            addAttributesToCollection(categoryDetails.attributes, 'category');
            
            // Category'nin öznitelik grupları
            await processAttributeGroups(categoryDetails.attributeGroups, 'category');
          } catch (err) {
            console.error('Kategori öznitelikleri yüklenirken hata:', err);
          }
        }
        
        // State'leri güncelle
        setAttributes(allAttributes);
        setAttributeGroupNames(attributeGroupNamesMap);
      } catch (err) {
        console.error('Öznitelikler yüklenirken hata oluştu:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllAttributes();
  }, [formData.itemType, formData.family, formData.category]);
  
  // ItemType değiştiğinde families listesini güncelle
  useEffect(() => {
    const fetchFamilies = async () => {
      if (!formData.itemType) {
        setFamilyOptions([]);
        setFormData(prev => ({ ...prev, family: '', category: '' }));
        return;
      }
      
      try {
        const familiesResult = await familyService.getFamilies({ 
          itemType: formData.itemType,
          limit: 100
        });
        
        setFamilyOptions(familiesResult.families.map(family => ({
          _id: family._id,
          name: family.name,
          code: family.code
        })));
        
        // Aile değiştiğinde kategori seçimini temizle
        setFormData(prev => ({ ...prev, family: '', category: '' }));
        
        // Seçilen ItemType'ın bilgilerini kaydet
        const selectedType = itemTypeOptions.find(type => type._id === formData.itemType);
        setSelectedItemType(selectedType || null);
      } catch (err) {
        console.error('Aileler yüklenirken hata oluştu:', err);
      }
    };
    
    fetchFamilies();
  }, [formData.itemType, itemTypeOptions]);
  
  // Family değiştiğinde categories listesini güncelle
  useEffect(() => {
    const fetchCategories = async () => {
      if (!formData.family) {
        setCategoryOptions([]);
        setFormData(prev => ({ ...prev, category: '' }));
        return;
      }
      
      try {
        const categoriesResult = await categoryService.getCategories({ 
          family: formData.family,
          limit: 100
        });
        
        setCategoryOptions(categoriesResult.categories.map(category => ({
          _id: category._id,
          name: category.name,
          code: category.code
        })));
        
        // Kategori seçimini temizle
        setFormData(prev => ({ ...prev, category: '' }));
        
        // Seçilen Family'nin bilgilerini kaydet
        const selectedFam = familyOptions.find(family => family._id === formData.family);
        setSelectedFamily(selectedFam || null);
      } catch (err) {
        console.error('Kategoriler yüklenirken hata oluştu:', err);
      }
    };
    
    fetchCategories();
  }, [formData.family, familyOptions]);
  
  // Form input değişiklik handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Checkbox için özel işlem
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: any) => ({ ...prev, [name]: checked }));
      return;
    }
    
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    
    // Hata mesajını temizle
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Öznitelik değeri değişiklik handler
  const handleAttributeChange = (attributeId: string, value: any) => {
    setAttributeValues(prev => ({
      ...prev,
      [attributeId]: value
    }));
  };
  
  // Form gönderme handler
  const handleSubmit = async () => {
    // Zorunlu attribute'ların kontrolü
    const requiredAttributesCheck = validateRequiredAttributes();
    if (!requiredAttributesCheck.isValid) {
      setError(`Zorunlu alanları doldurun: ${requiredAttributesCheck.missingFields.join(', ')}`);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Attribute değerlerini formData'ya ekle
      const attributeValuesArray = Object.entries(attributeValues).map(([attributeId, value]) => ({
        attributeId,
        value
      }));
      
      const payload = {
        ...formData,
        attributeValues: attributeValuesArray
      };
      
      // API'ye gönder
      await itemService.createItem(payload);
      
      setSuccess(true);
      
      // Başarılı olduğunda listeye yönlendir
      setTimeout(() => {
        navigate('/items/list');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Öğe oluşturulurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Zorunlu attribute'ların kontrol edilmesi
  const validateRequiredAttributes = (): { isValid: boolean; missingFields: string[] } => {
    // Zorunlu olan ama değeri girilmemiş attributelar
    const missingRequiredAttributes = attributes
      .filter(attr => attr.isRequired)
      .filter(attr => {
        const value = attributeValues[attr._id];
        return value === undefined || value === null || value === '' || 
               (Array.isArray(value) && value.length === 0);
      });
    
    // Eksik olan attributeların isimleri
    const missingFields = missingRequiredAttributes.map(attr => attr.name);
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  };
  
  // Adım 1 validasyonu
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Öğe adı zorunludur';
    }
    
    if (!formData.code.trim()) {
      errors.code = 'Öğe kodu zorunludur';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Adım 2 validasyonu
  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.itemType) {
      errors.itemType = 'Öğe tipi seçimi zorunludur';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // İleri adıma geç
  const handleNextStep = () => {
    let isValid = false;
    
    // Aktif adımın validasyonunu çalıştır
    switch (currentStep) {
      case 0:
        isValid = validateStep1();
        break;
      case 1:
        isValid = validateStep2();
        break;
      default:
        isValid = true;
        break;
    }
    
    if (!isValid) return;
    
    // Adımı tamamlanmış olarak işaretle
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
    
    // Sonraki adıma geç
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };
  
  // Önceki adıma dön
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };
  
  // Adıma göre içerik renderla
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* İsim */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Öğe Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                placeholder="Öğe adını girin"
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
              )}
            </div>
            
            {/* Kod */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kod <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                placeholder="Öğe kodunu girin (örn: ITEM001)"
              />
              {formErrors.code && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.code}</p>
              )}
            </div>
            
            {/* Açıklama */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Açıklama
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
                placeholder="Öğe hakkında açıklama girin"
              />
            </div>
            
            {/* Active/Inactive state */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive === undefined ? true : formData.isActive}
                    onChange={e => setFormData((prev: any) => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-primary-light bg-gray-100 border-gray-300 rounded focus:ring-primary-light dark:focus:ring-primary-dark dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Aktif
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Öğenin aktif olup olmadığını belirler. Pasif öğeler kullanıcı arayüzünde gösterilmez.
              </p>
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-200 dark:border-blue-800 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Hiyerarşik seçim yapmanız gerekmektedir. Önce Öğe Tipi, sonra Aile ve en son Kategori seçimi yapılmalıdır. Seçimleriniz, bir sonraki adımda gösterilecek öznitelikleri belirler.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Öğe Tipi */}
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <label htmlFor="itemType" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                1. Öğe Tipi <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Oluşturmak istediğiniz öğenin ana türünü seçin. Bu seçim, sonraki adımlarda gösterilecek aile ve kategori seçeneklerini belirler.
              </p>
              <select
                id="itemType"
                name="itemType"
                value={formData.itemType}
                onChange={handleChange}
                required
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
              >
                <option value="">Öğe tipi seçin</option>
                {itemTypeOptions.map(type => (
                  <option key={type._id} value={type._id}>
                    {type.name} ({type.code})
                  </option>
                ))}
              </select>
              {formErrors.itemType && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.itemType}</p>
              )}
            </div>
            
            {/* Aile */}
            <div className={`bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 ${!formData.itemType ? 'opacity-50' : ''}`}>
              <label htmlFor="family" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                2. Aile
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Seçtiğiniz öğe tipine ait bir aile seçin. Bu, ürün hiyerarşisindeki yerini belirler.
              </p>
              <select
                id="family"
                name="family"
                value={formData.family || ''}
                onChange={handleChange}
                disabled={!formData.itemType}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <option value="">Aile seçin (opsiyonel)</option>
                {familyOptions.length === 0 && formData.itemType && (
                  <option value="" disabled>Seçilen öğe tipine ait aile bulunamadı</option>
                )}
                {familyOptions.map(family => (
                  <option key={family._id} value={family._id}>
                    {family.name} ({family.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Kategori */}
            <div className={`bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 ${!formData.family ? 'opacity-50' : ''}`}>
              <label htmlFor="category" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                3. Kategori
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Seçtiğiniz aileye ait bir kategori seçin. Bu, öğenin en spesifik sınıflandırmasını belirler.
              </p>
              <select
                id="category"
                name="category"
                value={formData.category || ''}
                onChange={handleChange}
                disabled={!formData.family}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark disabled:bg-gray-100 disabled:dark:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <option value="">Kategori seçin (opsiyonel)</option>
                {categoryOptions.length === 0 && formData.family && (
                  <option value="" disabled>Seçilen aileye ait kategori bulunamadı</option>
                )}
                {categoryOptions.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name} ({category.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Öznitelik Değerleri</h3>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Aşağıdaki öznitelikler seçtiğiniz öğe tipi, aile ve kategoriye göre otomatik olarak belirlenmiştir. 
                    Zorunlu alanları doldurmanız gerekmektedir.
                  </p>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="py-4 flex justify-center">
                <svg className="animate-spin h-8 w-8 text-primary-light dark:text-primary-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : attributes.length === 0 ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Seçilen tür, aile ve kategoriye ait öznitelik bulunamadı. Yine de öğeyi oluşturabilirsiniz veya 
                      farklı bir tür, aile veya kategori seçmek için önceki adıma dönebilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <AttributeForm 
                attributes={attributes} 
                values={attributeValues} 
                onChange={handleAttributeChange} 
                itemType={selectedItemType}
                family={selectedFamily}
                category={selectedCategory}
                attributeGroupNames={attributeGroupNames}
              />
            )}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-7 h-7 mr-2 text-primary-light dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yeni Öğe Oluştur
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Yeni bir öğe oluşturmak için adımları takip edin
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => navigate('/items/list')}
            className="flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Listeye Dön
          </Button>
        </div>
      </div>
      
      {/* Form */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <Stepper 
            steps={steps} 
            activeStep={currentStep} 
            completedSteps={completedSteps} 
          />
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Öğe başarıyla oluşturuldu! Yönlendiriliyorsunuz...</span>
            </div>
          )}
          
          {/* Form içeriği - direkt submit edilmesini engelle */}
          <div className="space-y-6">
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                type="button"
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                className={`${currentStep === 0 ? 'invisible' : ''}`}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Önceki Adım
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  variant="primary"
                  type="button"
                  onClick={handleNextStep}
                >
                  Sonraki Adım
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              ) : (
            <Button
              variant="primary"
                  type="button"
                  onClick={handleSubmit}
              disabled={isLoading}
                  className="flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Kaydet
                </>
              )}
            </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCreatePage; 