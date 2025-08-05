import { useState, useEffect } from 'react';
import { associationService } from '../../services';
import { IRelationship } from '../../types/association';
import { useTranslation } from '../../context/i18nContext';

interface EntityAssociationsPanelProps {
  entityId: string;
  entityType: string;
  onAddRelationship?: () => void;
}

const EntityAssociationsPanel = ({ entityId, entityType, onAddRelationship }: EntityAssociationsPanelProps) => {
  const [relationships, setRelationships] = useState<IRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing' | 'all'>('all');
  const { t } = useTranslation();

  useEffect(() => {
    if (entityId && entityType) {
      fetchRelationships();
    }
  }, [entityId, entityType, activeTab]);

  const fetchRelationships = async () => {
    try {
      setLoading(true);
      let role: 'source' | 'target' | 'any' = 'any';
      
      if (activeTab === 'outgoing') role = 'source';
      if (activeTab === 'incoming') role = 'target';
      
      const data = await associationService.getRelationshipsByEntity(
        entityType,
        entityId,
        role
      );
      
      setRelationships(data);
      setError(null);
    } catch (err) {
      console.error('İlişkiler getirilemedi:', err);
      setError(t('error_fetching_relationships', 'common') || 'İlişkiler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: 'active' | 'inactive' | 'pending' | 'archived') => {
    try {
      await associationService.changeRelationshipStatus(id, status);
      
      // İlişkiyi güncelle
      setRelationships(prevRelationships => 
        prevRelationships.map(rel => 
          rel._id === id ? { ...rel, status } : rel
        )
      );
    } catch (err) {
      console.error('İlişki durumu değiştirilemedi:', err);
      alert(t('error_changing_relationship_status', 'common') || 'İlişki durumu değiştirilirken bir hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('confirm_delete_relationship', 'common') || 'Bu ilişkiyi silmek istediğinizden emin misiniz?')) {
      try {
        await associationService.deleteRelationship(id);
        setRelationships(prevRelationships => prevRelationships.filter(rel => rel._id !== id));
      } catch (err) {
        console.error('İlişki silinemedi:', err);
        alert(t('error_deleting_relationship', 'common') || 'İlişki silinirken bir hata oluştu');
      }
    }
  };

  const getRelationshipDirection = (relationship: IRelationship) => {
    if (relationship.sourceEntityId === entityId) {
      return 'outgoing';
    } else if (relationship.targetEntityId === entityId) {
      return 'incoming';
    }
    return 'unknown';
  };

  const getDisplayText = (relationship: IRelationship) => {
    const direction = getRelationshipDirection(relationship);
    const associationName = relationship.association?.name || 'İlişki';
    
    if (direction === 'outgoing') {
      return `${associationName} → ${relationship.targetEntityType}`;
    } else if (direction === 'incoming') {
      return `${relationship.sourceEntityType} → ${associationName}`;
    }
    
    return associationName;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-light dark:border-primary-dark"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {t('relationships', 'common')}
        </h3>
        {onAddRelationship && (
          <button
            onClick={onAddRelationship}
            className="px-3 py-1 bg-primary-light dark:bg-primary-dark text-white rounded text-sm hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
          >
            {t('add_relationship', 'relationships')}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 m-4 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={fetchRelationships}
            className="mt-2 px-3 py-1 bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300 rounded"
          >
            {t('retry', 'common')}
          </button>
        </div>
      )}

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'all'
                ? 'text-primary-light dark:text-primary-dark border-b-2 border-primary-light dark:border-primary-dark'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t('all_relationships', 'relationships')}
          </button>
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'outgoing'
                ? 'text-primary-light dark:text-primary-dark border-b-2 border-primary-light dark:border-primary-dark'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t('outgoing_relationships', 'relationships')}
          </button>
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'incoming'
                ? 'text-primary-light dark:text-primary-dark border-b-2 border-primary-light dark:border-primary-dark'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t('incoming_relationships', 'relationships')}
          </button>
        </nav>
      </div>

      {relationships.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          {t('no_relationships_found', 'relationships')}
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {relationships.map((relationship) => (
            <li key={relationship._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      getRelationshipDirection(relationship) === 'outgoing' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    }`}>
                      {getRelationshipDirection(relationship) === 'outgoing' 
                        ? t('outgoing', 'relationships') 
                        : t('incoming', 'relationships')}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      relationship.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      relationship.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      relationship.status === 'inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {t(relationship.status, 'status')}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {getDisplayText(relationship)}
                  </div>
                  {relationship.targetEntityId && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ID: {getRelationshipDirection(relationship) === 'outgoing' ? relationship.targetEntityId : relationship.sourceEntityId}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <select
                    value={relationship.status}
                    onChange={(e) => handleStatusChange(relationship._id, e.target.value as any)}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <option value="active">{t('active', 'status')}</option>
                    <option value="inactive">{t('inactive', 'status')}</option>
                    <option value="pending">{t('pending', 'status')}</option>
                    <option value="archived">{t('archived', 'status')}</option>
                  </select>
                  <button
                    onClick={() => handleDelete(relationship._id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EntityAssociationsPanel; 