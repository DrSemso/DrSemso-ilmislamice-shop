import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { CURRENCY_COOKIE } from "@/lib/currency-cookie";

const SESSION_PATHS = ["/nalog", "/admin", "/korpa", "/narudzba"];

// Price currency always follows the visitor's country (Vercel geo header): Serbia → dinars, else euros.
// There is no manual switch, so the cookie is refreshed whenever the location says otherwise.
function withCurrency(request: NextRequest, response: NextResponse) {
  const country = request.headers.get("x-vercel-ip-country");
  const cur = !country || country === "RS" ? "RSD" : "EUR";
  if (request.cookies.get(CURRENCY_COOKIE)?.value === cur) return response;
  response.cookies.set(CURRENCY_COOKIE, cur, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return response;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!SESSION_PATHS.some((p) => path === p || path.startsWith(`${p}/`))) {
    return withCurrency(request, NextResponse.next());
  }
  return withCurrency(request, await refreshSession(request));
}

// Keeps the Supabase login session fresh on account, admin and checkout pages.
async function refreshSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon|.*\\.(?:png|jpg|jpeg|svg|webp|ico|txt|xml)$).*)"],
};
