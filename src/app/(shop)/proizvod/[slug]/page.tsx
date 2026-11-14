import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, MessageCircle, Truck, X } from "lucide-react";
import { getProductBySlug, getProducts, getSetItems, getSetsContaining } from "@/lib/data";
import { discountPercent, price } from "@/lib/format";
import { BookCover } from "@/components/book-cover";
import { AddToCart } from "@/components/add-to-cart";
import { ProductGrid } from "@/components/product-card";
import { shop } from "@/shop.config";

export const revalidate = 300;
type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  if (!p) return { title: "Knjiga nije pronađena" };
  return {
    title: p.author ? `${p.title}, ${p.author.name}` : p.title,
    description: p.description?.slice(0, 160),
    openGraph: { images: p.cover_url ? [p.cover_url] : [] },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  const [setItems, inSets, related] = await Promise.all([
    product.is_set ? getSetItems(product.id) : Promise.resolve([]),
    product.is_set ? Promise.resolve([]) : getSetsContaining(product.id),
    product.category_id ? getProducts({ categoryIds: [product.category_id], limit: 5, sort: "popularno" }) : Promise.resolve({ items: [], total: 0 }),
  ]);
  const off = discountPercent(product.price, product.compare_at_price);
  const inStock = product.stock > 0;
  const specs: [string, React.ReactNode][] = [
    ["Autor", product.author ? <Link href={`/autori/${product.author.slug}`} className="link">{product.author.name}</Link> : null],
    ["Prijevod", product.translator],
    ["Izdavač", product.publisher ? <Link href={`/izdavaci/${product.publisher.slug}`} className="link">{product.publisher.name}</Link> : null],
    ["Godina izdanja", product.year],
    ["Broj stranica", product.pages],
    ["Uvez", product.binding],
    ["Format", product.dimensions],
    ["ISBN", product.isbn],
    ["Šifra", product.sku],
  ].filter(([, v]) => v != null && v !== "") as [string, React.ReactNode][];

  const waText = encodeURIComponent(`Selam, želim naručiti knjigu: ${product.title}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.cover_url ?? undefined,
    sku: product.sku ?? undefined,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: shop.currency === "KM" ? "BAM" : shop.currency,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="container-x pt-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Putanja" className="text-[13px] text-muted">
        <ol className="flex flex-wrap gap-1.5">
          <li><Link href="/" className="hover:text-ink">Početna</Link></li>
          <li>/</li>
          {product.is_set ? (
            <li><Link href="/setovi" className="hover:text-ink">Setovi knjiga</Link></li>
          ) : product.category ? (
            <li><Link href={`/kategorija/${product.category.slug}`} className="hover:text-ink">{product.category.name}</Link></li>
          ) : (
            <li><Link href="/knjige" className="hover:text-ink">Knjige</Link></li>
          )}
          <li>/</li>
          <li className="text-ink">{product.title}</li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,420px)_1fr] lg:gap-16">
        <div className="space-y-3">
          <div className="relative mx-auto w-full max-w-[420px] shadow-[0_30px_50px_-25px_rgba(0,0,0,.45)]">
            <BookCover product={product} sizes="(max-width: 768px) 90vw, 420px" priority />
            {off > 0 && <span className="absolute left-3 top-3 bg-accent px-2 py-1 text-[12px] font-bold text-accent-ink">−{off}%</span>}
          </div>
          {product.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((src) => (
                <div key={src} className="relative aspect-square overflow-hidden bg-surface-2">
                  <Image src={src} alt="" fill sizes="100px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="min-w-0">
          {product.is_set && <p className="eyebrow">Set knjiga</p>}
          <h1 className="font-serif text-[clamp(30px,4vw,44px)] font-bold leading-[1.1]">{product.title}</h1>
          {product.author && (
            <p className="mt-3 text-[16px]">
              <Link href={`/autori/${product.author.slug}`} className="link">{product.author.name}</Link>
              {product.translator && <span className="text-muted"> · prijevod: {product.translator}</span>}
            </p>
          )}
          {product.publisher && (
            <p className="mt-1 text-[14px] text-muted">
              Izdanje <Link href={`/izdavaci/${product.publisher.slug}`} className="link">{product.publisher.name}</Link>
              {product.year ? `, ${product.year}.` : ""}
            </p>
          )}

          <div className="mt-7 flex items-baseline gap-3 border-y border-line py-5">
            <span className="text-[30px] font-bold tabular-nums">{price(product.price)}</span>
            {off > 0 && (
              <>
                <s className="text-[17px] text-muted">{price(product.compare_at_price!)}</s>
                <span className="text-[14px] font-semibold text-accent">Ušteda {price(product.compare_at_price! - product.price)}</span>
              </>
            )}
          </div>

          <p className={`mt-5 flex items-center gap-2 text-[14px] font-medium ${inStock ? "text-success" : "text-danger"}`}>
            {inStock ? <Check size={16} /> : <X size={16} />}
            {inStock ? (product.stock <= 3 ? `Na stanju, još ${product.stock} kom.` : "Na stanju") : "Trenutno rasprodato"}
          </p>

          <div className="mt-5">
            <AddToCart product={product} variant="page" />
          </div>

          <ul className="mt-7 space-y-3 text-[14px] text-ink/80">
            <li className="flex gap-3">
              <Truck size={18} className="shrink-0 text-accent" />
              <span>
                Dostava {shop.shipping.deliveryTime}, plaćanje pouzećem.
                {shop.shipping.freeFrom ? ` Besplatna dostava iznad ${price(shop.shipping.freeFrom)}.` : ""}
              </span>
            </li>
            <li className="flex gap-3">
              <MessageCircle size={18} className="shrink-0 text-accent" />
              <span>
                Radije naručujete porukom?{" "}
                <a href={`https://wa.me/${shop.contact.whatsapp}?text=${waText}`} className="link">Naručite preko WhatsAppa</a>
              </span>
            </li>
          </ul>

          {product.description && (
            <section className="mt-10">
              <h2 className="font-serif text-[22px] font-bold">O knjizi</h2>
              <div className="prose-shop mt-3 max-w-[65ch] text-[15.5px] leading-relaxed text-ink/85">
                {product.description.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </section>
          )}

          {setItems.length > 0 && (
            <section className="mt-10">
              <h2 className="font-serif text-[22px] font-bold">Set sadrži</h2>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {setItems.map((b) => (
                  <li key={b.id} className="flex items-center gap-4 py-3">
                    <div className="w-12 shrink-0"><BookCover product={b} sizes="48px" /></div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/proizvod/${b.slug}`} className="font-semibold hover:text-accent">{b.title}</Link>
                      {b.author && <p className="text-[13px] text-muted">{b.author.name}</p>}
                    </div>
                    <span className="text-[14px] text-muted tabular-nums">{price(b.price)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[14px] text-muted">
                Pojedinačno: {price(setItems.reduce((s, b) => s + b.price, 0))}. U setu: <b className="text-ink">{price(product.price)}</b>.
              </p>
            </section>
          )}

          {inSets.length > 0 && (
            <p className="mt-8 rounded-xl bg-surface p-5 text-[14.5px]">
              Ova knjiga je dio seta{" "}
              {inSets.map((s, i) => (
                <span key={s.id}>{i > 0 && ", "}<Link href={`/proizvod/${s.slug}`} className="font-semibold link">{s.title}</Link></span>
              ))}{" "}
              po povoljnijoj cijeni.
            </p>
          )}

          {specs.length > 0 && (
            <section className="mt-10">
              <h2 className="font-serif text-[22px] font-bold">Dodatne informacije</h2>
              <table className="mt-4 w-full text-[14.5px]">
                <tbody>
                  {specs.map(([k, v]) => (
                    <tr key={k} className="border-b border-line">
                      <th scope="row" className="w-[40%] py-2.5 pr-4 text-left font-medium text-muted">{k}</th>
                      <td className="py-2.5">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </div>
      </div>

      {related.items.filter((r) => r.id !== product.id).length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 font-serif text-[30px] font-bold">Srodni naslovi</h2>
          <ProductGrid products={related.items.filter((r) => r.id !== product.id).slice(0, 4)} />
        </section>
      )}
    </div>
  );
}
