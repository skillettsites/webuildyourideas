import { LIMITS } from "@/lib/config";
import { fail, ok, readJson, rpcFail } from "@/lib/http";
import { ACCENT_IDS, LAYOUT_IDS, getPreview, validDomain } from "@/lib/previews";
import { sanitiseContent, type AccentId, type LayoutId, type SiteContent } from "@/lib/site/content";
import { sbRpc } from "@/lib/supabase";

type Body = { content?: Partial<SiteContent>; layout?: string; accent?: string; domain?: string };

// Saves changes to a preview. Layout and colour are free. Changing the words uses one of
// the three free edits; the database enforces the limit.
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await readJson<Body>(req);
  try {
    const current = await getPreview(id);
    if (!current) return fail("We couldn’t find that preview.", 404);

    if (typeof body.domain === "string") {
      const domain = body.domain.trim().toLowerCase();
      if (!validDomain(domain)) return fail("Please choose a .com or .co.uk name.");
      await sbRpc("wbyi_set_preview_domain", { p_id: id, p_domain: domain });
    }

    const layout = LAYOUT_IDS.includes(body.layout as LayoutId) ? (body.layout as LayoutId) : current.layout;
    const accent = ACCENT_IDS.includes(body.accent as AccentId) ? (body.accent as AccentId) : current.accent;
    const content = body.content ? sanitiseContent(body.content, current.site) : current.site;

    const rows = await sbRpc<{ edits_used: number; error: string | null }[]>("wbyi_update_preview", {
      p_id: id,
      p_site: content,
      p_layout: layout,
      p_accent: accent,
      p_max_edits: LIMITS.freeEdits,
    });
    const r = rows?.[0];
    if (r?.error === "no_edits_left") return fail("You’ve used your free edits. Make it live and we’ll make any changes you like.", 409);
    if (r?.error === "locked_status") return fail("This preview is with our team now, so changes are handled by email.", 409);
    if (r?.error) return fail("We couldn’t save that. Please try again.", 400);
    return ok({ editsUsed: r?.edits_used ?? current.edits_used, content, layout, accent });
  } catch (err) {
    return rpcFail(err);
  }
}
