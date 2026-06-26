const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() || '';

let initialized = false;

export function isAnalyticsEnabled() {
  return Boolean(GA_MEASUREMENT_ID);
}

export function initAnalytics() {
  if (!GA_MEASUREMENT_ID || initialized || typeof window === 'undefined') {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  initialized = true;
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