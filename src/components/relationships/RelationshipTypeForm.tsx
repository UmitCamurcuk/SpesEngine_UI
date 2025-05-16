import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { relationshipService } from '../../services';
import { IRelationshipType } from '../../types/relationship';
import { useTranslation } from '../../context/i18nContext';

interface RelationshipTypeFormProps {
  initialData?: Partial<IRelationshipType>;
  mode: 'create' | 'edit';
}

const entityTypes = ['product', 'category', 'family', 'attribute', 'attributeGroup', 'itemType'];

const RelationshipTypeForm = ({ initialData, mode }: RelationshipTypeFormProps) => {
  const [formData, setFormData] = useState<Partial<IRelationshipType>>({
    code: '',
    name: '',
    description: '',
    isDirectional: true,
    allowedSourceTypes: [],
    allowedTargetTypes: [],
    metadata: {},
    ...initialData
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  // ID ile düzenleme modunda veri yükleme
  useEffect(() => {
    if (mode === 'edit' && initialData?._id) {
      const fetchRelationshipType = async () => {
        try {
          setLoading(true);
          const data = await relationshipService.getRelationshipTypeById(initialData._id as string);
          setFormData(data);
          setError(null);
        } catch (err) {
          console.error('İlişki tipi getirilemedi:', err);
          setError(t('error_fetching_relationship_type', 'common') || 'İlişki tipi yüklenirken bir hata oluştu');
        } finally {
          setLoading(false);
        }
      };

      if (!initialData.name) { // Eğer sadece ID varsa detayları getir
        fetchRelationshipType();
      }
    }
  }, [initialData, mode, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, field: 'allowedSourceTypes' | 'allowedTargetTypes') => {
    const options = Array.from(e.target.selectedOptions).map(option => option.value);
    
    setFormData(prev => ({
      ...prev,
      [field]: options
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (mode === 'create') {
        await relationshipService.createRelationshipType(formData);
      } else {
        if (!initialData?._id) throw new Error('ID bulunamadı');
        await relationshipService.updateRelationshipType(initialData._id, formData);
      }
      
      navigate('/relationships/types');
    } catch (err) {
      console.error('İlişki tipi kaydedilemedi:', err);
      setError(t('error_saving_relationship_type', 'common') || 'İlişki tipi kaydedilirken bir hata oluştu');
      setLoading(false);
    }
  };

  if (loading && mode === 'edit') {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light dark:border-primary-dark"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {mode === 'create' 
            ? t('create_relationship_type', 'relationships') 
            : t('edit_relationship_type', 'relationships')}
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 m-4 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="code">
              {t('code', 'common')} *
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              value={formData.code || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark focus:border-primary-light dark:focus:border-primary-dark dark:bg-gray-700 dark:text-white"
              placeholder={t('enter_relationship_type_code', 'relationships') || 'İlişki tipi kodu girin'}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="name">
              {t('name', 'common')} *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark focus:border-primary-light dark:focus:border-primary-dark dark:bg-gray-700 dark:text-white"
              placeholder={t('enter_relationship_type_name', 'relationships') || 'İlişki tipi adı girin'}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="description">
            {t('description', 'common')}
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark focus:border-primary-light dark:focus:border-primary-dark dark:bg-gray-700 dark:text-white"
            placeholder={t('enter_relationship_type_description', 'relationships') || 'İlişki tipi açıklaması girin'}
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center">
            <input
              id="isDirectional"
              name="isDirectional"
              type="checkbox"
              checked={formData.isDirectional || false}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark border-gray-300 dark:border-gray-600 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300" htmlFor="isDirectional">
              {t('is_directional', 'relationships')}
            </label>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('directional_relationship_hint', 'relationships') || 'Yönlü ilişkiler kaynak ve hedef arasında belirli bir yön içerir (örn. "sahiptir", "parçasıdır").'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="allowedSourceTypes">
              {t('allowed_source_types', 'relationships')} *
            </label>
            <select
              id="allowedSourceTypes"
              name="allowedSourceTypes"
              multiple
              required
              value={formData.allowedSourceTypes || []}
              onChange={(e) => handleMultiSelectChange(e, 'allowedSourceTypes')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark focus:border-primary-light dark:focus:border-primary-dark dark:bg-gray-700 dark:text-white"
              size={5}
            >
              {entityTypes.map((type) => (
                <option key={`source-${type}`} value={type}>
                  {t(type, 'entity_types') || type}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('multiple_select_hint', 'common') || 'Birden fazla seçim için Ctrl/Cmd tuşunu basılı tutun'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="allowedTargetTypes">
              {t('allowed_target_types', 'relationships')} *
            </label>
            <select
              id="allowedTargetTypes"
              name="allowedTargetTypes"
              multiple
              required
              value={formData.allowedTargetTypes || []}
              onChange={(e) => handleMultiSelectChange(e, 'allowedTargetTypes')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark focus:border-primary-light dark:focus:border-primary-dark dark:bg-gray-700 dark:text-white"
              size={5}
            >
              {entityTypes.map((type) => (
                <option key={`target-${type}`} value={type}>
                  {t(type, 'entity_types') || type}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('multiple_select_hint', 'common') || 'Birden fazla seçim için Ctrl/Cmd tuşunu basılı tutun'}
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => navigate('/relationships/types')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-primary-dark"
          >
            {t('cancel', 'common')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-light dark:bg-primary-dark hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-primary-dark disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('saving', 'common')}
              </span>
            ) : (
              mode === 'create' ? t('create', 'common') : t('save', 'common')
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RelationshipTypeForm; 