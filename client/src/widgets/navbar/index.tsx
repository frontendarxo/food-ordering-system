import { useState } from 'react';
import { Link } from 'react-router-dom';
import './style.css';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <li>
            <Link to="/cart" onClick={closeMenu}>
              Корзина
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};