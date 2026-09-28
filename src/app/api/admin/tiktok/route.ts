import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CATEGORIES } from "@/lib/config";
import { cleanText } from "@/lib/moderation";
import { parseTikTokLines, titleFrom } from "@/lib/tiktok";
import { ADMIN_COOKIE, isAdminSession } from "@/lib/security";
import { sbRpc } from "@/lib/supabase";

export async function POST(req: Request) {
  if (!isAdminSession((await cookies()).get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  const form = await req.formData();
  const lines = String(form.get("lines") || "");
  const url = cleanText(form.get("url"), 300);
  const category = String(form.get("category") || "other");
  const back = new URL("/admin#tiktok", req.url);
  if (url && !/^https:\/\/(www\.|vm\.|m\.)?tiktok\.com\//.test(url)) {
    back.searchParams.set("tt", "That doesn't look like a TikTok link.");
    return NextResponse.redirect(back, 303);
  }
  if (!CATEGORIES.some((c) => c.id === category)) return NextResponse.json({ error: "bad category" }, { status: 400 });
  const { rows, errors } = parseTikTokLines(lines);
  let added = 0;
  for (const r of rows.slice(0, 50)) {
    try {
      await sbRpc("wbyi_admin_add_tiktok", {
        p_title: titleFrom(r.comment),
        p_description: cleanText(r.comment, 1200),
        p_category: category,
        p_handle: r.handle,
        p_likes: r.likes,
        p_url: url || null,
      });
      added++;
    } catch (err) {
      errors.push(`${r.handle}: ${err instanceof Error ? err.message : "failed"}`);
    }
  }
  for (const p of ["/", "/ideas"]) revalidatePath(p);
  back.searchParams.set("tt", `Added ${added} TikTok ${added === 1 ? "idea" : "ideas"}.${errors.length ? ` Skipped: ${errors.join("; ").slice(0, 300)}` : ""}`);
  return NextResponse.redirect(back, 303);
}
