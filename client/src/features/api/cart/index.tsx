import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/useAuth';
import { useCart } from './model';
import { CartList, CartTotal } from './ui';
import './style.css';

export const Cart = () => {
  const { user } = useAuth();
  const { items, isLoading, error } = useCart();

  if (user?.role === 'admin' || user?.role === 'worker') {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return <div className="cart-loading">Загрузка корзины...</div>;
  }

  if (error) {
    return <div className="cart-error">Ошибка: {error}</div>;
  }

  return (
    <div className="cart">
      <h1>Корзина</h1>
      <CartList items={items} />
      {items.length > 0 && <CartTotal items={items} />}
    </div>
  );
};
