import { useEffect, useRef, useState } from "react";
import { adminApi } from "../utils/api";
import { resolveImageUrl } from "../utils/imageUrl";
import {
  getProductImages,
  getProductPrimaryImage,
  MAX_PRODUCT_IMAGES,
} from "../utils/productImages";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  image: "",
  images: [],
  badge: "",
  size: "",
  shippingWeightKg: "",
  shippingLengthCm: "",
  shippingBreadthCm: "",
  shippingHeightCm: "",
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
  const [selectedFileName, setSelectedFileName] = useState("");
  const [localPreview, setLocalPreview] = useState("");
  const [error, setError] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const fileInputRef = useRef(null);
  const localPreviewRef = useRef("");

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
      localPreviewRef.current = "";
    }
    setLocalPreview("");
  };

  const resetUploadState = () => {
    setSelectedFileName("");
    setDragOver(false);
    setImageUrlInput("");
    clearLocalPreview();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev || "";
      };
    }
  }, [showModal]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    resetUploadState();
    setShowModal(true);
  };

  const openEdit = (product) => {
    const images = getProductImages(product);
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      originalPrice: product.originalPrice || "",
      image: images[0] || "",
      images,
      badge: product.badge || "",
      size: product.size || "",
      shippingWeightKg: product.shippingWeightKg ?? "",
      shippingLengthCm: product.shippingLengthCm ?? "",
      shippingBreadthCm: product.shippingBreadthCm ?? "",
      shippingHeightCm: product.shippingHeightCm ?? "",
      inStock: product.inStock,
      isActive: product.isActive,
    });
    setError("");
    resetUploadState();
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === "checkbox" ? checked : value;

    setForm({ ...form, [name]: nextValue });
  };

  const appendImage = (url) => {
    const nextUrl = String(url).trim();
    if (!nextUrl) return false;

    if (form.images.length >= MAX_PRODUCT_IMAGES) {
      setError(`You can add up to ${MAX_PRODUCT_IMAGES} images per product.`);
      return false;
    }

    if (form.images.includes(nextUrl)) {
      setError("This image is already added.");
      return false;
    }

    const nextImages = [...form.images, nextUrl];
    setForm({
      ...form,
      images: nextImages,
      image: nextImages[0],
    });
    setError("");
    return true;
  };

  const removeImage = (index) => {
    setForm((prev) => {
      const nextImages = prev.images.filter(
        (_, itemIndex) => itemIndex !== index,
      );
      return {
        ...prev,
        images: nextImages,
        image: nextImages[0] || "",
      };
    });
  };

  const uploadFile = async (file) => {
    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file (JPG, PNG, WebP)");
      return;
    }

    if (form.images.length >= MAX_PRODUCT_IMAGES) {
      setError(`You can add up to ${MAX_PRODUCT_IMAGES} images per product.`);
      return;
    }

    setUploading(true);
    setError("");
    setSelectedFileName(file.name);

    clearLocalPreview();
    const blobUrl = URL.createObjectURL(file);
    localPreviewRef.current = blobUrl;
    setLocalPreview(blobUrl);

    try {
      const res = await adminApi.uploadImage(file);
      clearLocalPreview();
      appendImage(res.data.url);
    } catch (err) {
      setError(err.message);
      setSelectedFileName("");
      clearLocalPreview();
    } finally {
      setUploading(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) {
      setError("Paste an image URL first.");
      return;
    }

    if (appendImage(imageUrlInput)) {
      setImageUrlInput("");
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

    if (!form.images.length) {
      setError("Please add at least one product image before saving.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      ...form,
      images: form.images,
      image: form.images[0],
      shippingWeightKg:
        form.shippingWeightKg === ""
          ? undefined
          : Number(form.shippingWeightKg),
      shippingLengthCm:
        form.shippingLengthCm === ""
          ? undefined
          : Number(form.shippingLengthCm),
      shippingBreadthCm:
        form.shippingBreadthCm === ""
          ? undefined
          : Number(form.shippingBreadthCm),
      shippingHeightCm:
        form.shippingHeightCm === ""
          ? undefined
          : Number(form.shippingHeightCm),
    };

    try {
      if (editing) {
        await adminApi.updateProduct(editing._id, payload);
      } else {
        await adminApi.createProduct(payload);
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
    if (!window.confirm(`Delete "${name}" permanently? This cannot be undone.`))
      return;

    setError("");
    try {
      await adminApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await adminApi.updateProduct(product._id, {
        isActive: !product.isActive,
      });
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Products</h1>
          <p className="admin-header-sub">
            Manage store products, images and pricing
          </p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}>
          + Add Product
        </button>
      </div>

      {error && !showModal && (
        <div className="admin-error" style={{ marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div className="admin-card">
        {loading ? (
          <p style={{ color: "#888" }}>Loading...</p>
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
                      src={resolveImageUrl(getProductPrimaryImage(p))}
                      alt={p.name}
                      className="admin-product-img"
                    />
                  </td>
                  <td>
                    <strong style={{ color: "#fff" }}>{p.name}</strong>
                    {p.badge && (
                      <span
                        className="admin-badge admin-badge-pending"
                        style={{ marginLeft: 8 }}
                      >
                        {p.badge}
                      </span>
                    )}
                  </td>
                  <td>{p.size || "-"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {p.originalPrice && p.originalPrice > p.price ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            textDecoration: "line-through",
                            color: "#d4af37",
                            fontSize: "0.85rem",
                            fontWeight: 500,
                            opacity: 0.75,
                          }}
                        >
                          ₹{p.originalPrice}
                        </span>
                        <span
                          style={{
                            fontSize: "0.62rem",
                            color: "#b89c5e",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.6px",
                          }}
                        >
                          Discounted
                        </span>
                        <span
                          style={{
                            color: "#d4af37",
                            fontWeight: 700,
                            fontSize: "1.05rem",
                          }}
                        >
                          ₹{p.price}
                        </span>
                        <span
                          style={{
                            fontSize: "0.65rem",
                            background: "rgba(212,175,55,0.15)",
                            color: "#d4af37",
                            padding: "1px 6px",
                            borderRadius: "3px",
                            fontWeight: 600,
                            border: "1px solid rgba(212,175,55,0.35)",
                          }}
                        >
                          {Math.round(
                            ((p.originalPrice - p.price) / p.originalPrice) *
                              100,
                          )}
                          % OFF
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: "#d4af37", fontWeight: 700 }}>
                        ₹{p.price}
                      </span>
                    )}
                  </td>
                  <td>{p.inStock ? "In Stock" : "Out of Stock"}</td>
                  <td>
                    <span
                      className={`admin-badge ${p.isActive ? "admin-badge-active" : "admin-badge-inactive"}`}
                    >
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="admin-btn admin-btn-outline admin-btn-sm"
                      onClick={() => openEdit(p)}
                      style={{ marginRight: 8 }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-outline admin-btn-sm"
                      onClick={() => handleToggleActive(p)}
                      style={{ marginRight: 8 }}
                    >
                      {p.isActive ? "Deactivate" : "Activate"}
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
          <div
            className="admin-modal admin-product-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-product-modal-header">
              <div>
                <span className="admin-product-modal-eyebrow">
                  {editing ? "Update listing" : "New listing"}
                </span>
                <h2>{editing ? "Edit Product" : "Add Product"}</h2>
                <p>
                  Fill details below — same content will show on your store.
                </p>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {error && <div className="admin-error">{error}</div>}

            <form onSubmit={handleSubmit} className="admin-product-form">
              <div className="admin-product-form-layout">
                <div className="admin-product-form-side">
                  <div className="admin-form-group">
                    <label>
                      Product Images ({form.images.length}/{MAX_PRODUCT_IMAGES})
                    </label>
                    <p className="admin-image-gallery-hint">
                      First image is the cover photo. Add up to{" "}
                      {MAX_PRODUCT_IMAGES} images like Flipkart.
                    </p>
                  </div>

                  {form.images.length > 0 && (
                    <div className="admin-image-gallery-grid">
                      {form.images.map((image, index) => (
                        <div
                          className="admin-image-gallery-item"
                          key={`${image}-${index}`}
                        >
                          <img
                            src={resolveImageUrl(image)}
                            alt={`Product image ${index + 1}`}
                          />
                          {index === 0 && (
                            <span className="admin-image-gallery-cover">
                              Cover
                            </span>
                          )}
                          <button
                            type="button"
                            className="admin-image-gallery-remove"
                            onClick={() => removeImage(index)}
                            aria-label={`Remove image ${index + 1}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {form.images.length < MAX_PRODUCT_IMAGES && (
                    <div
                      className={`admin-image-dropzone admin-image-dropzone-compact ${dragOver ? "drag-over" : ""} ${uploading ? "uploading" : ""}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() =>
                        !uploading && fileInputRef.current?.click()
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
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

                      <div className="admin-image-dropzone-empty">
                        <span className="admin-image-dropzone-icon">📷</span>
                        <strong>
                          {uploading ? "Uploading..." : "Add product image"}
                        </strong>
                        <span>Click or drag image here</span>
                      </div>
                    </div>
                  )}

                  {selectedFileName && (
                    <p className="admin-image-file-name">{selectedFileName}</p>
                  )}

                  {localPreview && uploading && (
                    <p className="admin-image-file-name">
                      Uploading preview...
                    </p>
                  )}

                  {form.images.length < MAX_PRODUCT_IMAGES && (
                    <div className="admin-form-group admin-image-url-group">
                      <label>Or paste image URL</label>
                      <div className="admin-image-url-row">
                        <input
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          placeholder="https://example.com/product.jpg"
                        />
                        <button
                          type="button"
                          className="admin-btn admin-btn-outline admin-btn-sm"
                          onClick={handleAddImageUrl}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="admin-product-toggles">
                    <label className="admin-toggle-row">
                      <span>In Stock</span>
                      <span className="admin-toggle">
                        <input
                          name="inStock"
                          type="checkbox"
                          checked={form.inStock}
                          onChange={handleChange}
                        />
                        <span className="admin-toggle-slider" />
                      </span>
                    </label>

                    <label className="admin-toggle-row">
                      <span>Show on store</span>
                      <span className="admin-toggle">
                        <input
                          name="isActive"
                          type="checkbox"
                          checked={form.isActive}
                          onChange={handleChange}
                        />
                        <span className="admin-toggle-slider" />
                      </span>
                    </label>
                  </div>
                </div>

                <div className="admin-product-form-fields">
                  <div className="admin-form-section-title">
                    Product details
                  </div>

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
                      <label>Weight (kg)</label>
                      <input
                        name="shippingWeightKg"
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={form.shippingWeightKg}
                        onChange={handleChange}
                        placeholder="0.5"
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Length (cm)</label>
                      <input
                        name="shippingLengthCm"
                        type="number"
                        min="1"
                        step="1"
                        value={form.shippingLengthCm}
                        onChange={handleChange}
                        placeholder="20"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Breadth (cm)</label>
                      <input
                        name="shippingBreadthCm"
                        type="number"
                        min="1"
                        step="1"
                        value={form.shippingBreadthCm}
                        onChange={handleChange}
                        placeholder="15"
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Height (cm)</label>
                    <input
                      name="shippingHeightCm"
                      type="number"
                      min="1"
                      step="1"
                      value={form.shippingHeightCm}
                      onChange={handleChange}
                      placeholder="10"
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

                  <div className="admin-form-group">
                    <label>
                      Original Price / MRP (optional — for strikethrough +
                      discount)
                    </label>
                    <input
                      name="originalPrice"
                      type="number"
                      min="0"
                      value={form.originalPrice}
                      onChange={handleChange}
                      placeholder="400 (leave empty if no discount)"
                    />
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#888",
                        marginTop: 4,
                      }}
                    >
                      If set higher than current price, store will show: crossed
                      old price (golden) + "Discounted" label + current price +
                      % OFF badge
                    </p>
                  </div>

                  {/* Live preview of how pricing will appear on customer site */}
                  {(() => {
                    const curr = Number(form.price) || 0;
                    const orig = Number(form.originalPrice) || 0;
                    if (orig > curr && curr > 0) {
                      const disc = Math.round(((orig - curr) / orig) * 100);
                      return (
                        <div
                          style={{
                            marginTop: 8,
                            padding: "10px 12px",
                            background: "rgba(0,0,0,0.3)",
                            border: "1px solid rgba(212,175,55,0.2)",
                            borderRadius: 6,
                            fontSize: "0.9rem",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.7rem",
                              color: "#888",
                              marginBottom: 4,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Customer preview (price row)
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                textDecoration: "line-through",
                                color: "#d4af37",
                                fontSize: "0.9rem",
                                fontWeight: 500,
                                opacity: 0.75,
                              }}
                            >
                              ₹{orig}
                            </span>
                            <span
                              style={{
                                fontSize: "0.62rem",
                                color: "#b89c5e",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.6px",
                              }}
                            >
                              Discounted
                            </span>
                            <span
                              style={{
                                color: "#d4af37",
                                fontWeight: 700,
                                fontSize: "1.05rem",
                              }}
                            >
                              ₹{curr}
                            </span>
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
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={saving || uploading}
                >
                  {saving
                    ? "Saving..."
                    : editing
                      ? "Save Changes"
                      : "Publish Product"}
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
