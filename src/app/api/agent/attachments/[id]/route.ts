import { agentAuthorised } from "@/lib/agent";
import { isUuid } from "@/lib/security";
import { attachmentResponse } from "@/lib/team";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!agentAuthorised(req.headers)) return new Response("unauthorised", { status: 401 });
  const { id } = await ctx.params;
  if (!isUuid(id)) return new Response("Not found", { status: 404 });
  return attachmentResponse(null, id);
}
