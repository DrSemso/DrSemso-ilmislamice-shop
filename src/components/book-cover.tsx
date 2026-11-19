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
}: {
  product: Pick<Product, "title" | "cover_url" | "is_set"> & { author?: { name: string } | null };
  sizes?: string;
  priority?: boolean;
}) {
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
