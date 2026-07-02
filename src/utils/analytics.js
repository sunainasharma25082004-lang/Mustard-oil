const GA_MEASUREMENT_ID = 'G-CZ7HQG57CM';

export function isAnalyticsEnabled() {
  return Boolean(GA_MEASUREMENT_ID);
}

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

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title,
  });
}