import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../redux/store';
import { ReactNode } from 'react';

interface PrivateRouteProps {
  children: ReactNode;
}

// Korumak istediğimiz route'lar için
const PrivateRoute = ({ children }: PrivateRouteProps) => {
  // Redux auth state'inden isAuthenticated değerini al
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  const location = useLocation();

  // Kullanıcı oturum açmamışsa login sayfasına yönlendir, aksi takdirde normal içeriği göster
  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default PrivateRoute; 