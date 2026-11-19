import type { Metadata } from "next";
import Link from "next/link";
import { getProducts, getPublishers } from "@/lib/data";

export const metadata: Metadata = { title: "Izdavači", alternates: { canonical: "/izdavaci" } };
export const revalidate = 300;

export default async function Page() {
  const [publishers, { items }] = await Promise.all([getPublishers(), getProducts({ limit: 1000 })]);
  const count = (id: string) => items.filter((p) => p.publisher_id === id).length;
  return (
    <div className="container-x pt-10">
      <p className="eyebrow">Ponuda</p>
      <h1 className="mt-2 font-serif text-[clamp(32px,4.5vw,48px)] font-bold">Izdavači</h1>
      <p className="mt-3 max-w-[60ch] text-ink/75">Knjige izdavačkih kuća koje objavljuju islamsku literaturu na bosanskom jeziku.</p>
      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {publishers.map((p) => (
          <li key={p.id}>
            <Link href={`/izdavaci/${p.slug}`} className="flex items-center justify-between gap-4 border border-line bg-card/60 p-6 transition hover:border-ink hover:bg-card">
              <span className="font-serif text-[20px] font-semibold">{p.name}</span>
              <span className="text-[13px] text-muted">{count(p.id)} naslova</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
