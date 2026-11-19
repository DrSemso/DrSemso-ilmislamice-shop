// One-off catalog import from the partner shop kelimeh.org (Astro site, schema.org JSON-LD on every product page).
// POST { offset, limit } with an admin's Supabase access token. Reads the partner sitemap, imports products
// [offset, offset+limit): authors, publishers, category mapping, EUR price → dinars (× 120), cover copied to Storage.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SITE = "https://www.kelimeh.org";
const EUR_RATE = 120;
const ADMINS = ["fatih.lukarcanin000@gmail.com", "ilmislamiceshop@gmail.com"];
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info, x-import-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Partner category slug → our Knjige subcategory slug. Anything else goes to "ostalo".
const CAT: Record<string, string> = {};
const map = (ours: string, theirs: string[]) => theirs.forEach((t) => (CAT[t] = ours));
map("hadisi", ["hadis", "zbirke-hadisa", "izbori-hadisa", "hadiske-nauke"]);
map("fikh", ["ibadet-i-propisi", "namaz", "ramazan-post-zekat", "hadz-umra-kurban", "serijatsko-pravo", "halal-i-haram"]);
map("sira", ["sira", "kazivanja-o-vjerovjesnicima", "ashabi-i-ucenjaci", "poslanik-za-djecu"]);
map("kuran", ["kuran", "mushafi-i-prijevodi-kurana", "ucenje-kurana", "tefsir-i-tefsirska-nauka", "poruke-kurana"]);
map("istorija", ["historija-islama", "historija-i-civilizacija-islama", "bosnjaci-bih-sandzak", "historija-bosnjaka", "kulturna-bastina"]);
map("psihologija", ["psihologija", "sreca-i-motivacija", "psihologija-i-licni-razvoj"]);

const ENT: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", ndash: "–", mdash: "—", bdquo: "„", ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’" };
const decode = (s: string) =>
  s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) =>
    e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ENT[e] ?? m);
