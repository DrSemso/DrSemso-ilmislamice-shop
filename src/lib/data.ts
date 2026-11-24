import "server-only";
import { cache } from "react";
import demo from "./demo-catalog.json";
import { isDemo } from "./env";
import { createSupabasePublic } from "./supabase/server";
import type { Author, Category, Product, Publisher } from "./types";

// Catalog reads. With Supabase configured they hit the database; otherwise they read the
// example catalog so the shop can be previewed before any setup.

const PRODUCT_SELECT =
  "*, author:authors(name,slug), publisher:publishers(name,slug), category:categories(name,slug)";

export type ProductSort = "novo" | "popularno" | "cijena-rastuce" | "cijena-opadajuce" | "naziv";

export type ProductQuery = {
  categoryIds?: string[];
  publisherId?: string;
  authorId?: string;
  isSet?: boolean;
  featured?: boolean;
  isNew?: boolean;
  onSale?: boolean;
  q?: string;
  ids?: string[];
  sort?: ProductSort;
  limit?: number;
  page?: number;
};

const demoProducts = (): Product[] =>
  (demo.products as unknown as Product[]).map((p) => ({
    ...p,
    author: (demo.authors as Author[]).find((a) => a.id === p.author_id) ?? null,
    publisher: (demo.publishers as Publisher[]).find((x) => x.id === p.publisher_id) ?? null,
    category: (demo.categories as Category[]).find((c) => c.id === p.category_id) ?? null,
  }));

const num = (p: Product): Product => ({
  ...p,
  price: Number(p.price),
  compare_at_price: p.compare_at_price == null ? null : Number(p.compare_at_price),
});

export const getCategories = cache(async (): Promise<Category[]> => {
  if (isDemo) return demo.categories as Category[];
  const { data, error } = await createSupabasePublic().from("categories").select("*").order("sort").order("name");
  if (error) throw error;
  return data as Category[];
});

export async function getCategoryBySlug(slug: string) {
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
}

/** A category plus all of its descendants, for "show everything under Knjige". */
export async function getCategoryWithDescendants(id: string) {
  const all = await getCategories();
  const ids = [id];
  for (let i = 0; i < ids.length; i++) all.filter((c) => c.parent_id === ids[i]).forEach((c) => ids.push(c.id));
  return ids;
}

export const getPublishers = cache(async (): Promise<Publisher[]> => {
  if (isDemo) return demo.publishers as Publisher[];
  const { data, error } = await createSupabasePublic().from("publishers").select("*").order("name");
  if (error) throw error;
  return data as Publisher[];
});

export const getAuthors = cache(async (): Promise<Author[]> => {
  if (isDemo) return demo.authors as Author[];
  const { data, error } = await createSupabasePublic().from("authors").select("*").order("name");
  if (error) throw error;
  return data as Author[];
});

