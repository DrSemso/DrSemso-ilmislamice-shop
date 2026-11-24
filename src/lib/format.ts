import { shop } from "@/shop.config";

export type Currency = "RSD" | "EUR";
export const CURRENCIES: Currency[] = ["RSD", "EUR"];

/** Catalog prices are stored in dinars; euros are din / eurRate, rounded to cents. */
export function convert(base: number, cur: Currency) {
  return cur === "RSD" ? base : Math.round((base / shop.currency.eurRate) * 100) / 100;
}

/** Orders shipped to the home country are charged in dinars, everywhere else in euros. */
export function currencyForCountry(country: string): Currency {
  return country === shop.currency.homeCountry ? "RSD" : "EUR";
}

// Formatted by hand so server and browser always agree (1.800 din, 15,00 €), whatever locale data is installed.
export function money(n: number, cur: Currency) {
  const digits = cur === "RSD" ? 0 : 2;
  const [int, dec] = Math.abs(n).toFixed(digits).split(".");
  const num = `${n < 0 ? "−" : ""}${int.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${dec ? `,${dec}` : ""}`;
  return cur === "RSD" ? `${num} din` : `${num} €`;
}

/** A catalog (dinar) price as text in the given currency, or in both ("1.800 din / 15,00 €"). */
export function price(base: number, cur?: Currency) {
  if (cur) return money(convert(base, cur), cur);
  return `${money(base, "RSD")} / ${money(convert(base, "EUR"), "EUR")}`;
}

export function discountPercent(price: number, compareAt: number | null) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round((1 - price / compareAt) * 100);
}

/** Shipping for a subtotal that is already in `cur`. null = price by agreement (shop calls the customer). */
export function shippingFor(subtotal: number, cur: Currency): number | null {
  const rule = shop.shipping[cur];
  if (subtotal <= 0) return 0;
  if (rule.price == null) return null;
  if (rule.freeFrom && subtotal >= rule.freeFrom) return 0;
  return rule.price;
}

/** Gift wrapping price in the given currency. */
export function giftWrapFor(cur: Currency) {
  return shop.giftWrap[cur];
}

/** "600 din", "Besplatna" or "Po dogovoru". */
export function shippingLabel(n: number | null, cur: Currency) {
  if (n == null) return "Po dogovoru";
  return n === 0 ? "Besplatna" : money(n, cur);
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/đ/g, "dj")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function date(iso: string) {
  return new Date(iso).toLocaleDateString("bs-BA", { day: "numeric", month: "long", year: "numeric" });
}

/** Parses a typed amount: "1800", "1.800", "1.800,50", "18,50" and "18.50" all work. */
export function parseAmount(text: string) {
  let t = text.replace(/\s|din|€/gi, "");
  if (!t) return null;
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, "");
  return Number(t);
}
