export const ADMIN_NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊', permission: 'dashboard' },
  { path: '/products', label: 'Products', icon: '🛢️', permission: 'products' },
  { path: '/orders', label: 'Orders', icon: '📦', permission: 'orders' },
  { path: '/reviews', label: 'Reviews', icon: '⭐', permission: 'reviews' },
  { path: '/testimonials', label: 'Testimonials', icon: '💬', permission: 'testimonials' },
  { path: '/recipes', label: 'Recipes', icon: '🍳', permission: 'recipes' },
  { path: '/certificates', label: 'Certificates', icon: '🏅', permission: 'certificates' },
  { path: '/youtube', label: 'YouTube', icon: '🎬', permission: 'youtube' },
  { path: '/site-images', label: 'Site Images', icon: '🖼️', permission: 'site-images' },
  { path: '/payment-gateways', label: 'Payment Gateway Settings', icon: '💳', superAdminOnly: true },
  { path: '/shipping', label: 'Shipping Settings', icon: '🚚', permission: 'shipping' },
  { path: '/contacts', label: 'Messages', icon: '✉️', permission: 'contacts' },
  { path: '/distributors', label: 'Distributors', icon: '🤝', permission: 'distributors' },
  { path: '/users', label: 'Users', icon: '👤', permission: 'users' },
  { path: '/team', label: 'Team & Access', icon: '🔐', superAdminOnly: true },
];

export const ROUTE_PERMISSIONS = {
  '/dashboard': 'dashboard',
  '/products': 'products',
  '/orders': 'orders',
  '/reviews': 'reviews',
  '/testimonials': 'testimonials',
  '/recipes': 'recipes',
  '/certificates': 'certificates',
  '/youtube': 'youtube',
  '/site-images': 'site-images',
  '/shipping': 'shipping',
  '/contacts': 'contacts',
  '/distributors': 'distributors',
  '/users': 'users',
};

export function getUserPermissions(user) {
  if (!user || user.role !== 'admin') return [];
  if (user.permissions?.length) return user.permissions;
  if (user.isSuperAdmin) return ADMIN_NAV_ITEMS.filter((item) => item.permission).map((item) => item.permission);
  if (!user.adminPermissions?.length) {
    return ADMIN_NAV_ITEMS.filter((item) => item.permission).map((item) => item.permission);
  }
  return user.adminPermissions;
}

export function hasPermission(user, permission) {
  if (!permission) return true;
  if (user?.isSuperAdmin) return true;
  return getUserPermissions(user).includes(permission);
}

export function getVisibleNavItems(user) {
  return ADMIN_NAV_ITEMS.filter((item) => {
    if (item.superAdminOnly) return user?.isSuperAdmin;
    return hasPermission(user, item.permission);
  });
}

export function getDefaultAdminPath(user) {
  const visible = getVisibleNavItems(user);
  return visible[0]?.path || '/dashboard';
}

export const DEPARTMENT_PRESET_LABELS = {
  billing: 'Billing',
  marketing: 'Marketing',
  sales: 'Sales',
  support: 'Support',
  operations: 'Operations',
};