import { useEffect, useState } from 'react';
import { adminApi } from '../utils/api';

function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadContacts = () => {
    setLoading(true);
    adminApi
      .getContacts()
      .then((res) => setContacts(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const markAsRead = async (id) => {
    try {
      await adminApi.updateContact(id, { status: 'read' });
      loadContacts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="admin-header">
        <h1>Messages</h1>
      </div>

      {error && <div className="admin-error" style={{ marginBottom: 20 }}>{error}</div>}

      <div className="admin-card">
        {loading ? (
          <p style={{ color: '#888' }}>Loading...</p>
        ) : contacts.length === 0 ? (
          <p style={{ color: '#888' }}>No messages yet</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Message</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone || '-'}</td>
                  <td style={{ maxWidth: 300 }}>{c.message}</td>
                  <td>
                    <span className={`admin-badge ${c.status === 'new' ? 'admin-badge-pending' : 'admin-badge-active'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    {c.status === 'new' && (
                      <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => markAsRead(c._id)}>
                        Mark Read
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default AdminContacts;