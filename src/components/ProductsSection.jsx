import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/main.css';
import { productApi } from '../utils/api';
import { resolveImageUrl } from '../utils/imageUrl';
import { getProductPrimaryImage } from '../utils/productImages';
import { readCache, writeCache } from '../utils/storeCache';

const PRODUCTS_CACHE_KEY = 'products';
const CACHE_TTL_MS = 5 * 60 * 1000;

function ProductSkeletonGrid({ count = 2 }) {
  return (
    <div className="row g-4 align-items-stretch justify-content-center">
      {Array.from({ length: count }).map((_, i) => (
        <div className="col-lg-3 col-md-6" key={i}>
          <div className="premium-card" style={{ opacity: 0.55, pointerEvents: 'none' }}>
            <div className="premium-card-bg" />
            <div className="product-image">
              <div
                className="product-image-inner"
                style={{ background: 'rgba(212,175,55,0.08)', minHeight: 180, borderRadius: 12 }}
              />
            </div>
            <div className="product-content">
              <div style={{ height: 18, width: '55%', background: 'rgba(212,175,55,0.12)', borderRadius: 6, marginBottom: 10 }} />
              <div style={{ height: 14, width: '90%', background: 'rgba(255,255,255,0.06)', borderRadius: 4 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductsSection({ products: productsProp }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(productsProp === undefined);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (productsProp === undefined) {
      setLoading(true);
      return;
    }

    if (Array.isArray(productsProp)) {
      setProducts(productsProp);
      setLoading(false);
      setError('');
      return undefined;
    }

    const cached = readCache(PRODUCTS_CACHE_KEY, CACHE_TTL_MS);
    if (cached?.length) {
      setProducts(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    productApi
      .getAll()
      .then((res) => {
        const data = res.data || [];
        setProducts(data);
        writeCache(PRODUCTS_CACHE_KEY, data);
      })
      .catch((err) => {
        if (!cached?.length) setError(err.message || 'Failed to load products');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [productsProp, retryKey]);

  return (
    <section className="premium-products" id="products">
      <div className="container">
        <div className="premium-heading">
          <span>Choose Your Pack</span>
          <h2>One Oil. Two Sizes. Zero Compromise </h2>
          {/* <p>
            Crafted from carefully selected mustard seeds,
            delivering purity, aroma and authentic taste.
          </p> */}

          {loading && products.length === 0 && (
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

        {loading && products.length === 0 && !error && <ProductSkeletonGrid />}

        {products.length > 0 && (
          <div className="row g-4 align-items-stretch justify-content-center">
            {products.map((product, index) => (
              <div className="col-lg-3 col-md-6" key={product._id || product.slug}>
                <Link
                  to={`/products/${product.slug || product._id}`}
                  className="premium-card premium-card-link"
                  aria-label={`View ${product.size || product.name}`}
                >
                  <div className="premium-card-bg" />

                  <div className="premium-tag">{product.badge || product.tag}</div>

                  <div className="product-image" style={{ position: 'relative' }}>
                    <div className="product-image-inner">
                      <img
                        src={resolveImageUrl(getProductPrimaryImage(product))}
                        alt={product.size || product.name}
                        className="product-showcase-img"
                        loading={index < 2 ? 'eager' : 'lazy'}
                        decoding="async"
                        fetchPriority={index < 2 ? 'high' : 'auto'}
                      />
                    </div>
                  </div>

                  <div className="product-content">
                    <h4>{product.size || product.name || product.title}</h4>

                    {/* Price display - Classic ecom style on card (upper part) */}
                    {product.price && (
                      <div style={{ margin: '4px 0 6px', fontSize: '0.95rem' }}>
                        {(() => {
                          const orig = Number(product.originalPrice);
                          const curr = Number(product.price);
                          if (orig && orig > curr) {
                            const discount = Math.round(((orig - curr) / orig) * 100);
                            return (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                                  fontWeight: 900, 
                                  fontSize: '1.25rem',
                                  lineHeight: 1
                                }}>
                                  ₹{curr}
                                </span>
                              </div>
                            );
                          }
                          return <span style={{ color: '#d4af37', fontWeight: 800, fontSize: '1.15rem' }}>₹{curr}</span>;
                        })()}
                      </div>
                    )}

                    <p>{product.description}</p>

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