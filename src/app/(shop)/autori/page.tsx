import type { Metadata } from "next";
import Link from "next/link";
import { getAuthors } from "@/lib/data";

export const metadata: Metadata = { title: "Autori", alternates: { canonical: "/autori" } };
export const revalidate = 300;

export default async function Page() {
  const authors = await getAuthors();
  const groups = new Map<string, typeof authors>();
  [...authors]
    .sort((a, b) => a.name.localeCompare(b.name, "bs"))
    .forEach((a) => {
      const letter = a.name[0].toUpperCase();
      groups.set(letter, [...(groups.get(letter) ?? []), a]);
    });
  return (
    <div className="container-x pt-10">
      <p className="eyebrow">Ponuda</p>
      <h1 className="mt-2 font-serif text-[clamp(32px,4.5vw,48px)] font-bold">Autori</h1>
      <nav aria-label="Slova" className="mt-6 flex flex-wrap gap-1.5">
        {[...groups.keys()].map((l) => (
          <a key={l} href={`#slovo-${l}`} className="grid h-9 w-9 place-items-center border border-line text-[14px] font-semibold hover:border-ink">{l}</a>
        ))}
      </nav>
      <div className="mt-10 columns-1 gap-10 sm:columns-2 lg:columns-3">
        {[...groups.entries()].map(([letter, list]) => (
          <section key={letter} id={`slovo-${letter}`} className="mb-8 break-inside-avoid">
            <h2 className="mb-3 border-b border-line pb-2 font-serif text-[26px] font-bold text-accent">{letter}</h2>
            <ul className="space-y-1.5">
              {list.map((a) => (
                <li key={a.id}><Link href={`/autori/${a.slug}`} className="hover:text-accent">{a.name}</Link></li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
