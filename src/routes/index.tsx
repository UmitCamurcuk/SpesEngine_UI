import { createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import LoginPage from '../pages/auth/login';
import RegisterPage from '../pages/auth/register';
import AppLayout from '../components/layout/AppLayout';
import PrivateRoute from '../components/layout/PrivateRoute';
import AttributesListPage from '../pages/attributes/list';
import AttributeCreatePage from '../pages/attributes/create';
import AttributeDetailsPage from '../pages/attributes/details';
import AttributeGroupsListPage from '../pages/attributeGroups/list';
import AttributeGroupCreatePage from '../pages/attributeGroups/create';
import AttributeGroupDetailsPage from '../pages/attributeGroups/details';
import ProfilePage from '../pages/profile';
import FamiliesListPage from '../pages/families/list';
import FamilyCreatePage from '../pages/families/create';
import FamilyDetailsPage from '../pages/families/details';
import ItemTypesListPage from '../pages/itemtypes/list';
import ItemTypeCreatePage from '../pages/itemtypes/create';
import ItemTypeDetailsPage from '../pages/itemtypes/details';
import ItemsListPage from '../pages/items/list';
import ItemDetailsPage from '../pages/items/details';
import ItemCreatePage from '../pages/items/create';
import CategoriesListPage from '../pages/categories/list';
import CategoryCreatePage from '../pages/categories/create';
import CategoryDetailsPage from '../pages/categories/details';
import RolesListPage from '../pages/roles/list';
import RoleCreatePage from '../pages/roles/create';
import RoleDetailsPage from '../pages/roles/details';
import PermissionsListPage from '../pages/permissions/list';
import PermissionCreatePage from '../pages/permissions/create';
import PermissionDetailsPage from '../pages/permissions/details';
import PermissionGroupCreatePage from '../pages/permissionGroups/create';
import PermissionGroupsListPage from '../pages/permissionGroups/list';
import PermissionGroupDetailsPage from '../pages/permissionGroups/details';
import LocalizationsListPage from '../pages/localizations/list';
import LocalizationCreatePage from '../pages/localizations/create';
import LocalizationDetailsPage from '../pages/localizations/details';
import RelationshipTypesListPage from '../pages/relationships/types/list';
import CreateRelationshipTypePage from '../pages/relationships/types/create/index';
import RelationshipTypeDetailsPage from '../pages/relationships/types/details';
import SystemSettingsPage from '../pages/system/settings';
import LoadingPage from '../pages/auth/loading';
import LogoutPage from '../pages/auth/logout';
import Dashboard2 from '../pages/dashboard/Dashboard2/index';
import Dashboard3 from '../pages/dashboard/Dashboard3/index';

// Error Pages
import NotFoundPage from '../pages/errors/NotFound';
import ServerErrorPage from '../pages/errors/ServerError';
import ForbiddenPage from '../pages/errors/Forbidden';

// Ana sayfa için basit bir test component'i
const DashboardOverview = () => (
  <div className="p-8">
    <h1 className="text-xl font-semibold mb-4">Master Data Management Ana Sayfası</h1>
    <p className="text-gray-700 dark:text-gray-300">Bu alan yetkilendirilmiş kullanıcılar için görünür.</p>
  </div>
);

// Tüm uygulamanın route tanımları
const routes: RouteObject[] = [
  {
    path: '/',
    children: [
      // Auth Routes - Layout dışında
      {
        path: 'auth/login',
        element: <LoginPage />
      },
      {
        path: 'auth/loading',
        element: <LoadingPage />
      },
      {
        path: 'auth/register',
        element: <RegisterPage />
      },
      {
        path: 'auth/logout',
        element: <LogoutPage />
      },
      
      // Error Routes - Layout dışında
      {
        path: 'error/404',
        element: <NotFoundPage />
      },
      {
        path: 'error/500',
        element: <ServerErrorPage />
      },
      {
        path: 'error/403',
        element: <ForbiddenPage />
      },
      
      // Ana Layout içindeki sayfalar
      {
        path: '/',
        element: <PrivateRoute><AppLayout /></PrivateRoute>,
        children: [
          // Ana Sayfa
          {
            index: true,
            element: <DashboardOverview />
          },
          {
            path: 'Dashboard2',
            index: true,
            element: <Dashboard2 />
          },

          {
            path: 'Dashboard3',
            index: true,
            element: <Dashboard3 />
          },
          
          // Profil Sayfası
          {
            path: 'profile',
            element: <ProfilePage />
          },
          
          // Öznitelikler
          {
            path: 'attributes/list',
            element: <AttributesListPage />
          },
          {
            path: 'attributes/create',
            element: <AttributeCreatePage />
          },
          {
            path: 'attributes/:id',
            element: <AttributeDetailsPage />
          },
          
          // Öznitelik Grupları
          {
            path: 'attributeGroups/list',
            element: <AttributeGroupsListPage />
          },
          {
            path: 'attributeGroups/create',
            element: <AttributeGroupCreatePage />
          },
          {
            path: 'attributeGroups/details/:id',
            element: <AttributeGroupDetailsPage />
          },
          
          // Öğe Tipleri
          {
            path: 'itemtypes/list',
            element: <ItemTypesListPage />
          },
          {
            path: 'itemtypes/create',
            element: <ItemTypeCreatePage />
          },
          {
            path: 'itemtypes/details/:id',
            element: <ItemTypeDetailsPage />
          },
          
          // Öğeler
          {
            path: 'items/list',
            element: <ItemsListPage />
          },
          {
            path: 'items/create',
            element: <ItemCreatePage />
          },
          {
            path: 'items/details/:id',
            element: <ItemDetailsPage />
          },
          
          // Kategoriler
          {
            path: 'categories/list',
            element: <CategoriesListPage />
          },
          {
            path: 'categories/create',
            element: <CategoryCreatePage />
          },
          {
            path: 'categories/details/:id',
            element: <CategoryDetailsPage />
          },
          
          // Ürün Aileleri
          {
            path: 'families/list',
            element: <FamiliesListPage />
          },
          {
            path: 'families/create',
            element: <FamilyCreatePage />
          },
          {
            path: 'families/details/:id',
            element: <FamilyDetailsPage />
          },
          
          // İlişkiler
          {
            path: 'relationships/types/list',
            element: <RelationshipTypesListPage />
          },
          {
            path: 'relationships/types/create',
            element: <CreateRelationshipTypePage />
          },
          {
            path: 'relationships/types/details/:id',
            element: <RelationshipTypeDetailsPage />
          },
          
          // Sistem Ayarları
          {
            path: 'system/settings',
            element: <SystemSettingsPage />
          },
          
          // Roller
          {
            path: 'roles/list',
            element: <RolesListPage />
          },
          {
            path: 'roles/create',
            element: <RoleCreatePage />
          },
          {
            path: 'roles/details/:id',
            element: <RoleDetailsPage />
          },
          
          // İzinler
          {
            path: 'permissions/list',
            element: <PermissionsListPage />
          },
          {
            path: 'permissions/create',
            element: <PermissionCreatePage />
          },
          {
            path: 'permissions/details/:id',
            element: <PermissionDetailsPage />
          },
          
          // İzin Grupları
          {
            path: 'permissionGroups/list',
            element: <PermissionGroupsListPage />
          },
          {
            path: 'permissionGroups/create',
            element: <PermissionGroupCreatePage />
          },
          {
            path: 'permissionGroups/details/:id',
            element: <PermissionGroupDetailsPage />
          },
          
          // Lokalizasyon
          {
            path: 'localizations/list',
            element: <LocalizationsListPage />
          },
          {
            path: 'localizations/create',
            element: <LocalizationCreatePage />
          },
          {
            path: 'localizations/details/:namespace/:key',
            element: <LocalizationDetailsPage />
          }
        ]
      },
      
      // Catch-all route for 404
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
];

const router = createBrowserRouter(routes);

export default router;