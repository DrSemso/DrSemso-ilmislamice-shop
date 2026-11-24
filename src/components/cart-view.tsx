"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "./cart";
import { BookCover } from "./book-cover";
import { convert, shippingFor, shippingLabel } from "@/lib/format";
import { ByCur, Dual, Price } from "./price";
import { FreeShippingBar } from "./free-shipping-bar";

export function CartView() {
  const { lines, subtotalIn, setQty, remove } = useCart();
  const sub = { RSD: subtotalIn("RSD"), EUR: subtotalIn("EUR") };
  const ship = { RSD: shippingFor(sub.RSD, "RSD"), EUR: shippingFor(sub.EUR, "EUR") };

  if (!lines.length) {
    return (
      <div className="mt-8 rounded-xl bg-surface p-12 text-center">
        <p className="font-serif text-[24px] font-semibold">Vaša korpa je prazna.</p>
        <p className="mt-2 text-muted">Dodajte knjige iz ponude i ovdje ćete ih vidjeti.</p>
        <Link href="/knjige" className="btn btn-dark mt-6">Pogledajte knjige</Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
      <div className="min-w-0">
        <div className="hidden grid-cols-[1fr_140px_110px_40px] gap-4 border-b border-ink pb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted sm:grid">
          <span>Knjiga</span><span>Količina</span><span className="text-right">Ukupno</span><span />
        </div>
        <ul className="divide-y divide-line">
          {lines.map((l) => (
            <li key={l.id} className="grid grid-cols-[72px_1fr] gap-4 py-5 sm:grid-cols-[1fr_140px_110px_40px] sm:items-center">
              <div className="flex gap-4 sm:items-center">
                <Link href={`/proizvod/${l.slug}`} className="w-[72px] shrink-0">
                  <BookCover product={{ title: l.title, cover_url: l.cover_url, is_set: false, author: l.author ? { name: l.author } : null }} sizes="72px" />
                </Link>
                <div className="hidden min-w-0 sm:block">
                  <Link href={`/proizvod/${l.slug}`} className="font-semibold hover:text-accent">{l.title}</Link>
                  {l.author && <p className="text-[13px] text-muted">{l.author}</p>}
                  <p className="text-[13px] text-muted tabular-nums"><Price value={l.price} /></p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:contents">
                <div className="sm:hidden">
                  <Link href={`/proizvod/${l.slug}`} className="font-semibold">{l.title}</Link>
                  <p className="text-[13px] text-muted tabular-nums"><Price value={l.price} /></p>
                </div>
                <div className="flex w-fit items-center rounded-[3px] border border-line bg-card">
                  <button aria-label="Smanji" className="px-2.5 py-2 text-muted hover:text-ink" onClick={() => setQty(l.id, l.quantity - 1)}><Minus size={14} /></button>
                  <span className="w-8 text-center tabular-nums">{l.quantity}</span>
                  <button aria-label="Povećaj" className="px-2.5 py-2 text-muted hover:text-ink disabled:opacity-30" disabled={l.quantity >= l.maxQty} onClick={() => setQty(l.id, l.quantity + 1)}><Plus size={14} /></button>
                </div>
                <span className="font-semibold tabular-nums sm:text-right"><Dual rsd={l.price * l.quantity} eur={convert(l.price, "EUR") * l.quantity} /></span>
                <button aria-label={`Ukloni ${l.title}`} onClick={() => remove(l.id)} className="w-fit text-muted hover:text-danger sm:justify-self-end">
                  <Trash2 size={17} />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/knjige" className="mt-6 inline-block text-[14px] link">← Nastavite kupovinu</Link>
      </div>

      <aside className="h-fit space-y-4 bg-surface p-6 lg:sticky lg:top-36">
        <h2 className="font-serif text-[22px] font-bold">Pregled narudžbe</h2>
        <div className="empty:hidden"><ByCur rsd={<FreeShippingBar subtotal={sub.RSD} cur="RSD" />} eur={<FreeShippingBar subtotal={sub.EUR} cur="EUR" />} /></div>
        <dl className="space-y-2 text-[15px]">
          <div className="flex justify-between"><dt>Knjige</dt><dd className="tabular-nums"><Dual rsd={sub.RSD} eur={sub.EUR} /></dd></div>
          <div className="flex justify-between"><dt>Dostava</dt><dd className="tabular-nums"><ByCur rsd={shippingLabel(ship.RSD, "RSD")} eur={shippingLabel(ship.EUR, "EUR")} /></dd></div>
          <div className="flex justify-between border-t border-line pt-3 text-[18px] font-bold"><dt>Ukupno</dt><dd className="text-right tabular-nums"><Dual rsd={sub.RSD + (ship.RSD ?? 0)} eur={sub.EUR + (ship.EUR ?? 0)} /><ByCur rsd={ship.RSD == null ? <span className="block text-[12px] font-normal text-muted">+ dostava</span> : null} eur={ship.EUR == null ? <span className="block text-[12px] font-normal text-muted">+ dostava</span> : null} /></dd></div>
        </dl>
        <p className="text-[13px] text-muted">Plaćanje pouzećem: iznos plaćate kuriru kad paket stigne.</p>
        <Link href="/narudzba" className="btn btn-dark w-full py-3.5 text-[15px]">Nastavi na narudžbu</Link>
      </aside>
    </div>
  );
}
