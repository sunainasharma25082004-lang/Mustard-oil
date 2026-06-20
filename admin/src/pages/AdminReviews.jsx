import { useEffect, useState } from 'react';
import { adminApi } from '../utils/api';

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReviews = () => {
    setLoading(true);
    adminApi
      .getReviews(filter || undefined)
      .then((res) => setReviews(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, [filter]);

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