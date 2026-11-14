import "server-only";
import { adminEmails, isDemo } from "./env";
import { createSupabaseServer } from "./supabase/server";
import type { Profile } from "./types";

/** The signed-in customer and their profile, or null. */
export async function getSession() {
  if (isDemo) return null;
  const supabase = await createSupabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
  const email = (data.user.email ?? "").toLowerCase();
  const isAdmin = Boolean((profile as Profile | null)?.is_admin) || adminEmails.includes(email);
  return { user: data.user, email, profile: profile as Profile | null, isAdmin };
}
