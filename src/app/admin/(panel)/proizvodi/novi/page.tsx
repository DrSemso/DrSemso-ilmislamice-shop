import Link from "next/link";
import { adminList, adminProducts } from "@/lib/admin-data";
import { ProductForm } from "@/components/admin/product-form";

export default async function Page() {
  const [categories, publishers, authors, products] = await Promise.all([
    adminList("categories"), adminList("publishers"), adminList("authors"), adminProducts(),
  ]);
  return (
    <div className="space-y-6">
      <Link href="/admin/proizvodi" className="text-[14px] link">← Proizvodi</Link>
      <h1 className="font-serif text-[32px] font-bold">Novi proizvod</h1>
      <ProductForm categories={categories} publishers={publishers} authors={authors} books={products.filter((p) => !p.is_set)} />
    </div>
  );
}
