import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Stepper from '../../../components/ui/Stepper';
import itemService from '../../../services/api/itemService';
import itemTypeService from '../../../services/api/itemTypeService';
import familyService from '../../../services/api/familyService';
import categoryService from '../../../services/api/categoryService';
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
  return (
    <div key={attribute._id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
      <label 
        htmlFor={`attr-${attribute._id}`} 
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {attribute.name} {attribute.isRequired && <span className="text-red-500">*</span>}
      </label>
      
      {attribute.type === 'text' && (
        <input
          type="text"
          id={`attr-${attribute._id}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={attribute.isRequired}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
        />
      )}
      
      {attribute.type === 'number' && (
        <input
          type="number"
          id={`attr-${attribute._id}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={attribute.isRequired}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
        />
      )}
      
      {attribute.type === 'date' && (
        <input
          type="date"
          id={`attr-${attribute._id}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={attribute.isRequired}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
        />
      )}
      
      {attribute.type === 'boolean' && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`attr-${attribute._id}`}
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 text-primary-light bg-gray-100 border-gray-300 rounded focus:ring-primary-light dark:focus:ring-primary-dark dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor={`attr-${attribute._id}`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            {value ? 'Evet' : 'Hayır'}
          </label>
        </div>
      )}
      
      {attribute.type === 'select' && (
        <select
          id={`attr-${attribute._id}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={attribute.isRequired}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
        >
          <option value="">Seçim yapın</option>
          {attribute.options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
      
      {attribute.type === 'multiselect' && (
        <select
          id={`attr-${attribute._id}`}
          value={value || []}
          onChange={(e) => {
            const options = Array.from(e.target.selectedOptions, option => option.value);
            onChange(options);
          }}
          multiple
          required={attribute.isRequired}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
          size={Math.min(attribute.options.length, 5)}
        >
          {attribute.options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
      
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {attribute.description}
      </p>
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
  if (!attributes || attributes.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400 italic">Bu seçime ait öznitelik bulunmuyor.</p>;
  }
  
  // Öznitelikleri kategorilere göre gruplandır
  const groupedAttributes = useMemo(() => {
    const grouped: {
      itemType: {
        direct: Attribute[];
        groups: { [groupId: string]: Attribute[] };
      };
      family: {
        direct: Attribute[];
        groups: { [groupId: string]: Attribute[] };
      };
      category: {
        direct: Attribute[];
        groups: { [groupId: string]: Attribute[] };
      };
    } = {
      itemType: { direct: [], groups: {} },
      family: { direct: [], groups: {} },
      category: { direct: [], groups: {} }
    };
    
    // Hangi özniteliğin hangi seviyeye ait olduğunu izlemek için setler
    const itemTypeAttributeIds = new Set<string>();
    const familyAttributeIds = new Set<string>();
    const categoryAttributeIds = new Set<string>();
    
    attributes.forEach(attr => {
      // Bu özniteliğin hangi gruba ait olduğunu belirleyelim
      if (attr.attributeGroup) {
        // Bu öznitelik bir attribute grubuna ait
        if (category && category._id && attr.attributeGroup === category._id) {
          categoryAttributeIds.add(attr._id);
          
          if (!grouped.category.groups[attr.attributeGroup]) {
            grouped.category.groups[attr.attributeGroup] = [];
          }
          grouped.category.groups[attr.attributeGroup].push(attr);
        } else if (family && family._id && attr.attributeGroup === family._id) {
          familyAttributeIds.add(attr._id);
          
          if (!grouped.family.groups[attr.attributeGroup]) {
            grouped.family.groups[attr.attributeGroup] = [];
          }
          grouped.family.groups[attr.attributeGroup].push(attr);
        } else {
          // Diğer grup ID'leri ItemType'a ait kabul ediyoruz
          itemTypeAttributeIds.add(attr._id);
          
          if (!grouped.itemType.groups[attr.attributeGroup]) {
            grouped.itemType.groups[attr.attributeGroup] = [];
          }
          grouped.itemType.groups[attr.attributeGroup].push(attr);
        }
      } else {
        // Bu öznitelik direkt olarak bağlı (grup olmadan)
        if (category && attr.attributeGroup === undefined) {
          categoryAttributeIds.add(attr._id);
          grouped.category.direct.push(attr);
        } else if (family && attr.attributeGroup === undefined) {
          familyAttributeIds.add(attr._id);
          grouped.family.direct.push(attr);
        } else {
          // Varsayılan olarak ItemType'a ait kabul ediyoruz
          itemTypeAttributeIds.add(attr._id);
          grouped.itemType.direct.push(attr);
        }
      }
    });
    
    return grouped;
  }, [attributes, itemType, family, category]);
  
  // Grup adını göstermek için yardımcı fonksiyon
  const getGroupName = (groupId: string): string => {
    return attributeGroupNames[groupId] || `Grup ${groupId.substring(0, 8)}...`;
  };
  
  return (
    <div className="space-y-6">
      {/* Öğe Tipine Ait Öznitelikler */}
      {(groupedAttributes.itemType.direct.length > 0 || Object.keys(groupedAttributes.itemType.groups).length > 0) && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Öğe Tipi Öznitelikleri
            {itemType && <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({itemType.name})</span>}
          </h3>
          
          {/* Direkt Öznitelikler */}
          {groupedAttributes.itemType.direct.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                Direkt Öznitelikler
              </h4>
              <div className="space-y-4">
                {groupedAttributes.itemType.direct.map((attribute) => (
                  <AttributeField
                    key={attribute._id}
                    attribute={attribute}
                    value={values[attribute._id]}
                    onChange={(value) => onChange(attribute._id, value)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Grup Öznitelikleri */}
          {Object.entries(groupedAttributes.itemType.groups).map(([groupId, groupAttributes]) => (
            <div key={groupId} className="mb-6 last:mb-0">
              <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                Grup: {getGroupName(groupId)}
              </h4>
              <div className="space-y-4">
                {groupAttributes.map((attribute) => (
                  <AttributeField
                    key={attribute._id}
                    attribute={attribute}
                    value={values[attribute._id]}
                    onChange={(value) => onChange(attribute._id, value)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Aile Öznitelikleri */}
      {(groupedAttributes.family.direct.length > 0 || Object.keys(groupedAttributes.family.groups).length > 0) && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Aile Öznitelikleri
            {family && <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({family.name})</span>}
          </h3>
          
          {/* Direkt Öznitelikler */}
          {groupedAttributes.family.direct.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                Direkt Öznitelikler
              </h4>
              <div className="space-y-4">
                {groupedAttributes.family.direct.map((attribute) => (
                  <AttributeField
                    key={attribute._id}
                    attribute={attribute}
                    value={values[attribute._id]}
                    onChange={(value) => onChange(attribute._id, value)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Grup Öznitelikleri */}
          {Object.entries(groupedAttributes.family.groups).map(([groupId, groupAttributes]) => (
            <div key={groupId} className="mb-6 last:mb-0">
              <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                Grup: {getGroupName(groupId)}
              </h4>
              <div className="space-y-4">
                {groupAttributes.map((attribute) => (
                  <AttributeField
                    key={attribute._id}
                    attribute={attribute}
                    value={values[attribute._id]}
                    onChange={(value) => onChange(attribute._id, value)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Kategori Öznitelikleri */}
      {(groupedAttributes.category.direct.length > 0 || Object.keys(groupedAttributes.category.groups).length > 0) && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Kategori Öznitelikleri
            {category && <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({category.name})</span>}
          </h3>
          
          {/* Direkt Öznitelikler */}
          {groupedAttributes.category.direct.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                Direkt Öznitelikler
              </h4>
              <div className="space-y-4">
                {groupedAttributes.category.direct.map((attribute) => (
                  <AttributeField
                    key={attribute._id}
                    attribute={attribute}
                    value={values[attribute._id]}
                    onChange={(value) => onChange(attribute._id, value)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Grup Öznitelikleri */}
          {Object.entries(groupedAttributes.category.groups).map(([groupId, groupAttributes]) => (
            <div key={groupId} className="mb-6 last:mb-0">
              <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                Grup: {getGroupName(groupId)}
              </h4>
              <div className="space-y-4">
                {groupAttributes.map((attribute) => (
                  <AttributeField
                    key={attribute._id}
                    attribute={attribute}
                    value={values[attribute._id]}
                    onChange={(value) => onChange(attribute._id, value)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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

  // ItemType değiştiğinde ilgili Family'leri getir
  useEffect(() => {
    const fetchFamilies = async () => {
      if (!formData.itemType) {
        setFamilyOptions([]);
        setFormData(prev => ({ ...prev, family: '', category: '' }));
        setSelectedItemType(null);
        return;
      }
      
      try {
        // Seçilen itemType'ı ayarla
        const selectedType = itemTypeOptions.find(item => item._id === formData.itemType) || null;
        setSelectedItemType(selectedType);
        
        // ItemType ID'sine göre Family'leri getir
        const familiesResult = await familyService.getFamilies({ itemType: formData.itemType, limit: 100 });
        setFamilyOptions(familiesResult.families.map(family => ({
          _id: family._id,
          name: family.name,
          code: family.code
        })));
        
        // ItemType değiştiğinde Family ve Category'yi sıfırla
        setFormData(prev => ({ ...prev, family: '', category: '' }));
        setCategoryOptions([]);
        setSelectedFamily(null);
        setSelectedCategory(null);
      } catch (err) {
        console.error('Aileler yüklenirken hata oluştu:', err);
      }
    };
    
    fetchFamilies();
  }, [formData.itemType, itemTypeOptions]);

  // Family değiştiğinde ilgili Category'leri getir
  useEffect(() => {
    const fetchCategories = async () => {
      if (!formData.family) {
        setCategoryOptions([]);
        setFormData(prev => ({ ...prev, category: '' }));
        setSelectedFamily(null);
        return;
      }
      
      try {
        // Seçilen family'i ayarla
        const selectedFam = familyOptions.find(item => item._id === formData.family) || null;
        setSelectedFamily(selectedFam);
        
        // Family ID'sine göre Category'leri getir
        const categoriesResult = await categoryService.getCategories({ family: formData.family, limit: 100 });
        setCategoryOptions(categoriesResult.categories.map(category => ({
          _id: category._id,
          name: category.name,
          code: category.code
        })));
        
        // Family değiştiğinde Category'yi sıfırla
        setFormData(prev => ({ ...prev, category: '' }));
        setSelectedCategory(null);
      } catch (err) {
        console.error('Kategoriler yüklenirken hata oluştu:', err);
      }
    };
    
    fetchCategories();
  }, [formData.family, familyOptions]);
  
  // Category değiştiğinde
  useEffect(() => {
    if (!formData.category) {
      setSelectedCategory(null);
      return;
    }
    
    // Seçilen kategoriyi ayarla
    const selectedCat = categoryOptions.find(item => item._id === formData.category) || null;
    setSelectedCategory(selectedCat);
  }, [formData.category, categoryOptions]);

  // ItemType, Family ve Category seçildikçe attributeleri yükle
  useEffect(() => {
    const fetchAttributes = async () => {
      if (!formData.itemType) return;
      
      setLoading(true);
      try {
        // ItemType attributeları ve gruplarını tek seferde getir
        const itemTypeDetails = await itemTypeService.getItemTypeById(formData.itemType, { includeAttributes: true, includeAttributeGroups: true });
        let allAttributes: Attribute[] = [];
        
        // ItemType'a ait attributelar varsa ekle (direk olanlar)
        if (itemTypeDetails.attributes && itemTypeDetails.attributes.length > 0) {
          // Direkt attributelar (grup olmayanlar)
          const directAttributes = itemTypeDetails.attributes.filter((attr: any) => !attr.attributeGroup);
          allAttributes = [...directAttributes];
        }
        
        // ItemType'a ait attribute grupları varsa ekle (itemTypeDetails.attributeGroups içinde gelir)
        if (itemTypeDetails.attributeGroups && itemTypeDetails.attributeGroups.length > 0) {
          for (const group of itemTypeDetails.attributeGroups) {
            if (group.attributes && group.attributes.length > 0) {
              // Grup adını kaydet
              setAttributeGroupNames(prev => ({
                ...prev,
                [group._id]: group.name
              }));
              
              // Grup attributelarını ekle
              allAttributes = [...allAttributes, ...group.attributes];
            }
          }
        }
        
        // Family seçiliyse, family attributelarını ve gruplarını tek seferde getir
        if (formData.family) {
          const familyDetails = await familyService.getFamilyById(formData.family, { includeAttributes: true, includeAttributeGroups: true });
          
          // Doğrudan family'e bağlı attributeları ekle
          if (familyDetails.attributes && familyDetails.attributes.length > 0) {
            // Aynı attributelar varsa, family olanlarını kullan (override)
            const existingAttributeIds = new Set(allAttributes.map((attr: any) => attr._id));
            const newDirectAttributes = familyDetails.attributes.filter((attr: any) => !existingAttributeIds.has(attr._id));
            
            allAttributes = [...allAttributes, ...newDirectAttributes];
          }
          
          // Family'e ait attribute grupları varsa ekle
          if (familyDetails.attributeGroups && familyDetails.attributeGroups.length > 0) {
            for (const group of familyDetails.attributeGroups) {
              if (group.attributes && group.attributes.length > 0) {
                // Grup adını kaydet
                setAttributeGroupNames(prev => ({
                  ...prev,
                  [group._id]: group.name
                }));
                
                // Aynı attributelar varsa, family gruptan olanlarını kullan (override)
                const existingAttributeIds = new Set(allAttributes.map((attr: any) => attr._id));
                const newGroupAttributes = group.attributes.filter((attr: any) => !existingAttributeIds.has(attr._id));
                
                // Her attribute için grup ilişkisini ayarla
                newGroupAttributes.forEach((attr: any) => {
                  if (!attr.attributeGroup) {
                    attr.attributeGroup = group._id;
                  }
                });
                
                allAttributes = [...allAttributes, ...newGroupAttributes];
              }
            }
          }
        }
        
        // Kategori seçiliyse, kategori attributelarını ve gruplarını tek seferde getir
        if (formData.category) {
          const categoryDetails = await categoryService.getCategoryById(formData.category, { includeAttributes: true, includeAttributeGroups: true });
          
          // Doğrudan kategoriye bağlı attributeları ekle
          if (categoryDetails.attributes && categoryDetails.attributes.length > 0) {
            // Aynı attributelar varsa, kategori olanlarını kullan (override)
            const existingAttributeIds = new Set(allAttributes.map((attr: any) => attr._id));
            const newDirectAttributes = categoryDetails.attributes.filter((attr: any) => !existingAttributeIds.has(attr._id));
            
            allAttributes = [...allAttributes, ...newDirectAttributes];
          }
          
          // Kategori attribute grubunu ekle
          if (categoryDetails.attributeGroups && categoryDetails.attributeGroups.length > 0) {
            for (const group of categoryDetails.attributeGroups) {
              if (group.attributes && group.attributes.length > 0) {
                // Grup adını kaydet
                setAttributeGroupNames(prev => ({
                  ...prev,
                  [group._id]: group.name
                }));
                
                // Aynı attributelar varsa, kategori gruptan olanlarını kullan (override)
                const existingAttributeIds = new Set(allAttributes.map((attr: any) => attr._id));
                const newGroupAttributes = group.attributes.filter((attr: any) => !existingAttributeIds.has(attr._id));
                
                // Her attribute için grup ilişkisini ayarla
                newGroupAttributes.forEach((attr: any) => {
                  if (!attr.attributeGroup) {
                    attr.attributeGroup = group._id;
                  }
                });
                
                allAttributes = [...allAttributes, ...newGroupAttributes];
              }
            }
          }
        }
        
        setAttributes(allAttributes);
      } catch (err) {
        console.error('Öznitelikler yüklenirken hata oluştu:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttributes();
  }, [formData.itemType, formData.family, formData.category]);
  
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