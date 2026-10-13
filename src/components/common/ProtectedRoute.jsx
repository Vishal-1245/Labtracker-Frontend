import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Route guard checking authentication, role authorization, and first-time password change enforcement
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, mustChangePassword } = useAuth();
  const location = useLocation();

  // 1. If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If student/staff must change password, force them to /change-password
  if (mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // 3. If route restricts roles, ensure user role is allowed
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect unauthorized user to their primary role page
    if (role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (role === 'LAB_INCHARGE') return <Navigate to="/incharge" replace />;
    if (role === 'LAB_ASSISTANT') return <Navigate to="/assistant" replace />;
    if (role === 'STUDENT') return <Navigate to="/student" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
