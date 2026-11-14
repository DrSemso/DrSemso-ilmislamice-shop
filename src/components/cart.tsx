"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { convert, type Currency } from "@/lib/format";

export type CartLine = {
  id: string;
  slug: string;
  title: string;
  price: number;
  cover_url: string | null;
  author?: string | null;
  quantity: number;
  maxQty: number;
};

type CartCtx = {
  lines: CartLine[];
  count: number;
  /** Subtotal in dinars (catalog currency). */
  subtotal: number;
  /** Subtotal in the given currency, converted per item the same way the order is. */
  subtotalIn: (cur: Currency) => number;
  add: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  lastAdded: CartLine | null;
  dismissAdded: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "ilm-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [lastAdded, setLastAdded] = useState<CartLine | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, loaded]);

  const add = useCallback((line: Omit<CartLine, "quantity">, qty = 1) => {
    setLines((prev) => {
      const found = prev.find((l) => l.id === line.id);
      if (found)
        return prev.map((l) =>
          l.id === line.id ? { ...l, ...line, quantity: Math.min(l.quantity + qty, line.maxQty) } : l,
        );
      return [...prev, { ...line, quantity: Math.min(qty, line.maxQty) }];
    });
    setLastAdded({ ...line, quantity: qty });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, quantity: Math.max(1, Math.min(qty, l.maxQty)) } : l)),
    );
  }, []);

  const remove = useCallback((id: string) => setLines((prev) => prev.filter((l) => l.id !== id)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartCtx>(
    () => ({
      lines,
      count: lines.reduce((s, l) => s + l.quantity, 0),
      subtotal: lines.reduce((s, l) => s + l.quantity * l.price, 0),
      subtotalIn: (cur: Currency) => Math.round(lines.reduce((s, l) => s + l.quantity * convert(l.price, cur), 0) * 100) / 100,
      add,
      setQty,
      remove,
      clear,
      lastAdded,
      dismissAdded: () => setLastAdded(null),
    }),
    [lines, add, setQty, remove, clear, lastAdded],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
