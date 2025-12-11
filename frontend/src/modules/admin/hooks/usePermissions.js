import { useAuth } from '../context/AuthContext';
import { ROLE_PERMISSIONS, ROLES } from '../constants/roles';

export const usePermissions = () => {
  const { admin } = useAuth();

  const hasPermission = (permission) => {
    if (!admin) return false;
    if (admin.role === ROLES.SUPER_ADMIN) return true;
    const permissions = ROLE_PERMISSIONS[admin.role] || [];
    return permissions.includes(permission);
  };

  const hasRole = (role) => {
    if (!admin) return false;
    if (admin.role === ROLES.SUPER_ADMIN) return true;
    return admin.role === role;
  };

  return {
    hasPermission,
    hasRole,
    isSuperAdmin: admin?.role === ROLES.SUPER_ADMIN,
    isAdmin: admin?.role === ROLES.ADMIN || admin?.role === ROLES.SUPER_ADMIN,
    isEditor: admin?.role === ROLES.EDITOR,
    isModerator: admin?.role === ROLES.MODERATOR
  };
};

