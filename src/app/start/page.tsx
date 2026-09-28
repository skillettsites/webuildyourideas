import Link from "next/link";
import type { Metadata } from "next";
import { StartForm } from "@/components/StartForm";

export const metadata: Metadata = {
  title: "Get a website: see a free preview in seconds",
  description:
    "Describe your business in plain English and see your new website straight away. Free preview, no sign-up. Live on your own .com or .co.uk from £12 a month.",
  alternates: { canonical: "/start" },
};

export default function StartPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="hero-glow top-[-8%] !opacity-[0.18]" aria-hidden="true" />
      <section className="relative px-5 pb-20 pt-14 md:pt-20">
        <div className="mx-auto grid max-w-[1080px] gap-12 lg:grid-cols-[1fr_520px] lg:items-start">
          <div className="lg:pt-10">
            <p className="eyebrow rise text-blue">Your website, today</p>
            <h1 className="display rise rise-1 mt-2">
              See your website
              <br />
              in seconds.
            </h1>
            <p className="lede rise rise-2 mt-6 max-w-[520px]">
              Tell us about your business or project. We’ll design a preview instantly, find a name you can own, and make it live whenever
              you’re ready.
            </p>
            <ol className="rise rise-3 mt-10 space-y-5">
              {[
                ["Describe it", "A few sentences, typed or spoken. That’s all we need."],
                ["Make it yours", "Pick a style and colour, tweak the words, and check your .com or .co.uk."],
                ["Go live", "Choose a plan from £12 a month. We set everything up and keep it running."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-[14px] font-semibold text-white">{i + 1}</span>
                  <div>
                    <p className="text-[17px] font-semibold tracking-[-0.02em] text-ink">{t}</p>
                    <p className="text-[15px] text-mute">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="rise rise-3 mt-10 text-[15px] text-mute">
              Got an idea for something bigger?{" "}
              <Link href="/ideas/submit" className="text-link hover:underline">
                Put it to the weekly vote
              </Link>{" "}
              and we might build it for free.
            </p>
          </div>
          <div className="rise rise-2">
            <StartForm />
          </div>
        </div>
      </section>
    </div>
  );
}
