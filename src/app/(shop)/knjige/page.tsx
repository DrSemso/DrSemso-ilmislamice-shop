import type { Metadata } from "next";
import { listingMeta } from "@/lib/seo";
import { Catalog } from "@/components/catalog";

type SP = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  return listingMeta("/knjige", "Knjige", await searchParams, "Islamske knjige na bosanskom jeziku: tefsir, hadis, akida, fikh, sira i knjige za djecu. Plaćanje pouzećem, dostava širom Srbije i regiona.");
}

export default async function Page({ searchParams }: { searchParams: SP }) {
  return (
    <Catalog
      title="Knjige"
      eyebrow="Ponuda"
      intro="Islamska literatura na bosanskom jeziku: tefsir, hadis, akaid, sira, ahlak i knjige za djecu."
      crumbs={[{ label: "Početna", href: "/" }, { label: "Knjige" }]}
      query={{ isSet: false }}
      searchParams={await searchParams}
      basePath="/knjige"
    />
  );
}
