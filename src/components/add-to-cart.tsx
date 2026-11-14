"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "./cart";
import type { Product } from "@/lib/types";

type Props = {
  product: Pick<Product, "id" | "slug" | "title" | "price" | "cover_url" | "stock"> & { author?: { name: string } | null };
  variant?: "card" | "page";
};

export function AddToCart({ product, variant = "card" }: Props) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const soldOut = product.stock <= 0;
  const line = {
    id: product.id,
    slug: product.slug,
    title: product.title,
    price: product.price,
    cover_url: product.cover_url,
    author: product.author?.name ?? null,
    maxQty: Math.max(product.stock, 1),
  };

  if (variant === "card") {
    return (
      <button
        type="button"
        disabled={soldOut}
        onClick={() => add(line, 1)}
        className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink underline decoration-line underline-offset-4 hover:decoration-accent disabled:no-underline disabled:opacity-50"
      >
        {soldOut ? "Rasprodato" : "Dodaj u korpu"}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-stretch gap-3">
      <div className="flex items-center rounded-[3px] border border-line bg-white">
        <button type="button" aria-label="Smanji količinu" className="px-3 py-3 text-muted hover:text-ink" onClick={() => setQty((q) => Math.max(1, q - 1))}>
          <Minus size={15} />
        </button>
        <input
          aria-label="Količina"
          inputMode="numeric"
          className="w-10 bg-transparent text-center tabular-nums focus:outline-none"
          value={qty}
          onChange={(e) => setQty(Math.max(1, Math.min(Number(e.target.value.replace(/\D/g, "")) || 1, product.stock || 1)))}
        />
        <button type="button" aria-label="Povećaj količinu" className="px-3 py-3 text-muted hover:text-ink" onClick={() => setQty((q) => Math.min(product.stock || 1, q + 1))}>
          <Plus size={15} />
        </button>
      </div>
      <button type="button" disabled={soldOut} onClick={() => add(line, qty)} className="btn btn-dark min-w-[200px] flex-1 sm:flex-none">
        <ShoppingBag size={16} /> {soldOut ? "Rasprodato" : "Dodaj u korpu"}
      </button>
    </div>
  );
}
