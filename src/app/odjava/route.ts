import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isDemo } from "@/lib/env";

export async function POST(req: Request) {
  if (!isDemo) await (await createSupabaseServer()).auth.signOut();
  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}
