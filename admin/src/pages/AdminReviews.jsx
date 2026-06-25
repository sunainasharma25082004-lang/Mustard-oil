import { useEffect, useState } from 'react';
import { adminApi } from '../utils/api';

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [widgetCode, setWidgetCode] = useState('');
  const [savingWidget, setSavingWidget] = useState(false);
  const [widgetSuccess, setWidgetSuccess] = useState('');

  const loadReviews = () => {
    setLoading(true);
    adminApi
      .getReviews(filter || undefined)
      .then((res) => setReviews(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const loadSettings = () => {
    adminApi.getGeneralSettings()
      .then((res) => setWidgetCode(res.data.googleReviewsWidgetCode || ''))
      .catch(console.error);
  };

  useEffect(() => {
    loadReviews();
  }, [filter]);

  useEffect(() => {
    loadSettings();
  }, []);

  const moderate = async (id, status) => {
    try {
      await adminApi.moderateReview(id, { status });
      loadReviews();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await adminApi.deleteReview(id);
      loadReviews();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveWidget = async () => {
    setSavingWidget(true);
    setWidgetSuccess('');
    setError('');
    try {
      await adminApi.updateGeneralSettings({ googleReviewsWidgetCode: widgetCode });
      setWidgetSuccess('Google Reviews widget code saved successfully!');
      setTimeout(() => setWidgetSuccess(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingWidget(false);
    }
  };

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Reviews</h1>
          <p className="admin-header-sub">Approve, reject, or remove customer reviews from the store</p>
        </div>
        <select
          className="admin-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All Reviews</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {error && <div className="admin-error" style={{ marginBottom: 20 }}>{error}</div>}
      {widgetSuccess && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 10, background: 'rgba(76, 175, 80, 0.12)', border: '1px solid rgba(76, 175, 80, 0.35)', color: '#8fd99a', fontSize: '0.9rem' }}>
          {widgetSuccess}
        </div>
      )}

      <div className="admin-card" style={{ marginBottom: 30 }}>
        <h2>Google Reviews Widget</h2>
        <p className="admin-hint" style={{ marginTop: -8, marginBottom: 16 }}>
          Paste your Elfsight or Trustindex Google Reviews embed code here. This will replace the default website reviews with live Google reviews. Leave empty to use the default manual review system.
        </p>
        <div className="admin-form-group">
          <textarea
            value={widgetCode}
            onChange={(e) => setWidgetCode(e.target.value)}
            placeholder='<script src="https://apps.elfsight.com/p/platform.js" defer></script>...'
            style={{ width: '100%', height: '100px', background: '#111', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '8px' }}
          />
        </div>
        <button
          className="admin-btn admin-btn-primary"
          onClick={handleSaveWidget}
          disabled={savingWidget}
        >
          {savingWidget ? 'Saving...' : 'Save Widget Code'}
        </button>
      </div>

      <div className="admin-card">
        {loading ? (
          <p style={{ color: '#888' }}>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <div className="admin-empty-state">
            <p>No reviews found for this filter.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Account</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r._id}>
                  <td>
                    <strong>{r.name}</strong>
                    <span className="admin-cell-muted">{r.location}</span>
                  </td>
                  <td>
                    <span className="admin-cell-muted">{r.user?.email || '—'}</span>
                  </td>
                  <td>
                    <span className="admin-star-rating">{'★'.repeat(r.rating)}</span>
                  </td>
                  <td className="admin-review-text">{r.text}</td>
                  <td>
                    <span className={`admin-badge admin-badge-${r.status}`}>{r.status}</span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      {r.status !== 'approved' && (
                        <button
                          type="button"
                          className="admin-btn admin-btn-primary admin-btn-sm"
                          onClick={() => moderate(r._id, 'approved')}
                        >
                          Approve
                        </button>
                      )}
                      {r.status !== 'rejected' && (
                        <button
                          type="button"
                          className="admin-btn admin-btn-outline admin-btn-sm"
                          onClick={() => moderate(r._id, 'rejected')}
                        >
                          Reject
                        </button>
                      )}
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        onClick={() => remove(r._id)}
                      >
                        Delete
                      </button>
                    </div>
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

export default AdminReviews;