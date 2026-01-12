import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { Worker } from './index';

export const WorkerPage = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.role !== 'worker' && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Worker />;
};

