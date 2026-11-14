"use client";

import { useActionState } from "react";
import { saveProfile } from "@/app/(shop)/nalog/actions";
import { shop } from "@/shop.config";
import type { Profile } from "@/lib/types";

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [state, action, pending] = useActionState(saveProfile, null);
  const f = (name: keyof Profile, label: string, auto: string) => (
    <div>
      <label htmlFor={`pf-${name}`} className="label">{label}</label>
      <input id={`pf-${name}`} name={name} autoComplete={auto} defaultValue={(profile?.[name] as string) ?? ""} className="input" />
    </div>
  );
  return (
    <form action={action} className="mt-5 space-y-4">
      {f("full_name", "Ime i prezime", "name")}
      {f("phone", "Telefon", "tel")}
      {f("address", "Ulica i broj", "street-address")}
      <div className="grid grid-cols-[1fr_2fr] gap-3">
        {f("postal_code", "Pošt. broj", "postal-code")}
        {f("city", "Grad", "address-level2")}
      </div>
      <div>
        <label htmlFor="pf-country" className="label">Država</label>
        <select id="pf-country" name="country" defaultValue={profile?.country ?? "Bosna i Hercegovina"} className="input">
          {shop.shipping.countries.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <button disabled={pending} className="btn btn-dark w-full">{pending ? "Čuvam…" : "Sačuvaj podatke"}</button>
      {state && <p className={`text-[14px] ${state.ok ? "text-success" : "text-danger"}`}>{state.message}</p>}
    </form>
  );
}
