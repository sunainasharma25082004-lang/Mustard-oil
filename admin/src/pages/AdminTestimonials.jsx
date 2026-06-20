import { useEffect, useState } from 'react';
import { adminApi } from '../utils/api';
import { resolveImageUrl } from '../utils/imageUrl';

const STORE_URL = (import.meta.env.VITE_STORE_URL || 'http://localhost:5173').replace(/\/$/, '');

const emptyForm = {
  customerName: '',
  customerImage: '',
  review: '',
  rating: 5,
  location: '',
  sortOrder: 0,
  isActive: true,
};

function AdminTestimonials() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    setLoading(true);
    adminApi
      .getTestimonials()
      .then((res) => setItems(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!success) return undefined;
    const timer = setTimeout(() => setSuccess(''), 4000);
    return () => clearTimeout(timer);
  }, [success]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item._id);
    setForm({
      customerName: item.customerName,
      customerImage: item.customerImage || '',
      review: item.review,
      rating: item.rating,
      location: item.location || '',
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
    setError('');
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await adminApi.uploadImage(file);
      setForm((prev) => ({ ...prev, customerImage: res.data.url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.review.trim()) {
      setError('Customer name and review are required');
      return;
    }

    setSaving(true);
    setError('');
    const body = {
      customerName: form.customerName.trim(),
      customerImage: form.customerImage.trim(),
      review: form.review.trim(),
      rating: Math.min(5, Math.max(1, Number(form.rating) || 5)),
      location: form.location.trim(),
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    };

    try {
      if (editing) {
        await adminApi.updateTestimonial(editing, body);
        setSuccess('Testimonial updated. Refresh the store home page to see changes.');
      } else {
        await adminApi.createTestimonial(body);
        setSuccess('Testimonial added. It will appear in the store carousel.');
      }
      closeModal();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    setError('');
    try {
      await adminApi.deleteTestimonial(id);
      setSuccess('Testimonial removed from store.');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Testimonials</h1>
          <p className="admin-header-sub">
            Curated customer stories for the home page carousel —{' '}
            <a href={`${STORE_URL}/#testimonials`} target="_blank" rel="noreferrer" style={{ color: '#d4af37' }}>
              {STORE_URL}/#testimonials
            </a>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a
            href={`${STORE_URL}/#testimonials`}
            target="_blank"
            rel="noreferrer"
            className="admin-btn admin-btn-outline"
          >
            View on Store
          </a>
          <button type="button" className="admin-btn admin-btn-primary" onClick={openAdd}>
            + Add Testimonial
          </button>
        </div>
      </div>

      {success && (
        <div
          style={{
            marginBottom: 20,
            padding: '12px 16px',
            borderRadius: 10,
            background: 'rgba(76, 175, 80, 0.12)',
            border: '1px solid rgba(76, 175, 80, 0.35)',
            color: '#8fd99a',
            fontSize: '0.9rem',
          }}
        >
          {success}
        </div>
      )}

      {error && !showModal && <div className="admin-error" style={{ marginBottom: 20 }}>{error}</div>}

      <div className="admin-card">
        {loading ? (
          <p style={{ color: '#888' }}>Loading testimonials...</p>
        ) : items.length === 0 ? (
          <div className="admin-empty-state">
            <p>No testimonials yet. Add customer stories for the home page slider.</p>
            <button type="button" className="admin-btn admin-btn-primary" onClick={openAdd}>
              Add First Testimonial
            </button>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {t.customerImage ? (
                        <img
                          src={resolveImageUrl(t.customerImage)}
                          alt=""
                          className="admin-thumb admin-thumb-round"
                        />
                      ) : (
                        <div
                          className="admin-thumb admin-thumb-round"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '1.2rem' }}
                        >
                          👤
                        </div>
                      )}
                      <div>
                        <strong>{t.customerName}</strong>
                        {t.location && <span className="admin-cell-muted">{t.location}</span>}
                      </div>
                    </div>
                  </td>
                  <td><span className="admin-star-rating">{'★'.repeat(t.rating)}</span></td>
                  <td className="admin-review-text">{t.review}</td>
                  <td>
                    <span className={`admin-badge ${t.isActive ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                      {t.isActive ? 'Live on store' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button type="button" className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => openEdit(t)}>
                        Edit
                      </button>
                      <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => remove(t._id)}>
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

      {showModal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal admin-content-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
            <p className="admin-hint" style={{ marginTop: -8, marginBottom: 16 }}>
              Name, photo, review and rating appear in the home page testimonial carousel.
            </p>
            {error && <div className="admin-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>Customer Name *</label>
                  <input
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    required
                    placeholder="e.g. Anjali Sharma"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Location</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Rating (1–5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="admin-form-group">
                <label>Review *</label>
                <textarea
                  rows={4}
                  value={form.review}
                  onChange={(e) => setForm({ ...form, review: e.target.value })}
                  required
                  placeholder="Customer testimonial text"
                />
              </div>
              <div className="admin-form-group">
                <label>Customer Photo</label>
                <div className="admin-file-picker">
                  <input type="file" accept="image/*" onChange={(e) => handleUpload(e.target.files?.[0])} />
                  {uploading && <span style={{ color: '#888', fontSize: '0.85rem' }}>Uploading...</span>}
                  {form.customerImage && (
                    <img
                      src={resolveImageUrl(form.customerImage)}
                      alt=""
                      className="admin-thumb admin-thumb-round"
                    />
                  )}
                </div>
                <p className="admin-hint">Optional — shows as round avatar in the carousel.</p>
              </div>
              <label className="admin-checkbox-row">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Show on store (live)
              </label>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn admin-btn-outline" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving || uploading}>
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminTestimonials;