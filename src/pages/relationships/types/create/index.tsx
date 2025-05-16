import { RelationshipTypeForm } from '../../../../components/relationships';
import { useTranslation } from '../../../../context/i18nContext';

const CreateRelationshipTypePage = () => {
  const { t } = useTranslation();
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('create_relationship_type', 'relationships')}
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {t('create_relationship_type_description', 'relationships') || 
            'Yeni bir ilişki tipi tanımlayarak varlıklar arasındaki ilişkileri yapılandırın.'}
        </p>
      </div>
      
      <RelationshipTypeForm mode="create" />
    </div>
  );
};

export default CreateRelationshipTypePage; 