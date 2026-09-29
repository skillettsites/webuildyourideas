import { after } from "next/server";
import { currentClientId, getClientHome } from "@/lib/clients";
import { SITE_URL } from "@/lib/config";
import { sendRequestReceived } from "@/lib/email";
import { fail, ok, readJson, rpcFail } from "@/lib/http";
import { cleanText } from "@/lib/moderation";
import { isUuid } from "@/lib/security";
import { sbRpc } from "@/lib/supabase";
import { notifyOwner } from "@/lib/telegram";

export async function POST(req: Request) {
  const clientId = await currentClientId();
  if (!clientId) return fail("Please sign in again.", 401);
  const body = await readJson<{ siteId?: string; title?: string; details?: string }>(req);
  const title = cleanText(body.title, 120);
  const details = cleanText(body.details, 8000);
  if (title.length < 3) return fail("Please give your request a short title.");
  const home = await getClientHome(clientId);
  if (!home) return fail("Please sign in again.", 401);
  const siteId = isUuid(body.siteId) ? body.siteId : home.sites[0]?.id ?? null;
  try {
    const rows = await sbRpc<{ out_id: string; out_ref: number }[]>("wbyi_request_create", { p_client_id: clientId, p_site_id: siteId, p_title: title, p_details: details });
    const created = rows?.[0];
    if (!created) return fail("Something went wrong. Please try again.", 500);
    const site = home.sites.find((s) => s.id === siteId);
    const url = `${SITE_URL}/account/requests/${created.out_id}`;
    after(async () => {
      await Promise.all([
        notifyOwner(
          [
            `${home.client.plan === "priority" ? "🟣 PRIORITY " : ""}Request #${created.out_ref} from ${home.client.name}${site ? ` (${site.name})` : ""}`,
            title,
            details.slice(0, 900),
          ],
          [{ text: "Open in admin", url: `${SITE_URL}/admin/requests/${created.out_id}` }],
        ),
        sendRequestReceived({ to: home.client.email, name: home.client.name, ref: created.out_ref, title, url, priority: home.client.plan === "priority" }),
      ]);
    });
    return ok({ id: created.out_id, ref: created.out_ref });
  } catch (err) {
    return rpcFail(err);
  }
}
