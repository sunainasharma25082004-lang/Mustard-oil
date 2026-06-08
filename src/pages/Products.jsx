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

  useEffect(() => {
    productApi
      .getAll()
      .then((res) => setProducts(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
            <p style={{ textAlign: 'center', color: '#ff6b6b' }}>{error}</p>
          )}

          <div className="row g-4 justify-content-center">

            {products.map((item) => (
              <div className="col-lg-5 col-md-6" key={item._id}>
                <div className="premium-product-card">

                  <div className="product-badge">
                    {item.badge}
                  </div>

                  <div className="product-image-box">
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
                    <p>{item.description}</p>
                    <p style={{ color: '#d4af37', fontWeight: 700, fontSize: '1.2rem' }}>
                      ₹{item.price}
                    </p>

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

        </div>
      </section>
    </>
  );
}

export default Products;