"use client";

import { useActionState } from "react";
import { updateOrder } from "@/app/admin/actions";
import { ORDER_STATUS_LABEL, type Order, type OrderStatus } from "@/lib/types";

export function OrderStatusForm({ order }: { order: Order }) {
  const [state, action, pending] = useActionState(updateOrder, null);
  return (
    <form action={action} className="h-fit space-y-4 border border-line bg-paper p-6">
      <h2 className="font-serif text-[20px] font-bold">Status</h2>
      <input type="hidden" name="id" value={order.id} />
      <div>
        <label htmlFor="os-status" className="label">Status narudžbe</label>
        <select id="os-status" name="status" defaultValue={order.status} className="input">
          {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((k) => <option key={k} value={k}>{ORDER_STATUS_LABEL[k]}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="os-track" className="label">Broj pošiljke (nije obavezno)</label>
        <input id="os-track" name="tracking_number" defaultValue={order.tracking_number ?? ""} className="input" />
      </div>
      <label className="flex items-center gap-2 text-[14px]">
        <input type="checkbox" name="notify" defaultChecked className="h-4 w-4" /> Pošalji kupcu e-mail o promjeni
      </label>
      <button disabled={pending} className="btn btn-dark w-full">{pending ? "Čuvam…" : "Sačuvaj"}</button>
      {state && <p className={`text-[14px] ${state.ok ? "text-success" : "text-danger"}`}>{state.message}</p>}
      <p className="text-[12.5px] text-muted">Otkazivanjem se knjige vraćaju na stanje.</p>
    </form>
  );
}
