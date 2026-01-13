import { Route, Routes } from 'react-router-dom';
import { HomeLayout } from '../../widgets/layouts/HomeLayout';
import { Cart } from '../../features/api/cart';
import { Home } from '../../pages/Home';
import { Login } from '../../pages/Login';
import { NotFound } from '../../pages/NotFound';
import { WorkerPage } from '../../pages/Worker/WorkerPage';
import { AdminOrdersPage } from '../../pages/AdminOrders';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<HomeLayout />}>
        <Route index element={<Home />} />
        <Route path="cart" element={<Cart />} />
        <Route path="worker" element={<WorkerPage />} />
        <Route path="admin/orders" element={<AdminOrdersPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};