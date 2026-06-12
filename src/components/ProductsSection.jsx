import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/main.css';
import { productApi } from '../utils/api';
import { resolveImageUrl } from '../utils/imageUrl';

function ProductsSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || '(not set - calling relative)';
    console.log('[ProductsSection] Using API base:', apiBase);

    productApi
      .getAll()
      .then((res) => {
        setProducts(res.data || []);
      })
      .catch((err) => {
        console.error('[ProductsSection] Failed to load live products from API:', err);
        setError(err.message || 'Failed to load products');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [retryKey]);

  return (
    <section className="premium-products">
      <div className="container">
        <div className="premium-heading">
          <span>OUR COLLECTION</span>
          <h2>Premium Mustard Oil Products</h2>
          <p>
            Crafted from carefully selected mustard seeds,
            delivering purity, aroma and authentic taste.
          </p>

          {loading && (
            <p style={{ color: '#d4af37', fontSize: '14px', marginTop: '8px' }}>
              Loading products...
            </p>
          )}

          {error && !loading && (
            <p style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '8px' }}>
              {error}.{' '}
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setError('');
                  setRetryKey((k) => k + 1);
                }}
                style={{ background: 'none', border: 'none', color: '#b45309', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
              >
                Retry
              </button>
            </p>
          )}

          {!loading && !error && products.length === 0 && (
            <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
              No products available at the moment.
            </p>
          )}
        </div>

        {!loading && !error && products.length > 0 && (
          <div className="row g-4 align-items-stretch">
            {products.map((product) => (
              <div className="col-lg-3 col-md-6" key={product._id || product.slug}>
                <Link
                  to={`/products/${product.slug || product._id}`}
                  className="premium-card premium-card-link"
                  aria-label={`View ${product.size || product.name}`}
                >
                  <div className="premium-card-bg" />

                  <div className="premium-tag">{product.badge || product.tag}</div>

                  <div className="product-image">
                    <div className="product-image-inner">
                      <img src={resolveImageUrl(product.image)} alt={product.size || product.name} className="product-showcase-img" />
                    </div>
                  </div>

                  <div className="product-content">
                    <h4>{product.size || product.name || product.title}</h4>
                    <p>{product.description}</p>
                    {product.price && (
                      <p className="premium-card-price">₹{product.price}</p>
                    )}

                    <span className="premium-btn">View Product</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductsSection;