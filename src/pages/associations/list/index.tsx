import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../context/i18nContext';
import ListPageLayout from '../../../components/layout/ListPageLayout';
import SimpleAssociationList from '../../../components/SimpleAssociationList';

// MAIN COMPONENT
const AssociationsListPage: React.FC = () => {
  // HOOKS
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <ListPageLayout 
      title="Association Yönetimi"
      breadcrumbItems={[
        { label: t('home'), path: '/' },
        { label: 'Associations' }
      ]}
    >
      <SimpleAssociationList mode="full" />
    </ListPageLayout>
  );
};

export default AssociationsListPage;