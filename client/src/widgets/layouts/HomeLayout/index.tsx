import { Outlet } from 'react-router-dom';
import { Navbar } from '../../navbar';
import { FloatingCartButton } from '../../floating-cart-button';
import { useAuth } from '../../../contexts/useAuth';
import './style.css';

export const HomeLayout = () => {
  const { user } = useAuth();
  const showFloatingCart = user?.role !== 'admin' && user?.role !== 'worker';

  return (
    <div className="home-layout">
      <Navbar />
      <div className="home-layout-content">
        <Outlet />
      </div>
      {showFloatingCart && <FloatingCartButton />}
    </div>
  );
};