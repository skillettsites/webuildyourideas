import { checkDomains } from "@/lib/domains";
import { fail, ok, readJson, rpcFail } from "@/lib/http";
import { cleanText } from "@/lib/moderation";
import { ipHash } from "@/lib/security";
import { sbRpc } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await readJson<{ name?: string; place?: string }>(req);
  const name = cleanText(body.name, 60);
  if (name.replace(/[^a-z0-9]/gi, "").length < 2) return fail("Type the name you’d like, for example brightcrumb.");
  try {
    const allowed = await sbRpc<boolean>("wbyi_rdap_allow", { p_ip_hash: ipHash(req.headers) });
    if (!allowed) return fail("Name checks are paused for today. Please try again tomorrow.", 429);
    const { label, results } = await checkDomains(name, cleanText(body.place, 40));
    return ok({ label, results });
  } catch (err) {
    return rpcFail(err);
  }
}
