import { NextResponse } from "next/server";
import { CLIENT_COOKIE, SIGNED_IN_HINT, hashToken, normaliseEmail, sessionCookieOptions, sessionValue } from "@/lib/clients";
import { sbRpc } from "@/lib/supabase";

// The "Sign in" button in the email.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = normaliseEmail(url.searchParams.get("e") || "");
  const token = (url.searchParams.get("t") || "").trim();
  const fail = NextResponse.redirect(new URL("/login?expired=1", req.url), 303);
  if (!email || !/^[a-f0-9]{48}$/.test(token)) return fail;
  try {
    const clientId = await sbRpc<string | null>("wbyi_login_verify", { p_email: email, p_code_hash: null, p_token_hash: hashToken(email, token) });
    if (!clientId) return fail;
    const s = sessionValue(clientId);
    const res = NextResponse.redirect(new URL("/account", req.url), 303);
    res.cookies.set(CLIENT_COOKIE, s.value, { ...sessionCookieOptions, maxAge: s.maxAge });
    res.cookies.set(SIGNED_IN_HINT, "1", { path: "/", sameSite: "lax", secure: true, maxAge: s.maxAge });
    return res;
  } catch {
    return fail;
  }
}
