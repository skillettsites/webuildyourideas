import Stripe from "stripe";
import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/config";
import { sbRpc } from "@/lib/supabase";
import { notifyOwner } from "@/lib/telegram";

function env(name: string) {
  return (process.env[name] || "").replace(/\\n$/, "").trim();
}

// Marks a preview as paid when Stripe confirms the first payment. Inactive until
// STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are set.
export async function POST(req: Request) {
  const key = env("STRIPE_SECRET_KEY");
  const secret = env("STRIPE_WEBHOOK_SECRET");
  if (!key || !secret) return NextResponse.json({ error: "stripe not configured" }, { status: 503 });
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = new Stripe(key).webhooks.constructEvent(raw, req.headers.get("stripe-signature") || "", secret);
  } catch {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    if (s.metadata?.site === "webuildyourideas") {
      const previewId = s.metadata.preview_id || "";
      if (previewId) {
        await sbRpc("wbyi_mark_paid", {
          p_preview_id: previewId,
          p_session_id: s.id,
          p_plan: s.metadata.plan || null,
          p_email: s.customer_details?.email || s.customer_email || null,
        }).catch((err) => console.error("mark paid failed", err));
      }
      await notifyOwner(
        [
          `💷 New subscriber: ${s.metadata.plan} · £${((s.amount_total ?? 0) / 100).toFixed(2)}/mo`,
          `${s.customer_details?.email || s.customer_email || "no email"}`,
          `Domain: ${s.metadata.domain || "not chosen"}`,
        ],
        previewId ? [{ text: "Preview", url: `${SITE_URL}/start/${previewId}` }] : [],
      );
    }
  }
  return NextResponse.json({ received: true });
}
