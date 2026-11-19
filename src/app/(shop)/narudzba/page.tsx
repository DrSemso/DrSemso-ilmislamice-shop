import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { CURRENCY_COOKIE } from "@/lib/currency-cookie";
import { getSession } from "@/lib/auth";
import { shop } from "@/shop.config";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = { title: "Narudžba", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getSession();
  const p = session?.profile;
  // No saved address: guess the country from the visitor's location, or from the currency they picked.
  const geo = (await headers()).get("x-vercel-ip-country") ?? ((await cookies()).get(CURRENCY_COOKIE)?.value === "EUR" ? "BA" : "RS");
  const geoCountry = ({ RS: "Srbija", BA: "Bosna i Hercegovina", ME: "Crna Gora", HR: "Hrvatska", XK: "Kosovo", MK: "Makedonija", SI: "Slovenija", AT: "Austrija", DE: "Njemačka", CH: "Švicarska" } as Record<string, string>)[geo] ?? "Drugo";
  const known = (c?: string | null) => (c && (shop.shipping.countries as readonly string[]).includes(c) ? c : null);
  return (
    <div className="container-x pt-10">
      <h1 className="font-serif text-[clamp(32px,4.5vw,44px)] font-bold">Narudžba</h1>
      <p className="mt-2 text-muted">
        {session ? `Prijavljeni ste kao ${session.email}.` : "Nalog nije potreban. Potvrdu narudžbe šaljemo na Vaš e-mail."}
      </p>
      <CheckoutForm
        loggedIn={Boolean(session)}
        defaults={{
          email: session?.email ?? "",
          full_name: p?.full_name ?? "",
          phone: p?.phone ?? "",
          address: p?.address ?? "",
          city: p?.city ?? "",
          postal_code: p?.postal_code ?? "",
          country: known(p?.country) ?? known(geoCountry) ?? shop.shipping.countries[0],
        }}
      />
    </div>
  );
}
