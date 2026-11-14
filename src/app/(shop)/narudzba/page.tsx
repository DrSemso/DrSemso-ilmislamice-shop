import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = { title: "Narudžba", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getSession();
  const p = session?.profile;
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
          country: p?.country ?? "Bosna i Hercegovina",
        }}
      />
    </div>
  );
}
