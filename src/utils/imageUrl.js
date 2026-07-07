const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

/** Admin panel uploads use timestamp filenames — only on API server */
const isApiOnlyUpload = (path) =>
  /^\/uploads\/products\/\d{13}-/i.test(path) || /^\/uploads\/site\//i.test(path);

export function resolveImageUrl(image) {
  if (!image) return '';

  const trimmed = String(image).trim();
  if (!trimmed) return '';

  if (/^https?:\/\//i.test(trimmed) || /^data:image\//i.test(trimmed) || /^blob:/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith('/uploads/products/') && !isApiOnlyUpload(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('/uploads/') && API_URL) {
    return `${API_URL}${trimmed}`;
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}