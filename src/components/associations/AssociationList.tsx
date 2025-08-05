import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { relationshipService } from '../../services';
import { IRelationshipType } from '../../types/association';
import { useTranslation } from '../../context/i18nContext';

const AssociationList = () => {
  const [relationshipTypes, setRelationshipTypes] = useState<IRelationshipType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRelationshipTypes();
  }, []);

  const fetchRelationshipTypes = async () => {
    try {
      setLoading(true);
      const data = await relationshipService.getAllRelationshipTypes();
      setRelationshipTypes(data);
      setError(null);
    } catch (err) {
      console.error('İlişki tipleri getirilemedi:', err);
      setError(t('error_fetching_relationship_types', 'common') || 'İlişki tipleri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('confirm_delete_relationship_type', 'common') || 'Bu ilişki tipini silmek istediğinizden emin misiniz?')) {
      try {
        await relationshipService.deleteRelationshipType(id);
        setRelationshipTypes(prevTypes => prevTypes.filter(type => type._id !== id));
      } catch (err) {
        console.error('İlişki tipi silinemedi:', err);
        alert(t('error_deleting_relationship_type', 'common') || 'İlişki tipi silinirken bir hata oluştu');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light dark:border-primary-dark"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button 
          onClick={fetchRelationshipTypes}
          className="mt-2 px-3 py-1 bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300 rounded"
        >
          {t('retry', 'common')}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {t('relationship_types', 'relationships')}
        </h2>
        <Link
          to="/associations/create"
          className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
        >
          {t('add_relationship_type', 'relationships')}
        </Link>
      </div>

      {relationshipTypes.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          {t('no_relationship_types_found', 'relationships')}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('code', 'common')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('name', 'common')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('directional', 'relationships')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('source_types', 'relationships')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('target_types', 'relationships')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('actions', 'common')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {relationshipTypes.map((type) => (
                <tr key={type._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {type.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {type.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {type.isDirectional ? 
                      <span className="text-green-600 dark:text-green-400">{t('yes', 'common')}</span> : 
                      <span className="text-red-600 dark:text-red-400">{t('no', 'common')}</span>
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {type.allowedSourceTypes.join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {type.allowedTargetTypes.join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/associations/details/${type._id}`)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        {t('view', 'common')}
                      </button>
                      <button
                        onClick={() => handleDelete(type._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        {t('delete', 'common')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssociationList; 