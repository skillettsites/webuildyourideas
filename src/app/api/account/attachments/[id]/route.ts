import { currentClientId } from "@/lib/clients";
import { isUuid } from "@/lib/security";
import { attachmentResponse } from "@/lib/team";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const clientId = await currentClientId();
  if (!clientId) return new Response("Please sign in.", { status: 401 });
  const { id } = await ctx.params;
  if (!isUuid(id)) return new Response("Not found", { status: 404 });
  return attachmentResponse(clientId, id);
}
