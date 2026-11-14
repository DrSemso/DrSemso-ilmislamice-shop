"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  ["novo", "Najnovije"],
  ["popularno", "Preporučeno"],
  ["cijena-rastuce", "Cijena: od najniže"],
  ["cijena-opadajuce", "Cijena: od najviše"],
  ["naziv", "Naziv A–Ž"],
] as const;

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <label className="flex items-center gap-2">
      <span className="text-muted">Sortiraj:</span>
      <select
        value={value}
        onChange={(e) => {
          const q = new URLSearchParams(params.toString());
          if (e.target.value === "novo") q.delete("sort");
          else q.set("sort", e.target.value);
          q.delete("strana");
          const s = q.toString();
          router.push(s ? `${pathname}?${s}` : pathname);
        }}
        className="rounded-[3px] border border-line bg-white px-2.5 py-1.5 font-medium"
      >
        {OPTIONS.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </label>
  );
}
