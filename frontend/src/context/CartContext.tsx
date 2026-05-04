/**
 * Cart Context
 * 
 * IMPORTANT: Cart is managed ENTIRELY on the frontend.
 * There is NO backend Cart Service involved in this implementation.
 * 
 * This is a deliberate design decision for this demo:
 * - Cart state lives in React context (memory)
 * - Cart resets on page refresh
 * - No persistence to backend
 * 
 * In a production system, you might want:
 * - Backend cart service for persistence
 * - Sync cart across devices
 * - Handle concurrent modifications
 * 
 * Cart Flow:
 * 1. User browses products (from Product Service)
 * 2. User adds products to cart (frontend only)
 * 3. User adjusts quantities (frontend only)
 * 4. User proceeds to checkout → cart items sent to Order Service
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Product, CartItem } from '../types';

interface CartContextType {
  // Current cart items
  items: CartItem[];
  // Total number of items in cart
  itemCount: number;
  // Total price of all items
  totalPrice: number;
  // Add product to cart (or increase quantity if already in cart)
  addToCart: (product: Product) => void;
  // Remove product from cart entirely
  removeFromCart: (productId: string) => void;
  // Update quantity for a specific product
  updateQuantity: (productId: string, quantity: number) => void;
  // Clear all items from cart
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  /**
   * Cart state - persisted to localStorage
   */
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('foodflow_cart');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist cart to localStorage on change
  React.useEffect(() => {
    localStorage.setItem('foodflow_cart', JSON.stringify(items));
  }, [items]);

  /**
   * Add product to cart
   * If product already exists, increment quantity by 1
   * Otherwise, add new item with quantity 1
   */
  const addToCart = useCallback((product: Product) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        // Product already in cart - increase quantity
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // New product - add to cart with quantity 1
      return [...currentItems, { product, quantity: 1 }];
    });
  }, []);

  /**
   * Remove product from cart entirely
   */
  const removeFromCart = useCallback((productId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId)
    );
  }, []);

  /**
   * Update quantity for a specific product
   * If quantity is 0 or less, remove the product
   */
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((currentItems) =>
        currentItems.filter((item) => item.product.id !== productId)
      );
    } else {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  }, []);

  /**
   * Clear entire cart
   * Called after successful order creation
   */
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Calculate derived values
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const value: CartContextType = {
    items,
    itemCount,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Hook to access cart context
 * Throws error if used outside CartProvider
 */
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

