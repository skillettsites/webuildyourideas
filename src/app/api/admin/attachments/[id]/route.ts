import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminSession, isUuid } from "@/lib/security";
import { attachmentResponse } from "@/lib/team";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdminSession((await cookies()).get(ADMIN_COOKIE)?.value)) return new Response("unauthorised", { status: 401 });
  const { id } = await ctx.params;
  if (!isUuid(id)) return new Response("Not found", { status: 404 });
  return attachmentResponse(null, id);
}
