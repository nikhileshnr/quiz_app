import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, requiredRole = null }) {
  const { currentUser } = useAuth();

  // Check if user is authenticated
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Check if specific role is required
  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  // User is authenticated and has required role (if any)
  return children;
}

export default ProtectedRoute; 