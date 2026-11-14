"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { shop } from "@/shop.config";
import { Logo } from "./logo";
import { useCart } from "./cart";
import { AccountDialog } from "./account-dialog";
import { AddedToCart } from "./added-to-cart";

type Sub = { name: string; slug: string };

export function HeaderClient({ subcats }: { subcats: Sub[] }) {
  const { count } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [mobile, setMobile] = useState(false);
  const [booksOpen, setBooksOpen] = useState(false);
  const [account, setAccount] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => setMobile(false), [pathname]);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/pretraga?q=${encodeURIComponent(q.trim())}`);
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  // Lock page scroll and allow Escape while the mobile menu is open.
  useEffect(() => {
    if (!mobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobile(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobile]);

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="container-x flex h-[76px] items-center gap-4">
        <button className="-ml-2 p-2 lg:hidden" aria-label="Otvori meni" onClick={() => setMobile(true)}>
          <Menu size={22} />
        </button>
        <Logo />
        <form onSubmit={search} className="mx-auto hidden w-full max-w-[460px] md:flex" role="search">
          <label htmlFor="q-desktop" className="sr-only">Pretraga</label>
          <input
            id="q-desktop"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Naslov, autor ili izdavač"
            className="input rounded-r-none border-r-0"
          />
          <button className="btn btn-dark rounded-l-none px-4" aria-label="Traži">
            <Search size={17} />
          </button>
        </form>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link href="/pretraga" className="p-2 md:hidden" aria-label="Pretraga">
            <Search size={21} />
          </Link>
          <button className="p-2" aria-label="Moj račun" onClick={() => setAccount(true)}>
            <User size={21} />
          </button>
          <Link href="/korpa" className="relative p-2" aria-label={`Korpa, ${count} artikala`}>
            <ShoppingBag size={21} />
            {count > 0 && (
              <span className="absolute right-0 top-0 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10.5px] font-bold text-accent-ink">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      <nav className="hidden border-t border-line lg:block" aria-label="Glavni meni">
        <ul className="container-x flex h-12 items-center gap-9 text-[14px] font-medium">
          {shop.nav.map((item) =>
            item.href === "/knjige" && subcats.length ? (
              <li key={item.href} className="group relative h-full">
                <Link href={item.href} className={`flex h-full items-center gap-1 border-b-2 ${isActive(item.href) || pathname.startsWith("/kategorija") ? "border-accent" : "border-transparent"} hover:border-accent`}>
                  {item.label} <ChevronDown size={14} className="text-muted" />
                </Link>
                <div className="invisible absolute left-0 top-full z-50 w-[520px] translate-y-1 border border-line bg-paper p-6 opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="eyebrow mb-3">Kategorije</p>
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {subcats.map((c) => (
                      <li key={c.slug}>
                        <Link href={`/kategorija/${c.slug}`} className="hover:text-accent">{c.name}</Link>
                      </li>
                    ))}
                  </ul>
                  <Link href="/knjige" className="mt-5 inline-block text-[13px] font-semibold link">Sve knjige →</Link>
                </div>
              </li>
            ) : (
              <li key={item.href} className="h-full">
                <Link href={item.href} className={`flex h-full items-center border-b-2 ${isActive(item.href) ? "border-accent" : "border-transparent"} hover:border-accent`}>
                  {item.label}
                </Link>
              </li>
            ),
          )}
          <li className="ml-auto h-full">
            <Link href="/akcija" className="flex h-full items-center text-accent hover:underline">Na popustu</Link>
          </li>
        </ul>
      </nav>
    </header>

      {/* Overlays live outside <header>: its backdrop-blur would trap position:fixed children inside the header box. */}
      {mobile && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Meni">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobile(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-[360px] flex-col overflow-y-auto bg-paper p-5">
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button className="p-2" aria-label="Zatvori meni" onClick={() => setMobile(false)}>
                <X size={22} />
              </button>
            </div>
            <form onSubmit={search} className="mb-6 flex" role="search">
              <label htmlFor="q-mobile" className="sr-only">Pretraga</label>
              <input id="q-mobile" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Naslov, autor ili izdavač" className="input rounded-r-none border-r-0" />
              <button className="btn btn-dark rounded-l-none px-4" aria-label="Traži"><Search size={17} /></button>
            </form>
            <ul className="divide-y divide-line border-y border-line text-[16px] font-medium">
              {shop.nav.map((item) => (
                <li key={item.href}>
                  {item.href === "/knjige" && subcats.length ? (
                    <>
                      <div className="flex items-center">
                        <Link href={item.href} className="block flex-1 py-3.5">{item.label}</Link>
                        <button
                          type="button"
                          className="-mr-2 p-3 text-muted"
                          aria-expanded={booksOpen}
                          aria-controls="m-subcats"
                          aria-label={booksOpen ? "Sakrij podkategorije" : "Prikaži podkategorije"}
                          onClick={() => setBooksOpen((o) => !o)}
                        >
                          <ChevronDown size={18} className={`transition-transform ${booksOpen ? "rotate-180" : ""}`} />
                        </button>
                      </div>
                      {booksOpen && (
                        <ul id="m-subcats" className="mb-3 ml-3 space-y-1 text-[15px] font-normal text-ink/75">
                          <li><Link href="/knjige" className="block py-1.5">Sve knjige</Link></li>
                          {subcats.map((c) => (
                            <li key={c.slug}><Link href={`/kategorija/${c.slug}`} className="block py-1.5">{c.name}</Link></li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link href={item.href} className="block py-3.5">{item.label}</Link>
                  )}
                </li>
              ))}
              <li><Link href="/akcija" className="block py-3.5 text-accent">Na popustu</Link></li>
              <li><Link href="/nalog" className="block py-3.5">Moj račun</Link></li>
            </ul>
          </div>
        </div>
      )}

      <AccountDialog open={account} onClose={() => setAccount(false)} />
      <AddedToCart />
    </>
  );
}
