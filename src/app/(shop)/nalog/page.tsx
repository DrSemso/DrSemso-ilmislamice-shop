import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { isDemo } from "@/lib/env";
import { createSupabaseServer } from "@/lib/supabase/server";
import { LoginForm } from "@/components/login-form";
import { ProfileForm } from "@/components/profile-form";
import { date, money } from "@/lib/format";
import { ORDER_STATUS_LABEL, type Order } from "@/lib/types";

export const metadata: Metadata = { title: "Moj račun", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="container-x grid gap-12 pt-14 md:grid-cols-2">
        <div>
          <p className="eyebrow">Moj račun</p>
          <h1 className="mt-3 font-serif text-[clamp(34px,4.5vw,48px)] font-bold leading-[1.08]">Vaše narudžbe na jednom mjestu.</h1>
          <p className="mt-5 text-[16px] text-ink/80">Prijavite se e-mail adresom koju ste koristili pri naručivanju.</p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-[15.5px] text-ink/80">
            <li>Unesite svoju e-mail adresu.</li>
            <li>Potvrdite prijavu kodom koji dobijete e-mailom.</li>
          </ol>
          <div className="mt-8 rounded-xl bg-surface p-6">
            <p className="font-semibold">Želite samo naručiti knjigu?</p>
            <p className="mt-2 text-ink/80">Možete naručiti i bez prijave.</p>
            <Link href="/knjige" className="mt-3 inline-block link">Razgledajte knjige →</Link>
          </div>
        </div>
        <div className="h-fit border border-line bg-white p-7 sm:p-9">
          <h2 className="mb-6 font-serif text-[24px] font-bold">Prijava</h2>
          <LoginForm demo={isDemo} />
        </div>
      </div>
    );
  }

  const supabase = await createSupabaseServer();
  const { data } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
  const orders = (data ?? []) as Order[];

  return (
    <div className="container-x pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="eyebrow">Moj račun</p>
          <h1 className="mt-2 font-serif text-[clamp(32px,4.5vw,44px)] font-bold">Selam{session.profile?.full_name ? `, ${session.profile.full_name.split(" ")[0]}` : ""}</h1>
          <p className="mt-1 text-muted">{session.email}</p>
        </div>
        <div className="flex gap-3">
          {session.isAdmin && <Link href="/admin" className="btn btn-accent">Admin panel</Link>}
          <form action="/odjava" method="post"><button className="btn btn-outline">Odjava</button></form>
        </div>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
        <section className="min-w-0">
          <h2 className="font-serif text-[24px] font-bold">Narudžbe</h2>
          {orders.length === 0 ? (
            <p className="mt-4 text-muted">Još nemate narudžbi. <Link href="/knjige" className="link">Pogledajte knjige</Link></p>
          ) : (
            <ul className="mt-5 space-y-4">
              {orders.map((o) => (
                <li key={o.id} className="border border-line bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">Narudžba #{o.number} <span className="font-normal text-muted">· {date(o.created_at)}</span></p>
                    <span className="rounded-full bg-surface px-3 py-1 text-[12.5px] font-semibold">{ORDER_STATUS_LABEL[o.status]}</span>
                  </div>
                  <ul className="mt-3 space-y-1 text-[14px] text-ink/80">
                    {o.order_items?.map((i) => (
                      <li key={i.id} className="flex justify-between gap-4"><span>{i.title} × {i.quantity}</span><span className="tabular-nums">{money(Number(i.price) * i.quantity, o.currency)}</span></li>
                    ))}
                  </ul>
                  <p className="mt-3 flex justify-between border-t border-line pt-3 text-[14.5px] font-semibold">
                    <span>Ukupno (pouzećem)</span><span className="tabular-nums">{money(Number(o.total), o.currency)}</span>
                  </p>
                  {o.tracking_number && <p className="mt-2 text-[13.5px] text-muted">Broj pošiljke: {o.tracking_number}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h2 className="font-serif text-[24px] font-bold">Podaci za dostavu</h2>
          <p className="mt-1 text-[14px] text-muted">Popunjavaju se automatski pri sljedećoj narudžbi.</p>
          <ProfileForm profile={session.profile} />
        </section>
      </div>
    </div>
  );
}
