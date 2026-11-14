"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";

// Passwordless login: e-mail -> one-time code from the e-mail -> signed in.
export function LoginForm({ next = "/nalog", demo = false }: { next?: string; demo?: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    if (demo) return setError("Prijava radi kad se poveže baza (Supabase).");
    setBusy(true);
    setError(null);
    const { error } = await createSupabaseBrowser().auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
    setBusy(false);
    if (error) return setError(error.status === 429 ? "Previše pokušaja. Sačekajte minutu pa pokušajte ponovo." : "Kod nije poslan. Provjerite e-mail adresu.");
    setStep("code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await createSupabaseBrowser().auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    setBusy(false);
    if (error) return setError("Kod nije ispravan ili je istekao. Pokušajte ponovo ili zatražite novi kod.");
    router.replace(next);
    router.refresh();
  }

  return step === "email" ? (
    <form onSubmit={sendCode} className="space-y-4">
      <div>
        <label htmlFor="login-email" className="label">E-mail adresa</label>
        <input id="login-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="ime@primjer.com" />
      </div>
      {error && <p role="alert" className="text-[14px] text-danger">{error}</p>}
      <button disabled={busy} className="btn btn-dark w-full py-3.5">{busy ? "Šaljem kod…" : "Pošalji kod za prijavu"}</button>
      <p className="text-[13px] text-muted">Nije potrebna lozinka. Kod stiže na e-mail za nekoliko sekundi.</p>
    </form>
  ) : (
    <form onSubmit={verify} className="space-y-4">
      <p className="text-[15px]">Poslali smo kod na <b>{email}</b>. Upišite ga ispod.</p>
      <div>
        <label htmlFor="login-code" className="label">Kod iz e-maila</label>
        <input
          id="login-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          maxLength={10}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="input text-center text-[22px] tracking-[0.4em] tabular-nums"
        />
      </div>
      {error && <p role="alert" className="text-[14px] text-danger">{error}</p>}
      <button disabled={busy || code.length < 6} className="btn btn-dark w-full py-3.5">{busy ? "Provjeravam…" : "Prijavi se"}</button>
      <button type="button" onClick={() => { setStep("email"); setCode(""); setError(null); }} className="text-[14px] link">
        Promijeni e-mail ili pošalji novi kod
      </button>
    </form>
  );
}
