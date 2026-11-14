import { adminList, adminProductCounts } from "@/lib/admin-data";
import { EntityManager } from "@/components/admin/entity-manager";
import { deleteEntity, saveEntity } from "@/app/admin/actions";

export default async function Page() {
  const [rows, counts] = await Promise.all([adminList("publishers"), adminProductCounts("publisher_id")]);
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-[32px] font-bold">Izdavači</h1>
      <EntityManager
        kind="publishers"
        rows={rows.map((r) => ({ ...r, count: counts[r.id] ?? 0 }))}
        save={saveEntity.bind(null, "publishers")}
        remove={deleteEntity.bind(null, "publishers")}
        publicPath="/izdavaci"
      />
    </div>
  );
}
