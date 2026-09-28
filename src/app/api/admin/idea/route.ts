import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isAdminSession, isUuid } from "@/lib/security";
import { sbRpc } from "@/lib/supabase";

const STATUSES = ["open", "hidden", "winner", "building", "built", "removed"];

export async function POST(req: Request) {
  if (!isAdminSession((await cookies()).get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  const form = await req.formData();
  const id = String(form.get("id") || "");
  const status = String(form.get("status") || "");
  const builtUrl = String(form.get("built_url") || "").trim();
  const builtSummary = String(form.get("built_summary") || "").trim();
  const slug = String(form.get("slug") || "");
  if (!isUuid(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  if (status && !STATUSES.includes(status)) return NextResponse.json({ error: "bad status" }, { status: 400 });
  if (builtUrl && !/^https:\/\/[^\s]+$/.test(builtUrl)) return NextResponse.json({ error: "built url must start with https://" }, { status: 400 });
  await sbRpc("wbyi_admin_set_idea", {
    p_id: id,
    p_status: status || null,
    p_built_url: builtUrl || null,
    p_built_summary: builtSummary || null,
  });
  for (const p of ["/", "/ideas", "/built", "/ideas/past"]) revalidatePath(p);
  if (/^[a-z0-9-]+$/.test(slug)) revalidatePath(`/ideas/${slug}`);
  return NextResponse.redirect(new URL("/admin#ideas", req.url), 303);
}
