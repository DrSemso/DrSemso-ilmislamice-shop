import type { Metadata } from "next";
import { shop } from "@/shop.config";
import { Faq } from "@/components/faq";

export const metadata: Metadata = { title: "Česta pitanja" };

export default function Page() {
  return (
    <div className="container-x max-w-[820px] pt-12">
      <p className="eyebrow">Pomoć</p>
      <h1 className="mb-10 mt-2 font-serif text-[clamp(32px,4.5vw,46px)] font-bold">Česta pitanja</h1>
      <Faq items={shop.faq} />
    </div>
  );
}
