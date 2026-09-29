import { NextResponse } from "next/server";
import { CLIENT_COOKIE, SIGNED_IN_HINT, hashCode, normaliseEmail, sessionCookieOptions, sessionValue } from "@/lib/clients";
import { readJson } from "@/lib/http";
import { sbRpc } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await readJson<{ email?: string; code?: string }>(req);
  const email = normaliseEmail(String(body.email || ""));
  const code = String(body.code || "").replace(/\D/g, "");
  if (code.length !== 6) return NextResponse.json({ ok: false, error: "Enter the six-digit code from the email." }, { status: 400 });
  try {
    const clientId = await sbRpc<string | null>("wbyi_login_verify", { p_email: email, p_code_hash: hashCode(email, code), p_token_hash: null });
    if (!clientId) return NextResponse.json({ ok: false, error: "That code didn’t work. Check it, or send a new one." }, { status: 401 });
    const s = sessionValue(clientId);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(CLIENT_COOKIE, s.value, { ...sessionCookieOptions, maxAge: s.maxAge });
    res.cookies.set(SIGNED_IN_HINT, "1", { path: "/", sameSite: "lax", secure: true, maxAge: s.maxAge });
    return res;
  } catch (err) {
    console.error("verify failed", err);
    return NextResponse.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
