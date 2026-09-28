import Link from "next/link";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Faq, faqJsonLd } from "@/components/Faq";
import { PRICING_FAQS } from "@/lib/faqs";
import { PLANS } from "@/lib/plans";
import { SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Pricing: your website, live from £12 a month",
  description:
    "Simple monthly plans with your own .com or .co.uk, hosting, security and updates included. Free preview first, no card needed. Cancel any time.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  const offers = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Website design, hosting and updates",
    provider: { "@type": "Organization", name: "We Build Your Ideas", url: SITE_URL },
    areaServed: "GB",
    offers: PLANS.map((p) => ({
      "@type": "Offer",
      name: p.name,
      price: p.price.toFixed(2),
      priceCurrency: "GBP",
      priceSpecification: { "@type": "UnitPriceSpecification", price: p.price.toFixed(2), priceCurrency: "GBP", unitCode: "MON" },
      url: `${SITE_URL}/start`,
    })),
  };
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offers) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(PRICING_FAQS)) }} />
      <section className="px-5 pb-12 pt-14 text-center md:pt-20">
        <div className="mx-auto max-w-[820px]">
          <h1 className="display rise">Simple pricing.</h1>
          <p className="lede rise rise-1 mx-auto mt-5 max-w-[620px]">
            Every plan includes your own web address, hosting, security and a website designed for you. See a free preview first.
          </p>
        </div>
      </section>

      <section className="px-5 pb-20" aria-label="Plans">
        <div className="mx-auto grid max-w-[1180px] gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((p, i) => {
            const popular = "popular" in p && p.popular;
            return (
              <div
                key={p.id}
                className={`rise relative flex flex-col rounded-[28px] p-7 ${popular ? "bg-ink text-white" : "bg-cloud text-ink"}`}
                style={{ animationDelay: `${0.1 + i * 0.07}s` }}
              >
                {popular && <span className="absolute right-6 top-6 rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold">Most popular</span>}
                <h2 className="text-[24px] font-bold tracking-[-0.03em]">{p.name}</h2>
                <p className={`mt-1 text-[15px] ${popular ? "text-white/70" : "text-mute"}`}>{p.blurb}</p>
                <p className="mt-6 flex items-baseline gap-1">
                  <span className="text-[48px] font-bold tracking-[-0.04em]">£{p.price}</span>
                  <span className={`text-[15px] ${popular ? "text-white/70" : "text-mute"}`}>a month</span>
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2.5 text-[15px] leading-snug">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${popular ? "text-[#30d158]" : "text-green"}`} strokeWidth={3} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/start" className={`btn mt-8 w-full ${popular ? "btn-primary" : "btn-dark"}`}>
                  Start with a free preview
                </Link>
              </div>
            );
          })}
        </div>
        <p className="mx-auto mt-8 max-w-[720px] text-center text-[14px] leading-relaxed text-mute">
          Prices include everything you need to be online: domain registration and renewal, hosting, SSL security and the design itself. No set-up fee.
          Cancel any time.
        </p>
      </section>

      <section className="bg-cloud px-5 py-20 md:py-24">
        <div className="mx-auto grid max-w-[1080px] items-center gap-10 md:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow text-orange">Prefer free?</p>
            <h2 className="headline mt-2">Put your idea to the vote.</h2>
            <p className="mt-4 max-w-[560px] text-[19px] leading-snug text-mute">
              Every week the community picks one idea and we build it, free. It could be yours.
            </p>
          </div>
          <Link href="/ideas/submit" className="btn btn-primary btn-lg">
            Submit an idea
          </Link>
        </div>
      </section>

      <section className="px-5 py-20 md:py-28" aria-labelledby="pfaq">
        <div className="mx-auto max-w-[880px]">
          <h2 id="pfaq" className="headline">
            Good to know.
          </h2>
          <div className="mt-10">
            <Faq items={PRICING_FAQS} />
          </div>
        </div>
      </section>
    </div>
  );
}
