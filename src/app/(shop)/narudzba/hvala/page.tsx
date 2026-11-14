import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { shop } from "@/shop.config";

export const metadata: Metadata = { title: "Hvala na narudžbi", robots: { index: false } };
type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function Page({ searchParams }: { searchParams: SP }) {
  const { broj } = await searchParams;
  return (
    <div className="container-x max-w-[680px] pt-16 text-center">
      <CheckCircle2 size={44} className="mx-auto text-success" />
      <h1 className="mt-5 font-serif text-[clamp(30px,4.5vw,42px)] font-bold">Hvala, narudžba je primljena.</h1>
      {broj && <p className="mt-3 text-[17px]">Broj narudžbe: <b className="tabular-nums">#{broj}</b></p>}
      <p className="mx-auto mt-5 max-w-[52ch] text-ink/75">
        Potvrdu smo poslali na Vaš e-mail. Paket šaljemo kurirskom službom ({shop.shipping.deliveryTime}), a iznos plaćate kuriru pri preuzimanju.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Link href="/nalog" className="btn btn-dark">Pratite narudžbu</Link>
        <Link href="/knjige" className="btn btn-outline">Nastavite kupovinu</Link>
      </div>
    </div>
  );
}
