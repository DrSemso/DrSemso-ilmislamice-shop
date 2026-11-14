import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StarMark } from "./logo";

// Geometric (girih-style) line patterns, drawn as tiny SVG tiles and repeated as a background.
const PATTERNS = [
  // 8-point stars on a grid
  (c: string) => `<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'><g fill='none' stroke='${c}' stroke-width='1'><rect x='14' y='14' width='16' height='16'/><rect x='14' y='14' width='16' height='16' transform='rotate(45 22 22)'/><path d='M0 22h8.7M35.3 22H44M22 0v8.7M22 35.3V44'/></g></svg>`,
  // diamond lattice with dots
  (c: string) => `<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'><g fill='none' stroke='${c}' stroke-width='1'><path d='M18 0 36 18 18 36 0 18Z'/><circle cx='18' cy='18' r='3'/></g></svg>`,
  // interlaced circles
  (c: string) => `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><g fill='none' stroke='${c}' stroke-width='1'><circle cx='0' cy='0' r='20'/><circle cx='40' cy='0' r='20'/><circle cx='0' cy='40' r='20'/><circle cx='40' cy='40' r='20'/><circle cx='20' cy='20' r='20'/></g></svg>`,
];

// Site palette tones (theme.css): paper surface, dark, bronze, stone.
const TONES = [
  { bg: "#EDEBE6", line: "rgba(168,123,69,.38)", text: "text-ink", star: "text-accent/40", muted: "text-muted" },
  { bg: "#171614", line: "rgba(168,123,69,.42)", text: "text-[#F3EFE6]", star: "text-accent/60", muted: "text-[#F3EFE6]/70" },
  { bg: "#A87B45", line: "rgba(248,247,243,.30)", text: "text-ink", star: "text-paper/45", muted: "text-ink/70" },
  { bg: "#E2DFD8", line: "rgba(23,22,20,.16)", text: "text-ink", star: "text-ink/20", muted: "text-muted" },
];

export function CategoryTile({ name, href, index }: { name: string; href: string; index: number }) {
  const tone = TONES[index % TONES.length];
  const pattern = PATTERNS[index % PATTERNS.length](tone.line);
  return (
    <Link
      href={href}
      className="group relative flex h-full min-h-[112px] items-end justify-between gap-3 overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-lg md:min-h-[132px]"
      style={{ backgroundColor: tone.bg }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(pattern)}")` }}
      />
      {/* fade the pattern where the name sits so it stays readable */}
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/3" style={{ background: `linear-gradient(to top, ${tone.bg} 35%, transparent)` }} />
      <StarMark size={96} ring className={`absolute -right-5 -top-5 transition-transform duration-500 group-hover:rotate-45 ${tone.star}`} />
      <span className={`relative font-serif text-[18px] font-semibold leading-tight ${tone.text}`}>{name}</span>
      <ArrowRight size={16} className={`relative shrink-0 transition group-hover:translate-x-1 ${tone.muted}`} />
    </Link>
  );
}
