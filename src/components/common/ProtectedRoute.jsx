import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // Redirect to appropriate dashboard based on role
    const roleRoutes = {
      customer: '/customer/dashboard',
      admin: '/admin/dashboard',
      technician: '/technician/dashboard',
    };
    return <Navigate to={roleRoutes[profile.role] || '/'} replace />;
  }

  return children;
}
