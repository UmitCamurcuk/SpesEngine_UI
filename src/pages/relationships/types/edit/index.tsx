import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RelationshipTypeForm } from '../../../../components/relationships';
import { relationshipService } from '../../../../services';
import { useTranslation } from '../../../../context/i18nContext';

const EditRelationshipTypePage = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!id) {
    navigate('/relationships/types');
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('edit_relationship_type', 'relationships')}
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {t('edit_relationship_type_description', 'relationships') || 
            'İlişki tipi ayarlarını güncelleyin ve yönetin.'}
        </p>
      </div>
      
      {error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={() => navigate('/relationships/types')}
            className="mt-2 px-3 py-1 bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300 rounded"
          >
            {t('go_back', 'common')}
          </button>
        </div>
      ) : (
        <RelationshipTypeForm mode="edit" initialData={{ _id: id }} />
      )}
    </div>
  );
};

export default EditRelationshipTypePage; 