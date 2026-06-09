import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import '../styles/main.css';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/products', label: 'Products' },
  { to: '/distributor', label: 'Distributor' },
  { to: '/contact', label: 'Contact' },
];

function Navbar() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-navbar ${scrolled ? 'site-navbar-scrolled' : ''}`}>
      <nav className="navbar navbar-expand-lg custom-navbar fixed-top">
        <div className="container site-navbar-inner">
          <Link className="site-navbar-brand" to="/">
            <img src="/logo.jpeg" alt="Karyor Logo" className="navbar-logo" />
            <span className="brand-logo">
              <span>KAR</span>YOR
            </span>
          </Link>

          <button
            className="navbar-toggler custom-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navMenu"
            aria-controls="navMenu"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span />
            <span />
            <span />
          </button>

          <div className="collapse navbar-collapse" id="navMenu">
            <ul className="navbar-nav ms-auto align-items-lg-center site-nav-list">
              {NAV_LINKS.map((link) => (
                <li className="nav-item" key={link.to}>
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link custom-link site-nav-link${isActive ? ' active' : ''}`
                    }
                    to={link.to}
                    end={link.end}
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
                >
                  <i className="bi bi-bag" aria-hidden="true" />
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
                    >
                      Profile
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className="nav-link custom-link site-nav-link site-nav-logout"
                      onClick={logout}
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
                    to="/signin"
                  >
                    Sign In
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