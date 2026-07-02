const DEFAULT_GA_MEASUREMENT_ID = 'G-CZ7HQG57CM';
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() || DEFAULT_GA_MEASUREMENT_ID;

export function isAnalyticsEnabled() {
  return Boolean(GA_MEASUREMENT_ID);
}

/** Ensures gtag stub exists before the async gtag.js script finishes loading. */
export function initAnalytics() {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }
}

export function trackPageView(path, title = document.title) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });
}