export async function getProducts(query: ProductQuery = {}): Promise<{ items: Product[]; total: number }> {
  const { sort = "novo", limit = 24, page = 1 } = query;

  if (isDemo) {
    let items = demoProducts().filter((p) => p.active);
    if (query.categoryIds) items = items.filter((p) => p.category_id && query.categoryIds!.includes(p.category_id));
    if (query.publisherId) items = items.filter((p) => p.publisher_id === query.publisherId);
    if (query.authorId) items = items.filter((p) => p.author_id === query.authorId);
    if (query.isSet !== undefined) items = items.filter((p) => p.is_set === query.isSet);
    if (query.featured) items = items.filter((p) => p.is_featured);
    if (query.isNew) items = items.filter((p) => p.is_new);
    if (query.onSale) items = items.filter((p) => p.compare_at_price && p.compare_at_price > p.price);
    if (query.ids) items = items.filter((p) => query.ids!.includes(p.id));
    if (query.q) {
      const q = fold(query.q);
      items = items.filter((p) => fold(`${p.title} ${p.author?.name ?? ""} ${p.publisher?.name ?? ""}`).includes(q));
    }
    items.sort(sorter(sort));
    return { items: items.slice((page - 1) * limit, page * limit), total: items.length };
  }

  let req = createSupabasePublic().from("products").select(PRODUCT_SELECT, { count: "exact" }).eq("active", true);
  if (query.categoryIds) req = req.in("category_id", query.categoryIds);
  if (query.publisherId) req = req.eq("publisher_id", query.publisherId);
  if (query.authorId) req = req.eq("author_id", query.authorId);
  if (query.isSet !== undefined) req = req.eq("is_set", query.isSet);
  if (query.featured) req = req.eq("is_featured", true);
  if (query.isNew) req = req.eq("is_new", true);
  if (query.onSale) req = req.not("compare_at_price", "is", null);
  if (query.ids) req = req.in("id", query.ids);
  if (query.q) req = req.ilike("search_text", `%${fold(query.q).replace(/[%_,()]/g, " ")}%`);
  const order: Record<ProductSort, [string, boolean]> = {
    novo: ["created_at", false],
    popularno: ["is_featured", false],
    "cijena-rastuce": ["price", true],
    "cijena-opadajuce": ["price", false],
    naziv: ["title", true],
  };
  const [col, asc] = order[sort];
  req = req.order(col, { ascending: asc }).order("created_at", { ascending: false });
  req = req.range((page - 1) * limit, page * limit - 1);
  const { data, error, count } = await req;
  if (error) throw error;
  let items = (data as Product[]).map(num);
  if (query.onSale) items = items.filter((p) => p.compare_at_price! > p.price);
  return { items, total: count ?? items.length };
}

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  if (isDemo) return demoProducts().find((p) => p.slug === slug && p.active) ?? null;
  const { data } = await createSupabasePublic().from("products").select(PRODUCT_SELECT).eq("slug", slug).eq("active", true).maybeSingle();
  return data ? num(data as Product) : null;
});

export async function getSetItems(setId: string): Promise<Product[]> {
  let ids: string[];
  if (isDemo) {
    ids = demo.set_items.filter((s) => s.set_id === setId).map((s) => s.product_id);
  } else {
    const { data } = await createSupabasePublic().from("set_items").select("product_id").eq("set_id", setId);
    ids = (data ?? []).map((r) => r.product_id as string);
  }
  if (!ids.length) return [];
  return (await getProducts({ ids, limit: 50 })).items;
}

/** Sets that contain this book, so a product page can point to them. */
export async function getSetsContaining(productId: string): Promise<Product[]> {
  let ids: string[];
  if (isDemo) {
    ids = demo.set_items.filter((s) => s.product_id === productId).map((s) => s.set_id);
  } else {
    const { data } = await createSupabasePublic().from("set_items").select("set_id").eq("product_id", productId);
    ids = (data ?? []).map((r) => r.set_id as string);
  }
  if (!ids.length) return [];
  return (await getProducts({ ids, limit: 10 })).items;
}

export function fold(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "dj");
}

function sorter(sort: ProductSort) {
  return (a: Product, b: Product) => {
    switch (sort) {
      case "cijena-rastuce": return a.price - b.price;
      case "cijena-opadajuce": return b.price - a.price;
      case "naziv": return a.title.localeCompare(b.title, "bs");
      case "popularno": return Number(b.is_featured) - Number(a.is_featured) || b.created_at.localeCompare(a.created_at);
      default: return b.created_at.localeCompare(a.created_at);
    }
  };
}

/** Every public product slug with its last change, for the sitemap. */
export async function getProductSlugs(): Promise<{ slug: string; updated_at: string | null }[]> {
  if (isDemo) return (demo.products as unknown as Product[]).map((p) => ({ slug: p.slug, updated_at: null }));
  const { data, error } = await createSupabasePublic()
    .from("products")
    .select("slug, updated_at")
    .eq("active", true)
    .order("slug")
    .range(0, 9999);
  if (error) throw error;
  return data ?? [];
}

/** Number of active books per author id. */
export const getAuthorBookCounts = cache(async (): Promise<Record<string, number>> => {
  const rows = isDemo
    ? demoProducts().filter((p) => p.active).map((p) => ({ author_id: p.author_id }))
    : ((await createSupabasePublic().from("products").select("author_id").eq("active", true).not("author_id", "is", null).range(0, 9999)).data ?? []);
  const counts: Record<string, number> = {};
  rows.forEach((r) => r.author_id && (counts[r.author_id] = (counts[r.author_id] ?? 0) + 1));
  return counts;
});
