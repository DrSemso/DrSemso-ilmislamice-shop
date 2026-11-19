import type { Metadata } from "next";
import { listingMeta } from "@/lib/seo";
import { notFound } from "next/navigation";
import { Catalog } from "@/components/catalog";
import { getCategories, getCategoryBySlug, getCategoryWithDescendants } from "@/lib/data";

type Params = Promise<{ slug: string }>;
type SP = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: SP }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCategoryBySlug(slug);
  return listingMeta(`/kategorija/${slug}`, c ? `${c.name}, islamske knjige` : "Kategorija", await searchParams, c?.description);
}

export default async function Page({ params, searchParams }: { params: Params; searchParams: SP }) {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) notFound();
  const all = await getCategories();
  const parent = all.find((c) => c.id === cat.parent_id);
  const ids = await getCategoryWithDescendants(cat.id);
  return (
    <Catalog
      title={cat.name}
      eyebrow={parent?.name ?? "Kategorija"}
      intro={cat.description}
      crumbs={[
        { label: "Početna", href: "/" },
        ...(parent ? [{ label: parent.name, href: parent.slug === "knjige" ? "/knjige" : `/kategorija/${parent.slug}` }] : []),
        { label: cat.name },
      ]}
      query={{ categoryIds: ids }}
      searchParams={await searchParams}
      basePath={`/kategorija/${slug}`}
      activeCategorySlug={slug}
    />
  );
}
