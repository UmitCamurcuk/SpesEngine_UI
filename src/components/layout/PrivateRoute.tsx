import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../redux/store';
import { ReactNode } from 'react';
import { TokenService } from '../../services/auth/tokenService';

interface PrivateRouteProps {
  children: ReactNode;
}

// Korumak istediğimiz route'lar için
const PrivateRoute = ({ children }: PrivateRouteProps) => {
  // Redux auth state'inden isAuthenticated değerini al
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  
  const location = useLocation();

  // Token kontrolü yap
  const hasValidTokens = TokenService.hasValidTokens();

  // Loading durumunda bekle
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Kullanıcı oturum açmamışsa veya geçerli token yoksa login sayfasına yönlendir
  if (!isAuthenticated || !hasValidTokens) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Kullanıcı oturum açmışsa normal içeriği göster
  return <>{children}</>;
};

export default PrivateRoute; 