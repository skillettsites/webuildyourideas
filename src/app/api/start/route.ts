import { fail, ok, readJson, rpcFail } from "@/lib/http";
import { cleanText } from "@/lib/moderation";
import { newPreviewId } from "@/lib/previews";
import { ipHash } from "@/lib/security";
import { buildSite } from "@/lib/site/content";
import { sbRpc } from "@/lib/supabase";

// Creates a free preview from a description. Pure template work, no paid API is called.
export async function POST(req: Request) {
  const body = await readJson<{ name?: string; description?: string; website?: string }>(req);
  if (body.website) return fail("Please try again.");
  const name = cleanText(body.name, 60);
  const description = cleanText(body.description, 2000);
  if (description.replace(/\s/g, "").length < 12) {
    return fail("Tell us a little more: what it is, who it’s for, and where you are.");
  }
  const site = buildSite({ name, description });
  const id = newPreviewId();
  try {
    await sbRpc("wbyi_create_preview", {
      p_id: id,
      p_ip_hash: ipHash(req.headers),
      p_name: name || site.content.brand,
      p_dump: description,
      p_site: site.content,
      p_layout: site.layout,
      p_accent: site.accent,
    });
    return ok({ id });
  } catch (err) {
    return rpcFail(err);
  }
}
