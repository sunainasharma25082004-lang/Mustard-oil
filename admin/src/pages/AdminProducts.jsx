import { useEffect, useRef, useState, useMemo } from 'react';
import { adminApi } from '../utils/api';
import { resolveImageUrl } from '../utils/imageUrl';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  image: '',
  badge: '',
  size: '',
  inStock: true,
  isActive: true,
};

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [localPreview, setLocalPreview] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const localPreviewRef = useRef('');

  const loadProducts = () => {
    setLoading(true);
    adminApi
      .getProducts()
      .then((res) => setProducts(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    return () => {
      if (localPreviewRef.current) {
        URL.revokeObjectURL(localPreviewRef.current);
      }
    };
  }, []);

  const clearLocalPreview = () => {
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
      localPreviewRef.current = '';
    }
    setLocalPreview('');
  };

  const resetUploadState = () => {
    setSelectedFileName('');
    setDragOver(false);
    setPreviewError(false);
    clearLocalPreview();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const closeModal = () => {
    setShowModal(false);
    resetUploadState();
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev || '';
      };
    }
  }, [showModal]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    resetUploadState();
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      originalPrice: product.originalPrice || '',
      image: product.image || '',
      badge: product.badge || '',
      size: product.size || '',
      inStock: product.inStock,
      isActive: product.isActive,
    });
    setError('');
    resetUploadState();
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? checked : value;

    if (name === 'image') {
      clearLocalPreview();
      setPreviewError(false);
      setSelectedFileName('');
    }

    setForm({ ...form, [name]: nextValue });
  };

  const uploadFile = async (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file (JPG, PNG, WebP)');
      return;
    }

    setUploading(true);
    setError('');
    setPreviewError(false);
    setSelectedFileName(file.name);

    clearLocalPreview();
    const blobUrl = URL.createObjectURL(file);
    localPreviewRef.current = blobUrl;
    setLocalPreview(blobUrl);

    try {
      const res = await adminApi.uploadImage(file);
      clearLocalPreview();
      setForm((prev) => ({ ...prev, image: res.data.url }));
    } catch (err) {
      setError(err.message);
      setSelectedFileName('');
      clearLocalPreview();
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.image) {
      setError('Please upload a product image before saving.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editing) {
        await adminApi.updateProduct(editing._id, form);
      } else {
        await adminApi.createProduct(form);
      }
      closeModal();
      loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" permanently? This cannot be undone.`)) return;

    setError('');
    try {
      await adminApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await adminApi.updateProduct(product._id, { isActive: !product.isActive });
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const previewSrc = useMemo(() => {
    if (localPreview) return localPreview;
    if (!form.image) return '';
    return resolveImageUrl(form.image);
  }, [localPreview, form.image]);

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Products</h1>
          <p className="admin-header-sub">Manage store products, images and pricing</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}>
          + Add Product
        </button>
      </div>

      {error && !showModal && <div className="admin-error" style={{ marginBottom: 20 }}>{error}</div>}

      <div className="admin-card">
        {loading ? (
          <p style={{ color: '#888' }}>Loading...</p>
        ) : products.length === 0 ? (
          <div className="admin-empty-state">
            <p>No products yet</p>
            <button className="admin-btn admin-btn-primary" onClick={openAdd}>
              Add your first product
            </button>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Size</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <img
                      src={resolveImageUrl(p.image)}
                      alt={p.name}
                      className="admin-product-img"
                    />
                  </td>
                  <td>
                    <strong style={{ color: '#fff' }}>{p.name}</strong>
                    {p.badge && (
                      <span className="admin-badge admin-badge-pending" style={{ marginLeft: 8 }}>
                        {p.badge}
                      </span>
                    )}
                  </td>
                  <td>{p.size || '-'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {p.originalPrice && p.originalPrice > p.price ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ 
                          textDecoration: 'line-through', 
                          color: '#d4af37', 
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          opacity: 0.75
                        }}>
                          ₹{p.originalPrice}
                        </span>
                        <span style={{ 
                          fontSize: '0.62rem', 
                          color: '#b89c5e', 
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.6px'
                        }}>
                          Discounted
                        </span>
                        <span style={{ color: '#d4af37', fontWeight: 700, fontSize: '1.05rem' }}>
                          ₹{p.price}
                        </span>
                        <span style={{ 
                          fontSize: '0.65rem', 
                          background: 'rgba(212,175,55,0.15)', 
                          color: '#d4af37', 
                          padding: '1px 6px', 
                          borderRadius: '3px',
                          fontWeight: 600,
                          border: '1px solid rgba(212,175,55,0.35)'
                        }}>
                          {Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% OFF
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: '#d4af37', fontWeight: 700 }}>₹{p.price}</span>
                    )}
                  </td>
                  <td>{p.inStock ? 'In Stock' : 'Out of Stock'}</td>
                  <td>
                    <span className={`admin-badge ${p.isActive ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => openEdit(p)} style={{ marginRight: 8 }}>
                      Edit
                    </button>
                    <button type="button" className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => handleToggleActive(p)} style={{ marginRight: 8 }}>
                      {p.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      onClick={() => handleDelete(p._id, p.name)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal admin-product-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-product-modal-header">
              <div>
                <span className="admin-product-modal-eyebrow">
                  {editing ? 'Update listing' : 'New listing'}
                </span>
                <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
                <p>Fill details below — same content will show on your store.</p>
              </div>
              <button type="button" className="admin-modal-close" onClick={closeModal} aria-label="Close">
                ×
              </button>
            </div>

            {error && <div className="admin-error">{error}</div>}

            <form onSubmit={handleSubmit} className="admin-product-form">
              <div className="admin-product-form-layout">
                <div className="admin-product-form-side">
                  <div
                    className={`admin-image-dropzone ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''} ${previewSrc && !previewError ? 'has-image' : ''}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="admin-image-upload-input"
                    />

                    {previewSrc && !previewError ? (
                      <img
                        key={previewSrc}
                        src={previewSrc}
                        alt="Product preview"
                        className="admin-image-dropzone-preview"
                        onLoad={() => setPreviewError(false)}
                        onError={() => setPreviewError(true)}
                      />
                    ) : previewError ? (
                      <div className="admin-image-dropzone-empty">
                        <span className="admin-image-dropzone-icon">⚠️</span>
                        <strong>Preview failed</strong>
                        <span>Check the image URL or upload again</span>
                      </div>
                    ) : (
                      <div className="admin-image-dropzone-empty">
                        <span className="admin-image-dropzone-icon">📷</span>
                        <strong>Upload product photo</strong>
                        <span>Click or drag image here</span>
                      </div>
                    )}

                    <div className="admin-image-dropzone-overlay">
                      {uploading ? 'Uploading...' : form.image ? 'Change image' : 'Choose image'}
                    </div>
                  </div>

                  {selectedFileName && (
                    <p className="admin-image-file-name">{selectedFileName}</p>
                  )}

                  <div className="admin-form-group admin-image-url-group">
                    <label>Or paste image URL</label>
                    <input
                      name="image"
                      value={form.image}
                      onChange={handleChange}
                      placeholder="https://example.com/product.jpg"
                    />
                    {form.image && previewError && (
                      <p className="admin-image-preview-error">Could not load this image URL</p>
                    )}
                  </div>

                  <div className="admin-product-toggles">
                    <label className="admin-toggle-row">
                      <span>In Stock</span>
                      <span className="admin-toggle">
                        <input name="inStock" type="checkbox" checked={form.inStock} onChange={handleChange} />
                        <span className="admin-toggle-slider" />
                      </span>
                    </label>

                    <label className="admin-toggle-row">
                      <span>Show on store</span>
                      <span className="admin-toggle">
                        <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} />
                        <span className="admin-toggle-slider" />
                      </span>
                    </label>
                  </div>
                </div>

                <div className="admin-product-form-fields">
                  <div className="admin-form-section-title">Product details</div>

                  <div className="admin-form-group">
                    <label>Product Name *</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. 500 ML Mustard Oil"
                      required
                    />
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Size</label>
                      <input
                        name="size"
                        value={form.size}
                        onChange={handleChange}
                        placeholder="500 ML"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Current Price (₹) *</label>
                      <input
                        name="price"
                        type="number"
                        min="0"
                        value={form.price}
                        onChange={handleChange}
                        placeholder="350"
                        required
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Original Price / MRP (optional — for strikethrough + discount)</label>
                    <input
                      name="originalPrice"
                      type="number"
                      min="0"
                      value={form.originalPrice}
                      onChange={handleChange}
                      placeholder="400 (leave empty if no discount)"
                    />
                    <p style={{ fontSize: '0.75rem', color: '#888', marginTop: 4 }}>
                      If set higher than current price, store will show: crossed old price (golden) + "Discounted" label + current price + % OFF badge
                    </p>
                  </div>

                  {/* Live preview of how pricing will appear on customer site */}
                  {(() => {
                    const curr = Number(form.price) || 0;
                    const orig = Number(form.originalPrice) || 0;
                    if (orig > curr && curr > 0) {
                      const disc = Math.round(((orig - curr) / orig) * 100);
                      return (
                        <div style={{
                          marginTop: 8,
                          padding: '10px 12px',
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(212,175,55,0.2)',
                          borderRadius: 6,
                          fontSize: '0.9rem'
                        }}>
                          <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Customer preview (price row)
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ textDecoration: 'line-through', color: '#d4af37', fontSize: '0.9rem', fontWeight: 500, opacity: 0.75 }}>
                              ₹{orig}
                            </span>
                            <span style={{ fontSize: '0.62rem', color: '#b89c5e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                              Discounted
                            </span>
                            <span style={{ color: '#d4af37', fontWeight: 700, fontSize: '1.05rem' }}>₹{curr}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="admin-form-group">
                    <label>Badge</label>
                    <input
                      name="badge"
                      value={form.badge}
                      onChange={handleChange}
                      placeholder="Best Seller"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      rows="4"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Write what customers will see on the product page..."
                    />
                  </div>
                </div>
              </div>

              <div className="admin-product-form-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving || uploading}>
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminProducts;