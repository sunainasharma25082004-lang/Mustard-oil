import { useEffect, useState } from 'react';
import { adminApi } from '../utils/api';

function AdminDashboard() {
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
    { label: 'Total Orders', value: stats?.totalOrders },
    { label: 'Pending Orders', value: stats?.pendingOrders },
    { label: 'Active Products', value: stats?.activeProducts },
    { label: 'Total Products', value: stats?.totalProducts },
    { label: 'New Messages', value: stats?.newContacts },
    { label: 'Distributor Apps', value: stats?.pendingDistributors },
    { label: 'Registered Users', value: stats?.totalUsers },
    { label: 'Total Revenue', value: `₹${stats?.totalRevenue || 0}` },
  ];

  return (
    <>
      <div className="admin-header">
        <h1>Dashboard</h1>
      </div>

      <div className="admin-stats">
        {cards.map((card) => (
          <div className="admin-stat-card" key={card.label}>
            <h3>{card.label}</h3>
            <div className="value">{card.value}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export default AdminDashboard;