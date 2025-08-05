import { useState, useEffect } from 'react';
import { relationshipService } from '../../services';
import { IRelationshipType } from '../../types/association';
import { useTranslation } from '../../context/i18nContext';

interface CreateAssociationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceEntityId: string;
  sourceEntityType: string;
  onSuccess?: () => void;
}

const CreateAssociationModal = ({ 
  isOpen, 
  onClose, 
  sourceEntityId, 
  sourceEntityType,
  onSuccess
}: CreateAssociationModalProps) => {
  const [relationshipTypes, setRelationshipTypes] = useState<IRelationshipType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [targetEntityId, setTargetEntityId] = useState<string>('');
  const [targetEntityType, setTargetEntityType] = useState<string>('');
  const [filteredTypes, setFilteredTypes] = useState<IRelationshipType[]>([]);
  const { t } = useTranslation();

  // İlişki tiplerini yükle
  useEffect(() => {
    if (!isOpen) return;

    const fetchRelationshipTypes = async () => {
      try {
        setLoading(true);
        const data = await relationshipService.getAllRelationshipTypes();
        // Kaynak varlık tipine uygun ilişki tiplerini filtrele
        const filteredData = data.filter(type => 
          type.allowedSourceTypes.includes(sourceEntityType)
        );
        setRelationshipTypes(data);
        setFilteredTypes(filteredData);
        setError(null);
      } catch (err) {
        console.error('İlişki tipleri getirilemedi:', err);
        setError(t('error_fetching_relationship_types', 'common') || 'İlişki tipleri yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchRelationshipTypes();
  }, [isOpen, sourceEntityType, t]);

  // Seçilen ilişki tipine göre hedef varlık tiplerini güncelle
  useEffect(() => {
    if (selectedTypeId) {
      const selectedType = relationshipTypes.find(type => type._id === selectedTypeId);
      if (selectedType && selectedType.allowedTargetTypes.length > 0) {
        setTargetEntityType(selectedType.allowedTargetTypes[0]);
      } else {
        setTargetEntityType('');
      }
    }
  }, [selectedTypeId, relationshipTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTypeId || !sourceEntityId || !targetEntityId || !targetEntityType) {
      setError(t('fill_all_fields', 'common') || 'Lütfen tüm alanları doldurun');
      return;
    }
    
    try {
      setLoading(true);
      
      await relationshipService.createRelationship({
        relationshipTypeId: selectedTypeId,
        sourceEntityId,
        sourceEntityType,
        targetEntityId,
        targetEntityType,
        status: 'active'
      });
      
      setSuccessMessage(t('relationship_created_successfully', 'relationships') || 'İlişki başarıyla oluşturuldu');
      
      // Form alanlarını sıfırla
      setSelectedTypeId('');
      setTargetEntityId('');
      setTargetEntityType('');
      
      if (onSuccess) {
        onSuccess();
      }
      
      // 2 saniye sonra başarı mesajını kaldır ve modalı kapat
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error('İlişki oluşturulamadı:', err);
      setError(t('error_creating_relationship', 'common') || 'İlişki oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-auto">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              onClick={onClose}
            >
              <span className="sr-only">{t('close', 'common')}</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('create_relationship', 'relationships')}
            </h3>
            
            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            
            {successMessage && (
              <div className="mb-4 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="sourceEntityType">
                  {t('source_entity_type', 'relationships')}
                </label>
                <input
                  type="text"
                  id="sourceEntityType"
                  value={t(sourceEntityType, 'entity_types') || sourceEntityType}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="sourceEntityId">
                  {t('source_entity_id', 'relationships')}
                </label>
                <input
                  type="text"
                  id="sourceEntityId"
                  value={sourceEntityId}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="relationshipTypeId">
                  {t('relationship_type', 'relationships')} *
                </label>
                
                {loading ? (
                  <div className="animate-pulse h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ) : filteredTypes.length === 0 ? (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {t('no_valid_relationship_types', 'relationships') || 'Bu varlık tipi için uygun ilişki tipi bulunamadı'}
                  </div>
                ) : (
                  <select
                    id="relationshipTypeId"
                    value={selectedTypeId}
                    onChange={(e) => setSelectedTypeId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark focus:border-primary-light dark:focus:border-primary-dark dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">{t('select_relationship_type', 'relationships')}</option>
                    {filteredTypes.map((type) => (
                      <option key={type._id} value={type._id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              {selectedTypeId && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="targetEntityType">
                      {t('target_entity_type', 'relationships')} *
                    </label>
                    
                    <select
                      id="targetEntityType"
                      value={targetEntityType}
                      onChange={(e) => setTargetEntityType(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark focus:border-primary-light dark:focus:border-primary-dark dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">{t('select_target_entity_type', 'relationships')}</option>
                      {relationshipTypes
                        .find(type => type._id === selectedTypeId)
                        ?.allowedTargetTypes.map((type) => (
                          <option key={type} value={type}>
                            {t(type, 'entity_types') || type}
                          </option>
                        ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="targetEntityId">
                      {t('target_entity_id', 'relationships')} *
                    </label>
                    <input
                      type="text"
                      id="targetEntityId"
                      value={targetEntityId}
                      onChange={(e) => setTargetEntityId(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark focus:border-primary-light dark:focus:border-primary-dark dark:bg-gray-700 dark:text-white"
                      placeholder={t('enter_target_entity_id', 'relationships') || 'Hedef varlık ID girin'}
                    />
                  </div>
                </>
              )}
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  {t('cancel', 'common')}
                </button>
                <button
                  type="submit"
                  disabled={loading || filteredTypes.length === 0}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-light dark:bg-primary-dark hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('creating', 'common')}
                    </span>
                  ) : (
                    t('create', 'common')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAssociationModal; 