import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getVisibleNavItems } from '../utils/permissions';

const STORE_URL = import.meta.env.VITE_STORE_URL || 'http://localhost:5173';

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleNavItems = getVisibleNavItems(user);

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen((open) => !open);

  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('admin-menu-open');
    } else {
      document.body.classList.remove('admin-menu-open');
    }
    return () => document.body.classList.remove('admin-menu-open');
  }, [menuOpen]);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate('/login');
  };

  const currentPage = visibleNavItems.find((item) => item.path === location.pathname);

  return (
    <div className={`admin-layout ${menuOpen ? 'admin-layout-menu-open' : ''}`}>
      {menuOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Close menu"
          onClick={closeMenu}
        />
      )}

      <header className="admin-mobile-bar">
        <button
          type="button"
          className={`admin-mobile-toggle ${menuOpen ? 'is-open' : ''}`}
          onClick={toggleMenu}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          <span className="admin-mobile-toggle-icon" aria-hidden="true">
            {menuOpen ? '✕' : '☰'}
          </span>
        </button>
        <div className="admin-mobile-bar-title">
          <strong>Karyor Admin</strong>
          {currentPage && <span>{currentPage.label}</span>}
        </div>
      </header>

      <aside className={`admin-sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="admin-brand">
          <h2>Karyor</h2>
          <p>Admin Panel</p>
        </div>

        <ul className="admin-nav">
          {visibleNavItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
                onClick={closeMenu}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="admin-sidebar-footer">
          <p className="admin-sidebar-user">{user?.name}</p>
          {user?.department && (
            <p className="admin-sidebar-user" style={{ color: '#888', fontSize: '0.8rem', marginTop: -6 }}>
              {user.department}
            </p>
          )}
          <button
            type="button"
            className="admin-btn admin-btn-outline admin-btn-sm"
            onClick={handleLogout}
            style={{ width: '100%' }}
          >
            Logout
          </button>
          <a
            href={STORE_URL}
            target="_blank"
            rel="noreferrer"
            className="admin-sidebar-store-link"
          >
            ← View Store
          </a>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;