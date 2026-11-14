"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Check, X } from "lucide-react";
import { useCart } from "./cart";
import { BookCover } from "./book-cover";
import { price } from "@/lib/format";

export function AddedToCart() {
  const { lastAdded, dismissAdded, count, subtotal } = useCart();

  useEffect(() => {
    if (!lastAdded) return;
    const t = setTimeout(dismissAdded, 6000);
    return () => clearTimeout(t);
  }, [lastAdded, dismissAdded]);

  if (!lastAdded) return null;
  return (
    <div role="status" className="fixed right-4 top-4 z-[60] w-[min(380px,calc(100%-32px))] border border-line bg-paper p-5 shadow-2xl">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-[14px] font-semibold text-success">
          <Check size={16} /> Dodano u korpu
        </p>
        <button onClick={dismissAdded} aria-label="Zatvori" className="p-1 text-muted hover:text-ink"><X size={16} /></button>
      </div>
      <div className="mt-4 flex gap-4">
        <div className="w-16 shrink-0"><BookCover product={{ title: lastAdded.title, cover_url: lastAdded.cover_url, is_set: false, author: lastAdded.author ? { name: lastAdded.author } : null }} sizes="64px" /></div>
        <div className="min-w-0">
          <p className="font-semibold leading-snug">{lastAdded.title}</p>
          <p className="text-[13px] text-muted">{lastAdded.quantity} × {price(lastAdded.price)}</p>
          <p className="mt-2 text-[13px]">U korpi: {count} kom. · {price(subtotal)}</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Link href="/korpa" onClick={dismissAdded} className="btn btn-dark px-3">Pregledaj korpu</Link>
        <button onClick={dismissAdded} className="btn btn-outline px-3">Nastavi kupovinu</button>
      </div>
    </div>
  );
}