const text = (html: string) => decode(html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")).replace(/[ \t]+/g, " ").trim();
const slugOf = (url?: string) => (url ? url.replace(/\/+$/, "").split("/").pop()! : "");
const slugify = (s: string) =>
  s.toLowerCase().replace(/đ/g, "dj").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function parse(html: string, url: string) {
  const lds = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => {
    try { return JSON.parse(m[1]); } catch { return null; }
  });
  const book = lds.find((l) => l && (l["@type"] === "Book" || l["@type"] === "Product"));
  if (!book) return null;
  const crumbs = lds.find((l) => l?.["@type"] === "BreadcrumbList")?.itemListElement ?? [];
  const catUrl: string | undefined = crumbs.find((c: { item?: string }) => c.item?.includes("/product-category/"))?.item;
  const rows: Record<string, string> = {};
  for (const m of html.matchAll(/<tr><th[^>]*>([\s\S]*?)<\/th><td>([\s\S]*?)<\/td><\/tr>/g)) rows[text(m[1])] = text(m[2]);
  for (const m of html.matchAll(/<dt>([\s\S]*?)<\/dt><dd>([\s\S]*?)<\/dd>/g)) rows[text(m[1])] ??= text(m[2]);
  const descHtml = html.match(/<div class="desc[^"]*" id="desc">([\s\S]*?)<\/div>/)?.[1] ?? "";
  const paras = [...descHtml.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => text(m[1])).filter(Boolean);
  const offer = (book.workExample ?? []).map((w: { offers?: unknown }) => w.offers).find(Boolean) ?? book.offers ?? {};
  const author = Array.isArray(book.author) ? book.author[0] : book.author;
  const uvez = rows["Uvez"];
  return {
    slug: slugOf(url),
    title: decode(book.name ?? ""),
    description: paras.length ? paras.join("\n\n") : (book.description ?? null),
    eur: Number(offer.price ?? 0),
    inStock: String(offer.availability ?? "").includes("InStock"),
    image: book.image as string | undefined,
    isbn: rows["ISBN"] || book.isbn || null,
    pages: Number(rows["Stranica"] || book.numberOfPages) || null,
    year: Number(rows["Godina izdanja"]) || null,
    translator: rows["Prijevod"] || null,
    dimensions: rows["Dimenzije"] || rows["Format"] || null,
    binding: uvez ? (/uvez/i.test(uvez) ? uvez : `${uvez} uvez`) : null,
    sku: rows["Šifra"] || null,
    author: author?.name ? { name: decode(author.name), slug: slugOf(author.url) || slugify(author.name) } : null,
    publisher: book.publisher?.name ? { name: decode(book.publisher.name), slug: slugOf(book.publisher.url) || slugify(book.publisher.name) } : null,
    theirCat: slugOf(catUrl),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Only shop admins may run the import: either an admin session, or a short-lived token from public.import_tokens
  // (RLS on, no policies — insert one with SQL when running the import, it expires on its own).
  const importToken = req.headers.get("x-import-token");
  let allowed = false;
  if (importToken) {
    const { data } = await db.from("import_tokens").select("token").eq("token", importToken).gt("expires_at", new Date().toISOString()).maybeSingle();
    allowed = !!data;
  } else {
    const token = (req.headers.get("authorization") ?? "").replace(/^Bearer /, "");
    const { data: who } = await db.auth.getUser(token);
    allowed = !!who.user?.email && ADMINS.includes(who.user.email.toLowerCase());
  }
  if (!allowed) return json({ error: "forbidden" }, 403);

  const { offset = 0, limit = 10, onlyCount = false } = await req.json().catch(() => ({}));
  const sitemap = await fetch(`${SITE}/sitemap.xml`).then((r) => r.text());
  const urls = [...sitemap.matchAll(/<loc>([^<]+\/product\/[^<]+)<\/loc>/g)].map((m) => m[1]);
  if (onlyCount) return json({ total: urls.length });

  const { data: cats } = await db.from("categories").select("id,slug");
  const catId = (s: string) => cats?.find((c) => c.slug === s)?.id ?? null;
  const people = new Map<string, string>();
  async function entity(table: "authors" | "publishers", e: { name: string; slug: string } | null) {
    if (!e) return null;
    const key = `${table}:${e.slug}`;
    if (people.has(key)) return people.get(key)!;
    const { data } = await db.from(table).upsert({ name: e.name, slug: e.slug }, { onConflict: "slug" }).select("id").single();
    if (data) people.set(key, data.id);
    return data?.id ?? null;
  }

  const results: { slug: string; ok: boolean; error?: string }[] = [];
  const batch = urls.slice(offset, offset + limit);
  for (let i = 0; i < batch.length; i += 4) {
    await Promise.all(batch.slice(i, i + 4).map(async (url) => {
      const slug = slugOf(url);
      try {
        const html = await fetch(url).then((r) => r.text());
        const p = parse(html, url);
        if (!p || !p.title) throw new Error("no product data");
        let cover_url: string | null = null;
        if (p.image) {
          const img = await fetch(p.image);
          if (img.ok) {
            const type = img.headers.get("content-type") ?? "image/webp";
            const path = `kelimeh/${p.slug}.${type.includes("png") ? "png" : type.includes("jpeg") ? "jpg" : "webp"}`;
            const up = await db.storage.from("products").upload(path, await img.arrayBuffer(), { contentType: type, upsert: true });
            if (!up.error) cover_url = db.storage.from("products").getPublicUrl(path).data.publicUrl;
          }
        }
        const row = {
          slug: p.slug, title: p.title, description: p.description,
          price: Math.round(p.eur * EUR_RATE), stock: p.inStock ? 10 : 0,
          sku: p.sku, isbn: p.isbn, pages: p.pages, binding: p.binding, year: p.year, translator: p.translator,
          dimensions: p.dimensions, cover_url,
          category_id: catId(CAT[p.theirCat] ?? "ostalo"),
          author_id: await entity("authors", p.author),
          publisher_id: await entity("publishers", p.publisher),
          is_set: p.theirCat === "kompleti",
          active: true,
        };
        const { error } = await db.from("products").upsert(row, { onConflict: "slug" });
        if (error) throw new Error(error.message);
        results.push({ slug, ok: true });
      } catch (e) {
        results.push({ slug, ok: false, error: String((e as Error).message ?? e) });
      }
    }));
  }
  return json({ total: urls.length, offset, done: results.filter((r) => r.ok).length, failed: results.filter((r) => !r.ok) });
});
