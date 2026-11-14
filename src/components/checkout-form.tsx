"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useCart } from "./cart";
import { BookCover } from "./book-cover";
import { price, shippingFor } from "@/lib/format";
import { shop } from "@/shop.config";
import { placeOrder, type OrderInput } from "@/app/(shop)/narudzba/actions";

type Defaults = Pick<OrderInput, "email" | "full_name" | "phone" | "address" | "city" | "postal_code" | "country">;

export function CheckoutForm({ defaults, loggedIn }: { defaults: Defaults; loggedIn: boolean }) {
  const { lines, subtotal, clear, setQty, remove } = useCart();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Partial<Record<keyof OrderInput, string>>>({});
  const shipping = shippingFor(subtotal);

  if (!lines.length) {
    return (
      <div className="mt-8 rounded-xl bg-surface p-12 text-center">
        <p className="font-serif text-[24px] font-semibold">Korpa je prazna.</p>
        <Link href="/knjige" className="btn btn-dark mt-6">Pogledajte knjige</Link>
      </div>
    );
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const input: OrderInput = {
      email: String(f.get("email") ?? ""),
      full_name: String(f.get("full_name") ?? ""),
      phone: String(f.get("phone") ?? ""),
      address: String(f.get("address") ?? ""),
      city: String(f.get("city") ?? ""),
      postal_code: String(f.get("postal_code") ?? ""),
      country: String(f.get("country") ?? ""),
      note: String(f.get("note") ?? ""),
      save: f.get("save") === "on",
      lines: lines.map((l) => ({ id: l.id, quantity: l.quantity })),
    };
    setError(null);
    start(async () => {
      const res = await placeOrder(input);
      if (res.ok) {
        clear();
        router.push(`/narudzba/hvala?broj=${res.number}`);
        return;
      }
      setError(res.error);
      setFields(res.fields ?? {});
      if (res.stock) {
        Object.entries(res.stock).forEach(([id, left]) => (left > 0 ? setQty(id, left) : remove(id)));
      }
    });
  }

  const field = (name: keyof Defaults, label: string, { className: wrap, ...props }: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className={wrap}>
      <label htmlFor={`co-${name}`} className="label">{label}</label>
      <input
        id={`co-${name}`}
        name={name}
        defaultValue={defaults[name]}
        aria-invalid={Boolean(fields[name])}
        aria-describedby={fields[name] ? `co-${name}-err` : undefined}
        className={`input ${fields[name] ? "border-danger" : ""}`}
        {...props}
      />
      {fields[name] && <p id={`co-${name}-err`} className="mt-1 text-[13px] text-danger">{fields[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
      <div className="min-w-0 space-y-10">
        <fieldset className="space-y-4">
          <legend className="mb-2 font-serif text-[22px] font-bold">Kontakt</legend>
          {field("email", "E-mail", { type: "email", autoComplete: "email", required: true, readOnly: loggedIn && Boolean(defaults.email) })}
          {field("phone", "Telefon (za kurira)", { type: "tel", autoComplete: "tel", required: true })}
        </fieldset>
        <fieldset className="grid gap-4 sm:grid-cols-6">
          <legend className="mb-2 font-serif text-[22px] font-bold">Adresa za dostavu</legend>
          {field("full_name", "Ime i prezime", { autoComplete: "name", required: true, className: "sm:col-span-6" })}
          {field("address", "Ulica i broj", { autoComplete: "street-address", required: true, className: "sm:col-span-6" })}
          {field("postal_code", "Poštanski broj", { autoComplete: "postal-code", required: true, className: "sm:col-span-2" })}
          {field("city", "Grad", { autoComplete: "address-level2", required: true, className: "sm:col-span-4" })}
          <div className="sm:col-span-6">
            <label htmlFor="co-country" className="label">Država</label>
            <select id="co-country" name="country" defaultValue={defaults.country} className="input">
              {shop.shipping.countries.map((c) => <option key={c}>{c}</option>)}
            </select>
            {fields.country && <p className="mt-1 text-[13px] text-danger">{fields.country}</p>}
          </div>
          <div className="sm:col-span-6">
            <label htmlFor="co-note" className="label">Napomena (nije obavezno)</label>
            <textarea id="co-note" name="note" rows={3} className="input" placeholder="Npr. najbolje vrijeme za dostavu" />
          </div>
          {loggedIn && (
            <label className="flex items-center gap-2 text-[14px] sm:col-span-6">
              <input type="checkbox" name="save" defaultChecked className="h-4 w-4 accent-[var(--accent)]" /> Sačuvaj adresu za sljedeću narudžbu
            </label>
          )}
        </fieldset>
        <fieldset>
          <legend className="mb-3 font-serif text-[22px] font-bold">Plaćanje</legend>
          <label className="flex items-start gap-3 rounded-[3px] border border-ink bg-white p-4">
            <input type="radio" checked readOnly className="mt-1 accent-[var(--ink)]" />
            <span>
              <span className="font-semibold">Plaćanje pouzećem</span>
              <span className="block text-[14px] text-muted">Iznos plaćate kuriru gotovinom kad paket stigne.</span>
            </span>
          </label>
        </fieldset>
      </div>

      <aside className="h-fit space-y-5 bg-surface p-6 lg:sticky lg:top-36">
        <h2 className="font-serif text-[22px] font-bold">Vaša narudžba</h2>
        <ul className="space-y-3">
          {lines.map((l) => (
            <li key={l.id} className="flex items-center gap-3 text-[14px]">
              <div className="w-11 shrink-0">
                <BookCover product={{ title: l.title, cover_url: l.cover_url, is_set: false, author: l.author ? { name: l.author } : null }} sizes="44px" />
              </div>
              <span className="min-w-0 flex-1">{l.title} <span className="text-muted">× {l.quantity}</span></span>
              <span className="tabular-nums">{price(l.price * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-2 border-t border-line pt-4 text-[15px]">
          <div className="flex justify-between"><dt>Knjige</dt><dd className="tabular-nums">{price(subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Dostava</dt><dd className="tabular-nums">{shipping ? price(shipping) : "Besplatna"}</dd></div>
          <div className="flex justify-between border-t border-line pt-3 text-[18px] font-bold"><dt>Za plaćanje pouzećem</dt><dd className="tabular-nums">{price(subtotal + shipping)}</dd></div>
        </dl>
        {error && <p role="alert" className="rounded-[3px] bg-danger/10 p-3 text-[14px] text-danger">{error}</p>}
        <button disabled={pending} className="btn btn-dark w-full py-3.5 text-[15px]">
          {pending ? "Šaljem narudžbu…" : "Potvrdi narudžbu"}
        </button>
        <p className="text-[12.5px] text-muted">Klikom na dugme potvrđujete narudžbu s obavezom plaćanja pouzećem.</p>
      </aside>
    </form>
  );
}
