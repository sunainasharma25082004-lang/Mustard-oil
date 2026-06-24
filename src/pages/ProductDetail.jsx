import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productApi } from '../utils/api';
import ProductImageGallery from '../components/ProductImageGallery';
import { useLiveData } from '../hooks/useLiveData';

const FEATURES = [
  { icon: 'bi-droplet-half', label: 'Cold Pressed & Single Pressed Mustard Oil' },
  { icon: 'bi-flower1', label: '5+ Years Legacy' },
  { icon: 'bi-shield-check', label: 'No Heat · No Chemical · No Adulteration' },
];

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  const loadProduct = useCallback(() => {
    setLoading(true);
    setError('');
    productApi
      .getById(id)
      .then((res) => setProduct(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useLiveData(loadProduct, [id]);

  const handleAddToCart = () => {
    if (!product?.inStock) return;
    addToCart(product, quantity);
    navigate('/addcart');
  };

  const handleBuyNow = () => {
    if (!product?.inStock) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const changeQty = (delta) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + delta)));
  };

  return (
    <>
      <section className="product-detail-page">
        <div className="container">
          <Link to="/products" className="product-detail-back">
            <i className="bi bi-arrow-left" /> Back to Products
          </Link>

          {loading && (
            <p className="product-detail-status">Loading product details...</p>
          )}

          {error && !loading && (
            <div className="product-detail-error">
              <p>{error}</p>
              <button type="button" className="golden-btn" onClick={() => navigate('/products')}>
                Browse All Products
              </button>
            </div>
          )}

          {product && !loading && (
            <div className="product-detail-grid">
              <ProductImageGallery product={product} />

              <div className="product-detail-info">
                <span className="product-detail-label">KARYOR Cold Pressed & Single Pressed Mustard Oil</span>
                <h1>{product.size || product.name}</h1>
                <p className="product-detail-desc">{product.description}</p>

                <div className="product-detail-price-row">
                  {(() => {
                    const orig = Number(product.originalPrice);
                    const curr = Number(product.price);
                    if (orig && orig > curr) {
                      const discount = Math.round(((orig - curr) / orig) * 100);
                      const savings = orig - curr;
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <span style={{ 
                              textDecoration: 'line-through', 
                              color: '#d4af37', 
                              fontSize: '1.1rem',
                              fontWeight: 500,
                              opacity: 0.75
                            }}>
                              ₹{orig}
                            </span>
                            <span style={{ 
                              fontSize: '0.68rem', 
                              color: '#b89c5e', 
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.6px'
                            }}>
                              Discounted
                            </span>
                            <span className="product-detail-price" style={{ fontSize: '1.65rem' }}>₹{curr}</span>
                          </div>
                          <div style={{ 
                            color: '#d4af37', 
                            fontSize: '0.85rem', 
                            fontWeight: 600 
                          }}>
                            You save ₹{savings}
                          </div>
                        </div>
                      );
                    }
                    return <span className="product-detail-price">₹{curr}</span>;
                  })()}
                  <span className={`product-detail-stock ${product.inStock ? 'in-stock' : 'out-stock'}`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                <ul className="product-detail-features">
                  {FEATURES.map((f) => (
                    <li key={f.label}>
                      <i className={`bi ${f.icon}`} />
                      {f.label}
                    </li>
                  ))}
                </ul>

                <div className="product-detail-qty">
                  <span>Quantity</span>
                  <div className="qty-controls">
                    <button type="button" onClick={() => changeQty(-1)} aria-label="Decrease quantity">
                      −
                    </button>
                    <span>{quantity}</span>
                    <button type="button" onClick={() => changeQty(1)} aria-label="Increase quantity">
                      +
                    </button>
                  </div>
                </div>

                <div className="product-detail-actions">
                  <button
                    type="button"
                    className="golden-btn product-detail-btn-primary"
                    onClick={handleBuyNow}
                    disabled={!product.inStock}
                  >
                    Buy Now — ₹{product.price * quantity}
                  </button>
                  <button
                    type="button"
                    className="product-detail-btn-secondary"
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                  >
                    Add to Cart
                  </button>
                </div>

                <div className="product-detail-trust">
                  <p><i className="bi bi-truck" /> Delivery in 5–7 business days</p>
                  <p><i className="bi bi-shield-lock" /> Secure online checkout · UPI, Card, Netbanking</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default ProductDetail;