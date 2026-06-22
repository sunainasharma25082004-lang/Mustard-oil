import { useEffect, useRef, useState } from 'react';

/**
 * Mounts children only when the section enters (or nears) the viewport.
 * Reduces initial JS work and defers below-the-fold API-driven sections.
 */
function DeferredSection({
  children,
  rootMargin = '200px 0px',
  minHeight = 1,
  className = '',
  anchorId = '',
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(() => {
    if (!anchorId || typeof window === 'undefined') return false;
    return window.location.hash.replace('#', '') === anchorId;
  });

  useEffect(() => {
    if (!anchorId || visible) return undefined;
    if (window.location.hash.replace('#', '') === anchorId) {
      setVisible(true);
    }
    return undefined;
  }, [anchorId, visible]);

  useEffect(() => {
    if (visible) return undefined;
    const node = ref.current;
    if (!node) return undefined;

    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return (
    <div
      ref={ref}
      id={anchorId || undefined}
      className={className}
      style={{ minHeight: visible ? undefined : minHeight }}
    >
      {visible ? children : null}
    </div>
  );
}

export default DeferredSection;