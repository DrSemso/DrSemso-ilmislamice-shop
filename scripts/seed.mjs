// Loads the example catalog into Supabase (idempotent upsert).
// Usage: node --env-file=.env.local scripts/seed.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (e.g. in .env.local).");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });
const data = JSON.parse(readFileSync(new URL("../src/lib/demo-catalog.json", import.meta.url), "utf8"));

// parents before children
const cats = [...data.categories].sort((a, b) => (a.parent_id ? 1 : 0) - (b.parent_id ? 1 : 0));
for (const [table, rows, onConflict] of [
  ["categories", cats, "id"],
  ["publishers", data.publishers, "id"],
  ["authors", data.authors, "id"],
  ["products", data.products, "id"],
  ["set_items", data.set_items, "set_id,product_id"],
]) {
  const { error } = await db.from(table).upsert(rows, { onConflict });
  if (error) {
    console.error(table, error.message);
    process.exit(1);
  }
  console.log(`${table}: ${rows.length}`);
}
