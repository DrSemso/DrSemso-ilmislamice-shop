import Link from "next/link";
import { notFound } from "next/navigation";
import { adminList, adminProduct, adminProducts } from "@/lib/admin-data";
import { ProductForm } from "@/components/admin/product-form";
import { deleteProduct } from "@/app/admin/actions";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories, publishers, authors, products] = await Promise.all([
    adminProduct(id), adminList("categories"), adminList("publishers"), adminList("authors"), adminProducts(),
  ]);
  if (!product) notFound();
  return (
    <div className="space-y-6">
      <Link href="/admin/proizvodi" className="text-[14px] link">← Proizvodi</Link>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-[32px] font-bold">{product.title}</h1>
        {product.active && <Link href={`/proizvod/${product.slug}`} className="text-[14px] link" target="_blank">Pogledaj u trgovini ↗</Link>}
      </div>
      <ProductForm product={product} categories={categories} publishers={publishers} authors={authors} books={products.filter((p) => !p.is_set && p.id !== id)} />
      <form action={deleteProduct} className="border-t border-line pt-6">
        <input type="hidden" name="id" value={product.id} />
        <details>
          <summary className="cursor-pointer text-[14px] text-danger">Ukloni proizvod…</summary>
          <p className="mt-3 max-w-[60ch] text-[14px] text-muted">Proizvod nestaje iz trgovine. Ako je već bio naručivan, samo se sakriva da bi historija narudžbi ostala tačna.</p>
          <button className="btn mt-3 border border-danger text-danger hover:bg-danger hover:text-white">Da, ukloni proizvod</button>
        </details>
      </form>
    </div>
  );
}
