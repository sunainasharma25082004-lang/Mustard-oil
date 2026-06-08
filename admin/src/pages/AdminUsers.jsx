import { Fragment, useEffect, useState } from 'react';
import { adminApi } from '../utils/api';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');

  const loadUsers = () => {
    setLoading(true);
    adminApi
      .getUsers()
      .then((res) => setUsers(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = users.filter((user) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      user.name?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.phone?.includes(q) ||
      user.city?.toLowerCase().includes(q)
    );
  });

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Users</h1>
          <p style={{ color: '#888', marginTop: 8, fontSize: '0.9rem' }}>
            Registered store customers with profile and order activity
          </p>
        </div>
        <input
          type="text"
          placeholder="Search name, email, phone, city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: 10,
            border: '1px solid rgba(212,175,55,.2)',
            background: '#1b1b1b',
            color: '#fff',
            minWidth: 260,
          }}
        />
      </div>

      {error && <div className="admin-error" style={{ marginBottom: 20 }}>{error}</div>}

      <div className="admin-card">
        {loading ? (
          <p style={{ color: '#888' }}>Loading users...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: '#888' }}>No registered users found</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Joined</th>
                <th>Profile</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <Fragment key={user.id}>
                  <tr>
                    <td><strong>{user.name}</strong></td>
                    <td>{user.email}</td>
                    <td>{user.phone || '-'}</td>
                    <td>{user.city || '-'}</td>
                    <td>{user.orderCount}</td>
                    <td>₹{user.totalSpent}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-btn admin-btn-outline admin-btn-sm"
                        onClick={() => toggleExpand(user.id)}
                      >
                        {expandedId === user.id ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>
                  {expandedId === user.id && (
                    <tr>
                      <td colSpan={8} style={{ background: 'rgba(255,255,255,.02)', padding: 20 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                          <div>
                            <p style={{ color: '#888', fontSize: '0.75rem', margin: '0 0 4px' }}>FULL NAME</p>
                            <p style={{ margin: 0 }}>{user.name}</p>
                          </div>
                          <div>
                            <p style={{ color: '#888', fontSize: '0.75rem', margin: '0 0 4px' }}>EMAIL</p>
                            <p style={{ margin: 0 }}>{user.email}</p>
                          </div>
                          <div>
                            <p style={{ color: '#888', fontSize: '0.75rem', margin: '0 0 4px' }}>PHONE</p>
                            <p style={{ margin: 0 }}>{user.phone || '-'}</p>
                          </div>
                          <div>
                            <p style={{ color: '#888', fontSize: '0.75rem', margin: '0 0 4px' }}>PINCODE</p>
                            <p style={{ margin: 0 }}>{user.pincode || '-'}</p>
                          </div>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <p style={{ color: '#888', fontSize: '0.75rem', margin: '0 0 4px' }}>ADDRESS</p>
                            <p style={{ margin: 0 }}>{user.address || 'Not provided'}</p>
                          </div>
                          <div>
                            <p style={{ color: '#888', fontSize: '0.75rem', margin: '0 0 4px' }}>CITY</p>
                            <p style={{ margin: 0 }}>{user.city || '-'}</p>
                          </div>
                          <div>
                            <p style={{ color: '#888', fontSize: '0.75rem', margin: '0 0 4px' }}>LAST ORDER</p>
                            <p style={{ margin: 0 }}>
                              {user.lastOrderAt
                                ? new Date(user.lastOrderAt).toLocaleDateString('en-IN')
                                : 'No orders yet'}
                            </p>
                          </div>
                          <div>
                            <p style={{ color: '#888', fontSize: '0.75rem', margin: '0 0 4px' }}>PROFILE UPDATED</p>
                            <p style={{ margin: 0 }}>
                              {user.updatedAt
                                ? new Date(user.updatedAt).toLocaleDateString('en-IN')
                                : '-'}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default AdminUsers;