import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import './style.css';

export const Navbar = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Qatar Food
        </Link>
        <ul className="navbar-menu">
          <li>
            <Link to="/">Меню</Link>
          </li>
          {isAuthenticated ? (
            <>
              <li>
                <Link to="/cart">Корзина</Link>
              </li>
              <li>
                <Link to="/orders">Заказы</Link>
              </li>
              <li>
                <Link to="/profile">Профиль</Link>
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
              <Link to="/auth/login">Войти</Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};