"use client";

import { useActionState, useMemo, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { saveProduct } from "@/app/admin/actions";
import type { Author, Category, Product, Publisher } from "@/lib/types";

type Props = {
  product?: Product & { set_item_ids: string[] };
  categories: Category[];
  publishers: Publisher[];
  authors: Author[];
  books: Product[];
};

// One page form for a book or a set. Required: name and price; everything else is optional.
export function ProductForm({ product: p, categories, publishers, authors, books }: Props) {
  const [state, action, pending] = useActionState(saveProduct, null);
  const [isSet, setIsSet] = useState(p?.is_set ?? false);
  const [coverPreview, setCoverPreview] = useState<string | null>(p?.cover_url ?? null);
  const [keep, setKeep] = useState<string[]>(p?.images ?? []);
  const [newAuthor, setNewAuthor] = useState(false);
  const [newPub, setNewPub] = useState(false);
  const [bookFilter, setBookFilter] = useState("");
  const [extra, setExtra] = useState(0);
  const [setItems, setSetItems] = useState<string[]>(p?.set_item_ids ?? []);

  const catOptions = useMemo(() => {
    const roots = categories.filter((c) => !c.parent_id);
    return roots.flatMap((r) => [r, ...categories.filter((c) => c.parent_id === r.id).map((c) => ({ ...c, name: `— ${c.name}` }))]);
  }, [categories]);

  const section = "space-y-4 border border-line bg-paper p-6";
  const h2 = "font-serif text-[20px] font-bold";

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <input type="hidden" name="id" value={p?.id ?? ""} />
      <input type="hidden" name="existing_cover" value={p?.cover_url ?? ""} />
      {keep.map((u) => <input key={u} type="hidden" name="keep_images" value={u} />)}

      <div className="min-w-0 space-y-6">
        <section className={section}>
          <h2 className={h2}>Osnovno</h2>
          <div>
            <label htmlFor="pf-title" className="label">Naziv *</label>
            <input id="pf-title" name="title" required defaultValue={p?.title} className="input" placeholder="npr. Rijadus-salihin" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pf-author" className="label">Autor</label>
              {newAuthor ? (
                <input id="pf-author" name="new_author" className="input" placeholder="Ime novog autora" autoFocus />
              ) : (
                <select id="pf-author" name="author_id" defaultValue={p?.author_id ?? ""} className="input">
                  <option value="">— bez autora —</option>
                  {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              )}
              <button type="button" onClick={() => setNewAuthor((v) => !v)} className="mt-1.5 text-[13px] link">
                {newAuthor ? "Izaberi postojećeg" : "+ Novi autor"}
              </button>
            </div>
            <div>
              <label htmlFor="pf-pub" className="label">Izdavač</label>
              {newPub ? (
                <input id="pf-pub" name="new_publisher" className="input" placeholder="Naziv novog izdavača" autoFocus />
              ) : (
                <select id="pf-pub" name="publisher_id" defaultValue={p?.publisher_id ?? ""} className="input">
                  <option value="">— bez izdavača —</option>
                  {publishers.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              )}
              <button type="button" onClick={() => setNewPub((v) => !v)} className="mt-1.5 text-[13px] link">
                {newPub ? "Izaberi postojećeg" : "+ Novi izdavač"}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="pf-cat" className="label">Kategorija</label>
            <select id="pf-cat" name="category_id" defaultValue={p?.category_id ?? ""} className="input">
              <option value="">— bez kategorije —</option>
              {catOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="pf-desc" className="label">Opis</label>
            <textarea id="pf-desc" name="description" rows={7} defaultValue={p?.description ?? ""} className="input" placeholder="O čemu je knjiga? Prazan red pravi novi pasus." />
          </div>
        </section>

        <section className={section}>
          <h2 className={h2}>Slike</h2>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="label">Naslovnica</p>
              <label className="relative grid aspect-[2/3] w-36 cursor-pointer place-items-center overflow-hidden border border-dashed border-line bg-surface text-center text-[13px] text-muted hover:border-ink">
                {coverPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverPreview} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <span className="flex flex-col items-center gap-1 p-2"><ImagePlus size={22} /> Dodaj sliku</span>
                )}
                <input
                  type="file"
                  name="cover"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setCoverPreview(URL.createObjectURL(file));
                  }}
                />
              </label>
              {p?.cover_url && (
                <label className="mt-2 flex items-center gap-1.5 text-[13px] text-muted"><input type="checkbox" name="remove_cover" /> Ukloni naslovnicu</label>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="label">Dodatne slike (nije obavezno)</p>
              <div className="flex flex-wrap gap-2">
                {keep.map((u) => (
                  <div key={u} className="relative h-20 w-20 overflow-hidden border border-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt="" className="h-full w-full object-cover" />
                    <button type="button" aria-label="Ukloni sliku" onClick={() => setKeep((k) => k.filter((x) => x !== u))} className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-ink text-paper"><X size={12} /></button>
                  </div>
                ))}
              </div>
              <label className="btn btn-outline mt-2 cursor-pointer px-4 py-2 text-[13px]">
                <ImagePlus size={15} /> {extra ? `Izabrano slika: ${extra}` : "Dodaj slike"}
                <input type="file" name="images" accept="image/*" multiple className="sr-only" onChange={(e) => setExtra(e.target.files?.length ?? 0)} />
              </label>
              <p className="mt-2 text-[12.5px] text-muted">Fotografija knjige uspravno, najbolje 800×1200 px. JPG ili PNG.</p>
            </div>
          </div>
        </section>

        <section className={section}>
          <h2 className={h2}>Detalji knjige</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["translator", "Prijevod", p?.translator],
              ["year", "Godina izdanja", p?.year],
              ["pages", "Broj stranica", p?.pages],
              ["binding", "Uvez", p?.binding],
              ["dimensions", "Format (npr. 17 × 24 cm)", p?.dimensions],
              ["isbn", "ISBN", p?.isbn],
              ["sku", "Šifra", p?.sku],
              ["slug", "Adresa stranice (automatski)", p?.slug],
            ].map(([name, label, value]) => (
              <div key={name as string}>
                <label htmlFor={`pf-${name}`} className="label">{label}</label>
                <input
                  id={`pf-${name}`}
                  name={name as string}
                  defaultValue={(value as string | number | null) ?? ""}
                  inputMode={name === "year" || name === "pages" ? "numeric" : undefined}
                  className="input"
                />
              </div>
            ))}
          </div>
        </section>

        {isSet && (
          <section className={section}>
            <h2 className={h2}>Knjige u setu</h2>
            <p className="text-[14px] text-muted">Označite knjige koje dolaze u ovom setu. Izabrano: {setItems.length}.</p>
            <input value={bookFilter} onChange={(e) => setBookFilter(e.target.value)} placeholder="Filtriraj po nazivu" className="input" aria-label="Filtriraj knjige" />
            <ul className="max-h-72 space-y-1 overflow-y-auto">
              {books
                .filter((b) => setItems.includes(b.id) || b.title.toLowerCase().includes(bookFilter.toLowerCase()))
                .map((b) => (
                  <li key={b.id}>
                    <label className="flex items-center gap-2.5 rounded-[3px] px-2 py-1.5 text-[14px] hover:bg-surface">
                      <input
                        type="checkbox"
                        name="set_items"
                        value={b.id}
                        checked={setItems.includes(b.id)}
                        onChange={(e) => setSetItems((s) => (e.target.checked ? [...s, b.id] : s.filter((x) => x !== b.id)))}
                      />
                      {b.title}
                    </label>
                  </li>
                ))}
            </ul>
          </section>
        )}
      </div>

      <div className="space-y-6">
        <section className={section}>
          <h2 className={h2}>Cijena i zalihe</h2>
          <div>
            <label htmlFor="pf-price" className="label">Cijena (KM) *</label>
            <input id="pf-price" name="price" required inputMode="decimal" defaultValue={p?.price ?? ""} className="input" placeholder="18,00" />
          </div>
          <div>
            <label htmlFor="pf-cmp" className="label">Stara cijena, za popust (nije obavezno)</label>
            <input id="pf-cmp" name="compare_at_price" inputMode="decimal" defaultValue={p?.compare_at_price ?? ""} className="input" />
          </div>
          <div>
            <label htmlFor="pf-stock" className="label">Količina na stanju</label>
            <input id="pf-stock" name="stock" inputMode="numeric" defaultValue={p?.stock ?? 10} className="input" />
          </div>
        </section>

        <section className={section}>
          <h2 className={h2}>Prikaz u trgovini</h2>
          <label className="flex items-start gap-2.5 text-[14.5px]"><input type="checkbox" name="active" defaultChecked={p?.active ?? true} className="mt-1" /> <span>Vidljivo u trgovini</span></label>
          <label className="flex items-start gap-2.5 text-[14.5px]"><input type="checkbox" name="is_new" defaultChecked={p?.is_new ?? !p} className="mt-1" /> <span>Novo (na početnoj u „Novi naslovi“)</span></label>
          <label className="flex items-start gap-2.5 text-[14.5px]"><input type="checkbox" name="is_featured" defaultChecked={p?.is_featured} className="mt-1" /> <span>Izdvojeno (na početnoj)</span></label>
          <label className="flex items-start gap-2.5 text-[14.5px]"><input type="checkbox" name="is_set" checked={isSet} onChange={(e) => setIsSet(e.target.checked)} className="mt-1" /> <span>Ovo je set knjiga</span></label>
        </section>

        <div className="sticky bottom-4 space-y-3 border border-line bg-paper p-4 shadow-lg">
          <button disabled={pending} className="btn btn-dark w-full py-3.5 text-[15px]">{pending ? "Čuvam…" : p ? "Sačuvaj izmjene" : "Dodaj proizvod"}</button>
          {state && !state.ok && <p role="alert" className="text-[14px] text-danger">{state.message}</p>}
        </div>
      </div>
    </form>
  );
}
