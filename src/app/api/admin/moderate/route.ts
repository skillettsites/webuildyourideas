import { revalidatePath } from "next/cache";
import { SITE_URL } from "@/lib/config";
import { isUuid, signModeration, verifyModeration } from "@/lib/security";
import { sbRpc } from "@/lib/supabase";

// One-tap hide / restore links sent in the Telegram alert for each new idea.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") || "";
  const action = url.searchParams.get("a") || "";
  const sig = url.searchParams.get("s") || "";
  const page = (title: string, body: string, status = 200) =>
    new Response(
      `<!DOCTYPE html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title></head><body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#f5f5f7;color:#1d1d1f"><div style="background:#fff;border-radius:22px;padding:32px 28px;max-width:420px;text-align:center"><h1 style="font-size:24px;margin:0 0 10px">${title}</h1><p style="color:#6e6e73;margin:0 0 20px">${body}</p></div></body></html>`,
      { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } },
    );
  if (!isUuid(id) || !["hide", "show"].includes(action) || !verifyModeration(id, action, sig)) {
    return page("Link not valid", "This moderation link is not valid.", 403);
  }
  await sbRpc("wbyi_admin_set_idea", { p_id: id, p_status: action === "hide" ? "hidden" : "open", p_built_url: null, p_built_summary: null });
  revalidatePath("/ideas");
  revalidatePath("/");
  if (action === "hide") {
    const undo = `${SITE_URL}/api/admin/moderate?id=${id}&a=show&s=${signModeration(id, "show")}`;
    return page("Idea hidden", `It no longer shows on the site. <a href="${undo}" style="color:#0066cc">Undo</a>`);
  }
  return page("Idea restored", "It is back on the board.");
}
