import type { Metadata } from "next";
import { Catalog } from "@/components/catalog";

export const metadata: Metadata = { title: "Pretraga", robots: { index: false } };
type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function Page({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  return (
    <>
      <form action="/pretraga" className="container-x mt-8 flex max-w-[640px]" role="search">
        <label htmlFor="q-page" className="sr-only">Pretraga</label>
        <input id="q-page" name="q" defaultValue={q} placeholder="Naslov, autor ili izdavač" className="input rounded-r-none border-r-0" />
        <button className="btn btn-dark rounded-l-none">Traži</button>
      </form>
      <Catalog
        title={q ? `Rezultati za „${q}“` : "Pretraga"}
        crumbs={[{ label: "Početna", href: "/" }, { label: "Pretraga" }]}
        query={q ? { q } : { isSet: false }}
        searchParams={sp}
        basePath="/pretraga"
      />
    </>
  );
}
