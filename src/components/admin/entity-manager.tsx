"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/admin/actions";

export type EntityRow = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: string | null;
  sort?: number;
  count: number;
};

type Props = {
  kind: "categories" | "publishers" | "authors";
  rows: EntityRow[];
  parents?: { id: string; name: string }[];
  save: (state: FormState, f: FormData) => Promise<FormState>;
  remove: (f: FormData) => Promise<void>;
  publicPath: string;
};

const LABELS = {
  categories: { one: "kategoriju", desc: "Opis (prikazuje se na vrhu kategorije)" },
  publishers: { one: "izdavača", desc: "Opis izdavača" },
  authors: { one: "autora", desc: "Biografija" },
};

function EntityForm({ kind, row, parents, save }: { kind: Props["kind"]; row?: EntityRow; parents?: Props["parents"]; save: Props["save"] }) {
  const [state, action, pending] = useActionState(save, null);
  const id = row?.id ?? "new";
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="id" value={row?.id ?? ""} />
      <div>
        <label htmlFor={`e-name-${id}`} className="label">Naziv *</label>
        <input id={`e-name-${id}`} name="name" required defaultValue={row?.name} className="input" />
      </div>
      {kind === "categories" ? (
        <div>
          <label htmlFor={`e-parent-${id}`} className="label">Nadređena kategorija</label>
          <select id={`e-parent-${id}`} name="parent_id" defaultValue={row?.parent_id ?? parents?.find((p) => p.name === "Knjige")?.id ?? ""} className="input">
            <option value="">— glavna kategorija (u meniju) —</option>
            {parents?.filter((p) => p.id !== row?.id).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      ) : (
        <div>
          <label htmlFor={`e-slug-${id}`} className="label">Adresa (automatski)</label>
          <input id={`e-slug-${id}`} name="slug" defaultValue={row?.slug} className="input" />
        </div>
      )}
      <div className="sm:col-span-2">
        <label htmlFor={`e-desc-${id}`} className="label">{LABELS[kind].desc}</label>
        <textarea id={`e-desc-${id}`} name="description" rows={2} defaultValue={row?.description ?? ""} className="input" />
      </div>
      {kind === "categories" && (
        <div>
          <label htmlFor={`e-sort-${id}`} className="label">Redoslijed (manji broj ide prije)</label>
          <input id={`e-sort-${id}`} name="sort" inputMode="numeric" defaultValue={row?.sort ?? 0} className="input" />
        </div>
      )}
      <div className="flex items-end gap-3 sm:col-span-2">
        <button disabled={pending} className="btn btn-dark">{pending ? "Čuvam…" : row ? "Sačuvaj" : `Dodaj ${LABELS[kind].one}`}</button>
        {state && <p className={`text-[14px] ${state.ok ? "text-success" : "text-danger"}`}>{state.message}</p>}
      </div>
    </form>
  );
}

export function EntityManager({ kind, rows, parents, save, remove, publicPath }: Props) {
  return (
    <div className="space-y-6">
      <details className="border border-line bg-paper p-6" open={rows.length === 0}>
        <summary className="cursor-pointer font-serif text-[20px] font-bold">+ Dodaj {LABELS[kind].one}</summary>
        <div className="mt-5"><EntityForm kind={kind} parents={parents} save={save} /></div>
      </details>
      <ul className="divide-y divide-line border border-line bg-paper">
        {rows.map((r) => (
          <li key={r.id} className="px-5 py-3">
            <details>
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
                <span className={`text-[15px] ${r.parent_id && kind === "categories" ? "pl-6 text-ink/85" : "font-semibold"}`}>
                  {r.parent_id && kind === "categories" ? "↳ " : ""}{r.name}
                </span>
                <span className="text-[13px] text-muted">{r.count} proizvoda · <span className="link">uredi</span></span>
              </summary>
              <div className="mt-4 space-y-4 border-t border-line pt-4">
                <EntityForm kind={kind} row={r} parents={parents} save={save} />
                <div className="flex flex-wrap items-center justify-between gap-3 text-[13px]">
                  <a href={`${publicPath}/${r.slug}`} target="_blank" className="link">Pogledaj u trgovini ↗</a>
                  <form action={remove}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="text-danger hover:underline" title="Proizvodi ostaju, samo gube ovu vezu">Obriši</button>
                  </form>
                </div>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
