import type { Metadata } from "next";
import { listingMeta } from "@/lib/seo";
import { notFound } from "next/navigation";
import { Catalog } from "@/components/catalog";
import { getPublishers } from "@/lib/data";

type Params = Promise<{ slug: string }>;
type SP = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: SP }): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getPublishers()).find((x) => x.slug === slug);
  return listingMeta(`/izdavaci/${slug}`, p ? `Izdavač ${p.name}` : "Izdavač", await searchParams, p ? `Knjige izdavača ${p.name}. Plaćanje pouzećem, dostava širom Srbije i regiona.` : null);
}

export default async function Page({ params, searchParams }: { params: Params; searchParams: SP }) {
  const { slug } = await params;
  const pub = (await getPublishers()).find((x) => x.slug === slug);
  if (!pub) notFound();
  return (
    <Catalog
      title={pub.name}
      eyebrow="Izdavač"
      intro={pub.description}
      crumbs={[{ label: "Početna", href: "/" }, { label: "Izdavači", href: "/izdavaci" }, { label: pub.name }]}
      query={{ publisherId: pub.id }}
      searchParams={await searchParams}
      basePath={`/izdavaci/${slug}`}
      showPublisherFilter={false}
    />
  );
}
