import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isAdminSession, isUuid } from "@/lib/security";
import { sbRpc } from "@/lib/supabase";

// Refresh the like count on a TikTok idea as the comment keeps collecting likes.
export async function POST(req: Request) {
  if (!isAdminSession((await cookies()).get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  const form = await req.formData();
  const id = String(form.get("id") || "");
  const slug = String(form.get("slug") || "");
  const raw = String(form.get("likes") || "").trim().toLowerCase();
  const mult = raw.endsWith("k") ? 1000 : raw.endsWith("m") ? 1_000_000 : 1;
  const likes = Math.round(parseFloat(raw.replace(/[km]$/, "").replace(/,/g, "")) * mult);
  if (!isUuid(id) || !Number.isFinite(likes) || likes < 0) return NextResponse.json({ error: "bad input" }, { status: 400 });
  await sbRpc("wbyi_admin_set_tiktok_likes", { p_id: id, p_likes: likes });
  for (const p of ["/", "/ideas"]) revalidatePath(p);
  if (/^[a-z0-9-]+$/.test(slug)) revalidatePath(`/ideas/${slug}`);
  return NextResponse.redirect(new URL("/admin#ideas", req.url), 303);
}
