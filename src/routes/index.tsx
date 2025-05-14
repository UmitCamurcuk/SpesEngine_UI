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

// Ana sayfa için basit bir test component'i
const HomePage = () => (
  <div>
    <h1 className="text-xl font-semibold mb-4">Master Data Management Ana Sayfası</h1>
    <p className="text-gray-700 dark:text-gray-300">Bu alan yetkilendirilmiş kullanıcılar için görünür.</p>
  </div>
);

// Geçici placeholder sayfalar
const ItemTypesListPage = () => <div>Öğe Tipleri sayfası (geliştiriliyor)</div>;
const ItemsListPage = () => <div>Öğeler sayfası (geliştiriliyor)</div>;
const CategoriesListPage = () => <div>Kategoriler sayfası (geliştiriliyor)</div>;
const FamiliesListPage = () => <div>Aileler sayfası (geliştiriliyor)</div>;

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
      
      // Ana Layout içindeki sayfalar
      {
        path: '/',
        element: <AppLayout />,
        children: [
          // Ana Sayfa
          {
            index: true,
            element: <HomePage />
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
          
          // Öğeler
          {
            path: 'items/list',
            element: <ItemsListPage />
          },
          
          // Kategoriler
          {
            path: 'categories/list',
            element: <CategoriesListPage />
          },
          
          // Ürün Aileleri
          {
            path: 'families/list',
            element: <FamiliesListPage />
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