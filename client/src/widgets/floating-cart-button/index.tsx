import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import './style.css';

export const FloatingCartButton = () => {
  const cartItems = useAppSelector((state) => state.cart.items);

  const totalItemsCount = useMemo(() => {
    return cartItems.length;
  }, [cartItems]);

  if (totalItemsCount === 0) {
    return null;
  }

  return (
    <Link to="/cart" className="floating-cart-button">
      <span className="floating-cart-icon">🛒</span>
      <span className="floating-cart-badge">{totalItemsCount}</span>
    </Link>
  );
};
