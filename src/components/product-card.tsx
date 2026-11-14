import Link from "next/link";
import { BookCover } from "./book-cover";
import { AddToCart } from "./add-to-cart";
import { discountPercent } from "@/lib/format";
import { Price } from "./price";
import type { Product } from "@/lib/types";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const off = discountPercent(product.price, product.compare_at_price);
  return (
    <article className="group flex min-w-0 flex-col">
      <Link href={`/proizvod/${product.slug}`} className="relative block">
        <div className="transition-transform duration-300 group-hover:-translate-y-1">
          <BookCover product={product} priority={priority} />
        </div>
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {off > 0 && <span className="bg-accent px-1.5 py-0.5 text-[11px] font-bold text-accent-ink">−{off}%</span>}
          {product.is_new && <span className="bg-paper px-1.5 py-0.5 text-[11px] font-bold text-ink">Novo</span>}
          {product.stock <= 0 && <span className="bg-ink px-1.5 py-0.5 text-[11px] font-bold text-paper">Rasprodato</span>}
        </div>
      </Link>
      <div className="mt-3 flex flex-1 flex-col gap-0.5">
        <h3 className="text-[15px] font-semibold leading-snug">
          <Link href={`/proizvod/${product.slug}`} className="hover:text-accent">
            {product.title}
          </Link>
        </h3>
        {product.author && <p className="text-[13px] text-muted">{product.author.name}</p>}
        <p className="mt-auto pt-1.5 text-[15px] font-bold tabular-nums">
          <Price value={product.price} />
          {off > 0 && <s className="ml-2 text-[13px] font-normal text-muted"><Price value={product.compare_at_price!} /></s>}
        </p>
        <AddToCart product={product} />
      </div>
    </article>
  );
}

export function ProductGrid({ products, cols = 4 }: { products: Product[]; cols?: 4 | 5 | 6 }) {
  const lg = { 4: "lg:grid-cols-4", 5: "lg:grid-cols-4 xl:grid-cols-5", 6: "md:grid-cols-4 lg:grid-cols-6" }[cols];
  return (
    <div className={`grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 ${lg}`}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 4} />
      ))}
    </div>
  );
}
