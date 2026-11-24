import { adminList, adminProductCounts } from "@/lib/admin-data";
import { EntityManager } from "@/components/admin/entity-manager";
import { deleteEntity, saveEntity } from "@/app/admin/actions";

export default async function Page() {
  const [rows, counts] = await Promise.all([adminList("authors"), adminProductCounts("author_id")]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-[32px] font-bold">Autori</h1>
        <p className="mt-1 text-[14px] text-muted">Otvorite autora i označite „Poznat autor“ da se prikaže na vrhu stranice Autori u trgovini.</p>
      </div>
      <EntityManager
        kind="authors"
        rows={[...rows].sort((a, b) => Number(Boolean(b.is_featured)) - Number(Boolean(a.is_featured))).map((r) => ({ ...r, description: r.bio, featured: Boolean(r.is_featured), count: counts[r.id] ?? 0 }))}
        save={saveEntity.bind(null, "authors")}
        remove={deleteEntity.bind(null, "authors")}
        publicPath="/autori"
      />
    </div>
  );
}
