import { SITE_URL } from "@/lib/config";
import { hashCode, hashToken, newLoginSecrets, normaliseEmail } from "@/lib/clients";
import { sendLoginCode } from "@/lib/email";
import { fail, ok, readJson } from "@/lib/http";
import { validEmail } from "@/lib/moderation";
import { ipHash } from "@/lib/security";
import { RpcError, sbRpc } from "@/lib/supabase";

// Always answers the same way, so this can't be used to find out who has an account.
export async function POST(req: Request) {
  const body = await readJson<{ email?: string }>(req);
  const email = normaliseEmail(String(body.email || ""));
  if (!validEmail(email)) return fail("Please enter a valid email address.");
  const { code, token } = newLoginSecrets();
  try {
    const rows = await sbRpc<{ out_client_id: string; out_name: string }[]>("wbyi_login_start", {
      p_email: email,
      p_code_hash: hashCode(email, code),
      p_token_hash: hashToken(email, token),
      p_ip_hash: ipHash(req.headers),
    });
    const client = rows?.[0];
    if (client) {
      const link = `${SITE_URL}/api/auth/link?e=${encodeURIComponent(email)}&t=${token}`;
      const sent = await sendLoginCode({ to: email, name: client.out_name, code, link });
      if (!sent.sent) console.error("login email failed", sent.reason);
    }
    return ok();
  } catch (err) {
    if (err instanceof RpcError && err.message === "rate_limited") return fail("Too many sign-in attempts. Please wait a few minutes and try again.", 429);
    console.error("login start failed", err);
    return fail("Something went wrong. Please try again.", 500);
  }
}
