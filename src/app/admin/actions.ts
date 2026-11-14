"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-data";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { sendStatusEmail } from "@/lib/email";
import { parseAmount, slugify } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";

export type FormState = { ok: boolean; message: string } | null;

const DEMO_MSG = "Demo režim: izmjene se čuvaju tek kad se poveže baza (Supabase).";
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const opt = (f: FormData, k: string) => str(f, k) || null;
const int = (f: FormData, k: string) => (str(f, k) ? Math.round(Number(str(f, k))) : null);
const money = (f: FormData, k: string) => parseAmount(str(f, k));

function refreshShop() {
  revalidatePath("/", "layout");
}

async function uniqueSlug(table: string, base: string, id?: string) {
  const db = createSupabaseAdmin();
  let slug = base || "stavka";
  for (let i = 2; i < 50; i++) {
    const { data } = await db.from(table).select("id").eq("slug", slug).maybeSingle();
    if (!data || data.id === id) return slug;
    slug = `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}

async function upload(file: File) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
  const db = createSupabaseAdmin();
  const { error } = await db.storage.from("products").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error("Slika nije učitana: " + error.message);
  return db.storage.from("products").getPublicUrl(path).data.publicUrl;
}

// ---------- Products ----------
export async function saveProduct(_: FormState, f: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  if (admin.demo) return { ok: false, message: DEMO_MSG };

  const id = opt(f, "id") ?? undefined;
  const title = str(f, "title");
  const price = money(f, "price");
  if (!title) return { ok: false, message: "Upišite naziv." };
  if (price == null || Number.isNaN(price) || price < 0) return { ok: false, message: "Upišite ispravnu cijenu (npr. 1800)." };

  try {
    let cover_url = opt(f, "existing_cover");
    const cover = f.get("cover");
    if (cover instanceof File && cover.size > 0) cover_url = await upload(cover);
    if (f.get("remove_cover") === "on") cover_url = null;

    const images = f.getAll("keep_images").map(String);
    for (const img of f.getAll("images")) if (img instanceof File && img.size > 0) images.push(await upload(img));

    // New author / publisher typed straight into the product form
    const db0 = createSupabaseAdmin();
    let author_id = opt(f, "author_id");
    if (str(f, "new_author")) {
      const name = str(f, "new_author");
      const { data: a, error } = await db0.from("authors").insert({ name, slug: await uniqueSlug("authors", slugify(name)) }).select("id").single();
      if (error) return { ok: false, message: "Autor nije dodan: " + error.message };
      author_id = a.id;
    }
    let publisher_id = opt(f, "publisher_id");
    if (str(f, "new_publisher")) {
      const name = str(f, "new_publisher");
      const { data: pb, error } = await db0.from("publishers").insert({ name, slug: await uniqueSlug("publishers", slugify(name)) }).select("id").single();
      if (error) return { ok: false, message: "Izdavač nije dodan: " + error.message };
      publisher_id = pb.id;
    }

    const row = {
      title,
      slug: await uniqueSlug("products", slugify(str(f, "slug") || title), id),
      description: opt(f, "description"),
      price,
      compare_at_price: money(f, "compare_at_price"),
      stock: int(f, "stock") ?? 0,
      sku: opt(f, "sku"),
      isbn: opt(f, "isbn"),
      pages: int(f, "pages"),
      binding: opt(f, "binding"),
      year: int(f, "year"),
      translator: opt(f, "translator"),
      dimensions: opt(f, "dimensions"),
      cover_url,
      images,
      category_id: opt(f, "category_id"),
      publisher_id,
      author_id,
      is_set: f.get("is_set") === "on",
      is_featured: f.get("is_featured") === "on",
      is_new: f.get("is_new") === "on",
      active: f.get("active") === "on",
    };
    const db = createSupabaseAdmin();
    const { data, error } = id
      ? await db.from("products").update(row).eq("id", id).select("id").single()
      : await db.from("products").insert(row).select("id").single();
    if (error) return { ok: false, message: "Nije sačuvano: " + error.message };

    const setIds = f.getAll("set_items").map(String).filter((x) => x && x !== data.id);
    await db.from("set_items").delete().eq("set_id", data.id);
    if (row.is_set && setIds.length) await db.from("set_items").insert(setIds.map((product_id) => ({ set_id: data.id, product_id })));
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Greška pri čuvanju." };
  }
  refreshShop();
  redirect("/admin/proizvodi?sacuvano=1");
}

export async function deleteProduct(f: FormData) {
  const admin = await requireAdmin();
  if (admin.demo) return;
  const id = str(f, "id");
  const db = createSupabaseAdmin();
  // Products that already appear in orders are hidden instead of deleted, so order history stays intact.
  const { count } = await db.from("order_items").select("id", { count: "exact", head: true }).eq("product_id", id);
  if (count) await db.from("products").update({ active: false }).eq("id", id);
  else await db.from("products").delete().eq("id", id);
  refreshShop();
  redirect("/admin/proizvodi?obrisano=1");
}

// ---------- Categories, publishers, authors ----------
type Entity = "categories" | "publishers" | "authors";
const ENTITY_PATH: Record<Entity, string> = { categories: "/admin/kategorije", publishers: "/admin/izdavaci", authors: "/admin/autori" };

export async function saveEntity(table: Entity, _: FormState, f: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  if (admin.demo) return { ok: false, message: DEMO_MSG };
  const id = opt(f, "id") ?? undefined;
  const name = str(f, "name");
  if (!name) return { ok: false, message: "Upišite naziv." };
  const row: Record<string, unknown> = { name, slug: await uniqueSlug(table, slugify(str(f, "slug") || name), id) };
  if (table === "categories") {
    row.parent_id = opt(f, "parent_id");
    row.description = opt(f, "description");
    row.sort = int(f, "sort") ?? 0;
    if (id && row.parent_id === id) return { ok: false, message: "Kategorija ne može biti sama sebi nadređena." };
  } else if (table === "publishers") {
    row.description = opt(f, "description");
  } else {
    row.bio = opt(f, "description");
  }
  const db = createSupabaseAdmin();
  const { error } = id ? await db.from(table).update(row).eq("id", id) : await db.from(table).insert(row);
  if (error) return { ok: false, message: "Nije sačuvano: " + error.message };
  refreshShop();
  revalidatePath(ENTITY_PATH[table]);
  return { ok: true, message: id ? "Izmjene su sačuvane." : `Dodano: ${name}` };
}

export async function deleteEntity(table: Entity, f: FormData) {
  const admin = await requireAdmin();
  if (admin.demo) return;
  await createSupabaseAdmin().from(table).delete().eq("id", str(f, "id"));
  refreshShop();
  revalidatePath(ENTITY_PATH[table]);
}

// ---------- Orders ----------
export async function updateOrder(_: FormState, f: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  if (admin.demo) return { ok: false, message: DEMO_MSG };
  const id = str(f, "id");
  const status = str(f, "status") as OrderStatus;
  const notify = f.get("notify") === "on";
  const db = createSupabaseAdmin();
  const { data: before } = await db.from("orders").select("status").eq("id", id).single();
  const { data, error } = await db
    .from("orders")
    .update({ status, tracking_number: opt(f, "tracking_number") })
    .eq("id", id)
    .select("*")
    .single();
  if (error || !data) return { ok: false, message: "Nije sačuvano." };
  // Cancelling returns the books to stock.
  if (status === "otkazana" && before?.status !== "otkazana") {
    const { data: items } = await db.from("order_items").select("product_id,quantity").eq("order_id", id);
    for (const i of items ?? []) {
      if (!i.product_id) continue;
      const { data: p } = await db.from("products").select("stock").eq("id", i.product_id).single();
      if (p) await db.from("products").update({ stock: p.stock + i.quantity }).eq("id", i.product_id);
    }
  }
  if (notify && before?.status !== status) await sendStatusEmail(data as Order);
  revalidatePath("/admin/narudzbe");
  revalidatePath(`/admin/narudzbe/${id}`);
  return { ok: true, message: notify && before?.status !== status ? "Sačuvano, kupcu je poslan e-mail." : "Sačuvano." };
}

export async function toggleMessage(f: FormData) {
  const admin = await requireAdmin();
  if (admin.demo) return;
  await createSupabaseAdmin().from("chat_messages").update({ handled: f.get("handled") === "true" }).eq("id", str(f, "id"));
  revalidatePath("/admin/poruke");
}
