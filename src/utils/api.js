const API_URL = import.meta.env.VITE_API_URL || '';

if (import.meta.env.DEV && typeof window !== 'undefined') {
  console.log('%c[Karyor API] Base URL:', 'color:#666', API_URL || '(relative → Vite proxy)');
}

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('karyor_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: options.cache ?? 'default',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const authApi = {
  register: (body) => apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  googleLogin: (credential) =>
    apiFetch('/api/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),
  getGoogleConfig: () => apiFetch('/api/auth/google/config'),
  getMe: () => apiFetch('/api/auth/me'),
  updateProfile: (body) => apiFetch('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  changePassword: (body) => apiFetch('/api/auth/password', { method: 'PATCH', body: JSON.stringify(body) }),
};

export const productApi = {
  getAll: () => apiFetch('/api/products'),
  getById: (id) => apiFetch(`/api/products/${id}`),
};

export const orderApi = {
  create: (body) => apiFetch('/api/orders', { method: 'POST', body: JSON.stringify(body) }),
  track: (orderNumber) => apiFetch(`/api/orders/track/${orderNumber}`),
  getMyOrders: () => apiFetch('/api/orders/my-orders'),
  cancel: (id, reason) => apiFetch(`/api/orders/${id}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
};

export const settingsApi = {
  getDelivery: () => apiFetch('/api/settings/delivery'),
  getGeneral: () => apiFetch('/api/settings/general'),
};

export const shippingApi = {
  getConfig: () => apiFetch('/api/shipping/config'),
  checkServiceability: (pincode, quantity) =>
    apiFetch(`/api/shipping/serviceability?pincode=${encodeURIComponent(pincode)}&quantity=${quantity || 1}`),
};

export const locationApi = {
  byPincode: (pincode) => apiFetch(`/api/location/pincode/${encodeURIComponent(pincode)}`),
  byCity: (city) => apiFetch(`/api/location/city/${encodeURIComponent(city)}`),
  reverseGeocode: (lat, lng) =>
    apiFetch(
      `/api/location/reverse?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`
    ),
};

export const paymentApi = {
  createRazorpayOrder: (body) =>
    apiFetch('/api/payments/razorpay/create', { method: 'POST', body: JSON.stringify(body) }),
  verifyRazorpayPayment: (body) =>
    apiFetch('/api/payments/razorpay/verify', { method: 'POST', body: JSON.stringify(body) }),
};

export const contactApi = {
  send: (body) => apiFetch('/api/contact', { method: 'POST', body: JSON.stringify(body) }),
};

export const distributorApi = {
  apply: (body) => apiFetch('/api/distributor', { method: 'POST', body: JSON.stringify(body) }),
  getStatus: (phone) => apiFetch(`/api/distributor/status/${encodeURIComponent(phone)}`),
};

export const reviewApi = {
  getAll: () => apiFetch('/api/reviews'),
  create: (body) => apiFetch('/api/reviews', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => apiFetch(`/api/reviews/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => apiFetch(`/api/reviews/${id}`, { method: 'DELETE' }),
};

export const contentApi = {
  getHomeBundle: () => apiFetch('/api/content/home'),
  getYouTubeVideos: () => apiFetch('/api/content/youtube'),
  getRecipes: () => apiFetch('/api/content/recipes'),
  getRecipe: (slug) => apiFetch(`/api/content/recipes/${slug}`),
  getCertificates: () => apiFetch('/api/content/certificates'),

  getSiteImages: () => apiFetch('/api/content/site-images'),
};

export const paymentConfigApi = {
  getConfig: () => apiFetch('/api/payments/config'),
};