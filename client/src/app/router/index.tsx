import { Navigate, Route, Routes } from 'react-router-dom';
import { HomeLayout } from '../../widgets/layouts/HomeLayout';
import { Cart } from '../../features/api/cart';
import { Home } from '../../pages/Home';
import { Login } from '../../pages/Login';
import { WorkerPage } from '../../pages/Worker/WorkerPage';
import { AdminOrdersPage } from '../../pages/AdminOrders';
import { AdminDashboardPage } from '../../pages/Dashboard/AdminDashboardPage';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<HomeLayout />}>
        <Route index element={<Home />} />
        <Route path="cart" element={<Cart />} />
        <Route path="worker" element={<WorkerPage />} />
        <Route path="worker/dashboard" element={<Navigate to="/worker" replace />} />
        <Route path="admin/orders" element={<AdminOrdersPage />} />
        <Route path="admin/dashboard" element={<AdminDashboardPage />} />
      </Route>
    </Routes>
  );
};