import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [deliveryQuote, setDeliveryQuote] = useState(null);

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
    setDeliveryCharge(0);
    setDeliveryQuote(null);
  };

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