"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

type Item = { slug: string; name: string; books: string };

// Diacritics-insensitive: "cevdet" finds "Ćevdet", "dj" finds "đ".
const norm = (s: string) => s.toLowerCase().replace(/đ/g, "dj").normalize("NFD").replace(/[̀-ͯ]/g, "");

export function AuthorSearch({ authors }: { authors: Item[] }) {
  const [q, setQ] = useState("");
  const hits = useMemo(() => {
    const t = norm(q.trim());
    if (t.length < 2) return null;
    return authors.filter((a) => norm(a.name).includes(t)).slice(0, 30);
  }, [q, authors]);
  return (
    <div className="mt-6 max-w-[560px]">
      <label htmlFor="author-q" className="sr-only">Pretraga autora</label>
      <div className="relative">
        <Search size={18} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          id="author-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Pretražite autore po imenu"
          autoComplete="off"
          className="input pl-10"
        />
      </div>
      {hits && (
        <div className="mt-2 border border-line bg-card" aria-live="polite">
          {hits.length ? (
            <ul className="max-h-[320px] divide-y divide-line overflow-auto">
              {hits.map((a) => (
                <li key={a.slug}>
                  <Link href={`/autori/${a.slug}`} className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-surface">
                    <span className="font-medium">{a.name}</span>
                    <span className="shrink-0 text-[13px] text-muted">{a.books}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-[14px] text-muted">Nema autora za „{q.trim()}“.</p>
          )}
        </div>
      )}
    </div>
  );
}
