import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { AdminOrders } from './AdminOrders';

export const AdminOrdersPage = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <AdminOrders />;
};

