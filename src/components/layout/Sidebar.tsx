import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

// MDM navigasyon menüleri için tip tanımı
interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  children?: Omit<NavItem, 'children' | 'icon'>[];
}

const Sidebar = ({ isOpen, closeSidebar }: SidebarProps) => {
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  // Başlangıçta şu anki rota ile eşleşen menüyü aç
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Şu anki rota ile eşleşen üst menüyü bul
    navItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some(child => 
          currentPath === child.path || currentPath.startsWith(child.path + '/')
        );
        
        if (isChildActive) {
          setOpenDropdowns(prev => ({...prev, [item.path]: true}));
        }
      }
    });
  }, [location.pathname]);

  // Menüler dışında bir yere tıklandığında sidebar'ı kapat (sadece mobil görünümde)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isOpen) {
        closeSidebar();
      }
    };

    // Sadece mobil görünümde aktif olsun
    if (isOpen && window.innerWidth < 768) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeSidebar]);

  // Rota değiştiğinde mobil görünümde sidebar'ı kapat
  useEffect(() => {
    if (window.innerWidth < 768) {
      closeSidebar();
    }
  }, [location.pathname, closeSidebar]);

  // Dropdown menüyü aç/kapat
  const toggleDropdown = (path: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Alt menü aktif mi kontrol et
  const isChildActive = (item: NavItem) => {
    if (!item.children) return false;
    return item.children.some(child => 
      location.pathname === child.path || location.pathname.startsWith(child.path + '/')
    );
  };

  // MDM navigasyon menüleri
  const navItems: NavItem[] = [
    {
      name: 'Ana Sayfa',
      path: '/',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
        </svg>
      )
    },
    {
      name: 'Öznitelikler',
      path: '/attributes',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
        </svg>
      ),
      children: [
        { name: 'Öznitelik Listesi', path: '/attributes/list' },
        { name: 'Öznitelik Ekle', path: '/attributes/create' }
      ]
    },
    {
      name: 'Öznitelik Grupları',
      path: '/attributeGroups',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
        </svg>
      ),
      children: [
        { name: 'Grup Listesi', path: '/attributeGroups/list' },
        { name: 'Grup Ekle', path: '/attributeGroups/create' }
      ]
    },
    {
      name: 'Ürün Tipleri',
      path: '/itemtypes',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
        </svg>
      ),
      children: [
        { name: 'Tip Listesi', path: '/itemtypes/list' },
        { name: 'Tip Ekle', path: '/itemtypes/create' }
      ]
    },
    {
      name: 'Ürünler',
      path: '/items',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"></path>
          <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd"></path>
        </svg>
      ),
      children: [
        { name: 'Ürün Listesi', path: '/items/list' },
        { name: 'Ürün Ekle', path: '/items/create' }
      ]
    },
    {
      name: 'Kategoriler',
      path: '/categories',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z" clipRule="evenodd"></path>
          <path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"></path>
        </svg>
      ),
      children: [
        { name: 'Kategori Listesi', path: '/categories/list' },
        { name: 'Kategori Ekle', path: '/categories/create' }
      ]
    },
    {
      name: 'Aileler',
      path: '/families',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
        </svg>
      ),
      children: [
        { name: 'Aile Listesi', path: '/families/list' },
        { name: 'Aile Ekle', path: '/families/create' }
      ]
    }
  ];

  const activeClass = "bg-gray-100 dark:bg-gray-700 text-primary-light dark:text-primary-dark";
  const inactiveClass = "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";

  return (
    <>
      {/* Sidebar arkaplan overlay (sadece mobil) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 md:hidden" 
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-14 left-0 z-20 w-64 h-[calc(100vh-3.5rem)] transition-transform border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => (
              <div key={item.path} className="mb-1">
                {item.children ? (
                  // Ana menü öğesi (dropdown) 
                  <div>
                    <button
                      type="button"
                      className={`flex items-center justify-between w-full p-2 text-sm font-medium rounded-lg ${
                        isChildActive(item) ? activeClass : inactiveClass
                      }`}
                      onClick={() => toggleDropdown(item.path)}
                      aria-expanded={openDropdowns[item.path]}
                    >
                      <div className="flex items-center">
                        <div className="mr-2 text-gray-500 dark:text-gray-400">{item.icon}</div>
                        <span>{item.name}</span>
                      </div>
                      <svg 
                        className={`w-4 h-4 transition-transform ${openDropdowns[item.path] ? 'transform rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    
                    {/* Alt menü öğeleri - dropdown içeriği */}
                    <div className={`pl-6 mt-1 space-y-1 overflow-hidden transition-all duration-200 ${
                      openDropdowns[item.path] ? 'max-h-40' : 'max-h-0'
                    }`}>
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={({ isActive }) =>
                            `flex items-center p-2 text-xs font-medium rounded-lg ${
                              isActive ? activeClass : inactiveClass
                            }`
                          }
                        >
                          <span>{child.name}</span>
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Tekli menü öğesi
                  <NavLink
                    to={item.path}
                    end={item.path === '/'} // Sadece ana sayfa için end kullan
                    className={({ isActive }) => 
                      `flex items-center p-2 text-sm font-medium rounded-lg ${
                        isActive ? activeClass : inactiveClass
                      }`
                    }
                  >
                    <div className="mr-2 text-gray-500 dark:text-gray-400">{item.icon}</div>
                    <span>{item.name}</span>
                  </NavLink>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar; 