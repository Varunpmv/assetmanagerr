import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle mandatory password reset
  if (user.requires_password_change && location.pathname !== '/reset-password') {
    return <Navigate to="/reset-password" replace />;
  }

  return children;
};

export default ProtectedRoute;
