import { useCallback, useEffect, useState } from 'react';
import { contentApi } from '../utils/api';
import { resolveImageUrl } from '../utils/imageUrl';
import '../styles/main.css';
import '../styles/testimonial-slider.css';

function CustomerTestimonials({ items }) {
  const [testimonials, setTestimonials] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (items !== undefined) {
      setTestimonials(Array.isArray(items) ? items : []);
      setActiveIndex(0);
    }
  }, [items]);

  useEffect(() => {
    if (items !== undefined) return undefined;
    contentApi
      .getTestimonials()
      .then((res) => setTestimonials(res.data || []))
      .catch(() => setTestimonials([]));
    return undefined;
  }, [items]);

  const goTo = useCallback(
    (index) => {
      if (testimonials.length === 0) return;
      const next = (index + testimonials.length) % testimonials.length;
      setActiveIndex(next);
    },
    [testimonials.length]
  );

  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  useEffect(() => {
    if (testimonials.length <= 1) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  if (items === undefined) return null;
  if (testimonials.length === 0) return null;

  const current = testimonials[activeIndex];

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'star-filled' : 'star-empty'}>
        ★
      </span>
    ));

  return (
    <section className="customer-testimonials-section" id="testimonials">
      <div className="container">
        <div className="section-title">
          <span>Happy Customers</span>
          <h2>What People Say About Karyor</h2>
        </div>

        <div className="testimonial-carousel">
          {testimonials.length > 1 && (
            <button
              type="button"
              className="testimonial-carousel-nav testimonial-carousel-nav--prev"
              onClick={goPrev}
              aria-label="Previous testimonial"
            >
              <i className="bi bi-chevron-left" />
            </button>
          )}

          <div className="testimonial-carousel-track">
            <article className="testimonial-carousel-slide" key={current._id}>
              <div className="testimonial-carousel-avatar">
                {current.customerImage ? (
                  <img src={resolveImageUrl(current.customerImage)} alt={current.customerName} />
                ) : (
                  <span>{current.customerName?.charAt(0)?.toUpperCase() || 'K'}</span>
                )}
              </div>
              <div className="testimonial-carousel-stars">{renderStars(current.rating || 5)}</div>
              <p className="testimonial-carousel-quote">&ldquo;{current.review}&rdquo;</p>
              <h3 className="testimonial-carousel-name">{current.customerName}</h3>
              {current.location && <span className="testimonial-carousel-location">{current.location}</span>}
            </article>
          </div>

          {testimonials.length > 1 && (
            <button
              type="button"
              className="testimonial-carousel-nav testimonial-carousel-nav--next"
              onClick={goNext}
              aria-label="Next testimonial"
            >
              <i className="bi bi-chevron-right" />
            </button>
          )}

          {testimonials.length > 1 && (
            <div className="testimonial-carousel-dots">
              {testimonials.map((t, i) => (
                <button
                  key={t._id}
                  type="button"
                  className={i === activeIndex ? 'active' : ''}
                  onClick={() => goTo(i)}
                  aria-label={`View testimonial ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default CustomerTestimonials;