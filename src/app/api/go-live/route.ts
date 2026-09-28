import Stripe from "stripe";
import { after } from "next/server";
import { SITE_URL } from "@/lib/config";
import { sendGoLiveReceived } from "@/lib/email";
import { fail, ok, readJson, rpcFail } from "@/lib/http";
import { cleanText, validEmail } from "@/lib/moderation";
import { planById } from "@/lib/plans";
import { getPreview, validDomain } from "@/lib/previews";
import { ipHash } from "@/lib/security";
import { sbRpc } from "@/lib/supabase";
import { notifyOwner } from "@/lib/telegram";

type Body = { previewId?: string; email?: string; name?: string; plan?: string; domain?: string; message?: string };

function stripeKey(): string {
  return (process.env.STRIPE_SECRET_KEY || "").replace(/\\n$/, "").trim();
}

// "Make it live". Always records the request first, so a person can follow up even if
// checkout is abandoned. With Stripe configured it then hands over to Stripe Checkout;
// without it, the team confirms details by email and takes payment then.
export async function POST(req: Request) {
  const body = await readJson<Body>(req);
  const email = cleanText(body.email, 200).toLowerCase();
  const name = cleanText(body.name, 80);
  const message = cleanText(body.message, 2000);
  const plan = planById(String(body.plan || ""));
  const domain = cleanText(body.domain, 80).toLowerCase();
  if (!validEmail(email)) return fail("Please enter a valid email address.");
  if (!plan) return fail("Please choose a plan.");
  if (domain && !validDomain(domain)) return fail("Please choose a .com or .co.uk name, or leave it blank and we’ll help you pick one.");

  const preview = body.previewId ? await getPreview(String(body.previewId)).catch(() => null) : null;
  const previewUrl = preview ? `${SITE_URL}/start/${preview.id}` : null;

  try {
    await sbRpc("wbyi_request_live", {
      p_preview_id: preview?.id ?? null,
      p_email: email,
      p_name: name,
      p_plan: plan.id,
      p_domain: domain || preview?.domain || null,
      p_message: message,
      p_ip_hash: ipHash(req.headers),
    });
  } catch (err) {
    return rpcFail(err);
  }

  const key = stripeKey();
  if (key) {
    try {
      const stripe = new Stripe(key);
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: email,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "gbp",
              unit_amount: plan.price * 100,
              recurring: { interval: "month" },
              product_data: { name: `We Build Your Ideas: ${plan.name}`, description: plan.blurb },
            },
          },
        ],
        allow_promotion_codes: true,
        metadata: { site: "webuildyourideas", preview_id: preview?.id ?? "", plan: plan.id, domain: domain || preview?.domain || "" },
        subscription_data: { metadata: { site: "webuildyourideas", preview_id: preview?.id ?? "", plan: plan.id } },
        success_url: `${previewUrl ?? `${SITE_URL}/pricing`}?paid=1`,
        cancel_url: previewUrl ?? `${SITE_URL}/pricing`,
      });
      after(() =>
        notifyOwner([`🛒 Checkout started: ${plan.name} £${plan.price}/mo`, `${name || "No name"} · ${email}`, `Domain: ${domain || preview?.domain || "not chosen"}`], previewUrl ? [{ text: "Preview", url: previewUrl }] : []),
      );
      return ok({ checkoutUrl: session.url });
    } catch (err) {
      console.error("stripe checkout failed", err);
      // Fall through to the manual path so the customer is never stuck.
    }
  }

  after(async () => {
    await Promise.all([
      sendGoLiveReceived({ to: email, name, plan: `${plan.name} (£${plan.price} a month)`, domain: domain || preview?.domain || "", previewUrl }),
      notifyOwner(
        [
          `🚀 Go-live request: ${plan.name} £${plan.price}/mo`,
          `${name || "No name"} · ${email}`,
          `Domain: ${domain || preview?.domain || "not chosen"}`,
          message ? `Note: ${message.slice(0, 600)}` : "",
        ].filter(Boolean),
        previewUrl ? [{ text: "Open preview", url: previewUrl }, { text: "Admin", url: `${SITE_URL}/admin` }] : [{ text: "Admin", url: `${SITE_URL}/admin` }],
      ),
    ]);
  });
  return ok({ requested: true });
}
