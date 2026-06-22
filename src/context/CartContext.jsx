import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import { productApi } from '../utils/api';
import {
  getGuestCartKey,
  getUserCartKey,
  loadStoredCart,
  mergeCartItems,
  saveStoredCart,
} from '../utils/cartStorage';

const CartContext = createContext(null);

const resolveUserId = (user) => user?.id || user?._id || null;

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState(() => loadStoredCart(getGuestCartKey()));
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [deliveryQuote, setDeliveryQuote] = useState(null);
  const lastUserIdRef = useRef(null);
  const skipGuestPersistRef = useRef(false);
  const isRestoringCartRef = useRef(false);

  const resetDelivery = useCallback(() => {
    setDeliveryCharge(0);
    setDeliveryQuote(null);
  }, []);

  useEffect(() => {
    const currentUserId = resolveUserId(user);
    const previousUserId = lastUserIdRef.current;
    lastUserIdRef.current = currentUserId;

    if (currentUserId) {
      skipGuestPersistRef.current = false;
      isRestoringCartRef.current = true;
      const guestItems = loadStoredCart(getGuestCartKey());
      const saved = loadStoredCart(getUserCartKey(currentUserId));
      const merged = mergeCartItems(saved, guestItems);
      setItems(merged);
      if (guestItems.length) {
        saveStoredCart(getGuestCartKey(), []);
      }
      resetDelivery();
      return;
    }

    if (previousUserId) {
      skipGuestPersistRef.current = true;
      setItems([]);
      resetDelivery();
    }
  }, [user?.id, user?._id, resetDelivery]);

  useEffect(() => {
    if (skipGuestPersistRef.current) {
      skipGuestPersistRef.current = false;
      return;
    }

    if (isRestoringCartRef.current) {
      isRestoringCartRef.current = false;
      return;
    }

    const userId = resolveUserId(user);
    const key = userId ? getUserCartKey(userId) : getGuestCartKey();
    saveStoredCart(key, items);
  }, [items, user?.id, user?._id]);

  const addToCart = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);

      if (existing) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((item) => item._id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    resetDelivery();
    const userId = resolveUserId(user);
    const key = userId ? getUserCartKey(userId) : getGuestCartKey();
    saveStoredCart(key, []);
  };

  const refreshItemPrices = useCallback(async () => {
    if (!items.length) return items;

    const res = await productApi.getAll();
    const products = Array.isArray(res.data) ? res.data : [];
    const byId = new Map(products.map((product) => [product._id, product]));

    let nextItems = [];
    setItems((prev) => {
      nextItems = prev
        .map((item) => {
          const product = byId.get(item._id);
          if (!product || !product.isActive || !product.inStock) return null;
          return {
            ...item,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            inStock: product.inStock,
          };
        })
        .filter(Boolean);
      return nextItems;
    });

    return nextItems;
  }, [items.length]);

  const applyDeliveryQuote = useCallback((quote) => {
    if (!quote) {
      setDeliveryCharge(0);
      setDeliveryQuote(null);
      return;
    }

    setDeliveryQuote(quote);
    setDeliveryCharge(quote.serviceable ? Number(quote.deliveryCharge) || 0 : 0);
  }, []);

  const clearDeliveryQuote = useCallback(() => {
    setDeliveryCharge(0);
    setDeliveryQuote(null);
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const total = subtotal + (items.length > 0 ? deliveryCharge : 0);

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshItemPrices,
    subtotal,
    deliveryCharge,
    deliveryQuote,
    applyDeliveryQuote,
    clearDeliveryQuote,
    total,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}