import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { refreshPermissions } from '../redux/features/auth/authSlice';

export const usePermissionRefresh = () => {
  const dispatch = useDispatch<AppDispatch>();

  const refreshUserPermissions = async () => {
    try {
      await dispatch(refreshPermissions()).unwrap();
      return true;
    } catch (error) {
      console.error('İzinler yenilenemedi:', error);
      return false;
    }
  };

  return { refreshUserPermissions };
}; 