import Link from "next/link";
import { notFound } from "next/navigation";
import { adminOrder } from "@/lib/admin-data";
import { date, price } from "@/lib/format";
import { StatusPill } from "@/components/admin/order-table";
import { OrderStatusForm } from "@/components/admin/order-status-form";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const order = await adminOrder((await params).id);
  if (!order) notFound();
  return (
    <div className="space-y-8">
      <Link href="/admin/narudzbe" className="text-[14px] link">← Sve narudžbe</Link>
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="font-serif text-[32px] font-bold">Narudžba #{order.number}</h1>
        <StatusPill status={order.status} />
      </div>
      <p className="text-muted">{date(order.created_at)} · plaćanje pouzećem</p>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="border border-line bg-paper p-6">
            <h2 className="mb-4 font-serif text-[20px] font-bold">Stavke</h2>
            <table className="w-full text-[14.5px]">
              <tbody className="divide-y divide-line">
                {order.order_items?.map((i) => (
                  <tr key={i.id}>
                    <td className="py-2.5">
                      {i.product_id ? <Link href={`/admin/proizvodi/${i.product_id}`} className="hover:text-accent">{i.title}</Link> : i.title}
                    </td>
                    <td className="py-2.5 text-right text-muted tabular-nums">{i.quantity} × {price(Number(i.price))}</td>
                    <td className="w-28 py-2.5 text-right font-semibold tabular-nums">{price(Number(i.price) * i.quantity)}</td>
                  </tr>
                ))}
                <tr><td className="py-2.5 text-muted" colSpan={2}>Dostava</td><td className="py-2.5 text-right tabular-nums">{price(Number(order.shipping))}</td></tr>
                <tr className="text-[16px] font-bold"><td className="py-3" colSpan={2}>Naplatiti pouzećem</td><td className="py-3 text-right tabular-nums">{price(Number(order.total))}</td></tr>
              </tbody>
            </table>
          </section>
          <section className="grid gap-6 border border-line bg-paper p-6 sm:grid-cols-2">
            <div>
              <h2 className="mb-2 font-serif text-[20px] font-bold">Dostava</h2>
              <p className="text-[14.5px] leading-relaxed">
                {order.full_name}<br />{order.address}<br />{order.postal_code} {order.city}<br />{order.country}
              </p>
            </div>
            <div>
              <h2 className="mb-2 font-serif text-[20px] font-bold">Kontakt</h2>
              <p className="text-[14.5px] leading-relaxed">
                <a href={`tel:${order.phone.replace(/\s/g, "")}`} className="link">{order.phone}</a><br />
                <a href={`mailto:${order.email}`} className="link">{order.email}</a>
              </p>
            </div>
            {order.note && (
              <div className="sm:col-span-2">
                <h2 className="mb-1 text-[14px] font-semibold">Napomena kupca</h2>
                <p className="rounded-[3px] bg-surface p-3 text-[14.5px]">{order.note}</p>
              </div>
            )}
          </section>
        </div>
        <OrderStatusForm order={order} />
      </div>
    </div>
  );
}
