import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: string;
  name: string;
  brand: string;
  imageUrl: string;
  size: string;
  unitPrice: number;
  qty: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (productId: string, size: string) => void;
  setQty: (productId: string, size: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
};

const CartContext = createContext<CartState | null>(null);
const LS_KEY = "mystreet_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  function add(item: Omit<CartItem, "qty">, qty = 1) {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.productId === item.productId && x.size === item.size);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { ...item, qty }];
    });
  }

  function remove(productId: string, size: string) {
    setItems((prev) => prev.filter((x) => !(x.productId === productId && x.size === size)));
  }

  function setQty(productId: string, size: string, qty: number) {
    const q = Math.max(1, Math.floor(qty || 1));
    setItems((prev) =>
      prev.map((x) => (x.productId === productId && x.size === size ? { ...x, qty: q } : x))
    );
  }

  function clear() {
    setItems([]);
  }

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.unitPrice * it.qty, 0),
    [items]
  );
  const count = useMemo(() => items.reduce((sum, it) => sum + it.qty, 0), [items]);

  const value = useMemo<CartState>(
    () => ({ items, add, remove, setQty, clear, subtotal, count }),
    [items, subtotal, count]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
