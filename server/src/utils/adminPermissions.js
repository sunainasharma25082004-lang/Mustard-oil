const ADMIN_PERMISSIONS = [
  { key: 'dashboard', label: 'Dashboard', department: 'General' },
  { key: 'products', label: 'Products', department: 'Sales' },
  { key: 'orders', label: 'Orders & Billing', department: 'Billing' },
  { key: 'reviews', label: 'Reviews', department: 'Support' },
  { key: 'testimonials', label: 'Testimonials', department: 'Marketing' },
  { key: 'recipes', label: 'Recipes', department: 'Marketing' },
  { key: 'certificates', label: 'Certificates', department: 'Marketing' },
  { key: 'youtube', label: 'YouTube', department: 'Marketing' },
  { key: 'site-images', label: 'Site Images', department: 'Marketing' },
  { key: 'shipping', label: 'Shipping Settings', department: 'Operations' },
  { key: 'contacts', label: 'Messages', department: 'Support' },
  { key: 'distributors', label: 'Distributors', department: 'Sales' },
  { key: 'users', label: 'Customers', department: 'Support' },
];

const PERMISSION_KEYS = ADMIN_PERMISSIONS.map((item) => item.key);

const DEPARTMENT_PRESETS = {
  billing: ['dashboard', 'orders'],
  marketing: ['dashboard', 'recipes', 'certificates', 'youtube', 'testimonials', 'site-images'],
  sales: ['dashboard', 'products', 'distributors', 'contacts'],
  support: ['dashboard', 'contacts', 'reviews', 'users'],
  operations: ['dashboard', 'orders', 'shipping', 'products'],
};

const getEffectivePermissions = (user) => {
  if (!user || user.role !== 'admin') return [];
  if (user.isSuperAdmin) return [...PERMISSION_KEYS];
  if (!user.adminPermissions?.length) return [...PERMISSION_KEYS];
  return user.adminPermissions.filter((key) => PERMISSION_KEYS.includes(key));
};

const userHasPermission = (user, permission) =>
  getEffectivePermissions(user).includes(permission);

const userHasAnyPermission = (user, permissions = []) =>
  permissions.some((permission) => userHasPermission(user, permission));

const sanitizePermissions = (permissions = []) => {
  if (!Array.isArray(permissions)) return [];
  return [...new Set(permissions.filter((key) => PERMISSION_KEYS.includes(key)))];
};

module.exports = {
  ADMIN_PERMISSIONS,
  PERMISSION_KEYS,
  DEPARTMENT_PRESETS,
  getEffectivePermissions,
  userHasPermission,
  userHasAnyPermission,
  sanitizePermissions,
};