import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import '../styles/main.css';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/', label: 'Our Oil', end: true },
  { to: '/#why-pure', label: 'Why Pure' },
  { to: '/#how-we-press', label: 'How We Press' },
  { to: '/#reviews', label: 'Reviews' },
];

function Navbar() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change / outside clicks (simple)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && !e.target.closest('.site-navbar')) {
        closeMenu();
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

  return (
    <header className={`site-navbar ${scrolled ? 'site-navbar-scrolled' : ''}`}>
      <nav className="navbar navbar-expand-lg custom-navbar fixed-top">
        <div className="container site-navbar-inner">
          <Link className="site-navbar-brand" to="/">
            <img src="/logo.jpeg" alt="Karyor Logo" className="navbar-logo" />
            <span className="brand-logo">KARYOR</span>
          </Link>

          <button
            className={`navbar-toggler custom-toggler ${menuOpen ? 'is-open' : ''}`}
            type="button"
            onClick={toggleMenu}
            aria-controls="navMenu"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
          >
            <span />
            <span />
            <span />
          </button>

          <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`} id="navMenu">
            <ul className="navbar-nav ms-auto align-items-lg-center site-nav-list">
              {NAV_LINKS.map((link) => (
                <li className="nav-item" key={link.to}>
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link custom-link site-nav-link${isActive ? ' active' : ''}`
                    }
                    to={link.to}
                    end={link.end}
                    onClick={closeMenu}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}

              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    `nav-link custom-link site-nav-link site-nav-cart${isActive ? ' active' : ''}`
                  }
                  to="/addcart"
                  onClick={closeMenu}
                >
                  <i className="bi bi-cart3" aria-hidden="true" />
                  Cart
                  {itemCount > 0 && <span className="site-cart-badge">{itemCount}</span>}
                </NavLink>
              </li>

              {user ? (
                <>
                  <li className="nav-item">
                    <NavLink
                      className={({ isActive }) =>
                        `nav-link custom-link site-nav-link${isActive ? ' active' : ''}`
                      }
                      to="/my-orders"
                      onClick={closeMenu}
                    >
                      My Orders
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      className={({ isActive }) =>
                        `nav-link custom-link site-nav-link${isActive ? ' active' : ''}`
                      }
                      to="/profile"
                      onClick={closeMenu}
                    >
                      Profile
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className="nav-link custom-link site-nav-link site-nav-logout"
                      onClick={() => {
                        closeMenu();
                        logout();
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link custom-link site-nav-link site-nav-cta${isActive ? ' active' : ''}`
                    }
                    to="/products"
                    onClick={closeMenu}
                  >
                   Shop Now
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;