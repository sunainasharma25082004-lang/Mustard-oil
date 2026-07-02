import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

export default function AnalyticsTracker() {
  const location = useLocation();
  const isFirstView = useRef(true);

  useEffect(() => {
    const path = `${location.pathname}${location.search}${location.hash}`;

    // First page view is sent by gtag config in index.html
    if (isFirstView.current) {
      isFirstView.current = false;
      return;
    }

    trackPageView(path);
  }, [location]);

  return null;
}