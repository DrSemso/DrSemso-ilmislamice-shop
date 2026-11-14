import { shop } from "@/shop.config";

// Formatted by hand so server and browser always agree (1.234,50 KM), whatever locale data is installed.
export function price(n: number) {
  const [int, dec] = Math.abs(n).toFixed(2).split(".");
  return `${n < 0 ? "−" : ""}${int.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${dec} ${shop.currency}`;
}

export function discountPercent(price: number, compareAt: number | null) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round((1 - price / compareAt) * 100);
}

export function shippingFor(subtotal: number) {
  if (subtotal <= 0) return 0;
  if (shop.shipping.freeFrom && subtotal >= shop.shipping.freeFrom) return 0;
  return shop.shipping.price;
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
