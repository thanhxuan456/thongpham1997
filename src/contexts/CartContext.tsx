import React, { createContext, useContext, useState, ReactNode } from "react";
import { Theme, CartItem } from "@/types/theme";
import { trackAddToCart } from "@/components/AnalyticsProvider";

interface CartContextType {
  items: CartItem[];
  addToCart: (theme: Theme) => void;
  removeFromCart: (themeId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  isInCart: (themeId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (theme: Theme) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.theme.id === theme.id);
      if (existingItem) {
        return prev; // Already in cart
      }
      
      // Track add to cart event
      trackAddToCart(theme.id, theme.name, theme.price);
      
      return [...prev, { theme, quantity: 1 }];
    });
  };

  const removeFromCart = (themeId: string) => {
    setItems((prev) => prev.filter((item) => item.theme.id !== themeId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.theme.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return items.length;
  };

  const isInCart = (themeId: string) => {
    return items.some((item) => item.theme.id === themeId);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        getTotalPrice,
        getTotalItems,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
