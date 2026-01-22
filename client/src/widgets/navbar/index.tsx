import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { useAppSelector } from '../../store/hooks';
import './style.css';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const cartItems = useAppSelector((state) => state.cart.items);

  const totalItemsCount = useMemo(() => {
    return cartItems.length;
  }, [cartItems]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          Qatar Food
        </Link>
        <button
          className={`navbar-burger ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Меню"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li>
            <Link to="/" onClick={closeMenu}>
              Меню
            </Link>
          </li>
          {user?.role !== 'admin' && user?.role !== 'worker' && (
            <li className="navbar-cart-item">
              <Link to="/cart" onClick={closeMenu} className="navbar-cart-link">
                Корзина
                {totalItemsCount > 0 && (
                  <span className="navbar-cart-badge">{totalItemsCount}</span>
                )}
              </Link>
            </li>
          )}
          {isAuthenticated && (
            <>
              {user?.role === 'admin' && (
                <li>
                  <Link to="/admin/orders" onClick={closeMenu}>
                    Заказы
                  </Link>
                </li>
              )}
              {user?.role === 'worker' && (
                <li>
                  <Link to="/worker" onClick={closeMenu}>
                    Заказы
                  </Link>
                </li>
              )}
              <li>
                <button onClick={logout} className="navbar-logout">
                  Выйти
                </button>
              </li>
            </>
          )}
          {!isAuthenticated && (
            <li>
              <Link to="/login" onClick={closeMenu}>
                Вход
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};