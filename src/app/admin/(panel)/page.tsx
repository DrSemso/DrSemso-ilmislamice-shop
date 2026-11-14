import Link from "next/link";
import { adminMessages, adminOrders, adminProducts } from "@/lib/admin-data";
import { money } from "@/lib/format";
import { OrderTable } from "@/components/admin/order-table";

export default async function Dashboard() {
  const [orders, products, messages] = await Promise.all([adminOrders(), adminProducts(), adminMessages()]);
  const newOrders = orders.filter((o) => o.status === "nova");
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const month = orders.filter((o) => o.created_at >= monthStart && o.status !== "otkazana");
  const lowStock = products.filter((p) => p.active && p.stock <= 2).sort((a, b) => a.stock - b.stock);
  const openMessages = messages.filter((m) => !m.handled).length;

  const tiles = [
    { label: "Nove narudžbe", value: String(newOrders.length), href: "/admin/narudzbe?status=nova", hot: newOrders.length > 0 },
    { label: "Prodaja ovog mjeseca", value: (["RSD", "EUR"] as const).map((c) => [c, month.filter((o) => o.currency === c).reduce((s, o) => s + Number(o.total), 0)] as const).filter(([, n]) => n > 0).map(([c, n]) => money(n, c)).join(" + ") || money(0, "RSD"), sub: `${month.length} narudžbi` },
    { label: "Aktivni proizvodi", value: String(products.filter((p) => p.active).length), href: "/admin/proizvodi" },
    { label: "Neodgovorene poruke", value: String(openMessages), href: "/admin/poruke", hot: openMessages > 0 },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-[32px] font-bold">Pregled</h1>
        <Link href="/admin/proizvodi/novi" className="btn btn-dark">+ Dodaj proizvod</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => {
          const body = (
            <>
              <p className="text-[13px] text-muted">{t.label}</p>
              <p className={`mt-1 text-[28px] font-bold tabular-nums ${t.hot ? "text-accent" : ""}`}>{t.value}</p>
              {t.sub && <p className="text-[13px] text-muted">{t.sub}</p>}
            </>
          );
          return t.href ? (
            <Link key={t.label} href={t.href} className="border border-line bg-paper p-5 hover:border-ink">{body}</Link>
          ) : (
            <div key={t.label} className="border border-line bg-paper p-5">{body}</div>
          );
        })}
      </div>
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-serif text-[22px] font-bold">Posljednje narudžbe</h2>
          <Link href="/admin/narudzbe" className="text-[14px] link">Sve narudžbe</Link>
        </div>
        <OrderTable orders={orders.slice(0, 8)} />
      </section>
      {lowStock.length > 0 && (
        <section>
          <h2 className="mb-4 font-serif text-[22px] font-bold">Na izmaku zaliha</h2>
          <ul className="divide-y divide-line border border-line bg-paper">
            {lowStock.slice(0, 10).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 px-5 py-3 text-[14.5px]">
                <Link href={`/admin/proizvodi/${p.id}`} className="hover:text-accent">{p.title}</Link>
                <span className={`font-semibold tabular-nums ${p.stock === 0 ? "text-danger" : "text-accent"}`}>{p.stock === 0 ? "Rasprodato" : `${p.stock} kom.`}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
