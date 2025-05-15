import { createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import LoginPage from '../pages/auth/login';
import RegisterPage from '../pages/auth/register';
import AppLayout from '../components/layout/AppLayout';
import PrivateRoute from '../components/layout/PrivateRoute';
import AttributesListPage from '../pages/attributes/list';
import AttributeCreatePage from '../pages/attributes/create';
import AttributeDetailsPage from '../pages/attributes/details';
import StepperAttributeCreatePage from '../pages/attributes/create/StepperCreate';
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

// Ana sayfa için basit bir test component'i
const HomePage = () => (
  <div>
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
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'register',
        element: <RegisterPage />
      },
      {
        path: 'auth/login',
        element: <LoginPage />
      },
      {
        path: 'auth/register',
        element: <RegisterPage />
      },
      {
        path: 'logout',
        element: <LoginPage />
      },
      
      // Ana Layout içindeki sayfalar
      {
        path: '/',
        element: <PrivateRoute><AppLayout /></PrivateRoute>,
        children: [
          // Ana Sayfa
          {
            index: true,
            element: <HomePage />
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
            element: <StepperAttributeCreatePage />
          },
          {
            path: 'attributes/create/simple',
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
          }
        ]
      }
    ]
  },
  // Catch-all route (404 sayfası)
  {
    path: '*',
    element: <div className="p-8">Sayfa bulunamadı.</div>
  }
];

const router = createBrowserRouter(routes);

export default router;