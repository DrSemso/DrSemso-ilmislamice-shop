"use client";

import { CURRENCY_COOKIE } from "@/lib/currency-cookie";
import type { Currency } from "@/lib/format";

function pick(cur: Currency) {
  document.cookie = `${CURRENCY_COOKIE}=${cur}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.dataset.cur = cur;
}

export function CurrencySwitch({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 text-[12.5px] ${className}`} role="group" aria-label="Valuta">
      <button type="button" onClick={() => pick("RSD")} className="sw-rsd px-1 opacity-60 hover:opacity-100">din</button>
      <span className="opacity-40">/</span>
      <button type="button" onClick={() => pick("EUR")} className="sw-eur px-1 opacity-60 hover:opacity-100">€</button>
    </div>
  );
}
