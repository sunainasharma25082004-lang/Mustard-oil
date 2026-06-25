import { useCallback, useEffect, useRef, useState } from 'react';
import { resolveImageUrl } from '../utils/imageUrl';
import { getProductImages } from '../utils/productImages';

const SWIPE_THRESHOLD = 48;

function ProductImageGallery({ product }) {
  const images = getProductImages(product);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const viewportRef = useRef(null);

  const goTo = useCallback(
    (index) => {
      if (!images.length) return;
      setActiveIndex((index + images.length) % images.length);
      setDragOffset(0);
    },
    [images.length]
  );

  const finishDrag = useCallback(() => {
    setDragOffset((offset) => {
      if (offset > SWIPE_THRESHOLD) {
        setActiveIndex((current) => (current - 1 + images.length) % images.length);
      } else if (offset < -SWIPE_THRESHOLD) {
        setActiveIndex((current) => (current + 1) % images.length);
      }
      return 0;
    });
    setIsDragging(false);
  }, [images.length]);

  const onPointerDown = (clientX) => {
    if (images.length <= 1) return;
    startXRef.current = clientX;
    setIsDragging(true);
  };

  const onPointerMove = (clientX) => {
    if (!isDragging || images.length <= 1) return;
    setDragOffset(clientX - startXRef.current);
  };

  useEffect(() => {
    if (!isDragging) return undefined;

    const handleMouseMove = (event) => onPointerMove(event.clientX);
    const handleMouseUp = () => finishDrag();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, finishDrag]);

  if (!images.length) return null;

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
              className="product-gallery-nav product-gallery-nav--prev product-gallery-nav--desktop"
              onClick={() => goTo(activeIndex - 1)}
              aria-label="Previous image"
            >
              <i className="bi bi-chevron-left" />
            </button>
            <button
              type="button"
              className="product-gallery-nav product-gallery-nav--next product-gallery-nav--desktop"
              onClick={() => goTo(activeIndex + 1)}
              aria-label="Next image"
            >
              <i className="bi bi-chevron-right" />
            </button>
          </>
        )}

        <div
          ref={viewportRef}
          className={`product-gallery-viewport${isDragging ? ' is-dragging' : ''}`}
          onTouchStart={(event) => onPointerDown(event.touches[0].clientX)}
          onTouchMove={(event) => {
            if (!isDragging) return;
            const delta = event.touches[0].clientX - startXRef.current;
            setDragOffset(delta);
            if (Math.abs(delta) > 10) {
              event.preventDefault();
            }
          }}
          onTouchEnd={finishDrag}
          onMouseDown={(event) => {
            event.preventDefault();
            onPointerDown(event.clientX);
          }}
        >
          <div
            className="product-gallery-track"
            style={{
              transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))`,
              transition: isDragging ? 'none' : 'transform 0.35s ease',
            }}
          >
            {images.map((image, index) => (
              <div className="product-gallery-slide" key={`${image}-${index}`}>
                <div className="product-detail-image-wrap">
                  <div className="product-image-inner product-image-inner-xl">
                    <img
                      src={resolveImageUrl(image)}
                      alt={`${product.name} - image ${index + 1}`}
                      className="product-showcase-img"
                      draggable={false}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {images.length > 1 && (
          <span className="product-gallery-counter product-gallery-counter--desktop">
            {activeIndex + 1} / {images.length}
          </span>
        )}

        {images.length > 1 && (
          <div className="product-gallery-dots">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`product-gallery-dot${index === activeIndex ? ' active' : ''}`}
                onClick={() => goTo(index)}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="product-gallery-thumbs product-gallery-thumbs--desktop" role="tablist" aria-label="Product images">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`View image ${index + 1}`}
              className={`product-gallery-thumb${index === activeIndex ? ' active' : ''}`}
              onClick={() => goTo(index)}
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