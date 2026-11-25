import type { Metadata } from "next";
import Link from "next/link";
import { getAuthorBookCounts, getAuthors } from "@/lib/data";
import { AuthorSearch } from "@/components/author-search";

export const metadata: Metadata = { title: "Autori", alternates: { canonical: "/autori" } };
export const revalidate = 300;

export default async function Page() {
  const [authors, counts] = await Promise.all([getAuthors(), getAuthorBookCounts()]);
  const featured = authors.filter((a) => a.is_featured).sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0));
  const books = (n: number) => (n === 1 ? "1 knjiga" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? `${n} knjige` : `${n} knjiga`);
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
      <AuthorSearch authors={authors.map((a) => ({ slug: a.slug, name: a.name, books: books(counts[a.id] ?? 0) }))} />
      {featured.length > 0 && (
        <section aria-labelledby="poznati" className="mt-8">
          <h2 id="poznati" className="eyebrow mb-4">Poznati autori</h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((a) => (
              <li key={a.id}>
                <Link href={`/autori/${a.slug}`} className="group flex h-full flex-col items-start gap-3 border border-line bg-card p-3.5 transition hover:-translate-y-0.5 hover:border-accent sm:flex-row sm:items-center sm:gap-4 sm:p-4">
                  <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/15 font-serif text-[17px] font-bold text-accent sm:h-12 sm:w-12 sm:text-[20px]">
                    {a.name.replace(/^(dr\.?|mr\.?|prof\.?)\s+/i, "")[0]}
                  </span>
                  <span className="min-w-0 max-w-full">
                    <span className="block break-words font-serif text-[15.5px] font-semibold leading-snug group-hover:text-accent sm:text-[17px]">{a.name}</span>
                    <span className="text-[13px] text-muted">{books(counts[a.id] ?? 0)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <h2 className="eyebrow mb-0 mt-10">Svi autori</h2>
        </section>
      )}
      <nav aria-label="Slova" className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(36px,1fr))] gap-1.5 sm:flex sm:flex-wrap">
        {[...groups.keys()].map((l) => (
          <a key={l} href={`#slovo-${l}`} className="grid h-9 place-items-center border border-line text-[14px] font-semibold hover:border-ink sm:w-9">{l}</a>
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
