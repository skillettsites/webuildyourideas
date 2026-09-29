import { after } from "next/server";
import { currentClientId, getRequest } from "@/lib/clients";
import { SITE_URL } from "@/lib/config";
import { fail, ok, readJson, rpcFail } from "@/lib/http";
import { cleanText } from "@/lib/moderation";
import { sbRpc } from "@/lib/supabase";
import { notifyOwner } from "@/lib/telegram";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const clientId = await currentClientId();
  if (!clientId) return fail("Please sign in again.", 401);
  const { id } = await ctx.params;
  const body = await readJson<{ body?: string }>(req);
  const text = cleanText(body.body, 8000);
  if (!text) return fail("Please write a message.");
  const detail = await getRequest(clientId, id);
  if (!detail) return fail("We couldn’t find that request.", 404);
  try {
    const messageId = await sbRpc<string>("wbyi_request_reply", { p_client_id: clientId, p_request_id: id, p_body: text });
    after(() =>
      notifyOwner(
        [`💬 ${detail.request.client.name} replied on #${detail.request.ref}: ${detail.request.title}`, text.slice(0, 900)],
        [{ text: "Open in admin", url: `${SITE_URL}/admin/requests/${id}` }],
      ),
    );
    return ok({ messageId });
  } catch (err) {
    return rpcFail(err);
  }
}
