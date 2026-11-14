import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { shop } from "@/shop.config";
import { catalogAnswer, faqAnswer, systemPrompt } from "@/lib/chat";

type Msg = { role: "user" | "assistant"; content: string };

const FALLBACK = `Hvala na pitanju! Na ovo će Vam najbolje odgovoriti naš tim: pišite na ${shop.contact.email} ili na WhatsApp ${shop.contact.phone}. Možete nam ostaviti i poruku ovdje, uz Vaš e-mail.`;

export async function POST(req: Request) {
  let messages: Msg[];
  try {
    const body = await req.json();
    messages = (body.messages as Msg[])
      .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
    if (!messages.length || messages[messages.length - 1].role !== "user") throw new Error();
    while (messages[0]?.role !== "user") messages.shift();
  } catch {
    return NextResponse.json({ error: "Neispravan upit." }, { status: 400 });
  }

  const question = messages[messages.length - 1].content;

  if (!process.env.ANTHROPIC_API_KEY) {
    const reply = faqAnswer(question) ?? (await catalogAnswer(question)) ?? FALLBACK;
    return NextResponse.json({ reply, source: "faq" });
  }

  try {
    const client = new Anthropic();
    const response = await client.beta.messages.create({
      model: process.env.CHAT_MODEL || "claude-opus-5-5",
      max_tokens: 1024,
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [{ type: "text", text: await systemPrompt(), cache_control: { type: "ephemeral" } }],
      messages,
    });
    if (response.stop_reason === "refusal") {
      return NextResponse.json({ reply: FALLBACK, source: "ai" });
    }
    const reply = response.content
      .flatMap((b) => (b.type === "text" ? [b.text] : []))
      .join("\n")
      .trim();
    return NextResponse.json({ reply: reply || FALLBACK, source: "ai" });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) console.error("chat: rate limited");
    else if (error instanceof Anthropic.APIError) console.error(`chat: API error ${error.status}`, error.message);
    else console.error("chat:", error);
    const reply = faqAnswer(question) ?? (await catalogAnswer(question)) ?? FALLBACK;
    return NextResponse.json({ reply, source: "faq" });
  }
}
