import { convert, money } from "@/lib/format";

// Both currencies are rendered; CSS shows the visitor's one (html[data-cur], set before paint in the root layout).
// This keeps pages static/cacheable and avoids a flash of the wrong currency.
export function ByCur({ rsd, eur }: { rsd: React.ReactNode; eur: React.ReactNode }) {
  return (
    <>
      <span className="cur-rsd">{rsd}</span>
      <span className="cur-eur">{eur}</span>
    </>
  );
}

/** Amounts already in each currency. `zero` replaces a 0 amount (e.g. "Besplatna"). */
export function Dual({ rsd, eur, zero }: { rsd: number; eur: number; zero?: string }) {
  const show = (n: number, c: "RSD" | "EUR") => (zero !== undefined && n === 0 ? zero : money(n, c));
  return <ByCur rsd={show(rsd, "RSD")} eur={show(eur, "EUR")} />;
}

/** A catalog price (stored in dinars) in the visitor's currency. */
export function Price({ value }: { value: number }) {
  return <Dual rsd={value} eur={convert(value, "EUR")} />;
}
