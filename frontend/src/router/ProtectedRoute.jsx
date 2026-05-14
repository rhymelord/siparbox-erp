import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectCurrentAdmin } from '@/redux/auth/selectors';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const currentAdmin = useSelector(selectCurrentAdmin);
  const userRole = currentAdmin?.role || 'admin';

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to default route for this user if they don't have access
    return <Navigate to="/invoice" replace />;
  }

  return children;
};

export default ProtectedRoute;
