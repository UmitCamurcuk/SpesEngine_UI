import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { useTranslation } from '../../context/i18nContext';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const { mode, toggleTheme } = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { t } = useTranslation();
  const [systemTitle, setSystemTitle] = useState('SpesEngine');
  const [logoUrl, setLogoUrl] = useState('/logo.png');

  useEffect(() => {
    // LocalStorage'dan sistem ayarlarını al
    const systemSettings = localStorage.getItem('systemSettings');
    if (systemSettings) {
      try {
        const settings = JSON.parse(systemSettings);
        if (settings.systemTitle) {
          setSystemTitle(settings.systemTitle);
        }
        if (settings.logoUrl) {
          setLogoUrl(settings.logoUrl);
        }
      } catch (error) {
        console.error('Sistem ayarları parse edilirken hata:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    navigate('/auth/logout');
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 w-full z-30 h-14">
      <div className="px-3 py-2 h-full flex items-center justify-between">
        {/* Sol Taraf: Hamburger ve Logo */}
        <div className="flex items-center">
          <button
            type="button"
            className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none rounded-lg text-sm p-2 mr-2"
            onClick={toggleSidebar}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
            </svg>
          </button>
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src={logoUrl} 
              alt={systemTitle}
              className="h-8 w-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
            <span className="text-primary-light dark:text-primary-dark text-xl font-semibold whitespace-nowrap">{systemTitle}</span>
          </Link>
        </div>

        {/* Sağ Taraf: Tema Değiştirici ve Kullanıcı Menü */}
        <div className="flex items-center space-x-3">
          {/* Tema Değiştirici */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label={mode === 'dark' ? t('switch_to_light', 'theme') : t('switch_to_dark', 'theme')}
          >
            {mode === 'dark' ? (
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Notification Icon */}
          <button className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300 relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">3</span>
          </button>

          {/* Kullanıcı Profil Menüsü */}
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
                
                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">{t('my_profile', 'nav')}</Link>
                <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">{t('settings', 'common')}</Link>
                
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