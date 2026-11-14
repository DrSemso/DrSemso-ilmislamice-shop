import { adminList, adminProductCounts } from "@/lib/admin-data";
import { EntityManager } from "@/components/admin/entity-manager";
import { deleteEntity, saveEntity } from "@/app/admin/actions";

export default async function Page() {
  const [cats, counts] = await Promise.all([adminList("categories"), adminProductCounts("category_id")]);
  const roots = cats.filter((c) => !c.parent_id);
  const ordered = roots.flatMap((r) => [r, ...cats.filter((c) => c.parent_id === r.id)]);
  const orphans = cats.filter((c) => !ordered.includes(c));
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-[32px] font-bold">Kategorije</h1>
      <p className="max-w-[65ch] text-[14.5px] text-muted">
        „Knjige“ je glavna kategorija u meniju. Podkategorije (npr. Hadis, Akaid) dodajte s nadređenom kategorijom „Knjige“ i pojavit će se u padajućem meniju.
      </p>
      <EntityManager
        kind="categories"
        rows={[...ordered, ...orphans].map((c) => ({ ...c, count: counts[c.id] ?? 0 }))}
        parents={roots.map(({ id, name }) => ({ id, name }))}
        save={saveEntity.bind(null, "categories")}
        remove={deleteEntity.bind(null, "categories")}
        publicPath="/kategorija"
      />
    </div>
  );
}
