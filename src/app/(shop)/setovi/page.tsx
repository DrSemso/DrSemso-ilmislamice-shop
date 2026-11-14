import type { Metadata } from "next";
import { Catalog } from "@/components/catalog";

export const metadata: Metadata = { title: "Setovi knjiga" };
type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function Page({ searchParams }: { searchParams: SP }) {
  return (
    <Catalog
      title="Setovi knjiga"
      eyebrow="Povoljnije u kompletu"
      intro="Odabrane knjige u kompletu, po nižoj cijeni nego kad ih kupujete pojedinačno."
      crumbs={[{ label: "Početna", href: "/" }, { label: "Setovi knjiga" }]}
      query={{ isSet: true }}
      searchParams={await searchParams}
      basePath="/setovi"
    />
  );
}
