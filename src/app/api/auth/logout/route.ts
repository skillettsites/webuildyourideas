import { NextResponse } from "next/server";
import { CLIENT_COOKIE, SIGNED_IN_HINT } from "@/lib/clients";

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/login?out=1", req.url), 303);
  res.cookies.delete(CLIENT_COOKIE);
  res.cookies.delete(SIGNED_IN_HINT);
  return res;
}
