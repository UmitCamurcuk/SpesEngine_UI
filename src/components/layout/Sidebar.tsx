import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from '../../context/i18nContext';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  children?: Omit<NavItem, 'children' | 'icon'>[];
}

const Sidebar = ({ isOpen, closeSidebar }: SidebarProps) => {
  const location = useLocation();
  const { t } = useTranslation();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  console.log('Sidebar render:', { isOpen, windowWidth: window.innerWidth });

  const toggleDropdown = (path: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const isChildActive = (item: NavItem) => {
    if (!item.children) return false;
    return item.children.some(child =>
      location.pathname === child.path || location.pathname.startsWith(child.path + '/')
    );
  };

  const navItems: NavItem[] = [
    {
      name: t('home', 'menu'),
      path: '/',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
        </svg>
      ),
      children: [
        { name: t('Dash1', 'menu'), path: '/' },
        { name: t('Dash2', 'menu'), path: '/Dashboard2' },
        { name: t('Dash3', 'menu'), path: '/Dashboard3' }
      ]
    },
    {
      name: t('attributes', 'menu'),
      path: '/attributes',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
        </svg>
      ),
      children: [
        { name: t('attribute_list', 'menu'), path: '/attributes/list' },
        { name: t('add_attribute', 'menu'), path: '/attributes/create' }
      ]
    },
    {
      name: t('attribute_groups', 'menu'),
      path: '/attributeGroups',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
        </svg>
      ),
      children: [
        { name: t('group_list', 'menu'), path: '/attributeGroups/list' },
        { name: t('add_group', 'menu'), path: '/attributeGroups/create' }
      ]
    },
    {
      name: t('item_types', 'menu'),
      path: '/itemtypes',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
        </svg>
      ),
      children: [
        { name: t('type_list', 'menu'), path: '/itemtypes/list' },
        { name: t('add_type', 'menu'), path: '/itemtypes/create' }
      ]
    },
    {
      name: t('items', 'menu'),
      path: '/items',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"></path>
          <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd"></path>
        </svg>
      ),
      children: [
        { name: t('item_list', 'menu'), path: '/items/list' },
        { name: t('add_item', 'menu'), path: '/items/create' }
      ]
    },
    {
      name: t('categories', 'menu'),
      path: '/categories',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z" clipRule="evenodd"></path>
          <path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"></path>
        </svg>
      ),
      children: [
        { name: t('category_list', 'menu'), path: '/categories/list' },
        { name: t('add_category', 'menu'), path: '/categories/create' }
      ]
    },
    {
      name: t('families', 'menu'),
      path: '/families',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
        </svg>
      ),
      children: [
        { name: t('family_list', 'menu'), path: '/families/list' },
        { name: t('add_family', 'menu'), path: '/families/create' }
      ]
    },
    {
      name: t('relationships', 'menu'),
      path: '/relationships',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
        </svg>
      ),
      children: [
        { name: t('relationship_type_list', 'menu'), path: '/relationships/types/list' },
        { name: t('add_relationship_type', 'menu'), path: '/relationships/types/create' }
      ]
    },
    {
      name: t('roles', 'menu'),
      path: '/roles',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
        </svg>
      ),
      children: [
        { name: t('role_list', 'menu'), path: '/roles/list' },
        { name: t('add_role', 'menu'), path: '/roles/create' }
      ]
    },
    {
      name: t('permissions', 'menu'),
      path: '/permissions',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
        </svg>
      ),
      children: [
        { name: t('permission_list', 'menu'), path: '/permissions/list' },
        { name: t('add_permission', 'menu'), path: '/permissions/create' }
      ]
    },
    {
      name: t('permission_groups', 'menu'),
      path: '/permissionGroups',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
        </svg>
      ),
      children: [
        { name: t('permission_group_list', 'menu'), path: '/permissionGroups/list' },
        { name: t('add_permission_group', 'menu'), path: '/permissionGroups/create' }
      ]
    },
    {
      name: t('localization', 'menu'),
      path: '/localizations',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.4-1.423 17.087 17.087 0 003.13-3.733c-.97-1.382-1.72-2.694-2.207-3.885C3.01 5.836 2.5 3.896 3.183 3.16c.736-.738 2.736-.198 4.698 1.271.985.608 1.875 1.313 2.57 2.065a15.498 15.498 0 012.741 2.155 1 1 0 01-1.384 1.445a13.495 13.495 0 00-2.41-1.895c-1.076-1.051-2.36-2.042-3.729-2.777-2.325-1.25-3.582-1.297-3.739-1.118-.16.18-.11 1.43.66 3.664.43 1.223 1.131 2.5 2.07 3.84.745-.693 1.543-1.443 2.403-2.252.438.41.895.792 1.368 1.145a19.638 19.638 0 01-3.655 3.489c-.36-.376-.676-.795-.954-1.247a19.783 19.783 0 01-.821-1.27 1 1 0 111.8-.888c.194.297.4.589.617.863.623-.749 1.204-1.478 1.746-2.185.057-.075.11-.148.166-.22H13a1 1 0 110 2h-2a1 1 0 01-1-1V2z" clipRule="evenodd"></path>
        </svg>
      ),
      children: [
        { name: t('translation_list', 'menu'), path: '/localizations/list' },
        { name: t('add_translation', 'menu'), path: '/localizations/create' }
      ]
    },
    {
      name: t('system', 'menu'),
      path: '/system',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      ),
      children: [
        { name: t('system_settings', 'menu'), path: '/system/settings' }
      ]
    }
  ];

  const activeClass = "bg-gray-100 dark:bg-gray-700 text-primary-light dark:text-primary-dark";
  const inactiveClass = "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";

  const shouldShowSidebar = isOpen || window.innerWidth >= 768;
  console.log('Should show sidebar:', shouldShowSidebar);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 md:hidden"
          onClick={() => {
            console.log('Overlay clicked, closing sidebar');
            closeSidebar();
          }}
        />
      )}

      {shouldShowSidebar && (
        <aside
          className="fixed top-14 left-0 z-40 w-64 h-[calc(100vh-3.5rem)] 
            bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
        >
          <nav className="h-full px-3 py-4 overflow-y-auto">
            {navItems.map((item) => (
              <div key={item.path} className="mb-1">
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleDropdown(item.path)}
                      className={`flex items-center justify-between w-full p-2 text-sm font-medium rounded-lg 
                        ${isChildActive(item) ? activeClass : inactiveClass}`}
                    >
                      <div className="flex items-center">
                        <div className="mr-2 text-gray-500 dark:text-gray-400">{item.icon}</div>
                        <span>{item.name}</span>
                      </div>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <div className={`pl-6 mt-1 space-y-1 overflow-hidden transition-all duration-200 
                      ${openDropdowns[item.path] ? 'max-h-40' : 'max-h-0'}`}
                    >
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onClick={() => {
                            console.log('Child NavLink clicked, closing sidebar');
                            closeSidebar();
                          }}
                          className={({ isActive }) =>
                            `flex items-center p-2 text-xs font-medium rounded-lg ${isActive ? activeClass : inactiveClass}`
                          }
                        >
                          <span>{child.name}</span>
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    onClick={() => {
                      console.log('Main NavLink clicked, closing sidebar');
                      closeSidebar();
                    }}
                    className={({ isActive }) =>
                      `flex items-center p-2 text-sm font-medium rounded-lg ${isActive ? activeClass : inactiveClass}`
                    }
                  >
                    <div className="mr-2 text-gray-500 dark:text-gray-400">{item.icon}</div>
                    <span>{item.name}</span>
                  </NavLink>
                )}
              </div>
            ))}
          </nav>
        </aside>
      )}
    </>
  );
};

export default Sidebar; 