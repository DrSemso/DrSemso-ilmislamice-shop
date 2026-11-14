import type { Metadata } from "next";
import { Catalog } from "@/components/catalog";

export const metadata: Metadata = { title: "Knjige" };
type SP = Promise<Record<string, string | string[] | undefined>>;

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
