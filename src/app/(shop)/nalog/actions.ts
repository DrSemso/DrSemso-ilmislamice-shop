"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function saveProfile(_: unknown, form: FormData) {
  const supabase = await createSupabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { ok: false, message: "Prijavite se ponovo." };
  const get = (k: string) => String(form.get(k) ?? "").trim().slice(0, 200) || null;
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: get("full_name"), phone: get("phone"), address: get("address"), city: get("city"), postal_code: get("postal_code"), country: get("country") })
    .eq("id", data.user.id);
  revalidatePath("/nalog");
  return error ? { ok: false, message: "Podaci nisu sačuvani." } : { ok: true, message: "Sačuvano." };
}
