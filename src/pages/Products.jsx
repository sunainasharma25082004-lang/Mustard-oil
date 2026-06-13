import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productApi } from '../utils/api';
import { resolveImageUrl } from '../utils/imageUrl';

function Products() {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    productApi
      .getAll()
      .then((res) => setProducts(res.data || []))
      .catch((err) => setError(err.message || 'Failed to load products'))
      .finally(() => setLoading(false));
  }, [retryKey]);

  const handleAddToCart = (product) => {
    addToCart(product);
    navigate('/addcart');
  };

  return (
    <>
      <section className="premium-products-page">
        <div className="container">

          <div className="products-heading">
            <span>PREMIUM COLLECTION</span>
            <h1>Our Products</h1>
            <p>
              Experience the purity of traditional Kachi Ghani Mustard Oil
              crafted with quality, nutrition and trust.
            </p>
          </div>

          {loading && (
            <p style={{ textAlign: 'center', color: '#d4af37' }}>Loading products...</p>
          )}

          {error && (
            <p style={{ textAlign: 'center', color: '#ff6b6b' }}>
              {error}.{' '}
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setError('');
                  setRetryKey((k) => k + 1);
                }}
                style={{ background: 'none', border: 'none', color: '#d4af37', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}
              >
                Retry
              </button>
            </p>
          )}

          {!loading && !error && products.length === 0 && (
            <p style={{ textAlign: 'center', color: '#666' }}>
              No products available at the moment. Please check back later.
            </p>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="row g-4 justify-content-center">
              {products.map((item) => (
                <div className="col-lg-5 col-md-6" key={item._id}>
                  <div className="premium-product-card">

                    <div className="product-badge">
                      {item.badge}
                    </div>

                    <div className="product-image-box" style={{ position: 'relative' }}>
                      <div className="product-image-inner product-image-inner-lg">
                        <img
                          src={resolveImageUrl(item.image)}
                          alt={item.name}
                          className="img-fluid product-showcase-img"
                        />
                      </div>
                    </div>

                    <div className="product-content">
                      <h3>{item.size || item.name}</h3>

                      {/* Price display - Original (strikethrough) + Sale price beside it + % OFF */}
                      {(() => {
                        const orig = Number(item.originalPrice);
                        const curr = Number(item.price);
                        if (orig && orig > curr) {
                          const discount = Math.round(((orig - curr) / orig) * 100);
                          return (
                            <div style={{ margin: '6px 0 4px', fontSize: '0.95rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span style={{ 
                                  textDecoration: 'line-through', 
                                  color: '#d4af37', 
                                  fontSize: '0.85rem',
                                  fontWeight: 500,
                                  opacity: 0.75
                                }}>
                                  ₹{orig}
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
                                <span style={{ 
                                  color: '#d4af37', 
                                  fontWeight: 800, 
                                  fontSize: '1.15rem',
                                  lineHeight: 1
                                }}>
                                  ₹{curr}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return <p style={{ color: '#d4af37', fontWeight: 800, fontSize: '1.1rem', margin: '6px 0 4px' }}>
                          ₹{curr}
                        </p>;
                      })()}

                      <p>{item.description}</p>

                      <div className="product-card-actions">
                        <Link
                          to={`/products/${item.slug || item._id}`}
                          className="product-view-btn"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="golden-btn"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>
    </>
  );
}

export default Products;