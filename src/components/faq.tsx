import { Plus } from "lucide-react";

export function Faq({ items }: { items: readonly { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((f) => (
        <details key={f.q} className="group py-1">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[16px] font-semibold [&::-webkit-details-marker]:hidden">
            {f.q}
            <Plus size={18} className="shrink-0 text-muted transition group-open:rotate-45" />
          </summary>
          <p className="pb-5 pr-8 text-[15px] leading-relaxed text-ink/75">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
