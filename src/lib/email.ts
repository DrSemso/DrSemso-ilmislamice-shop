import "server-only";
import { shop } from "@/shop.config";
import { money, date, shippingLabel } from "./format";
import { SITE_URL } from "./env";
import type { Order, OrderItem } from "./types";

type Mail = { to: string; subject: string; html: string; replyTo?: string };

/** Sends through Resend. Without RESEND_API_KEY the mail is only logged, so local development works. */
export async function sendMail({ to, subject, html, replyTo }: Mail) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info(`[email skipped, no RESEND_API_KEY] to=${to} subject=${subject}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || `${shop.name} <onboarding@resend.dev>`,
      // OWNER_EMAIL may list several addresses separated by commas.
      to: to.split(",").map((a) => a.trim()).filter(Boolean),
      subject,
      html,
      // Customers who hit "Reply" reach the shop inbox, not the no-reply sending address.
      reply_to: replyTo ?? shop.contact.email,
    }),
  });
  if (!res.ok) console.error("email failed", res.status, await res.text().catch(() => ""));
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f8f7f3;font-family:Helvetica,Arial,sans-serif;color:#141414">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f3;padding:24px 12px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e2dfd8">
<tr><td style="background:#171614;color:#f1ede4;padding:18px 28px;font-family:Georgia,serif;font-size:22px;font-weight:bold">${esc(shop.shortName)} <span style="color:#a87b45;font-size:13px;font-family:Helvetica,Arial,sans-serif;font-weight:normal;letter-spacing:2px">E-ISLAMIC SHOP</span></td></tr>
<tr><td style="padding:28px">
<h1 style="font-family:Georgia,serif;font-size:24px;margin:0 0 16px">${esc(title)}</h1>
${body}
</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid #e2dfd8;color:#6b6b6b;font-size:12px">${esc(shop.name)} · ${esc(shop.contact.email)} · ${esc(shop.contact.phone)}</td></tr>
</table></td></tr></table></body></html>`;
}

function itemsTable(order: Order, items: Pick<OrderItem, "title" | "price" | "quantity">[]) {
  const rows = items
    .map(
      (i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${esc(i.title)} × ${i.quantity}</td>
<td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">${money(i.price * i.quantity, order.currency)}</td></tr>`,
    )
    .join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">${rows}
<tr><td style="padding:8px 0;color:#6b6b6b">Dostava</td><td style="padding:8px 0;text-align:right;color:#6b6b6b">${shippingLabel(order.shipping == null ? null : Number(order.shipping), order.currency)}</td></tr>
${order.gift_wrap ? `<tr><td style="padding:8px 0;color:#6b6b6b">Poklon pakovanje</td><td style="padding:8px 0;text-align:right;color:#6b6b6b">${money(Number(order.gift_wrap), order.currency)}</td></tr>` : ""}
<tr><td style="padding:8px 0;font-weight:bold">Ukupno za plaćanje pouzećem</td><td style="padding:8px 0;text-align:right;font-weight:bold">${money(order.total, order.currency)}${order.shipping == null ? " + dostava" : ""}</td></tr></table>${order.shipping == null ? `<p style="color:#6b6b6b;font-size:14px">${shop.shipping.byAgreementNote}</p>` : ""}`;
}

function address(order: Order) {
  return `<p style="font-size:14px;line-height:1.6;margin:20px 0 0"><b>Adresa za dostavu</b><br>${esc(order.full_name)}<br>${esc(order.address)}<br>${esc(order.postal_code)} ${esc(order.city)}, ${esc(order.country)}<br>Tel: ${esc(order.phone)}${order.note ? `<br><br><b>Napomena:</b> ${esc(order.note)}` : ""}</p>`;
}

export async function sendOrderEmails(order: Order, items: Pick<OrderItem, "title" | "price" | "quantity">[]) {
  const customer = layout(
    `Hvala, narudžba #${order.number} je primljena`,
    `<p style="font-size:15px;line-height:1.6">Poštovani/a ${esc(order.full_name.split(" ")[0])}, primili smo Vašu narudžbu od ${date(order.created_at)}. Javit ćemo Vam se kad paket pošaljemo. Iznos plaćate kuriru pri preuzimanju.</p>
${itemsTable(order, items)}${address(order)}
<p style="font-size:14px;margin-top:24px">Status narudžbe možete pratiti na <a href="${SITE_URL}/nalog" style="color:#a87b45">Moj račun</a>, prijavom s ovom e-mail adresom.</p>`,
  );
  const owner = layout(
    `Nova narudžba #${order.number}`,
    `<p style="font-size:15px">${esc(order.full_name)} · ${esc(order.email)} · ${esc(order.phone)}</p>${itemsTable(order, items)}${address(order)}
<p style="margin-top:24px"><a href="${SITE_URL}/admin/narudzbe/${order.id}" style="background:#171614;color:#fff;padding:10px 16px;text-decoration:none;font-size:14px">Otvori u admin panelu</a></p>`,
  );
  await Promise.all([
    sendMail({ to: order.email, subject: `Potvrda narudžbe #${order.number}`, html: customer }),
    process.env.OWNER_EMAIL
      ? sendMail({ to: process.env.OWNER_EMAIL, subject: `Nova narudžba #${order.number}, ${money(order.total, order.currency)}`, html: owner, replyTo: order.email })
      : Promise.resolve(),
  ]);
}

export async function sendStatusEmail(order: Order) {
  const text: Partial<Record<Order["status"], string>> = {
    potvrdjena: "Vaša narudžba je potvrđena i pripremamo je za slanje.",
    poslana: `Vaša narudžba je predata kurirskoj službi.${order.tracking_number ? ` Broj pošiljke: <b>${esc(order.tracking_number)}</b>.` : ""} Iznos od ${money(order.total, order.currency)} plaćate kuriru.`,
    otkazana: `Vaša narudžba je otkazana. Ako je ovo greška, javite nam se na ${esc(shop.contact.email)}.`,
  };
  const body = text[order.status];
  if (!body) return;
  await sendMail({
    to: order.email,
    subject: `Narudžba #${order.number}: ${order.status === "poslana" ? "poslana" : order.status === "otkazana" ? "otkazana" : "potvrđena"}`,
    html: layout(`Narudžba #${order.number}`, `<p style="font-size:15px;line-height:1.6">${body}</p>`),
  });
}
