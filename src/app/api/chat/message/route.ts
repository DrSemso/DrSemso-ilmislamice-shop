import { NextResponse } from "next/server";
import { isDemo } from "@/lib/env";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { sendMail } from "@/lib/email";
import { shop } from "@/shop.config";

// "Leave us a message" from the chat widget: saved for the owner (admin panel) and emailed to them.
export async function POST(req: Request) {
  const { email, message } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email) || typeof message !== "string" || message.trim().length < 2) {
    return NextResponse.json({ error: "Upišite ispravan e-mail i poruku." }, { status: 400 });
  }
  const text = message.trim().slice(0, 4000);
  if (!isDemo) {
    const { error } = await createSupabaseAdmin().from("chat_messages").insert({ email, message: text });
    if (error) return NextResponse.json({ error: "Poruka nije sačuvana, pokušajte ponovo." }, { status: 500 });
  }
  const owner = process.env.OWNER_EMAIL;
  if (owner) {
    await sendMail({
      to: owner,
      replyTo: email,
      subject: `Nova poruka iz chata (${shop.shortName})`,
      html: `<p><b>Od:</b> ${escape(email)}</p><p>${escape(text).replace(/\n/g, "<br>")}</p>`,
    });
  }
  return NextResponse.json({ ok: true });
}

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
