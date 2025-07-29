import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { useTranslation } from '../../context/i18nContext';
import systemSettingsService from '../../services/api/systemSettingsService';
import itemTypeService from '../../services/api/itemTypeService';
import { getEntityName } from '../../utils/translationUtils';
import type { ItemType } from '../../types/itemType';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { t, currentLanguage } = useTranslation();
  const [systemTitle, setSystemTitle] = useState('SpesEngine');
  const [logoUrl, setLogoUrl] = useState<string | null>('/logo.png');
  const [logoError, setLogoError] = useState(false);
  const [dynamicItemTypes, setDynamicItemTypes] = useState<ItemType[]>([]);

  const loadSystemSettings = async () => {
    try {
      const systemSettingsStr = localStorage.getItem('systemSettings');
      let settings = null;
      
      if (systemSettingsStr) {
        try {
          settings = JSON.parse(systemSettingsStr);
        } catch (parseError) {
          console.error('Sistem ayarları parse edilirken hata:', parseError);
        }
      }
      
      if (!settings) {
        try {
          settings = await systemSettingsService.getSettings();
          localStorage.setItem('systemSettings', JSON.stringify(settings));
        } catch (apiError) {
          console.error('API\'den sistem ayarları alınırken hata:', apiError);
        }
      }
      
      if (settings) {
        if (settings.systemTitle) {
          setSystemTitle(settings.systemTitle);
        }
        
        if (settings.logoUrl) {
          setLogoUrl(settings.logoUrl);
          setLogoError(false);
        }
      }
    } catch (error) {
      console.error('Sistem ayarları yüklenirken beklenmeyen hata:', error);
    }
  };

  // Dinamik itemtype'ları yükle
  const loadDynamicItemTypes = async () => {
    try {
      const itemTypes = await itemTypeService.getItemTypesForNavbar();
      setDynamicItemTypes(itemTypes);
    } catch (error) {
      console.error('Navbar itemTypes yüklenirken hata:', error);
    }
  };

  useEffect(() => {
    loadSystemSettings();
    loadDynamicItemTypes();

    const handleSystemSettingsUpdate = () => {
      loadSystemSettings();
    };

    window.addEventListener('systemSettingsUpdated', handleSystemSettingsUpdate);

    return () => {
      window.removeEventListener('systemSettingsUpdated', handleSystemSettingsUpdate);
    };
  }, []);

  const handleLogout = () => {
    navigate('/auth/logout');
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="h-full px-3 flex items-center justify-between">
        {/* Sol Taraf: Hamburger, Logo ve Dinamik ItemType Linkleri */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none rounded-lg text-sm p-2.5 mr-2"
            onClick={toggleSidebar}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <Link to="/" className="flex items-center space-x-2">
            {!logoError && logoUrl ? (
              <img 
                src={logoUrl} 
                alt={systemTitle}
                className="h-8 w-auto max-w-[120px] object-contain"
                onError={(e) => {
                  setLogoError(true);
                  (e.target as HTMLImageElement).src = '';
                }}
              />
            ) : (
              <div className="h-8 w-8 flex items-center justify-center bg-primary-light dark:bg-primary-dark text-white rounded-md">
                <span className="text-lg font-bold">{systemTitle.charAt(0)}</span>
              </div>
            )}
            <span className="text-primary-light dark:text-primary-dark text-xl font-semibold whitespace-nowrap">{systemTitle}</span>
          </Link>
          
          {/* Dinamik ItemType Linkleri */}
          {dynamicItemTypes.length > 0 && (
            <div className="hidden md:flex items-center space-x-1">
              {dynamicItemTypes
                .sort((a, b) => (a.settings?.navigation?.navbarOrder || 999) - (b.settings?.navigation?.navbarOrder || 999))
                .map((itemType) => (
                <Link
                  key={itemType._id}
                  to={`/items/type/${itemType.code}`}
                  className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                >
                  {itemType.settings?.navigation?.navbarLabel || getEntityName(itemType, currentLanguage)}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sağ Taraf: Bildirimler ve Kullanıcı Menü */}
        <div className="flex items-center space-x-3">
          {/* Bildirimler */}
          <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300 relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">3</span>
          </button>

          {/* Kullanıcı Menü */}
          <div className="relative">
            <button
              type="button"
              className="flex text-sm bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
              onClick={toggleUserMenu}
            >
              <span className="sr-only">{t('open_user_menu', 'nav')}</span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary-light dark:bg-primary-dark text-white">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                  <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                  <div className="text-xs truncate">{user?.email}</div>
                </div>
                
                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  {t('my_profile', 'nav')}
                </Link>
                <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  {t('settings', 'common')}
                </Link>
                
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {t('logout', 'common')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 