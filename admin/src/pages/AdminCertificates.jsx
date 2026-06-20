import { useEffect, useState } from 'react';
import { adminApi } from '../utils/api';
import { resolveImageUrl } from '../utils/imageUrl';

const STORE_URL = (import.meta.env.VITE_STORE_URL || 'http://localhost:5173').replace(/\/$/, '');

const emptyForm = { title: '', description: '', image: '', sortOrder: 0, isActive: true };

function AdminCertificates() {
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
      .getCertificates()
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
      title: item.title,
      description: item.description || '',
      image: item.image,
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
      setForm((prev) => ({ ...prev, image: res.data.url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Certificate title is required');
      return;
    }
    if (!form.image.trim()) {
      setError('Please upload a certificate image');
      return;
    }

    setSaving(true);
    setError('');
    const body = {
      title: form.title.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    };

    try {
      if (editing) {
        await adminApi.updateCertificate(editing, body);
        setSuccess('Certificate updated. Refresh the store home page to see changes.');
      } else {
        await adminApi.createCertificate(body);
        setSuccess('Certificate added. It will appear on the store home page.');
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
    if (!window.confirm('Delete this certificate?')) return;
    setError('');
    try {
      await adminApi.deleteCertificate(id);
      setSuccess('Certificate removed from store.');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Certifications</h1>
          <p className="admin-header-sub">
            Manage certification badges shown on the store home page —{' '}
            <a href={`${STORE_URL}/#certifications`} target="_blank" rel="noreferrer" style={{ color: '#d4af37' }}>
              {STORE_URL}/#certifications
            </a>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a
            href={`${STORE_URL}/#certifications`}
            target="_blank"
            rel="noreferrer"
            className="admin-btn admin-btn-outline"
          >
            View on Store
          </a>
          <button type="button" className="admin-btn admin-btn-primary" onClick={openAdd}>
            + Add Certificate
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
          <p style={{ color: '#888' }}>Loading certificates...</p>
        ) : items.length === 0 ? (
          <div className="admin-empty-state">
            <p>No certificates yet. Add FSSAI, ISO, Organic badges for the store.</p>
            <button type="button" className="admin-btn admin-btn-primary" onClick={openAdd}>
              Add First Certificate
            </button>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Certificate</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={resolveImageUrl(c.image)} alt="" className="admin-thumb admin-thumb-lg" />
                      <strong>{c.title}</strong>
                    </div>
                  </td>
                  <td className="admin-review-text">{c.description || '—'}</td>
                  <td>
                    <span className={`admin-badge ${c.isActive ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                      {c.isActive ? 'Live on store' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button type="button" className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => openEdit(c)}>
                        Edit
                      </button>
                      <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => remove(c._id)}>
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
            <h2>{editing ? 'Edit Certificate' : 'Add Certificate'}</h2>
            <p className="admin-hint" style={{ marginTop: -8, marginBottom: 16 }}>
              Upload badge image, title and description. Active certificates show on the home page.
            </p>
            {error && <div className="admin-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="e.g. FSSAI Certified"
                />
              </div>
              <div className="admin-form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description shown below the badge"
                />
              </div>
              <div className="admin-form-group">
                <label>Certificate Image *</label>
                <div className="admin-file-picker">
                  <input type="file" accept="image/*" onChange={(e) => handleUpload(e.target.files?.[0])} />
                  {uploading && <span style={{ color: '#888', fontSize: '0.85rem' }}>Uploading...</span>}
                  {form.image && (
                    <img src={resolveImageUrl(form.image)} alt="" className="admin-thumb admin-thumb-lg" />
                  )}
                </div>
                <p className="admin-hint">Upload FSSAI / ISO / Organic certificate badge (PNG or JPG).</p>
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
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminCertificates;