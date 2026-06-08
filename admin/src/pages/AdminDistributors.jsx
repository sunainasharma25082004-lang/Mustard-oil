import { useEffect, useState } from 'react';
import { adminApi } from '../utils/api';

const statusOptions = ['pending', 'reviewed', 'approved', 'rejected'];

function AdminDistributors() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifyModal, setNotifyModal] = useState(null);

  const loadApplications = () => {
    setLoading(true);
    adminApi
      .getDistributors()
      .then((res) => setApplications(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await adminApi.updateDistributor(id, { status });
      loadApplications();

      if (status === 'approved' && res.approvalMessage) {
        setNotifyModal({
          id: res.data._id,
          name: res.data.name,
          phone: res.data.phone,
          message: res.approvalMessage,
          whatsappUrl: res.whatsappNotifyUrl,
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const badgeClass = (status) => {
    if (status === 'approved') return 'admin-badge admin-badge-delivered';
    if (status === 'rejected') return 'admin-badge admin-badge-cancelled';
    if (status === 'reviewed') return 'admin-badge admin-badge-confirmed';
    return 'admin-badge admin-badge-pending';
  };

  return (
    <>
      <div className="admin-header">
        <h1>Distributors</h1>
        <p style={{ color: '#888', marginTop: 8 }}>
          New applications appear here automatically. Set status to <strong>approved</strong> to add as distributor.
        </p>
      </div>

      {error && <div className="admin-error" style={{ marginBottom: 20 }}>{error}</div>}

      <div className="admin-card">
        {loading ? (
          <p style={{ color: '#888' }}>Loading...</p>
        ) : applications.length === 0 ? (
          <p style={{ color: '#888' }}>No distributor applications yet</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>City</th>
                <th>Business</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id}>
                  <td>{app.name}</td>
                  <td>{app.phone}</td>
                  <td>{app.email || '-'}</td>
                  <td>{app.city || '-'}</td>
                  <td>{app.business || '-'}</td>
                  <td>
                    <span className={badgeClass(app.status)}>{app.status}</span>
                  </td>
                  <td>{new Date(app.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <select
                      value={app.status}
                      onChange={(e) => updateStatus(app._id, e.target.value)}
                      style={{ padding: '6px 10px', background: '#1b1b1b', color: '#fff', border: '1px solid rgba(212,175,55,.2)', borderRadius: 8, fontSize: '0.8rem' }}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {notifyModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 999, padding: 20,
          }}
          onClick={() => setNotifyModal(null)}
        >
          <div
            style={{
              background: '#141414', border: '1px solid rgba(212,175,55,.3)',
              borderRadius: 20, padding: 28, maxWidth: 480, width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: '#d4af37', margin: '0 0 12px' }}>Distributor Approved</h3>
            <p style={{ color: '#ccc', marginBottom: 16, lineHeight: 1.6 }}>
              <strong>{notifyModal.name}</strong> has been added as a distributor.
              The user can see this on the website by checking status with their phone number.
            </p>
            <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: 20, padding: 12, background: 'rgba(255,255,255,.04)', borderRadius: 10 }}>
              {notifyModal.message}
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a
                href={notifyModal.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                onClick={async () => {
                  try {
                    if (notifyModal.id) {
                      await adminApi.updateDistributor(notifyModal.id, { userNotifiedAt: true });
                      loadApplications();
                    }
                  } catch {
                    /* non-blocking */
                  }
                }}
                style={{
                  flex: 1, textAlign: 'center', padding: '12px 20px', borderRadius: 50,
                  background: '#25D366', color: '#fff', textDecoration: 'none', fontWeight: 700,
                }}
              >
                Notify via WhatsApp
              </a>
              <button
                type="button"
                onClick={() => setNotifyModal(null)}
                style={{
                  flex: 1, padding: '12px 20px', borderRadius: 50,
                  border: '1px solid #d4af37', background: 'transparent', color: '#d4af37', fontWeight: 700, cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminDistributors;