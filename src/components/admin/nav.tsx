"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookOpen, FolderTree, Home, Inbox, Menu, MessageSquare, PenLine, Store, Users } from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "Pregled", icon: Home },
  { href: "/admin/narudzbe", label: "Narudžbe", icon: Inbox },
  { href: "/admin/proizvodi", label: "Proizvodi", icon: BookOpen },
  { href: "/admin/kategorije", label: "Kategorije", icon: FolderTree },
  { href: "/admin/izdavaci", label: "Izdavači", icon: PenLine },
  { href: "/admin/autori", label: "Autori", icon: Users },
  { href: "/admin/poruke", label: "Poruke iz chata", icon: MessageSquare },
];

export function AdminNav({ email, demo }: { email: string; demo: boolean }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/admin" ? path === href : path.startsWith(href));
  return (
    <aside className="sticky top-0 z-30 bg-dark text-on-dark lg:h-screen">
      <div className="flex items-center justify-between px-5 py-4 lg:py-6">
        <Link href="/admin" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-badge-160.png" alt="" width={30} height={30} className="h-[30px] w-[30px]" />
          <span className="font-serif text-[20px] font-bold">ILM <span className="text-[12px] font-normal text-on-dark/60">admin</span></span>
        </Link>
        <button className="p-2 lg:hidden" aria-label="Meni" onClick={() => setOpen((o) => !o)}><Menu size={20} /></button>
      </div>
      <nav className={`${open ? "block" : "hidden"} px-3 pb-4 lg:block`}>
        <ul className="space-y-0.5">
          {ITEMS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-[3px] px-3 py-2.5 text-[14.5px] ${active(href) ? "bg-white/10 text-white" : "text-on-dark/75 hover:bg-white/5 hover:text-white"}`}
              >
                <Icon size={17} className={active(href) ? "text-accent" : ""} /> {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-2 border-t border-white/10 px-3 pt-5 text-[13px] text-on-dark/60">
          <Link href="/" className="flex items-center gap-2 hover:text-white"><Store size={15} /> Otvori trgovinu</Link>
          <p className="truncate">{email}</p>
          {!demo && (
            <form action="/odjava" method="post"><button className="hover:text-white">Odjava</button></form>
          )}
        </div>
      </nav>
    </aside>
  );
}
