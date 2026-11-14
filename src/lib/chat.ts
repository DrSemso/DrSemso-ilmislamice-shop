import "server-only";
import { shop } from "@/shop.config";
import { fold, getProducts } from "./data";
import { money, price } from "./format";

/** Answer from the FAQ when no AI key is configured: pick the entry sharing the most words with the question. */
const STOP = new Set(["imate", "imali", "knjigu", "knjiga", "knjige", "trazim", "preporucite", "preporuka", "molim", "koja", "koju", "neku", "nesto", "mogu", "kako", "koliko", "zelim"]);

export function faqAnswer(question: string): string | null {
  const words = new Set(fold(question).split(/[^a-z0-9]+/).filter((w) => w.length > 3 && !STOP.has(w)));
  let best: { a: string; score: number } | null = null;
  for (const { q, a } of shop.faq) {
    const score = fold(q + " " + a)
      .split(/[^a-z0-9]+/)
      .filter((w, i, arr) => w.length > 3 && arr.indexOf(w) === i && [...words].some((x) => w.startsWith(x.slice(0, 5))))
      .length;
    if (score > 0 && (!best || score > best.score)) best = { a, score };
  }
  return best?.a ?? null;
}

/** System prompt for the AI assistant: who it is, shop facts, FAQ and the current catalog. */
export async function systemPrompt() {
  const { items } = await getProducts({ limit: 300, sort: "naziv" });
  const catalog = items
    .map(
      (p) =>
        `- ${p.title}${p.author ? ` (${p.author.name})` : ""} | ${price(p.price)} | ${p.stock > 0 ? "na stanju" : "rasprodato"} | /proizvod/${p.slug}`,
    )
    .join("\n");
  return `Ti si ljubazni asistent online knjižare "${shop.name}" (${shop.tagline}).
Odgovaraj kratko (2 do 4 rečenice), na bosanskom jeziku, ijekavicom, i obraćaj se kupcu sa "Vi".
Pomažeš kupcima da nađu knjigu, objašnjavaš naručivanje, plaćanje i dostavu. Preporučuj samo knjige iz kataloga ispod i uz preporuku daj link.
Ako nešto ne znaš (npr. status konkretne narudžbe ili knjigu koje nema u katalogu), reci to iskreno i uputi kupca na e-mail ${shop.contact.email} ili WhatsApp ${shop.contact.phone}.
Ne izmišljaj cijene, rokove ni pravila. Na vjerska pitanja koja traže fetvu ne odgovaraj, nego uputi na nadležnog imama ili učenjaka.

Činjenice o trgovini:
- Plaćanje: isključivo pouzećem (kupac plaća kuriru pri preuzimanju).
- Cijene: u Srbiji u dinarima, za ostale zemlje u eurima (din / ${shop.currency.eurRate}). Dostava: Srbija ${money(shop.shipping.RSD.price, "RSD")} (besplatna iznad ${money(shop.shipping.RSD.freeFrom, "RSD")}), ostale zemlje ${money(shop.shipping.EUR.price, "EUR")} (besplatna iznad ${money(shop.shipping.EUR.freeFrom, "EUR")}); rok ${shop.shipping.deliveryTime}.
- Naručivanje je moguće i bez korisničkog računa.

Česta pitanja:
${shop.faq.map((f) => `P: ${f.q}\nO: ${f.a}`).join("\n")}

Katalog:
${catalog}`;
}

/** Without AI: look for books whose title, author or publisher matches a word from the question. */
export async function catalogAnswer(question: string): Promise<string | null> {
  const words = fold(question).split(/[^a-z0-9]+/).filter((w) => w.length > 3 && !STOP.has(w));
  const found = new Map<string, Awaited<ReturnType<typeof getProducts>>["items"][number]>();
  if (fold(question).includes("preporu")) {
    (await getProducts({ featured: true, limit: 3, sort: "popularno" })).items.forEach((p) => found.set(p.id, p));
  }
  for (const w of words.slice(0, 5)) {
    const { items } = await getProducts({ q: w, limit: 3 });
    items.forEach((p) => found.set(p.id, p));
  }
  if (!found.size) return null;
  const list = [...found.values()].slice(0, 3);
  return `Pronašao sam u ponudi:\n${list
    .map((p) => `• ${p.title}${p.author ? `, ${p.author.name}` : ""}: ${price(p.price)} /proizvod/${p.slug}`)
    .join("\n")}`;
}
