// Generates src/lib/demo-catalog.json: example catalog used when Supabase isn't configured
// and as seed data (scripts/seed.mjs). Edit the lists below, then: node scripts/build-demo-catalog.mjs
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";

const uuid = (s) => {
  const h = createHash("sha1").update("ilm:" + s).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
};
const slug = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "dj")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const cats = [
  ["Knjige", null, "Sve knjige iz naše ponude."],
  ["Kur'an i tefsir", "Knjige"], ["Hadis", "Knjige"], ["Akaid", "Knjige"],
  ["Sira i historija", "Knjige"], ["Ahlak i duhovnost", "Knjige"], ["Fikh", "Knjige"],
  ["Knjige za djecu", "Knjige"], ["Porodica i odgoj", "Knjige"],
];
const categories = cats.map(([name, parent, description], i) => ({
  id: uuid("cat:" + name), name, slug: slug(name), parent_id: parent ? uuid("cat:" + parent) : null,
  description: description ?? null, sort: i,
}));

const pubs = ["Bookline", "Libris", "Ilum", "Dobra knjiga", "Kelimeh"];
const publishers = pubs.map((name) => ({ id: uuid("pub:" + name), name, slug: slug(name), description: null, logo_url: null }));

const auths = [
  ["Ibn Kesir", "Ismail ibn Kesir (1300–1373), mufessir i historičar iz Damaska."],
  ["Safijurrahman Mubarekfuri", "Autor nagrađivanog životopisa Poslanika ﷺ 'Zapečaćeni džennetski napitak'."],
  ["Aid el-Karni", "Savremeni saudijski autor i predavač."],
  ["Ibn Kajjim el-Dževzijje", "Klasični učenjak (1292–1350), autor brojnih djela o duhovnosti."],
  ["Imam Nevevi", "Jahja ibn Šeref en-Nevevi (1233–1277), muhaddis i pravnik."],
  ["Muhammed el-Gazali", "Egipatski učenjak i pisac 20. stoljeća."],
  ["Grupa autora", null],
];
const authors = auths.map(([name, bio]) => ({ id: uuid("aut:" + name), name, slug: slug(name), bio, photo_url: null }));

