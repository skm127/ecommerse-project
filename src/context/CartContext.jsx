import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('shophub_cart'));
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('shophub_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Fetch initial cart if user logs in and local cart is empty
  useEffect(() => {
    const fetchUserCart = async () => {
      if (user?.id && cart.length === 0) {
        try {
          const res = await fetch(`https://dummyjson.com/carts/user/${user.id}`);
          const data = await res.json();
          if (data.carts && data.carts.length > 0) {
            // Take the first cart and map its products
            const cartProducts = data.carts[0].products.map(p => ({
              id: p.id,
              title: p.title,
              price: p.price,
              quantity: p.quantity,
              thumbnail: p.thumbnail,
              category: 'Mixed' // dummyjson cart endpoint doesn't return category, we provide fallback
            }));
            setCart(cartProducts);
          }
        } catch (error) {
          console.error("Failed to fetch user cart:", error);
        }
      }
    };
    fetchUserCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Persist cart whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('shophub_cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cart]);

  // Persist coupon whenever it changes
  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem('shophub_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('shophub_coupon');
      }
    } catch (error) {
      console.error('Failed to save coupon to localStorage:', error);
    }
  }, [appliedCoupon]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, 99) }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: Math.max(0, Math.min(item.quantity + delta, 99)),
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Calculate Subtotal
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Auto-remove PREMIUM500 if subtotal drops below 2000
  useEffect(() => {
    if (appliedCoupon?.code === 'PREMIUM500' && subtotal < 2000) {
      setAppliedCoupon(null);
    }
  }, [subtotal, appliedCoupon]);

  // Calculate Discount Amount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.code === 'SKM10') {
      discountAmount = subtotal * 0.10; // 10% off
    } else if (appliedCoupon.code === 'PREMIUM500') {
      discountAmount = 500; // Flat 500 off
    }
  }

  // Ensure discount doesn't exceed subtotal
  discountAmount = Math.min(discountAmount, subtotal);

  const applyCoupon = (code) => {
    const uppercaseCode = code.toUpperCase();
    if (uppercaseCode === 'SKM10') {
      setAppliedCoupon({ code: uppercaseCode, message: '10% Discount Applied' });
      return { success: true, message: 'Coupon applied successfully!' };
    } else if (uppercaseCode === 'PREMIUM500') {
      if (subtotal >= 2000) {
        setAppliedCoupon({ code: uppercaseCode, message: '₹500 Discount Applied' });
        return { success: true, message: 'Premium discount applied!' };
      } else {
        return { success: false, message: 'Subtotal must be over ₹2000 for this coupon.' };
      }
    }
    return { success: false, message: 'Invalid coupon code.' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems: cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        discountAmount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        getCartTotal: () => subtotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
