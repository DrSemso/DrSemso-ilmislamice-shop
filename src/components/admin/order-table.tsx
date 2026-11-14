import Link from "next/link";
import { date, price } from "@/lib/format";
import { ORDER_STATUS_LABEL, type Order, type OrderStatus } from "@/lib/types";

export const STATUS_STYLE: Record<OrderStatus, string> = {
  nova: "bg-accent text-accent-ink",
  potvrdjena: "bg-ink/10 text-ink",
  poslana: "bg-[#2f4b5c]/15 text-[#2f4b5c]",
  isporucena: "bg-success/15 text-success",
  otkazana: "bg-danger/10 text-danger",
};

export function StatusPill({ status }: { status: OrderStatus }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${STATUS_STYLE[status]}`}>{ORDER_STATUS_LABEL[status]}</span>;
}

export function OrderTable({ orders }: { orders: Order[] }) {
  if (!orders.length) return <p className="border border-line bg-paper p-8 text-center text-muted">Nema narudžbi.</p>;
  return (
    <div className="overflow-x-auto border border-line bg-paper">
      <table className="w-full min-w-[720px] text-[14px]">
        <thead>
          <tr className="border-b border-line text-left text-[12px] uppercase tracking-[0.1em] text-muted">
            <th className="px-5 py-3 font-semibold">Broj</th>
            <th className="px-5 py-3 font-semibold">Kupac</th>
            <th className="px-5 py-3 font-semibold">Mjesto</th>
            <th className="px-5 py-3 font-semibold">Datum</th>
            <th className="px-5 py-3 text-right font-semibold">Iznos</th>
            <th className="px-5 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-white">
              <td className="px-5 py-3 font-semibold tabular-nums"><Link href={`/admin/narudzbe/${o.id}`} className="link">#{o.number}</Link></td>
              <td className="px-5 py-3">{o.full_name}<span className="block text-[12.5px] text-muted">{o.phone}</span></td>
              <td className="px-5 py-3">{o.city}<span className="block text-[12.5px] text-muted">{o.country}</span></td>
              <td className="px-5 py-3 text-muted">{date(o.created_at)}</td>
              <td className="px-5 py-3 text-right font-semibold tabular-nums">{price(Number(o.total))}</td>
              <td className="px-5 py-3"><StatusPill status={o.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
