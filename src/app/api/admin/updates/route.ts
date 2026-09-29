import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isAdminSession, isUuid } from "@/lib/security";
import { sbRpc } from "@/lib/supabase";

// Post an item to a client's "Recent updates" feed (work done outside a request).
export async function POST(req: Request) {
  if (!isAdminSession((await cookies()).get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  const f = await req.formData();
  const clientId = String(f.get("client_id") || "");
  const title = String(f.get("title") || "").trim();
  if (!isUuid(clientId) || title.length < 3) return NextResponse.json({ error: "bad input" }, { status: 400 });
  const siteId = String(f.get("site_id") || "");
  await sbRpc("wbyi_admin_update_post", {
    p_client_id: clientId,
    p_site_id: isUuid(siteId) ? siteId : null,
    p_request_id: null,
    p_title: title,
    p_body: String(f.get("body") || ""),
    p_at: null,
  });
  return NextResponse.redirect(new URL("/admin#clients", req.url), 303);
}
