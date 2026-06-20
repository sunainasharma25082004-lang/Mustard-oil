import { useEffect, useState } from 'react';
import { adminApi } from '../utils/api';

const emptyForm = { title: '', url: '', sortOrder: 0, isActive: true };

function AdminYouTube() {
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    adminApi
      .getYouTubeVideos()
      .then((res) => setVideos(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (video) => {
    setEditing(video._id);
    setForm({
      title: video.title,
      url: video.url,
      sortOrder: video.sortOrder,
      isActive: video.isActive,
    });
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) await adminApi.updateYouTubeVideo(editing, form);
      else await adminApi.createYouTubeVideo(form);
      closeModal();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      await adminApi.deleteYouTubeVideo(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>YouTube Videos</h1>
          <p className="admin-header-sub">Manage videos displayed on the store homepage</p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={openAdd}>
          + Add Video
        </button>
      </div>

      {error && !showModal && <div className="admin-error" style={{ marginBottom: 20 }}>{error}</div>}

      <div className="admin-card">
        {loading ? (
          <p style={{ color: '#888' }}>Loading videos...</p>
        ) : videos.length === 0 ? (
          <div className="admin-empty-state">
            <p>No YouTube videos added yet.</p>
            <button type="button" className="admin-btn admin-btn-primary" onClick={openAdd}>
              Add First Video
            </button>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>URL</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((v) => (
                <tr key={v._id}>
                  <td><strong>{v.title || 'Untitled'}</strong></td>
                  <td className="admin-url-cell">{v.url}</td>
                  <td>
                    <span className={`admin-badge ${v.isActive ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                      {v.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button type="button" className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => openEdit(v)}>
                        Edit
                      </button>
                      <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => remove(v._id)}>
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
            <h2>{editing ? 'Edit Video' : 'Add Video'}</h2>
            {error && <div className="admin-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Video title (optional)"
                />
              </div>
              <div className="admin-form-group">
                <label>YouTube URL *</label>
                <input
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  required
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <label className="admin-checkbox-row">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Show on store
              </label>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn admin-btn-outline" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminYouTube;