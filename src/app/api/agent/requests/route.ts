import { NextResponse } from "next/server";
import { agentAuthorised } from "@/lib/agent";
import { sbRpc } from "@/lib/supabase";

export const dynamic = "force-dynamic";
const STATUSES = ["new", "in_progress", "needs_info", "done", "declined"];

// GET /api/agent/requests?status=new,in_progress with header "Authorization: Bearer <AGENT_KEY>".
// The open work queue, Priority clients first.
export async function GET(req: Request) {
  if (!agentAuthorised(req.headers)) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  const param = new URL(req.url).searchParams.get("status");
  const statuses = (param ? param.split(",") : ["new", "in_progress", "needs_info"]).filter((s) => STATUSES.includes(s));
  const rows = await sbRpc<unknown[]>("wbyi_admin_requests", { p_statuses: statuses.length ? statuses : null });
  return NextResponse.json({ requests: rows ?? [] }, { headers: { "cache-control": "no-store" } });
}
