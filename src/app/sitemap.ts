import type { MetadataRoute } from "next";
import { getAuthors, getCategories, getProductSlugs, getPublishers } from "@/lib/data";
import { SITE_URL } from "@/lib/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, authors, publishers] = await Promise.all([getProductSlugs(), getCategories(), getAuthors(), getPublishers()]);
  const url = (path: string) => `${SITE_URL}${path}`;
  const pages = ["/", "/knjige", "/setovi", "/akcija", "/autori", "/izdavaci", "/dostava-i-placanje", "/cesta-pitanja"];
  return [
    ...pages.map((p) => ({ url: url(p), changeFrequency: "daily" as const, priority: p === "/" ? 1 : 0.8 })),
    ...categories.filter((c) => c.slug !== "knjige").map((c) => ({ url: url(`/kategorija/${c.slug}`), changeFrequency: "daily" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: url(`/proizvod/${p.slug}`), lastModified: p.updated_at ?? undefined, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...authors.map((a) => ({ url: url(`/autori/${a.slug}`), changeFrequency: "weekly" as const, priority: 0.4 })),
    ...publishers.map((p) => ({ url: url(`/izdavaci/${p.slug}`), changeFrequency: "weekly" as const, priority: 0.4 })),
  ];
}
