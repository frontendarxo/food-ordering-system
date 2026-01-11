import { Route, Routes } from 'react-router-dom';
import { HomeLayout } from '../../widgets/layouts/HomeLayout';
import { Cart } from '../../features/api/cart';
import { Home } from '../../pages/Home';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeLayout />}>
        <Route index element={<Home />} />
        <Route path="cart" element={<Cart />} />
      </Route>
    </Routes>
  );
};