import Link from "next/link";
import { adminOrders } from "@/lib/admin-data";
import { OrderTable } from "@/components/admin/order-table";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/types";

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function Page({ searchParams }: { searchParams: SP }) {
  const { status } = await searchParams;
  const s = typeof status === "string" && status in ORDER_STATUS_LABEL ? status : undefined;
  const orders = await adminOrders(s);
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-[32px] font-bold">Narudžbe</h1>
      <nav className="flex flex-wrap gap-2 text-[14px]">
        <Link href="/admin/narudzbe" className={`rounded-full border px-3.5 py-1.5 ${!s ? "border-ink bg-ink text-paper" : "border-line bg-paper"}`}>Sve</Link>
        {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((k) => (
          <Link key={k} href={`/admin/narudzbe?status=${k}`} className={`rounded-full border px-3.5 py-1.5 ${s === k ? "border-ink bg-ink text-paper" : "border-line bg-paper"}`}>
            {ORDER_STATUS_LABEL[k]}
          </Link>
        ))}
      </nav>
      <OrderTable orders={orders} />
    </div>
  );
}
