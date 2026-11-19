import type { Metadata } from "next";
import { listingMeta } from "@/lib/seo";
import { Catalog } from "@/components/catalog";

type SP = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  return listingMeta("/setovi", "Setovi knjiga", await searchParams, "Setovi islamskih knjiga po povoljnijoj cijeni. Plaćanje pouzećem.");
}

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
