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

  const visitors = stats?.visitors;
  const showVisitors = hasPermission(user, 'dashboard');
  const visitorsConfigured = visitors?.configured;
  const visitorCards = showVisitors && visitorsConfigured
    ? [
        { label: 'Live Visitors', value: visitors?.activeNow ?? 0, hint: 'Google Analytics realtime' },
        { label: 'Visitors Today', value: visitors?.uniqueVisitorsToday ?? 0 },
        { label: 'Page Views Today', value: visitors?.pageViewsToday ?? 0 },
        { label: 'Visitors (7 Days)', value: visitors?.uniqueVisitorsThisWeek ?? 0 },
        { label: 'Page Views (7 Days)', value: visitors?.pageViewsThisWeek ?? 0 },
        { label: 'All-Time Views', value: visitors?.totalPageViews ?? 0 },
      ]
    : [];

  return (
    <>
      <div className="admin-header">
        <h1>Dashboard</h1>
      </div>

      {showVisitors && (
        <>
          <div className="admin-section-heading">
            <h2>Google Analytics</h2>
            <p>Website traffic from your GA4 account — only visible in admin panel</p>
          </div>

          {!visitorsConfigured && (
            <div className="admin-card admin-ga-setup" style={{ marginBottom: '24px' }}>
              <p style={{ margin: '0 0 8px', color: '#e0e0e0' }}>
                Google Analytics is not connected yet.
              </p>
              <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>
                {visitors?.error || visitors?.setupHint}
              </p>
            </div>
          )}

          {visitorCards.length > 0 && (
            <div className="admin-stats">
              {visitorCards.map((card) => (
                <div className="admin-stat-card" key={card.label}>
                  <h3>{card.label}</h3>
                  <div className="value">{card.value}</div>
                  {card.hint && <p className="admin-stat-hint">{card.hint}</p>}
                </div>
              ))}
            </div>
          )}

          {visitors?.topPages?.length > 0 && (
            <div className="admin-card" style={{ marginBottom: '32px' }}>
              <h3 style={{ color: '#d4af37', margin: '0 0 16px', fontSize: '1rem' }}>Top Pages (Last 7 Days)</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Page</th>
                    <th>Views</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.topPages.map((page) => (
                    <tr key={page.path}>
                      <td>{page.path}</td>
                      <td>{page.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {cards.length > 0 && (
        <div className="admin-section-heading">
          <h2>Store Overview</h2>
        </div>
      )}

      {cards.length === 0 && !showVisitors ? (
        <div className="admin-card">
          <div className="admin-empty-state">
            <p>Your dashboard will show stats for the sections you can access.</p>
          </div>
        </div>
      ) : cards.length > 0 ? (
        <div className="admin-stats">
          {cards.map((card) => (
            <div className="admin-stat-card" key={card.label}>
              <h3>{card.label}</h3>
              <div className="value">{card.value}</div>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}

export default AdminDashboard;