import type { Metadata } from "next";
import { listingMeta } from "@/lib/seo";
import { Catalog } from "@/components/catalog";

type SP = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  return listingMeta("/akcija", "Na popustu", await searchParams, "Islamske knjige na popustu. Plaćanje pouzećem.");
}

export default async function Page({ searchParams }: { searchParams: SP }) {
  return (
    <Catalog
      title="Na popustu"
      eyebrow="Snižene cijene"
      crumbs={[{ label: "Početna", href: "/" }, { label: "Na popustu" }]}
      query={{ onSale: true }}
      searchParams={await searchParams}
      basePath="/akcija"
    />
  );
}
