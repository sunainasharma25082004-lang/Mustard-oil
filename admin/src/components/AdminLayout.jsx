import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STORE_URL = import.meta.env.VITE_STORE_URL || 'http://localhost:5173';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/products', label: 'Products', icon: '🛢️' },
  { path: '/orders', label: 'Orders', icon: '📦' },
  { path: '/contacts', label: 'Messages', icon: '✉️' },
  { path: '/distributors', label: 'Distributors', icon: '🤝' },
  { path: '/users', label: 'Users', icon: '👤' },
];

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>Karyor</h2>
          <p>Admin Panel</p>
        </div>

        <ul className="admin-nav">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div style={{ padding: '24px', marginTop: 'auto' }}>
          <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: 12 }}>
            {user?.name}
          </p>
          <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={handleLogout} style={{ width: '100%' }}>
            Logout
          </button>
          <a
            href={STORE_URL}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'block', textAlign: 'center', color: '#666', fontSize: '0.8rem', marginTop: 16, textDecoration: 'none' }}
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