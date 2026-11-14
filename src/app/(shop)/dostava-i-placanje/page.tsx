import type { Metadata } from "next";
import { shop } from "@/shop.config";
import { price } from "@/lib/format";

export const metadata: Metadata = { title: "Dostava i plaćanje" };

export default function Page() {
  return (
    <article className="container-x max-w-[760px] pt-12">
      <p className="eyebrow">Kupovina</p>
      <h1 className="mt-2 font-serif text-[clamp(32px,4.5vw,46px)] font-bold">Dostava i plaćanje</h1>
      <div className="prose-shop mt-8 space-y-8 text-[16px] leading-relaxed text-ink/85">
        <section>
          <h2 className="mb-2 font-serif text-[22px] font-bold text-ink">Plaćanje pouzećem</h2>
          <p>Sve narudžbe plaćate pouzećem: iznos predajete kuriru gotovinom kad Vam paket stigne. Ne tražimo podatke o kartici niti online plaćanje.</p>
        </section>
        <section>
          <h2 className="mb-2 font-serif text-[22px] font-bold text-ink">Cijena i rok dostave</h2>
          <p>Dostava kurirskom službom košta {price(shop.shipping.price)}{shop.shipping.freeFrom ? `, a za narudžbe iznad ${price(shop.shipping.freeFrom)} je besplatna` : ""}. Paket obično stiže za {shop.shipping.deliveryTime} od potvrde narudžbe.</p>
          <p>Dostavljamo u: {shop.shipping.countries.filter((c) => c !== "Drugo").join(", ")}. Za druge zemlje nam se javite pa ćemo dogovoriti dostavu.</p>
        </section>
        <section>
          <h2 className="mb-2 font-serif text-[22px] font-bold text-ink">Povrat</h2>
          <p>Knjigu možete vratiti u roku od 14 dana od prijema ako nije oštećena. Javite nam se na {shop.contact.email} ili WhatsApp {shop.contact.phone}.</p>
        </section>
      </div>
    </article>
  );
}