const P = (title, o) => ({
  id: uuid("prod:" + title), title, slug: slug(title), description: o.d ?? null,
  // Example prices are written in KM-like units; the shop is priced in dinars (×100, e.g. 18 → 1.800 din = 15 €).
  price: o.p * 100, compare_at_price: o.c ? o.c * 100 : null, stock: o.s ?? 10, sku: o.sku ?? null, isbn: o.isbn ?? null,
  pages: o.pages ?? null, binding: o.b ?? "Tvrdi uvez", year: o.y ?? 2024, translator: o.t ?? null,
  dimensions: o.dim ?? "17 × 24 cm", cover_url: null, images: [],
  category_id: uuid("cat:" + o.cat), publisher_id: uuid("pub:" + o.pub), author_id: uuid("aut:" + o.a),
  is_set: !!o.set, is_featured: !!o.f, is_new: !!o.n, active: true,
  created_at: new Date(Date.UTC(2026, 9, 1 + (o.age ?? 0))).toISOString(),
});
const products = [
  P("Tefsir Ibn Kesir, 1. tom", { p: 32, cat: "Kur'an i tefsir", pub: "Libris", a: "Ibn Kesir", pages: 680, f: 1, n: 1, age: 30,
    d: "Prvi tom jednog od najčitanijih klasičnih tefsira, u kojem autor Kur'an tumači Kur'anom, hadisom i riječima ashaba." }),
  P("Zapečaćeni džennetski napitak", { p: 28, c: 34, cat: "Sira i historija", pub: "Bookline", a: "Safijurrahman Mubarekfuri", pages: 520, f: 1, age: 20,
    d: "Nagrađivani životopis Poslanika Muhammeda ﷺ, od rođenja do preseljenja na ahiret, pisan jasno i pregledno." }),
  P("Ne tuguj", { p: 18, cat: "Ahlak i duhovnost", pub: "Kelimeh", a: "Aid el-Karni", pages: 456, b: "Meki uvez", f: 1, n: 1, age: 28,
    d: "Knjiga o nadi, strpljenju i zadovoljstvu Allahovom odredbom, koja je milionima čitalaca pomogla da se nose s brigama." }),
  P("Rijadus-salihin", { p: 35, cat: "Hadis", pub: "Libris", a: "Imam Nevevi", pages: 740, f: 1, age: 10,
    d: "Zbirka vjerodostojnih hadisa o ahlaku, ibadetu i svakodnevnom životu muslimana, razvrstanih po poglavljima." }),
  P("Lijek za srčane bolesti", { p: 16, c: 19, cat: "Ahlak i duhovnost", pub: "Ilum", a: "Ibn Kajjim el-Dževzijje", pages: 210, b: "Meki uvez", age: 15,
    d: "Klasično djelo o bolestima srca poput zavisti, oholosti i pohlepe, i načinima da se od njih izliječi." }),
  P("Akaid za početnike", { p: 14, cat: "Akaid", pub: "Dobra knjiga", a: "Grupa autora", pages: 160, b: "Meki uvez", n: 1, age: 29,
    d: "Pregledan uvod u islamsko vjerovanje: šest ruševa imana, tevhid i osnovni pojmovi akaida." }),
  P("Četrdeset hadisa", { p: 12, cat: "Hadis", pub: "Bookline", a: "Imam Nevevi", pages: 140, b: "Meki uvez", age: 5,
    d: "Četrdeset dva hadisa koja obuhvataju temelje vjere, s kratkim komentarom uz svaki hadis." }),
  P("Fikh namaza", { p: 15, cat: "Fikh", pub: "Ilum", a: "Grupa autora", pages: 190, b: "Meki uvez", age: 8,
    d: "Praktičan priručnik o namazu: uvjeti, ruknovi, sunneti i najčešće greške." }),
  P("Priče o poslanicima za djecu", { p: 22, cat: "Knjige za djecu", pub: "Dobra knjiga", a: "Grupa autora", pages: 96, dim: "21 × 28 cm", n: 1, f: 1, age: 27,
    d: "Ilustrovane priče o Allahovim poslanicima, pisane jednostavnim jezikom za djecu od 5 do 10 godina." }),
  P("Odgoj djeteta u islamu", { p: 20, cat: "Porodica i odgoj", pub: "Kelimeh", a: "Grupa autora", pages: 280, b: "Meki uvez", age: 12,
    d: "Savjeti roditeljima o odgoju djece od najranije dobi, utemeljeni na Kur'anu i sunnetu." }),
  P("Fikhus-sira", { p: 24, cat: "Sira i historija", pub: "Libris", a: "Muhammed el-Gazali", pages: 410, age: 3,
    d: "Životopis Poslanika ﷺ s naglaskom na pouke koje iz njegovog života izvlači savremeni čitalac." }),
  P("Put ka Allahu", { p: 17, cat: "Ahlak i duhovnost", pub: "Ilum", a: "Ibn Kajjim el-Dževzijje", pages: 230, b: "Meki uvez", s: 0, age: 1,
    d: "Odabrana poglavlja o pokajanju, ljubavi prema Allahu i putu duhovnog uzdizanja." }),
  P("Set: Temelji vjere", { p: 38, c: 44, cat: "Knjige", pub: "Dobra knjiga", a: "Grupa autora", set: 1, f: 1, age: 26,
    d: "Tri knjige za one koji žele sistematski naučiti osnove vjere: akaid, hadis i fikh namaza." }),
  P("Set: Sira", { p: 46, c: 52, cat: "Knjige", pub: "Libris", a: "Grupa autora", set: 1, age: 22,
    d: "Dva najčitanija životopisa Poslanika ﷺ u jednom setu, po povoljnijoj cijeni." }),
];
const set_items = [
  ["Set: Temelji vjere", ["Akaid za početnike", "Četrdeset hadisa", "Fikh namaza"]],
  ["Set: Sira", ["Zapečaćeni džennetski napitak", "Fikhus-sira"]],
].flatMap(([s, items]) => items.map((t) => ({ set_id: uuid("prod:" + s), product_id: uuid("prod:" + t) })));

writeFileSync(new URL("../src/lib/demo-catalog.json", import.meta.url),
  JSON.stringify({ categories, publishers, authors, products, set_items }, null, 2));
console.log(`demo catalog: ${categories.length} categories, ${products.length} products`);
