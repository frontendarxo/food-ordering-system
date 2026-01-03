import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import './style.css';

export const Navbar = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setIsMenuOpen(false);
  };

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
          {isAuthenticated ? (
            <>
              <li>
                <Link to="/cart" onClick={closeMenu}>
                  Корзина
                </Link>
              </li>
              <li>
                <Link to="/orders" onClick={closeMenu}>
                  Заказы
                </Link>
              </li>
              <li>
                <Link to="/profile" onClick={closeMenu}>
                  Профиль
                </Link>
              </li>
              <li className="navbar-user">
                <span>{user?.name}</span>
                <button onClick={handleLogout} className="navbar-logout">
                  Выйти
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/auth/login" onClick={closeMenu}>
                Войти
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};