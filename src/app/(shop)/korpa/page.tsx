import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = { title: "Korpa", robots: { index: false } };

export default function Page() {
  return (
    <div className="container-x pt-10">
      <h1 className="font-serif text-[clamp(32px,4.5vw,44px)] font-bold">Korpa</h1>
      <CartView />
    </div>
  );
}
