import { RelationshipTypeList } from '../../../../components/relationships';
import { useTranslation } from '../../../../context/i18nContext';

const RelationshipTypesListPage = () => {
  const { t } = useTranslation();
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('relationship_types', 'relationships')}
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {t('relationship_types_description', 'relationships') || 
            'İlişki tipleri, varlıklar arasındaki bağlantıları tanımlar ve yönetir.'}
        </p>
      </div>
      
      <RelationshipTypeList />
    </div>
  );
};

export default RelationshipTypesListPage;