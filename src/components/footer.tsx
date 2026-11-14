import Link from "next/link";
import { shop } from "@/shop.config";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-24 bg-dark text-on-dark">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo light />
          <p className="max-w-[32ch] text-[14px] text-on-dark/70">{shop.tagline}. Plaćanje pouzećem, dostava kurirskom službom.</p>
          <p className="font-arabic text-[34px] leading-none text-accent">{shop.arabicMark}</p>
        </div>
        <div>
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-on-dark/60">Ponuda</p>
          <ul className="space-y-2 text-[14px]">
            {shop.nav.map((n) => (
              <li key={n.href}><Link href={n.href} className="hover:text-accent">{n.label}</Link></li>
            ))}
            <li><Link href="/akcija" className="hover:text-accent">Na popustu</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-on-dark/60">Kupovina</p>
          <ul className="space-y-2 text-[14px]">
            <li><Link href="/dostava-i-placanje" className="hover:text-accent">Dostava i plaćanje</Link></li>
            <li><Link href="/cesta-pitanja" className="hover:text-accent">Česta pitanja</Link></li>
            <li><Link href="/nalog" className="hover:text-accent">Moj račun</Link></li>
            <li><Link href="/korpa" className="hover:text-accent">Korpa</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-on-dark/60">Kontakt</p>
          <ul className="space-y-2 text-[14px] text-on-dark/85">
            <li>{shop.contact.email}</li>
            <li>{shop.contact.phone}</li>
            <li><a href={`https://wa.me/${shop.contact.whatsapp}`} className="hover:text-accent">WhatsApp</a></li>
            <li><a href={shop.contact.instagram} className="hover:text-accent">Instagram</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-wrap justify-between gap-2 py-5 text-[12.5px] text-on-dark/55">
          <span>© {new Date().getFullYear()} {shop.name}</span>
          <span>Plaćanje isključivo pouzećem</span>
        </div>
      </div>
    </footer>
  );
}
