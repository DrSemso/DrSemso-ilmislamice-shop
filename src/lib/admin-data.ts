import "server-only";
import { redirect } from "next/navigation";
import demo from "./demo-catalog.json";
import { isDemo } from "./env";
import { getSession } from "./auth";
import { createSupabaseAdmin } from "./supabase/server";
import type { Author, Category, Order, Product, Publisher } from "./types";

// Data access for the admin panel. Every function checks admin rights first.
// In demo mode it reads the example catalog and refuses writes.

export async function requireAdmin() {
  if (isDemo) return { email: "demo@primjer.ba", demo: true as const };
  const s = await getSession();
  if (!s) redirect("/admin/prijava");
  if (!s.isAdmin) redirect("/admin/prijava?nema-pristupa=1");
  return { email: s.email, demo: false as const };
}

export const DEMO_ORDERS: Order[] = [
  {
    id: "00000000-0000-4000-a000-000000001001", number: 1001, user_id: null, email: "amina@primjer.ba", full_name: "Amina Hodžić",
    phone: "+387 61 000 000", address: "Ferhadija 1", city: "Sarajevo", postal_code: "71000", country: "Bosna i Hercegovina",
    note: "Molim dostavu poslije 16h.", subtotal: 38.5, shipping: 10, total: 48.5, currency: "EUR", payment_method: "pouzece", status: "nova",
    tracking_number: null, created_at: new Date(Date.now() - 3600e3).toISOString(),
    order_items: [
      { id: "i1", order_id: "", product_id: null, title: "Ne tuguj", price: 15, quantity: 1 },
      { id: "i2", order_id: "", product_id: null, title: "Zapečaćeni džennetski napitak", price: 23.5, quantity: 1 },
    ],
  },
  {
    id: "00000000-0000-4000-a000-000000001000", number: 1000, user_id: null, email: "emir@primjer.rs", full_name: "Emir Ljajić",
    phone: "+381 64 000 000", address: "28. novembra 10", city: "Novi Pazar", postal_code: "36300", country: "Srbija",
    note: null, subtotal: 4600, shipping: 450, total: 5050, currency: "RSD", payment_method: "pouzece", status: "poslana",
    tracking_number: "PE123456789", created_at: new Date(Date.now() - 86400e3 * 2).toISOString(),
    order_items: [{ id: "i3", order_id: "", product_id: null, title: "Set: Temelji vjere", price: 4600, quantity: 1 }],
  },
];

const num = (p: Product): Product => ({ ...p, price: Number(p.price), compare_at_price: p.compare_at_price == null ? null : Number(p.compare_at_price) });

export async function adminProducts(q?: string): Promise<Product[]> {
  await requireAdmin();
  if (isDemo) {
    const list = (demo.products as unknown as Product[]).map((p) => ({
      ...p,
      author: (demo.authors as Author[]).find((a) => a.id === p.author_id) ?? null,
      category: (demo.categories as Category[]).find((c) => c.id === p.category_id) ?? null,
    }));
    return q ? list.filter((p) => p.title.toLowerCase().includes(q.toLowerCase())) : list;
  }
  let req = createSupabaseAdmin().from("products").select("*, author:authors(name,slug), category:categories(name,slug)").order("created_at", { ascending: false }).limit(500);
  if (q) req = req.ilike("title", `%${q.replace(/[%_,()]/g, " ")}%`);
  const { data, error } = await req;
  if (error) throw error;
  return (data as Product[]).map(num);
}

export async function adminProduct(id: string): Promise<(Product & { set_item_ids: string[] }) | null> {
  await requireAdmin();
  if (isDemo) {
    const p = (demo.products as unknown as Product[]).find((x) => x.id === id);
    return p ? { ...p, set_item_ids: demo.set_items.filter((s) => s.set_id === id).map((s) => s.product_id) } : null;
  }
  const db = createSupabaseAdmin();
  const [{ data }, { data: items }] = await Promise.all([
    db.from("products").select("*").eq("id", id).maybeSingle(),
    db.from("set_items").select("product_id").eq("set_id", id),
  ]);
  return data ? { ...num(data as Product), set_item_ids: (items ?? []).map((i) => i.product_id as string) } : null;
}

export async function adminList<T extends "categories" | "publishers" | "authors">(table: T) {
  await requireAdmin();
  type Row = T extends "categories" ? Category : T extends "publishers" ? Publisher : Author;
  if (isDemo) return (demo as unknown as Record<string, Row[]>)[table];
  const q = createSupabaseAdmin().from(table).select("*");
  const { data, error } = await (table === "categories" ? q.order("sort").order("name") : q.order("name"));
  if (error) throw error;
  return data as Row[];
}

export async function adminProductCounts(column: "category_id" | "publisher_id" | "author_id") {
  const products = await adminProducts();
  const counts: Record<string, number> = {};
  products.forEach((p) => {
    const k = p[column];
    if (k) counts[k] = (counts[k] ?? 0) + 1;
  });
  return counts;
}

export async function adminOrders(status?: string): Promise<Order[]> {
  await requireAdmin();
  if (isDemo) return status ? DEMO_ORDERS.filter((o) => o.status === status) : DEMO_ORDERS;
  let req = createSupabaseAdmin().from("orders").select("*, order_items(*)").order("created_at", { ascending: false }).limit(300);
  if (status) req = req.eq("status", status);
  const { data, error } = await req;
  if (error) throw error;
  return data as Order[];
}

export async function adminOrder(id: string): Promise<Order | null> {
  await requireAdmin();
  if (isDemo) return DEMO_ORDERS.find((o) => o.id === id) ?? null;
  const { data } = await createSupabaseAdmin().from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
  return data as Order | null;
}

export async function adminMessages() {
  await requireAdmin();
  if (isDemo) {
    return [{ id: "m1", email: "kupac@primjer.ba", message: "Da li imate tefsir u kompletu, svih 10 tomova?", handled: false, created_at: new Date().toISOString() }];
  }
  const { data } = await createSupabaseAdmin().from("chat_messages").select("*").order("created_at", { ascending: false }).limit(200);
  return (data ?? []) as { id: string; email: string | null; message: string; handled: boolean; created_at: string }[];
}
