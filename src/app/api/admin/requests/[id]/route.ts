import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { RequestStatus } from "@/lib/clients";
import type { RequestSize } from "@/lib/plans";
import { ADMIN_COOKIE, isAdminSession, isUuid } from "@/lib/security";
import { storeUpload, teamUpdate } from "@/lib/team";

const STATUSES = ["new", "in_progress", "needs_info", "done", "declined"];
const SIZES = ["small", "medium", "large"];

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdminSession((await cookies()).get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  const { id } = await ctx.params;
  if (!isUuid(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  const f = await req.formData();
  const status = String(f.get("status") || "");
  const size = String(f.get("size") || "");
  const res = await teamUpdate({
    requestId: id,
    status: STATUSES.includes(status) ? (status as RequestStatus) : null,
    size: SIZES.includes(size) ? (size as RequestSize) : null,
    message: String(f.get("message") || "").trim(),
    notify: f.get("notify") !== "0",
  });
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 404 });
  for (const file of f.getAll("files")) {
    if (file instanceof File && file.size > 0) await storeUpload(file, id, null, null);
  }
  return NextResponse.redirect(new URL(`/admin/requests/${id}?saved=1`, req.url), 303);
}
