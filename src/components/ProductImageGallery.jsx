import { useState } from 'react';
import { resolveImageUrl } from '../utils/imageUrl';
import { getProductImages } from '../utils/productImages';

function ProductImageGallery({ product }) {
  const images = getProductImages(product);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) return null;

  const activeImage = images[activeIndex] || images[0];

  const goTo = (index) => {
    setActiveIndex((index + images.length) % images.length);
  };

  return (
    <div className="product-detail-gallery">
      <div className="product-gallery-main">
        {product.badge && (
          <span className="product-detail-badge">{product.badge}</span>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="product-gallery-nav product-gallery-nav--prev"
              onClick={() => goTo(activeIndex - 1)}
              aria-label="Previous image"
            >
              <i className="bi bi-chevron-left" />
            </button>
            <button
              type="button"
              className="product-gallery-nav product-gallery-nav--next"
              onClick={() => goTo(activeIndex + 1)}
              aria-label="Next image"
            >
              <i className="bi bi-chevron-right" />
            </button>
          </>
        )}

        <div className="product-detail-image-wrap">
          <div className="product-image-inner product-image-inner-xl">
            <img
              key={activeImage}
              src={resolveImageUrl(activeImage)}
              alt={`${product.name} - image ${activeIndex + 1}`}
              className="product-showcase-img"
            />
          </div>
        </div>

        {images.length > 1 && (
          <span className="product-gallery-counter">
            {activeIndex + 1} / {images.length}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="product-gallery-thumbs" role="tablist" aria-label="Product images">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`View image ${index + 1}`}
              className={`product-gallery-thumb${index === activeIndex ? ' active' : ''}`}
              onClick={() => setActiveIndex(index)}
            >
              <img src={resolveImageUrl(image)} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductImageGallery;