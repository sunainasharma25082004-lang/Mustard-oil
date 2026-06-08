const API_URL = import.meta.env.VITE_API_URL || '';

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

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}