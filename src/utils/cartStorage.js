const GUEST_CART_KEY = 'karyor_cart_guest';

const userCartKey = (userId) => `karyor_cart_${userId}`;

export const loadStoredCart = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveStoredCart = (key, items) => {
  try {
    if (!items?.length) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // ignore quota / private mode errors
  }
};

export const getGuestCartKey = () => GUEST_CART_KEY;

export const getUserCartKey = (userId) => userCartKey(userId);