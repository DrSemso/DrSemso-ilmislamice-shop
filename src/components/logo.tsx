import Link from "next/link";
import { shop } from "@/shop.config";

/**
 * The frame of the ILM badge (outer outline and the gold arch frame), as a one-colour line drawing.
 * Pass size={0} to size it with classes instead. Coloured with currentColor through a CSS mask, so `text-accent`, `text-paper/45` etc. work as before.
 */
export function StarMark({ size = 34, className = "" }: { size?: number; className?: string; ring?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block bg-current ${className}`}
      style={{
        ...(size ? { width: size, height: size } : {}),
        WebkitMaskImage: "url(/brand/frame-mask.png)",
        maskImage: "url(/brand/frame-mask.png)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label={`${shop.name}, početna`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo-badge-160.png" alt="" width={46} height={46} className="h-[46px] w-[46px] shrink-0" />
      <span className="flex flex-col leading-none">
        <span className={`font-serif text-[26px] font-bold tracking-tight ${light ? "text-on-dark" : "text-ink"}`}>
          {shop.shortName}
        </span>
        <span className={`mt-1 text-[10px] font-medium uppercase tracking-[0.2em] ${light ? "text-on-dark/70" : "text-muted"}`}>
          e-islamic shop
        </span>
      </span>
    </Link>
  );
}
