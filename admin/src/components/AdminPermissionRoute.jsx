import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDefaultAdminPath, hasPermission, ROUTE_PERMISSIONS } from '../utils/permissions';

function AdminAccessDenied() {
  return (
    <div className="admin-card">
      <div className="admin-empty-state">
        <h2 style={{ color: '#fff', marginBottom: 12 }}>Access Restricted</h2>
        <p>You do not have permission to view this section.</p>
        <p style={{ color: '#888', marginTop: 8 }}>
          Contact your Super Admin if you need access to this department.
        </p>
      </div>
    </div>
  );
}

function AdminPermissionRoute({ permission, children }) {
  const { user } = useAuth();

  if (!hasPermission(user, permission)) {
    const fallback = getDefaultAdminPath(user);
    if (permission === 'dashboard' && fallback !== '/dashboard') {
      return <Navigate to={fallback} replace />;
    }
    return <AdminAccessDenied />;
  }

  return children;
}

export function getRoutePermission(pathname) {
  return ROUTE_PERMISSIONS[pathname] || null;
}

export default AdminPermissionRoute;