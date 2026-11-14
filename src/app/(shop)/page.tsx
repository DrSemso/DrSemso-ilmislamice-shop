import Link from "next/link";
import { ArrowRight, BookOpen, Package, ShieldCheck, Truck } from "lucide-react";
import { shop } from "@/shop.config";
import { getCategories, getProducts } from "@/lib/data";
import { ProductGrid } from "@/components/product-card";
import { BookCover } from "@/components/book-cover";
import { StarMark } from "@/components/logo";
import { Faq } from "@/components/faq";
import { CategoryTile } from "@/components/category-tile";

export const revalidate = 300;

export default async function Home() {
  const [categories, newest, featured, sets, sale] = await Promise.all([
    getCategories(),
    getProducts({ isNew: true, isSet: false, limit: 6 }),
    getProducts({ featured: true, isSet: false, limit: 6, sort: "popularno" }),
    getProducts({ isSet: true, limit: 6 }),
    getProducts({ onSale: true, limit: 6 }),
  ]);
  const root = categories.find((c) => c.slug === "knjige");
  const tiles = categories.filter((c) => c.parent_id === root?.id).slice(0, 8);
  const heroBooks = featured.items.slice(0, 3);
  const icons = [Package, Truck, ShieldCheck, BookOpen];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface">
        <div className="container-x relative grid items-center gap-12 py-12 md:grid-cols-[1.1fr_1fr] md:py-24">
          <div className="relative z-10">
            <p className="eyebrow">{shop.hero.eyebrow}</p>
            <h1 className="mt-4 font-serif text-[clamp(40px,6vw,68px)] font-bold leading-[1.02] tracking-tight">{shop.hero.title}</h1>
            <p className="mt-6 max-w-[48ch] text-[17px] leading-relaxed text-ink/75">{shop.hero.text}</p>
            <div className="mt-8 flex flex-wrap gap-3 md:mt-9">
              <Link href={shop.hero.primary.href} className="btn btn-dark px-5 py-3.5 text-[15px] sm:px-7">
                {shop.hero.primary.label} <ArrowRight size={16} />
              </Link>
              <Link href={shop.hero.secondary.href} className="btn btn-outline px-5 py-3.5 text-[15px] sm:px-7">
                {shop.hero.secondary.label}
              </Link>
            </div>
          </div>
          {/* Mobile: a faint watermark behind the text (keeps the hero short). Desktop: the full emblem with books. */}
          <div
            className="pointer-events-none absolute -right-20 top-1/2 aspect-square w-[340px] -translate-y-1/2 opacity-[0.22] md:relative md:right-auto md:top-auto md:mx-auto md:w-full md:max-w-[460px] md:translate-y-0 md:opacity-100"
            aria-hidden="true"
          >
            <StarMark size={460} ring={false} className="absolute inset-0 h-full w-full text-accent/30" />
            <p className="absolute inset-x-0 top-[17%] text-center font-arabic text-[clamp(44px,7vw,72px)] leading-none text-accent">
              {shop.arabicMark}
            </p>
            <div className="absolute inset-x-[12%] bottom-[10%] hidden items-end justify-center md:flex">
              {heroBooks.map((b, i) => (
                <div
                  key={b.id}
                  className="w-[34%] shadow-[0_18px_30px_-12px_rgba(0,0,0,.45)]"
                  style={{ transform: `rotate(${(i - 1) * 7}deg) translateY(${i === 1 ? -14 : 0}px)`, marginInline: "-3%", zIndex: i === 1 ? 2 : 1 }}
                >
                  <BookCover product={b} sizes="160px" priority />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category tiles */}
      <section className="container-x py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Kategorije</p>
            <h2 className="mt-2 font-serif text-[32px] font-bold">Šta Vas zanima?</h2>
          </div>
          <Link href="/knjige" className="text-[14px] font-semibold link">Sve knjige</Link>
        </div>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {tiles.map((c, i) => (
            <li key={c.id}>
              <CategoryTile name={c.name} href={`/kategorija/${c.slug}`} index={i} />
            </li>
          ))}
        </ul>
      </section>

      <Shelf eyebrow="Novo u ponudi" title="Novi naslovi" href="/knjige?sort=novo" products={newest.items} />
      <Shelf eyebrow="Čitaoci preporučuju" title="Izdvojeno iz ponude" href="/knjige?sort=popularno" products={featured.items} />

      {sets.items.length > 0 && (
        <section className="mt-6 bg-surface py-16">
          <div className="container-x">
            <SectionHead eyebrow="Povoljnije u kompletu" title="Setovi knjiga" href="/setovi" />
            <ProductGrid products={sets.items} cols={6} />
          </div>
        </section>
      )}

      {sale.items.length > 0 && <Shelf eyebrow="Snižene cijene" title="Na popustu" href="/akcija" products={sale.items} />}

      {/* Advantages */}
      <section className="container-x py-16">
        <div className="grid gap-8 border-y border-line py-10 sm:grid-cols-2 lg:grid-cols-4">
          {shop.advantages.map((a, i) => {
            const Icon = icons[i % icons.length];
            return (
              <div key={a.title} className="flex gap-4">
                <Icon size={22} className="mt-0.5 shrink-0 text-accent" />
                <div>
                  <p className="font-semibold">{a.title}</p>
                  <p className="mt-1 text-[14px] text-muted">{a.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ + contact */}
      <section className="container-x grid gap-12 py-8 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="eyebrow">Pomoć</p>
          <h2 className="mt-2 font-serif text-[32px] font-bold">Česta pitanja o naručivanju i dostavi</h2>
          <div className="mt-8 rounded-xl bg-surface p-6">
            <p className="font-semibold">Niste pronašli odgovor?</p>
            <p className="mt-2 text-[14.5px] text-ink/75">Pišite nam u chatu u donjem desnom uglu, na WhatsApp ili e-mailom.</p>
            <p className="mt-4 text-[14.5px]">
              <a href={`https://wa.me/${shop.contact.whatsapp}`} className="link">WhatsApp {shop.contact.phone}</a>
              <br />
              <span>{shop.contact.email}</span>
            </p>
          </div>
        </div>
        <Faq items={shop.faq.slice(0, 6)} />
      </section>
    </>
  );
}

function SectionHead({ eyebrow, title, href }: { eyebrow: string; title: string; href: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 font-serif text-[32px] font-bold">{title}</h2>
      </div>
      <Link href={href} className="shrink-0 text-[14px] font-semibold link">Pogledajte sve</Link>
    </div>
  );
}

function Shelf({ eyebrow, title, href, products }: { eyebrow: string; title: string; href: string; products: import("@/lib/types").Product[] }) {
  if (!products.length) return null;
  return (
    <section className="container-x py-10">
      <SectionHead eyebrow={eyebrow} title={title} href={href} />
      <ProductGrid products={products} cols={6} />
    </section>
  );
}
