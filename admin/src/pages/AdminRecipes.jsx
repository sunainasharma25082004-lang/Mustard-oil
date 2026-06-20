import { useEffect, useState } from 'react';
import { adminApi } from '../utils/api';
import { resolveImageUrl } from '../utils/imageUrl';

const STORE_URL = (import.meta.env.VITE_STORE_URL || 'http://localhost:5173').replace(/\/$/, '');

const emptyForm = {
  title: '',
  description: '',
  image: '',
  ingredients: '',
  steps: '',
  prepTime: '',
  cookTime: '',
  servings: '',
  isActive: true,
};

function AdminRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    setLoading(true);
    adminApi
      .getRecipes()
      .then((res) => setRecipes(res.data || []))
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

  const openEdit = (recipe) => {
    setEditing(recipe._id);
    setForm({
      title: recipe.title,
      description: recipe.description || '',
      image: recipe.image || '',
      ingredients: (recipe.ingredients || []).join('\n'),
      steps: (recipe.steps || []).join('\n'),
      prepTime: recipe.prepTime || '',
      cookTime: recipe.cookTime || '',
      servings: recipe.servings || '',
      isActive: recipe.isActive,
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

  const buildPayload = () => ({
    title: form.title.trim(),
    description: form.description.trim(),
    image: form.image.trim(),
    prepTime: form.prepTime.trim(),
    cookTime: form.cookTime.trim(),
    servings: form.servings.trim(),
    isActive: form.isActive,
    ingredients: form.ingredients
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    steps: form.steps
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Recipe title is required');
      return;
    }

    setSaving(true);
    setError('');
    const body = buildPayload();

    try {
      if (editing) {
        await adminApi.updateRecipe(editing, body);
        setSuccess('Recipe updated. Refresh the store page to see changes.');
      } else {
        await adminApi.createRecipe(body);
        setSuccess('Recipe added. It will appear on the store recipes page.');
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
    if (!window.confirm('Delete this recipe?')) return;
    setError('');
    try {
      await adminApi.deleteRecipe(id);
      setSuccess('Recipe deleted from store.');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Recipes</h1>
          <p className="admin-header-sub">
            Add recipes here — active ones show on{' '}
            <a href={`${STORE_URL}/recipes`} target="_blank" rel="noreferrer" style={{ color: '#d4af37' }}>
              {STORE_URL}/recipes
            </a>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a
            href={`${STORE_URL}/recipes`}
            target="_blank"
            rel="noreferrer"
            className="admin-btn admin-btn-outline"
          >
            Open Store Page
          </a>
          <button type="button" className="admin-btn admin-btn-primary" onClick={openAdd}>
            + Add Recipe
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
          <p style={{ color: '#888' }}>Loading recipes...</p>
        ) : recipes.length === 0 ? (
          <div className="admin-empty-state">
            <p>No recipes yet. Click &quot;Add Recipe&quot; to publish on the store.</p>
            <button type="button" className="admin-btn admin-btn-primary" onClick={openAdd}>
              Add First Recipe
            </button>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Recipe</th>
                <th>Timing</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((r) => (
                <tr key={r._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {r.image ? (
                        <img src={resolveImageUrl(r.image)} alt="" className="admin-thumb admin-thumb-lg" />
                      ) : (
                        <div
                          className="admin-thumb admin-thumb-lg"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}
                        >
                          🍳
                        </div>
                      )}
                      <div>
                        <strong>{r.title}</strong>
                        <span className="admin-cell-muted" style={{ display: 'block' }}>
                          /recipes/{r.slug}
                        </span>
                        {r.description && <span className="admin-cell-muted">{r.description}</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="admin-cell-muted" style={{ display: 'block' }}>
                      {r.prepTime && `Prep: ${r.prepTime}`}
                    </span>
                    <span className="admin-cell-muted" style={{ display: 'block' }}>
                      {r.cookTime && `Cook: ${r.cookTime}`}
                    </span>
                    {r.servings && <span className="admin-cell-muted">Serves: {r.servings}</span>}
                  </td>
                  <td>
                    <span className={`admin-badge ${r.isActive ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                      {r.isActive ? 'Live on store' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      {r.isActive && (
                        <a
                          href={`${STORE_URL}/recipes/${r.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-btn admin-btn-outline admin-btn-sm"
                        >
                          View
                        </a>
                      )}
                      <button type="button" className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => openEdit(r)}>
                        Edit
                      </button>
                      <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => remove(r._id)}>
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
          <div className="admin-modal admin-content-modal-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Recipe' : 'Add Recipe'}</h2>
            <p className="admin-hint" style={{ marginTop: -8, marginBottom: 16 }}>
              Fill the form and save. Active recipes appear on the store recipes page instantly.
            </p>
            {error && <div className="admin-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                <div className="admin-form-group full-width">
                  <label>Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    placeholder="e.g. Sarson Ka Saag"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Prep Time</label>
                  <input
                    value={form.prepTime}
                    onChange={(e) => setForm({ ...form, prepTime: e.target.value })}
                    placeholder="15 mins"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Cook Time</label>
                  <input
                    value={form.cookTime}
                    onChange={(e) => setForm({ ...form, cookTime: e.target.value })}
                    placeholder="30 mins"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Servings</label>
                  <input
                    value={form.servings}
                    onChange={(e) => setForm({ ...form, servings: e.target.value })}
                    placeholder="4 people"
                  />
                </div>
              </div>
              <div className="admin-form-group">
                <label>Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short summary shown on recipe card"
                />
              </div>
              <div className="admin-form-group">
                <label>Recipe Image</label>
                <div className="admin-file-picker">
                  <input type="file" accept="image/*" onChange={(e) => handleUpload(e.target.files?.[0])} />
                  {uploading && <span style={{ color: '#888', fontSize: '0.85rem' }}>Uploading...</span>}
                  {form.image && (
                    <img src={resolveImageUrl(form.image)} alt="" className="admin-thumb admin-thumb-lg" />
                  )}
                </div>
                <p className="admin-hint">Upload a food photo for best results on the store.</p>
              </div>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>Ingredients *</label>
                  <textarea
                    rows={6}
                    value={form.ingredients}
                    onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                    placeholder="One ingredient per line"
                    required
                  />
                  <p className="admin-hint">One ingredient per line</p>
                </div>
                <div className="admin-form-group">
                  <label>Cooking Steps *</label>
                  <textarea
                    rows={6}
                    value={form.steps}
                    onChange={(e) => setForm({ ...form, steps: e.target.value })}
                    placeholder="One step per line"
                    required
                  />
                  <p className="admin-hint">One step per line</p>
                </div>
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
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Publish Recipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminRecipes;