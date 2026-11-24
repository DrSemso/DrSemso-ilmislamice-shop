import { Truck } from "lucide-react";
import { money, type Currency } from "@/lib/format";
import { shop } from "@/shop.config";

/** Progress towards free shipping for a subtotal already in `cur`. Renders nothing where there is no free-shipping threshold. */
export function FreeShippingBar({ subtotal, cur }: { subtotal: number; cur: Currency }) {
  const from = shop.shipping[cur].freeFrom;
  if (!from || shop.shipping[cur].price == null) return null;
  const left = Math.max(0, from - subtotal);
  const pct = Math.min(100, Math.round((subtotal / from) * 100));
  return (
    <div className="rounded-[3px] border border-line bg-card p-3.5">
      <p className="flex items-start gap-2 text-[13.5px] leading-snug">
        <Truck size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />
        {left > 0 ? (
          <span>
            Još <b className="tabular-nums">{money(left, cur)}</b> do besplatne dostave
            <span className="text-muted"> (besplatna iznad {money(from, cur)})</span>
          </span>
        ) : (
          <span className="font-semibold text-success">Ostvarili ste besplatnu dostavu!</span>
        )}
      </p>
      <div
        role="progressbar"
        aria-label="Do besplatne dostave"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="mt-2.5 h-2 overflow-hidden rounded-full bg-surface-2"
      >
        <div className={`h-full rounded-full transition-[width] duration-500 ${left > 0 ? "bg-accent" : "bg-success"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
