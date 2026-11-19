import Link from "next/link";
import { adminProducts } from "@/lib/admin-data";
import { price } from "@/lib/format";
import { BookCover } from "@/components/book-cover";

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function Page({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const products = await adminProducts(q || undefined);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-[32px] font-bold">Proizvodi</h1>
        <Link href="/admin/proizvodi/novi" className="btn btn-dark">+ Dodaj proizvod</Link>
      </div>
      {"sacuvano" in sp && <p className="rounded-[3px] bg-success/10 px-4 py-2.5 text-[14px] text-success">Proizvod je sačuvan i vidljiv u trgovini.</p>}
      {"obrisano" in sp && <p className="rounded-[3px] bg-ink/5 px-4 py-2.5 text-[14px]">Proizvod je uklonjen.</p>}
      <form className="flex max-w-[420px]">
        <label htmlFor="ap-q" className="sr-only">Traži</label>
        <input id="ap-q" name="q" defaultValue={q} placeholder="Traži po nazivu" className="input rounded-r-none border-r-0" />
        <button className="btn btn-dark rounded-l-none">Traži</button>
      </form>
      <div className="overflow-x-auto border border-line bg-paper">
        <table className="w-full min-w-[760px] text-[14px]">
          <thead>
            <tr className="border-b border-line text-left text-[12px] uppercase tracking-[0.1em] text-muted">
              <th className="px-5 py-3 font-semibold">Naziv</th>
              <th className="px-5 py-3 font-semibold">Kategorija</th>
              <th className="px-5 py-3 text-right font-semibold">Cijena</th>
              <th className="px-5 py-3 text-right font-semibold">Stanje</th>
              <th className="px-5 py-3 font-semibold">Prikaz</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id} className={`hover:bg-card ${p.active ? "" : "opacity-55"}`}>
                <td className="px-5 py-2.5">
                  <Link href={`/admin/proizvodi/${p.id}`} className="flex items-center gap-3">
                    <span className="w-9 shrink-0"><BookCover product={p} sizes="36px" /></span>
                    <span>
                      <span className="font-semibold hover:text-accent">{p.title}</span>
                      {p.author && <span className="block text-[12.5px] text-muted">{p.author.name}</span>}
                    </span>
                  </Link>
                </td>
                <td className="px-5 py-2.5 text-muted">{p.is_set ? "Set knjiga" : p.category?.name ?? "—"}</td>
                <td className="px-5 py-2.5 text-right tabular-nums">{price(p.price, "RSD")}</td>
                <td className={`px-5 py-2.5 text-right font-semibold tabular-nums ${p.stock === 0 ? "text-danger" : p.stock <= 2 ? "text-accent" : ""}`}>{p.stock}</td>
                <td className="px-5 py-2.5 text-[12.5px]">
                  <span className="flex flex-wrap gap-1">
                    {!p.active && <span className="rounded-full bg-ink/10 px-2 py-0.5">Skriveno</span>}
                    {p.is_new && <span className="rounded-full bg-surface-2 px-2 py-0.5">Novo</span>}
                    {p.is_featured && <span className="rounded-full bg-accent/20 px-2 py-0.5">Izdvojeno</span>}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-8 text-center text-muted">Nema proizvoda{q ? ` za „${q}“` : ""}.</p>}
      </div>
    </div>
  );
}
