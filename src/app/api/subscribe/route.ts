import { fail, ok, readJson, rpcFail } from "@/lib/http";
import { cleanText, validEmail } from "@/lib/moderation";
import { sbRpc } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await readJson<{ email?: string; source?: string }>(req);
  const email = cleanText(body.email, 200).toLowerCase();
  if (!validEmail(email)) return fail("Please enter a valid email address.");
  try {
    await sbRpc("wbyi_subscribe", { p_email: email, p_source: cleanText(body.source, 40) || "site" });
    return ok();
  } catch (err) {
    return rpcFail(err);
  }
}
