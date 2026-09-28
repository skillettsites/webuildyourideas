import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminSessionValue, checkAdminPassword } from "@/lib/security";

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const password = String(form?.get("password") || "");
  const url = new URL("/admin", req.url);
  if (!checkAdminPassword(password)) {
    await new Promise((r) => setTimeout(r, 800));
    url.searchParams.set("e", "1");
    return NextResponse.redirect(url, 303);
  }
  const res = NextResponse.redirect(url, 303);
  res.cookies.set(ADMIN_COOKIE, adminSessionValue(), { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
