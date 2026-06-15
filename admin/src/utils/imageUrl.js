const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const STORE_URL = (import.meta.env.VITE_STORE_URL || 'http://localhost:5173').replace(/\/$/, '');

export function resolveImageUrl(image) {
  if (!image) return '';

  const trimmed = String(image).trim();
  if (!trimmed) return '';

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith('/uploads/')) {
    return API_URL ? `${API_URL}${trimmed}` : trimmed;
  }

  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${STORE_URL}${path}`;
}