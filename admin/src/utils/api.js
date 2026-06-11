const API_URL = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'karyor_admin_token';

if (typeof window !== 'undefined') {
  console.log('%c[Karyor Admin API] Base URL configured as:', 'color:#666', API_URL || '(empty → wrong in production)');
}

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

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
  login: (body) => apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => apiFetch('/api/auth/me'),
};

export const adminApi = {
  getStats: () => apiFetch('/api/admin/stats'),
  updateDeliverySettings: (body) => apiFetch('/api/admin/settings/delivery', { method: 'PATCH', body: JSON.stringify(body) }),
  getProducts: () => apiFetch('/api/admin/products'),
  createProduct: (body) => apiFetch('/api/admin/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id, body) => apiFetch(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id) => apiFetch(`/api/admin/products/${id}`, { method: 'DELETE' }),
  getOrders: (status) => apiFetch(`/api/admin/orders${status ? `?status=${status}` : ''}`),
  updateOrder: (id, body) => apiFetch(`/api/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  getContacts: () => apiFetch('/api/admin/contacts'),
  updateContact: (id, body) => apiFetch(`/api/admin/contacts/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  getDistributors: () => apiFetch('/api/admin/distributors'),
  updateDistributor: (id, body) => apiFetch(`/api/admin/distributors/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  getUsers: () => apiFetch('/api/admin/users'),
  getUser: (id) => apiFetch(`/api/admin/users/${id}`),
  uploadImage: async (file) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/api/admin/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Image upload failed');
    }

    return data;
  },
};

export { TOKEN_KEY };