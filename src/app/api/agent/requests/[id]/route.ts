import { NextResponse } from "next/server";
import { agentAuthorised } from "@/lib/agent";
import { getRequest, type RequestStatus } from "@/lib/clients";
import { SITE_URL } from "@/lib/config";
import type { RequestSize } from "@/lib/plans";
import { isUuid } from "@/lib/security";
import { teamUpdate } from "@/lib/team";

export const dynamic = "force-dynamic";
const STATUSES = ["new", "in_progress", "needs_info", "done", "declined"];
const SIZES = ["small", "medium", "large"];

// GET: the full request, its thread and links to each attachment.
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!agentAuthorised(req.headers)) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  const { id } = await ctx.params;
  const detail = isUuid(id) ? await getRequest(null, id) : null;
  if (!detail) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(
    { ...detail, attachments: detail.attachments.map((a) => ({ ...a, url: `${SITE_URL}/api/agent/attachments/${a.id}` })) },
    { headers: { "cache-control": "no-store" } },
  );
}

// POST {status?, size?, message?, notify?, updateTitle?}: move a request along and tell the client.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!agentAuthorised(req.headers)) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  const { id } = await ctx.params;
  if (!isUuid(id)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const body = (await req.json().catch(() => ({}))) as { status?: string; size?: string; message?: string; notify?: boolean; updateTitle?: string };
  if (body.status && !STATUSES.includes(body.status)) return NextResponse.json({ error: "bad status" }, { status: 400 });
  if (body.size && !SIZES.includes(body.size)) return NextResponse.json({ error: "bad size" }, { status: 400 });
  const res = await teamUpdate({
    requestId: id,
    status: (body.status as RequestStatus) || null,
    size: (body.size as RequestSize) || null,
    message: body.message || null,
    notify: body.notify !== false,
    updateTitle: body.updateTitle || null,
  });
  return NextResponse.json(res, { status: res.ok ? 200 : 404 });
}
