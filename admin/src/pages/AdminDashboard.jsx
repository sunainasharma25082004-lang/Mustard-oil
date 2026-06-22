import { useEffect, useState } from 'react';
import { adminApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils/permissions';

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .getStats()
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: '#888' }}>Loading dashboard...</p>;
  if (error) return <div className="admin-error">{error}</div>;

  const cards = [
    { label: 'Total Orders', value: stats?.totalOrders, permission: 'orders' },
    { label: 'Pending Orders', value: stats?.pendingOrders, permission: 'orders' },
    { label: 'Total Revenue', value: `₹${stats?.totalRevenue || 0}`, permission: 'orders' },
    { label: 'Active Products', value: stats?.activeProducts, permission: 'products' },
    { label: 'Total Products', value: stats?.totalProducts, permission: 'products' },
    { label: 'New Messages', value: stats?.newContacts, permission: 'contacts' },
    { label: 'Distributor Apps', value: stats?.pendingDistributors, permission: 'distributors' },
    { label: 'Registered Users', value: stats?.totalUsers, permission: 'users' },
  ].filter((card) => hasPermission(user, card.permission));

  return (
    <>
      <div className="admin-header">
        <h1>Dashboard</h1>
      </div>

      {cards.length === 0 ? (
        <div className="admin-card">
          <div className="admin-empty-state">
            <p>Your dashboard will show stats for the sections you can access.</p>
          </div>
        </div>
      ) : (
        <div className="admin-stats">
          {cards.map((card) => (
            <div className="admin-stat-card" key={card.label}>
              <h3>{card.label}</h3>
              <div className="value">{card.value}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default AdminDashboard;