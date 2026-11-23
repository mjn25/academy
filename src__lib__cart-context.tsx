"use client";

import React from "react";

/* سبد خرید مشترک دوره‌ها و کتاب‌ها — با ذخیره در localStorage */
export type CartItem = {
  type: "course" | "book";
  id: string;
  title: string;
  price: number;
  image: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  total: number;
};

const CartContext = React.createContext<CartContextValue | null>(null);

const STORAGE_KEY = "edc-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {}
  }, []);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const add = React.useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    const n = Math.max(1, Math.min(10, qty));
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id && p.type === item.type);
      if (existing) {
        return prev.map((p) => (p === existing ? { ...p, qty: Math.min(10, p.qty + n) } : p));
      }
      return [...prev, { ...item, qty: n }];
    });
  }, []);

  const remove = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  /* تغییر تعداد یک آیتم — حداقل ۱ و حداکثر ۱۰ (استپر سبد خرید) */
  const setQty = React.useCallback((id: string, qty: number) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: Math.max(1, Math.min(10, qty)) } : p)));
  }, []);

  const clear = React.useCallback(() => setItems([]), []);

  const count = items.reduce((a, p) => a + p.qty, 0);
  const total = items.reduce((a, p) => a + p.qty * p.price, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, setQty, clear, count, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
