import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import '../styles/main.css';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSiteImages } from '../context/SiteImagesContext';

const HOME_REVIEWS_LINK = { to: { pathname: '/', hash: '#reviews' }, label: 'Reviews' };
const DISTRIBUTOR_LINK = { to: '/distributor', label: 'Become a Distributor' };

const PUBLIC_NAV_LINKS = [
  { to: '/', label: 'Our Oil', end: true },
  { to: { pathname: '/', hash: '#why-pure' }, label: 'Why Pure' },
  { to: { pathname: '/', hash: '#how-we-press' }, label: 'How We Press' },
  { to: '/recipes', label: 'Recipes' },
  HOME_REVIEWS_LINK,
  DISTRIBUTOR_LINK,
];

function Navbar() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const { logo } = useSiteImages();
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && !e.target.closest('.site-navbar')) {
        closeMenu();
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onEscape = (e) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('site-menu-open');
    } else {
      document.body.classList.remove('site-menu-open');
    }
    return () => document.body.classList.remove('site-menu-open');
  }, [menuOpen]);

  const navLinks = user
    ? [{ to: '/', label: 'Home', end: true }, HOME_REVIEWS_LINK, DISTRIBUTOR_LINK]
    : PUBLIC_NAV_LINKS;

  return (
    <header className={`site-navbar ${scrolled ? 'site-navbar-scrolled' : ''} ${menuOpen ? 'site-navbar-menu-open' : ''}`}>
      {menuOpen && (
        <button
          type="button"
          className="site-nav-backdrop"
          aria-label="Close menu"
          onClick={closeMenu}
        />
      )}
      <nav className="navbar navbar-expand-lg custom-navbar fixed-top">
        <div className="container site-navbar-inner">
          <div className="site-navbar-top">
            <Link className="site-navbar-brand" to="/" onClick={closeMenu}>
              <img src={logo} alt="Karyor Logo" className="navbar-logo" />
              <span className="brand-logo">KARYOR</span>
            </Link>

            <button
              className={`site-nav-toggle ${menuOpen ? 'is-open' : ''}`}
              type="button"
              onClick={toggleMenu}
              aria-controls="navMenu"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <i className={`bi ${menuOpen ? 'bi-x-lg' : 'bi-list'} site-nav-toggle-icon`} aria-hidden="true" />
            </button>
          </div>

          <div
            className={`collapse navbar-collapse site-nav-panel ${menuOpen ? 'show' : ''}`}
            id="navMenu"
          >
            <ul className="navbar-nav ms-auto align-items-lg-center site-nav-list">
              {navLinks.map((link) => (
                <li className="nav-item" key={link.label}>
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
                    `nav-link custom-link site-nav-link${isActive ? ' active' : ''}`
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
                      `nav-link custom-link site-nav-link${isActive ? ' active' : ''}`
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