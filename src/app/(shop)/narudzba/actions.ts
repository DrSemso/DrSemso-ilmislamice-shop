"use server";

import { isDemo } from "@/lib/env";
import { getSession } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { shippingFor } from "@/lib/format";
import { sendOrderEmails } from "@/lib/email";
import { shop } from "@/shop.config";
import type { Order } from "@/lib/types";

export type OrderInput = {
  email: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  note: string;
  save: boolean;
  lines: { id: string; quantity: number }[];
};

export type OrderResult =
  | { ok: true; number: number }
  | { ok: false; error: string; fields?: Partial<Record<keyof OrderInput, string>>; stock?: Record<string, number> };

export async function placeOrder(input: OrderInput): Promise<OrderResult> {
  const v = {
    email: String(input.email ?? "").trim().toLowerCase(),
    full_name: String(input.full_name ?? "").trim(),
    phone: String(input.phone ?? "").trim(),
    address: String(input.address ?? "").trim(),
    city: String(input.city ?? "").trim(),
    postal_code: String(input.postal_code ?? "").trim(),
    country: String(input.country ?? "").trim(),
    note: String(input.note ?? "").trim().slice(0, 1000),
  };
  const fields: Partial<Record<keyof OrderInput, string>> = {};
  if (!/^\S+@\S+\.\S+$/.test(v.email)) fields.email = "Upišite ispravnu e-mail adresu.";
  if (v.full_name.length < 3) fields.full_name = "Upišite ime i prezime.";
  if (v.phone.replace(/\D/g, "").length < 6) fields.phone = "Upišite broj telefona za kurira.";
  if (v.address.length < 3) fields.address = "Upišite ulicu i broj.";
  if (v.city.length < 2) fields.city = "Upišite grad.";
  if (v.postal_code.length < 3) fields.postal_code = "Upišite poštanski broj.";
  if (!shop.shipping.countries.includes(v.country as never)) fields.country = "Izaberite državu.";
  if (Object.keys(fields).length) return { ok: false, error: "Provjerite označena polja.", fields };

  const lines = (input.lines ?? [])
    .map((l) => ({ id: String(l.id), quantity: Math.floor(Number(l.quantity)) }))
    .filter((l) => l.quantity > 0 && l.quantity <= 99);
  if (!lines.length) return { ok: false, error: "Korpa je prazna." };

  if (isDemo) return { ok: false, error: "Demo režim: narudžbe će raditi kad se poveže baza (Supabase)." };

  const db = createSupabaseAdmin();
  const { data: products, error: pErr } = await db
    .from("products")
    .select("id,title,price,stock,active")
    .in("id", lines.map((l) => l.id));
  if (pErr) return { ok: false, error: "Narudžba nije poslana, pokušajte ponovo." };

  const stock: Record<string, number> = {};
  const items = lines.map((l) => {
    const p = products?.find((x) => x.id === l.id);
    if (!p || !p.active) stock[l.id] = 0;
    else if (p.stock < l.quantity) stock[l.id] = p.stock;
    return { product_id: l.id, title: p?.title ?? "", price: Number(p?.price ?? 0), quantity: l.quantity };
  });
  if (Object.keys(stock).length) {
    return { ok: false, error: "Neke knjige nisu dostupne u traženoj količini. Korpa je usklađena sa stanjem.", stock };
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = shippingFor(subtotal);
  const session = await getSession();

  const { data: order, error: oErr } = await db
    .from("orders")
    .insert({ ...v, note: v.note || null, user_id: session?.user.id ?? null, subtotal, shipping, total: subtotal + shipping })
    .select("*")
    .single();
  if (oErr || !order) return { ok: false, error: "Narudžba nije poslana, pokušajte ponovo." };

  const { error: iErr } = await db.from("order_items").insert(items.map((i) => ({ ...i, order_id: order.id })));
  if (iErr) {
    await db.from("orders").delete().eq("id", order.id);
    return { ok: false, error: "Narudžba nije poslana, pokušajte ponovo." };
  }
  await Promise.all(items.map((i) => db.rpc("decrement_stock", { p_id: i.product_id, qty: i.quantity })));

  if (session && input.save) {
    await db.from("profiles").update({
      full_name: v.full_name, phone: v.phone, address: v.address, city: v.city, postal_code: v.postal_code, country: v.country,
    }).eq("id", session.user.id);
  }

  try {
    await sendOrderEmails({ ...(order as Order), subtotal, shipping, total: subtotal + shipping }, items);
  } catch (e) {
    console.error("order email", e);
  }
  return { ok: true, number: order.number };
}
