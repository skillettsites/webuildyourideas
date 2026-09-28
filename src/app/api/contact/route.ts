import { after } from "next/server";
import { SITE_URL } from "@/lib/config";
import { fail, ok, readJson, rpcFail } from "@/lib/http";
import { cleanText, validEmail } from "@/lib/moderation";
import { ipHash } from "@/lib/security";
import { sbRpc } from "@/lib/supabase";
import { notifyOwner } from "@/lib/telegram";

export async function POST(req: Request) {
  const body = await readJson<{ name?: string; email?: string; message?: string; website?: string }>(req);
  if (body.website) return ok();
  const name = cleanText(body.name, 80);
  const email = cleanText(body.email, 200).toLowerCase();
  const message = cleanText(body.message, 4000);
  if (!validEmail(email)) return fail("Please enter a valid email address.");
  if (message.length < 5) return fail("Please write a short message.");
  try {
    await sbRpc("wbyi_contact", { p_name: name, p_email: email, p_message: message, p_ip_hash: ipHash(req.headers) });
    after(() => notifyOwner([`✉️ Contact form`, `${name || "No name"} · ${email}`, message.slice(0, 1500)], [{ text: "Admin", url: `${SITE_URL}/admin` }]));
    return ok();
  } catch (err) {
    return rpcFail(err);
  }
}
