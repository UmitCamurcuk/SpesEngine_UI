import React from 'react';
import { useAppSelector } from '../../redux/store';
import TranslationExample from '../../components/demo/TranslationExample';
import { useTranslation } from '../../context/i18nContext';

const ProfilePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {t('profile')}
      </h1>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('profile_information')}
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('name')}
              </p>
              <p className="text-base text-gray-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('email')}
              </p>
              <p className="text-base text-gray-900 dark:text-white">
                {user?.email}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('role')}
              </p>
              <p className="text-base text-gray-900 dark:text-white">
                {user?.role?.name || '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Çeviri örneği komponenti */}
      <div className="mb-8">
        <TranslationExample />
      </div>
    </div>
  );
};

export default ProfilePage; 