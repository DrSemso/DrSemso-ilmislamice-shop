"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, MessageCircle, Minus, Send } from "lucide-react";
import { shop } from "@/shop.config";

type Msg = { role: "user" | "assistant"; content: string };

const QUICK = ["Koliko traje dostava?", "Da li dostavljate u moju zemlju?", "Kako se plaća?", "Preporučite mi knjigu"];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [big, setBig] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [leave, setLeave] = useState<"no" | "form" | "sent">("no");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy, leave]);

  async function ask(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply ?? data.error ?? "Došlo je do greške." }]);
    } catch {
      setMessages([...next, { role: "assistant", content: `Veza nije uspjela. Pišite nam na ${shop.contact.email}.` }]);
    } finally {
      setBusy(false);
    }
  }

  async function sendNote(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, message: note || messages.filter((m) => m.role === "user").map((m) => m.content).join("\n") }),
    });
    if (res.ok) setLeave("sent");
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-dark p-4 sm:py-3 sm:pl-4 sm:pr-5 text-[14px] font-medium text-on-dark shadow-lg transition hover:bg-accent"
        style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <MessageCircle size={18} /> <span className="hidden sm:inline">Trebate li pomoć?</span><span className="sr-only sm:hidden">Chat</span>
      </button>
    );
  }

  return (
    <section
      aria-label="Chat"
      className={`fixed bottom-0 right-0 z-50 flex flex-col overflow-hidden bg-white shadow-2xl sm:bottom-5 sm:right-5 sm:rounded-3xl ${
        big ? "h-[100dvh] w-full sm:h-[min(760px,calc(100dvh-40px))] sm:w-[640px]" : "h-[100dvh] w-full sm:h-[560px] sm:w-[420px]"
      }`}
    >
      <div className="flex justify-end gap-2 p-3">
        <button onClick={() => setBig((b) => !b)} aria-label={big ? "Smanji" : "Proširi"} className="hidden h-9 w-9 place-items-center rounded-full border border-line text-muted hover:text-ink sm:grid">
          {big ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
        <button onClick={() => setOpen(false)} aria-label="Zatvori chat" className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted hover:text-ink">
          <Minus size={16} />
        </button>
      </div>

      <div ref={scroller} className="flex-1 overflow-y-auto px-5 pb-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col justify-end pb-2">
            <p className="text-center text-[17px] font-semibold leading-snug text-ink">
              Imate pitanje ili trebate pomoć?
              <br />
              Pišite nam.
            </p>
            <p className="mt-6 text-[13px] leading-relaxed text-muted">
              Odgovore daje automatski asistent na osnovu podataka o knjižari. Za sve što ne zna, javit će Vam se naš tim. Ne upisujte osjetljive lične podatke.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-[14.5px] leading-relaxed ${
                  m.role === "user" ? "self-end bg-dark text-on-dark" : "self-start bg-surface text-ink"
                }`}
              >
                <Linkified text={m.content} />
              </div>
            ))}
            {busy && <div className="self-start rounded-2xl bg-surface px-4 py-2.5 text-[14px] text-muted">Pišem odgovor…</div>}
            {messages.length >= 2 && leave === "no" && (
              <button onClick={() => setLeave("form")} className="self-start text-[13px] text-muted link">
                Želite da Vam se javimo e-mailom?
              </button>
            )}
            {leave === "form" && (
              <form onSubmit={sendNote} className="flex flex-col gap-2 rounded-2xl border border-line p-3">
                <label htmlFor="chat-email" className="text-[13px] font-medium">Vaš e-mail</label>
                <input id="chat-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input py-2 text-[14px]" />
                <label htmlFor="chat-note" className="text-[13px] font-medium">Poruka (nije obavezno)</label>
                <textarea id="chat-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} className="input py-2 text-[14px]" />
                <button className="btn btn-dark py-2">Pošalji</button>
              </form>
            )}
            {leave === "sent" && <p className="text-[13px] text-success">Hvala! Javit ćemo Vam se uskoro.</p>}
          </div>
        )}
      </div>

      <div className="px-4 pb-4" style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom, 0px))" }}>
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {QUICK.map((q) => (
            <button key={q} onClick={() => ask(q)} disabled={busy} className="shrink-0 rounded-full border border-line px-3.5 py-1.5 text-[13.5px] font-medium hover:border-ink">
              {q}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex items-center gap-2 rounded-2xl border border-line px-4 py-2.5 focus-within:border-ink"
        >
          <label htmlFor="chat-input" className="sr-only">Pitanje</label>
          <input id="chat-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Pitaj bilo što…" className="flex-1 bg-transparent text-[15px] focus:outline-none" />
          <button disabled={busy || !input.trim()} aria-label="Pošalji" className="text-ink disabled:text-muted/50">
            <Send size={18} />
          </button>
        </form>
      </div>
    </section>
  );
}

function Linkified({ text }: { text: string }) {
  const parts = text.split(/((?:https?:\/\/[^\s)]+)|(?:\/proizvod\/[a-z0-9-]+))/g);
  return (
    <>
      {parts.map((p, i) =>
        /^(https?:\/\/|\/proizvod\/)/.test(p) ? (
          <a key={i} href={p} className="underline underline-offset-2">
            {p.includes("/proizvod/") ? "Pogledaj knjigu" : p}
          </a>
        ) : (
          p
        ),
      )}
    </>
  );
}
