import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES, ROLE_PERMISSIONS } from '../constants/roles';

function ProtectedRoute({ children, requiredRole = null, requiredPermission = null }) {
  const { admin, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check role-based access
  if (requiredRole && admin.role !== requiredRole && admin.role !== ROLES.SUPER_ADMIN) {
    return <Navigate to="/admin/access-denied" replace />;
  }

  // Check permission-based access
  if (requiredPermission) {
    const adminPermissions = ROLE_PERMISSIONS[admin.role] || [];
    const hasPermission = adminPermissions.includes(requiredPermission) || admin.role === ROLES.SUPER_ADMIN;
    
    if (!hasPermission) {
      return <Navigate to="/admin/access-denied" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;

