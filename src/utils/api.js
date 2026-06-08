const API_URL = import.meta.env.VITE_API_URL || '';

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