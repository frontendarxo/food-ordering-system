import { Route, Routes } from 'react-router-dom';
import { AuthLayout } from '../../widgets/layouts/AuthLayout';
import { HomeLayout } from '../../widgets/layouts/HomeLayout';
import { Login } from '../../features/api/Login';
import { Register } from '../../features/api/Register';
import { Cart } from '../../features/api/cart';
import { Home } from '../../pages/Home';
import { Orders } from '../../pages/Orders';
import { Profile } from '../../pages/Profile';
import { PrivateRoute } from '../../shared/PrivateRoute';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeLayout />}>
        <Route index element={<Home />} />
        <Route
          path="cart"
          element={
            <PrivateRoute>
              <Cart />
            </PrivateRoute>
          }
        />
        <Route
          path="orders"
          element={
            <PrivateRoute>
              <Orders />
            </PrivateRoute>
          }
        />
        <Route
          path="profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      </Route>
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
    </Routes>
  );
};