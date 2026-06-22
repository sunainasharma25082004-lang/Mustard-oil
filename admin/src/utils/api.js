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
  getReviews: (status) => apiFetch(`/api/admin/reviews${status ? `?status=${status}` : ''}`),
  moderateReview: (id, body) => apiFetch(`/api/admin/reviews/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteReview: (id) => apiFetch(`/api/admin/reviews/${id}`, { method: 'DELETE' }),
  getPaymentGateways: () => apiFetch('/api/admin/settings/payment-gateways'),
  updatePaymentGateways: (body) => apiFetch('/api/admin/settings/payment-gateways', { method: 'PUT', body: JSON.stringify(body) }),
  getShippingSettings: () => apiFetch('/api/admin/settings/shipping'),
  updateShippingSettings: (body) => apiFetch('/api/admin/settings/shipping', { method: 'PUT', body: JSON.stringify(body) }),
  testShippingConnection: (body) => apiFetch('/api/admin/settings/shipping/test', { method: 'POST', body: JSON.stringify(body) }),
  createShiprocketShipment: (orderId) =>
    apiFetch(`/api/admin/orders/${orderId}/shiprocket/create`, { method: 'POST' }),
  verifyShiprocketShipment: (orderId) =>
    apiFetch(`/api/admin/orders/${orderId}/shiprocket/verify`, { method: 'POST' }),
  resyncShiprocketShipment: (orderId) =>
    apiFetch(`/api/admin/orders/${orderId}/shiprocket/resync`, { method: 'POST' }),
  trackShiprocketShipment: (orderId) => apiFetch(`/api/admin/orders/${orderId}/shiprocket/track`),
  getShiprocketLiveStatus: (orderId) => apiFetch(`/api/admin/orders/${orderId}/shiprocket/live`),
  getYouTubeVideos: () => apiFetch('/api/admin/youtube'),
  createYouTubeVideo: (body) => apiFetch('/api/admin/youtube', { method: 'POST', body: JSON.stringify(body) }),
  updateYouTubeVideo: (id, body) => apiFetch(`/api/admin/youtube/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteYouTubeVideo: (id) => apiFetch(`/api/admin/youtube/${id}`, { method: 'DELETE' }),
  getRecipes: () => apiFetch('/api/admin/recipes'),
  createRecipe: (body) => apiFetch('/api/admin/recipes', { method: 'POST', body: JSON.stringify(body) }),
  updateRecipe: (id, body) => apiFetch(`/api/admin/recipes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteRecipe: (id) => apiFetch(`/api/admin/recipes/${id}`, { method: 'DELETE' }),
  getCertificates: () => apiFetch('/api/admin/certificates'),
  createCertificate: (body) => apiFetch('/api/admin/certificates', { method: 'POST', body: JSON.stringify(body) }),
  updateCertificate: (id, body) => apiFetch(`/api/admin/certificates/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCertificate: (id) => apiFetch(`/api/admin/certificates/${id}`, { method: 'DELETE' }),
  getTestimonials: () => apiFetch('/api/admin/testimonials'),
  createTestimonial: (body) => apiFetch('/api/admin/testimonials', { method: 'POST', body: JSON.stringify(body) }),
  updateTestimonial: (id, body) => apiFetch(`/api/admin/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTestimonial: (id) => apiFetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' }),
  getSiteImages: () => apiFetch('/api/admin/site-images'),
  updateSiteImages: (body) => apiFetch('/api/admin/site-images', { method: 'PUT', body: JSON.stringify(body) }),
  getPermissionCatalog: () => apiFetch('/api/admin/permissions'),
  getTeam: () => apiFetch('/api/admin/team'),
  createTeamMember: (body) => apiFetch('/api/admin/team', { method: 'POST', body: JSON.stringify(body) }),
  updateTeamMember: (id, body) => apiFetch(`/api/admin/team/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTeamMember: (id) => apiFetch(`/api/admin/team/${id}`, { method: 'DELETE' }),
  uploadImage: async (file, folder = 'products') => {
    const token = localStorage.getItem(TOKEN_KEY);
    const formData = new FormData();
    formData.append('image', file);
    const folderQuery = folder && folder !== 'products' ? `?folder=${encodeURIComponent(folder)}` : '';

    const response = await fetch(`${API_URL}/api/admin/upload${folderQuery}`, {
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