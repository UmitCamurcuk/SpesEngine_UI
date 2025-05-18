import React, { useEffect, useState } from 'react';
import attributeService from '../../services/api/attributeService';
import { useTranslation } from '../../context/i18nContext';
import AttributeBadge from './AttributeBadge';

interface AttributeSelectorProps {
  attributeGroupIds: string[];
  selectedAttributes: string[];
  onChange: (attributeIds: string[]) => void;
}

interface AttributeOption {
  _id: string;
  name: string;
  code: string;
  type: string;
  attributeGroup: string;
}

const AttributeSelector: React.FC<AttributeSelectorProps> = ({
  attributeGroupIds,
  selectedAttributes,
  onChange
}) => {
  const { t } = useTranslation();
  const [attributes, setAttributes] = useState<AttributeOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchAttributes = async () => {
      if (!attributeGroupIds.length) {
        setAttributes([]);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Tüm attribute'ları getir, UI'da filtreleyelim
        const result = await attributeService.getAttributes({ limit: 100 });
        
        // AttributeGroup ID'lerine göre filtrele
        const filteredAttributes = result.attributes
          .filter(attr => attr.attributeGroup && attributeGroupIds.includes(attr.attributeGroup))
          .map(attr => ({
            _id: attr._id,
            name: attr.name,
            code: attr.code,
            type: attr.type,
            attributeGroup: attr.attributeGroup as string // Type assertion ile string olduğunu belirtiyoruz
          }));
        
        setAttributes(filteredAttributes);
      } catch (err: any) {
        console.error('Attributes yüklenirken hata:', err);
        setError(err.message || 'Öznitelikler yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAttributes();
  }, [attributeGroupIds]);
  
  const handleAttributeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedIds: string[] = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedIds.push(options[i].value);
      }
    }
    
    onChange(selectedIds);
  };
  
  // AttributeGroup'a göre attributes'ları gruplama
  const attributesByGroup: Record<string, AttributeOption[]> = {};
  attributes.forEach(attr => {
    if (!attributesByGroup[attr.attributeGroup]) {
      attributesByGroup[attr.attributeGroup] = [];
    }
    attributesByGroup[attr.attributeGroup].push(attr);
  });
  
  if (isLoading) {
    return <div className="text-center py-4">Yükleniyor...</div>;
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }
  
  if (!attributeGroupIds.length) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <p className="text-yellow-600 dark:text-yellow-400">Lütfen önce öznitelik gruplarını seçin</p>
      </div>
    );
  }
  
  if (attributes.length === 0) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-blue-600 dark:text-blue-400">Seçilen gruplara ait öznitelik bulunamadı</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <label htmlFor="attributes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Öznitelikler
      </label>
      <select
        id="attributes"
        name="attributes"
        value={selectedAttributes}
        onChange={handleAttributeChange}
        multiple
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-light focus:border-primary-light block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-dark dark:focus:border-primary-dark"
        size={Math.min(attributes.length, 10)}
      >
        {attributes.map((attr) => (
          <option key={attr._id} value={attr._id} className="py-1">
            {attr.name} ({attr.code}) - <AttributeBadge type={attr.type as any} size="sm" />
          </option>
        ))}
      </select>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Aileye eklemek istediğiniz öznitelikleri seçin (Çoklu seçim için CTRL tuşunu basılı tutun)
      </p>
    </div>
  );
};

export default AttributeSelector; 