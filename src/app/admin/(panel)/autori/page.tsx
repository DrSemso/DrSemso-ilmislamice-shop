import { adminList, adminProductCounts } from "@/lib/admin-data";
import { EntityManager } from "@/components/admin/entity-manager";
import { deleteEntity, saveEntity } from "@/app/admin/actions";

export default async function Page() {
  const [rows, counts] = await Promise.all([adminList("authors"), adminProductCounts("author_id")]);
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-[32px] font-bold">Autori</h1>
      <EntityManager
        kind="authors"
        rows={rows.map((r) => ({ ...r, description: r.bio, count: counts[r.id] ?? 0 }))}
        save={saveEntity.bind(null, "authors")}
        remove={deleteEntity.bind(null, "authors")}
        publicPath="/autori"
      />
    </div>
  );
}
