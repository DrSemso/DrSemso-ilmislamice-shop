import Link from "next/link";
import { getCategories, getProducts, getPublishers, type ProductQuery, type ProductSort } from "@/lib/data";
import { ProductGrid } from "./product-card";
import { SortSelect } from "./sort-select";

const PER_PAGE = 24;
const SORTS: ProductSort[] = ["novo", "popularno", "cijena-rastuce", "cijena-opadajuce", "naziv"];

export type CatalogProps = {
  title: string;
  eyebrow?: string;
  intro?: string | null;
  crumbs: { label: string; href?: string }[];
  query: ProductQuery;
  searchParams: Record<string, string | string[] | undefined>;
  basePath: string;
  activeCategorySlug?: string;
  showPublisherFilter?: boolean;
};

export async function Catalog(props: CatalogProps) {
  const sp = props.searchParams;
  const sort = (SORTS.includes(sp.sort as ProductSort) ? sp.sort : "novo") as ProductSort;
  const page = Math.max(1, Number(sp.strana) || 1);
  const [categories, publishers] = await Promise.all([getCategories(), getPublishers()]);
  const pubSlug = typeof sp.izdavac === "string" ? sp.izdavac : undefined;
  const pub = pubSlug ? publishers.find((p) => p.slug === pubSlug) : undefined;

  const { items, total } = await getProducts({
    ...props.query,
    ...(pub ? { publisherId: pub.id } : {}),
    sort,
    page,
    limit: PER_PAGE,
  });
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const root = categories.find((c) => c.slug === "knjige");
  const subcats = categories.filter((c) => c.parent_id === root?.id);

  const href = (patch: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    const merged = { sort: sort === "novo" ? undefined : sort, izdavac: pubSlug, strana: page > 1 ? String(page) : undefined, ...patch };
    Object.entries(merged).forEach(([k, v]) => v && q.set(k, v));
    if (typeof sp.q === "string") q.set("q", sp.q);
    const s = q.toString();
    return s ? `${props.basePath}?${s}` : props.basePath;
  };

  return (
    <div className="container-x pb-8 pt-8">
      <nav aria-label="Putanja" className="text-[13px] text-muted">
        <ol className="flex flex-wrap gap-1.5">
          {props.crumbs.map((c, i) => (
            <li key={i} className="flex gap-1.5">
              {i > 0 && <span>/</span>}
              {c.href ? <Link href={c.href} className="hover:text-ink">{c.label}</Link> : <span className="text-ink">{c.label}</span>}
            </li>
          ))}
        </ol>
      </nav>

      <header className="mt-6 border-b border-line pb-8">
        {props.eyebrow && <p className="eyebrow">{props.eyebrow}</p>}
        <h1 className="mt-2 font-serif text-[clamp(32px,4.5vw,48px)] font-bold leading-tight">{props.title}</h1>
        {props.intro && <p className="mt-3 max-w-[65ch] text-[16px] text-ink/75">{props.intro}</p>}
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-8 text-[14.5px]">
          <div>
            <p className="eyebrow mb-3">Kategorije</p>
            <ul className="flex flex-wrap gap-2 lg:block lg:space-y-1.5">
              <li>
                <Link href="/knjige" className={`block rounded-full border px-3 py-1 lg:rounded-none lg:border-0 lg:p-0 ${props.basePath === "/knjige" ? "border-ink font-semibold" : "border-line hover:text-accent"}`}>
                  Sve knjige
                </Link>
              </li>
              {subcats.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/kategorija/${c.slug}`}
                    className={`block rounded-full border px-3 py-1 lg:rounded-none lg:border-0 lg:p-0 ${props.activeCategorySlug === c.slug ? "border-ink font-semibold text-ink" : "border-line hover:text-accent"}`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/setovi" className={`block rounded-full border px-3 py-1 lg:rounded-none lg:border-0 lg:p-0 ${props.basePath === "/setovi" ? "border-ink font-semibold" : "border-line hover:text-accent"}`}>
                  Setovi knjiga
                </Link>
              </li>
            </ul>
          </div>
          {props.showPublisherFilter !== false && publishers.length > 0 && (
            <div className="hidden lg:block">
              <p className="eyebrow mb-3">Izdavač</p>
              <ul className="space-y-1.5">
                {publishers.map((p) => (
                  <li key={p.id}>
                    <Link href={href({ izdavac: pubSlug === p.slug ? undefined : p.slug, strana: undefined })} className={pubSlug === p.slug ? "font-semibold" : "hover:text-accent"}>
                      {pubSlug === p.slug ? "✓ " : ""}
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <div className="min-w-0">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3 text-[14px]">
            <p className="text-muted">
              {total === 1 ? "1 naslov" : `${total} naslova`}
              {pub && (
                <>
                  {" "}· izdavač {pub.name}{" "}
                  <Link href={href({ izdavac: undefined, strana: undefined })} className="link">ukloni</Link>
                </>
              )}
            </p>
            <SortSelect value={sort} />
          </div>
          {items.length ? (
            <ProductGrid products={items} cols={5} />
          ) : (
            <div className="rounded-xl bg-surface p-10 text-center">
              <p className="font-serif text-[22px] font-semibold">Nema naslova za ovaj izbor.</p>
              <p className="mt-2 text-muted">Pogledajte <Link href="/knjige" className="link">sve knjige</Link> ili nam pišite u chatu.</p>
            </div>
          )}
          {pages > 1 && (
            <nav aria-label="Stranice" className="mt-14 flex justify-center gap-1.5">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={href({ strana: n > 1 ? String(n) : undefined })}
                  aria-current={n === page ? "page" : undefined}
                  className={`grid h-10 w-10 place-items-center border text-[14px] tabular-nums ${n === page ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"}`}
                >
                  {n}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
