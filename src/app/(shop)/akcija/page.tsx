import type { Metadata } from "next";
import { Catalog } from "@/components/catalog";

export const metadata: Metadata = { title: "Na popustu" };
type SP = Promise<Record<string, string | string[] | undefined>>;

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
