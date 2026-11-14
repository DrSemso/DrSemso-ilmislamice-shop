import Link from "next/link";
import { shop } from "@/shop.config";

/** Eight-point star (rub el hizb) mark from the ILM logo, drawn as SVG. Swap for /public/logo.svg when the real file is available. */
export function StarMark({ size = 34, className = "", ring = true }: { size?: number; className?: string; ring?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <g fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="9" y="9" width="22" height="22" />
        <rect x="9" y="9" width="22" height="22" transform="rotate(45 20 20)" />
        {ring && <circle cx="20" cy="20" r="6.5" strokeWidth="1" />}
      </g>
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label={`${shop.name}, početna`}>
      <StarMark className="text-accent transition-transform duration-500 group-hover:rotate-45" />
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
