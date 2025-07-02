import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface Permission {
  permission: {
    code: string;
    name: string;
    description: string;
    _id: string;
  };
  granted: boolean;
  _id: string;
}

interface PermissionGroup {
  permissionGroup: {
    code: string;
    name: string;
    description?: string;
    _id: string;
  };
  permissions: Permission[];
  _id: string;
}

interface UserRole {
  _id: string;
  name: string;
  description: string;
  permissionGroups: PermissionGroup[];
  isActive: boolean;
}

interface User {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  role: UserRole;
  isActive: boolean;
}

export const usePermissions = () => {
  const user = useSelector((state: RootState) => state.auth.user) as User | null;

  // Kullanıcının tüm izinlerini çıkar
  const getUserPermissions = (): string[] => {
    if (!user) return [];
    
    // System admin ise tüm izinler var
    if (user.isAdmin) {
      return ['*']; // Wildcard - tüm izinler
    }

    if (!user.role || !user.role.permissionGroups) return [];

    const permissions: string[] = [];
    
    user.role.permissionGroups.forEach((permissionGroup) => {
      if (permissionGroup.permissions && Array.isArray(permissionGroup.permissions)) {
        permissionGroup.permissions.forEach((permissionItem) => {
          // Sadece granted:true olan permission'ları ekle
          if (permissionItem.granted && permissionItem.permission && permissionItem.permission.code) {
            permissions.push(permissionItem.permission.code);
          }
        });
      }
    });

    return permissions;
  };

  // Belirli bir izni kontrol et
  const hasPermission = (permissionCode: string): boolean => {
    const userPermissions = getUserPermissions();
    
    // System admin kontrolü
    if (userPermissions.includes('*')) return true;
    
    return userPermissions.includes(permissionCode);
  };

  // Birden fazla izinden herhangi birini kontrol et (OR logic)
  const hasAnyPermission = (permissionCodes: string[]): boolean => {
    return permissionCodes.some(code => hasPermission(code));
  };

  // Tüm izinlere sahip mi kontrol et (AND logic)
  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    return permissionCodes.every(code => hasPermission(code));
  };

  // Sayfa görüntüleme izni
  const canViewPage = (pageCode: string): boolean => {
    return hasPermission(`${pageCode}:read`) || hasPermission(`${pageCode}_VIEW`);
  };

  // CRUD işlem izinleri
  const canCreate = (resourceCode: string): boolean => {
    const upperResourceCode = resourceCode.toUpperCase();
    return hasPermission(`${resourceCode}:create`) || 
           hasPermission(`${upperResourceCode}_CREATE`);
  };

  const canUpdate = (resourceCode: string): boolean => {
    const upperResourceCode = resourceCode.toUpperCase();
    return hasPermission(`${resourceCode}:update`) || 
           hasPermission(`${upperResourceCode}_UPDATE`);
  };

  const canDelete = (resourceCode: string): boolean => {
    const upperResourceCode = resourceCode.toUpperCase();
    return hasPermission(`${resourceCode}:delete`) || 
           hasPermission(`${upperResourceCode}_DELETE`);
  };

  const canRead = (resourceCode: string): boolean => {
    const upperResourceCode = resourceCode.toUpperCase();
    return hasPermission(`${resourceCode}:read`) || 
           hasPermission(`${upperResourceCode}_VIEW`);
  };

  // Debug için tüm izinleri döndür
  const getAllPermissions = (): string[] => {
    return getUserPermissions();
  };

  return {
    user,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canViewPage,
    canCreate,
    canUpdate,
    canDelete,
    canRead,
    getAllPermissions,
    isAdmin: user?.isAdmin || false,
    isAuthenticated: !!user
  };
}; 