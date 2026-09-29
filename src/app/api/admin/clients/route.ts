import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { validEmail } from "@/lib/moderation";
import { ADMIN_COOKIE, isAdminSession, isUuid } from "@/lib/security";
import { sbRpc } from "@/lib/supabase";

const PLANS = ["starter", "growth", "pro", "priority"];
const BILLING = ["stripe", "invoice", "complimentary"];

// Create or update a client (matched by email), optionally adding a site. Also changes a login email.
export async function POST(req: Request) {
  if (!isAdminSession((await cookies()).get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  const f = await req.formData();
  const back = new URL("/admin#clients", req.url);
  const get = (k: string) => String(f.get(k) || "").trim();
  if (get("action") === "email") {
    if (!isUuid(get("client_id")) || !validEmail(get("email").toLowerCase())) return NextResponse.json({ error: "bad input" }, { status: 400 });
    await sbRpc("wbyi_admin_client_set_email", { p_client_id: get("client_id"), p_email: get("email") });
    return NextResponse.redirect(back, 303);
  }
  const email = get("email").toLowerCase();
  if (!validEmail(email) || !get("name")) return NextResponse.json({ error: "email and name are required" }, { status: 400 });
  const plan = PLANS.includes(get("plan")) ? get("plan") : "starter";
  const billing = BILLING.includes(get("billing")) ? get("billing") : "stripe";
  const clientId = await sbRpc<string>("wbyi_admin_client_upsert", {
    p_email: email,
    p_name: get("name"),
    p_company: get("company"),
    p_plan: plan,
    p_billing: billing,
  });
  if (get("site_name")) {
    await sbRpc("wbyi_admin_site_add", { p_client_id: clientId, p_name: get("site_name"), p_url: get("site_url"), p_repo: get("site_repo"), p_status: "live" });
  }
  return NextResponse.redirect(back, 303);
}
