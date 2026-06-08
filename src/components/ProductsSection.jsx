import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/main.css';
import { productApi } from '../utils/api';
import { resolveImageUrl } from '../utils/imageUrl';

const FALLBACK_PRODUCTS = [
  { slug: '500ml-mustard-oil', size: '500 ML', description: 'Pure Kachi Ghani Mustard Oil', image: '/product-500ml.jpg', badge: 'Best Seller' },
  { slug: '1-litre-mustard-oil', size: '1 Litre', description: 'Rich Aroma & Natural Purity', image: '/product-1l.jpg', badge: 'Popular' },
  { slug: '2-litre-mustard-oil', size: '2 Litre', description: 'Traditional Cold Pressed Process', image: '/product-2l.jpg', badge: 'Family Pack' },
  { slug: '5-litre-mustard-oil', size: '5 Litre', description: 'Premium Economy Pack', image: '/product-5l.jpg', badge: 'Premium' },
];

function ProductsSection() {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);

  useEffect(() => {
    productApi
      .getAll()
      .then((res) => {
        if (res.data?.length) setProducts(res.data);
      })
      .catch(() => {});
  }, []);

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
        </div>

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
      </div>
    </section>
  );
}

export default ProductsSection;