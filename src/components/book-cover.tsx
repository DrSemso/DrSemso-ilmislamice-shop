import Image from "next/image";
import type { Product } from "@/lib/types";

// Covers without a photo get a typographic placeholder in one of a few book-cloth colours,
// chosen from the title so the same book always looks the same.
const CLOTHS = [
  ["#2f4b5c", "#e8dcc4"],
  ["#1d5a49", "#f2e7cf"],
  ["#7a5a33", "#f8efe0"],
  ["#5b2a2a", "#f1e3cf"],
  ["#2b2b33", "#d9c39a"],
  ["#e9e4da", "#3a3227"],
];

export function BookCover({
  product,
  sizes = "(max-width: 640px) 50vw, 25vw",
  priority = false,
  natural = false,
}: {
  product: Pick<Product, "title" | "cover_url" | "is_set"> & { author?: { name: string } | null };
  sizes?: string;
  priority?: boolean;
  /** Show the whole cover at its own proportions (no crop) with a book-spine shade: used on the product page. */
  natural?: boolean;
}) {
  if (product.cover_url && natural) {
    return (
      <div className="relative w-full overflow-hidden">
        <Image
          src={product.cover_url}
          alt={product.title}
          width={600}
          height={844}
          sizes={sizes}
          priority={priority}
          unoptimized={product.cover_url.includes("/kelimeh/")}
          className="block h-auto w-full"
        />
        {/* Spine: a dark fold line and a soft highlight down the left edge, like a real hardback. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-[7%]"
          style={{ background: "linear-gradient(90deg, rgba(0,0,0,.28) 0%, rgba(0,0,0,.05) 35%, rgba(255,255,255,.22) 55%, rgba(0,0,0,.12) 100%)" }}
        />
        <span aria-hidden className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10" />
      </div>
    );
  }
  if (product.cover_url) {
    return (
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-2">
        {/* Imported partner covers are already small webp files: serve them as-is so Next does not re-compress them. */}
        <Image src={product.cover_url} alt={product.title} fill sizes={sizes} priority={priority} unoptimized={product.cover_url.includes("/kelimeh/")} className="object-cover" />
      </div>
    );
  }
  const h = [...product.title].reduce((s, c) => s + c.charCodeAt(0), 0);
  const [bg, fg] = CLOTHS[h % CLOTHS.length];
  return (
    <div
      className="@container relative flex aspect-[2/3] w-full flex-col justify-between overflow-hidden p-[9%] shadow-[inset_6px_0_0_rgba(0,0,0,.18)]"
      style={{ background: bg, color: fg }}
      role="img"
      aria-label={product.title}
    >
      <span className="mx-auto mt-[4%] h-px w-1/3 opacity-50" style={{ background: fg }} />
      <span className="font-serif text-[10.5cqw] font-semibold leading-[1.15] [overflow-wrap:anywhere]">{product.title}</span>
      <span className="truncate text-[5.5cqw] font-semibold uppercase tracking-[0.18em] opacity-70">
        {product.is_set ? "Set knjiga" : product.author?.name ?? ""}
      </span>
    </div>
  );
}
