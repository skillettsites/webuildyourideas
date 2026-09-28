import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isAdminSession, isUuid } from "@/lib/security";
import { sbRpc } from "@/lib/supabase";

export async function POST(req: Request) {
  if (!isAdminSession((await cookies()).get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  const form = await req.formData();
  const id = String(form.get("id") || "");
  if (!isUuid(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  await sbRpc("wbyi_admin_mark_lead", { p_id: id, p_handled: form.get("handled") === "1" });
  return NextResponse.redirect(new URL("/admin#requests", req.url), 303);
}
