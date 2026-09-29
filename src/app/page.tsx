import Link from "next/link";
import type { Metadata } from "next";
import { CalendarCheck, ChevronRight, Globe, LayoutDashboard, MapPinned, ShoppingBag, Calculator } from "lucide-react";
import { Countdown } from "@/components/Countdown";
import { Faq, faqJsonLd } from "@/components/Faq";
import { HeroShowcase } from "@/components/HeroShowcase";
import { IdeaRow } from "@/components/IdeaRow";
import { PhoneSample } from "@/components/PhoneSample";
import { HOME_FAQS } from "@/lib/faqs";
import { getCurrentRoundIdeas, getWinners } from "@/lib/ideas";
import { formatRoundClose, roundNumber } from "@/lib/rounds";

export const revalidate = 30;

export const metadata: Metadata = {
  title: { absolute: "We Build Your Ideas: share an idea, we build the winner every week" },
  alternates: { canonical: "/" },
};

function More({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  return (
    <Link href={href} className={`link-more ${light ? "!text-[#2997ff]" : ""}`}>
      {children}
      <ChevronRight strokeWidth={2.4} />
    </Link>
  );
}

export default async function HomePage() {
  const [{ end, ideas }, winners] = await Promise.all([getCurrentRoundIdeas(), getWinners()]);
  const round = roundNumber(end);
  const closes = formatRoundClose(end);
  const top = ideas.slice(0, 5);
  const totalVotes = ideas.reduce((n, i) => n + i.score, 0);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(HOME_FAQS)) }} />

      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-20 pt-14 sm:pt-20 md:pb-28">
        <div className="mx-auto max-w-[980px] text-center">
          <Link
            href="/ideas"
            className="rise inline-flex items-center gap-2.5 rounded-full bg-cloud px-4 py-2 text-[14px] font-medium text-ink transition-colors hover:bg-[#ebebef]"
          >
            <span className="live-dot" aria-hidden="true" />
            <span>
              Round {round} is open<span className="hidden sm:inline"> · voting closes Sunday 8pm</span>
              <span className="sm:hidden"> · closes Sun 8pm</span>
            </span>
            <ChevronRight className="h-4 w-4 text-mute" strokeWidth={2.4} />
          </Link>
          <h1 className="display-hero rise rise-1 mt-7">
            Your idea.
            <br />
            <span className="gradient-text">Built.</span>
          </h1>
          <p className="lede rise rise-2 mx-auto mt-6 max-w-[640px]">
            Share an idea for free and let everyone vote. Every Sunday, the most-wanted idea gets designed, built and launched. On us.
          </p>
          <div className="rise rise-3 mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link href="/ideas/submit" className="btn btn-primary btn-lg">
              Submit your idea
            </Link>
            <More href="/ideas">See this week’s ideas</More>
          </div>
        </div>
        <div className="rise rise-3 mt-16 md:mt-20">
          <HeroShowcase />
        </div>
      </section>

      {/* This week */}
      <section className="bg-cloud px-5 py-20 md:py-28" aria-labelledby="this-week">
        <div className="mx-auto max-w-[980px]">
          <div className="reveal flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow text-orange">Round {round}</p>
              <h2 id="this-week" className="headline mt-2">
                This week’s ideas.
              </h2>
              <p className="mt-4 max-w-[520px] text-[19px] leading-snug text-mute">
                Vote for the ones you want to exist. When voting closes on {closes} at 8pm, the top idea gets built.
              </p>
            </div>
            <div className="shrink-0">
              <p className="mb-2 text-[13px] font-medium text-mute">Voting closes in</p>
              <Countdown to={end.toISOString()} variant="blocks" />
            </div>
          </div>

          <div className="reveal mt-10">
            {top.length > 0 ? (
              <div className="space-y-3">
                {top.map((idea, n) => (
                  <IdeaRow key={idea.id} idea={idea} rank={n + 1} />
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] bg-white px-6 py-14 text-center">
                <p className="title">Round {round} is wide open.</p>
                <p className="mx-auto mt-3 max-w-md text-[17px] text-mute">
                  No ideas yet this week. Share yours first and it has the whole week to gather votes.
                </p>
                <Link href="/ideas/submit" className="btn btn-primary mt-7">
                  Submit an idea
                </Link>
              </div>
            )}
          </div>
          {top.length > 0 && (
            <div className="reveal mt-8 flex flex-wrap items-center justify-between gap-4">
              <p className="text-[15px] text-mute">
                {ideas.length} {ideas.length === 1 ? "idea" : "ideas"} · {totalVotes} {totalVotes === 1 ? "vote" : "votes"} so far
              </p>
              <div className="flex gap-6">
                <More href="/ideas">See all ideas</More>
                <More href="/ideas/submit">Submit yours</More>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="px-5 py-20 md:py-28" aria-labelledby="how">
        <div className="mx-auto max-w-[1080px]">
          <div className="reveal mx-auto max-w-[760px] text-center">
            <h2 id="how" className="headline">
              Three steps.
              <br />
              One winner a week.
            </h2>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            <StepTile n={1} title="Share it." text="Tell us your idea in a sentence or two, here or in the comments on our TikTok. It’s free and takes about two minutes." delay={0}>
              <div className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <div className="text-[11px] font-semibold text-mute">Your idea</div>
                <div className="mt-1.5 text-[14px] font-semibold text-ink">TikTok recipe box</div>
                <div className="mt-2 h-2 w-4/5 rounded-full bg-cloud" />
                <div className="mt-1.5 h-2 w-3/5 rounded-full bg-cloud" />
                <div className="mt-4 inline-flex rounded-full bg-blue px-3 py-1 text-[12px] font-medium text-white">Submit idea</div>
              </div>
            </StepTile>
            <StepTile n={2} title="Rally the votes." text="Anyone can vote. Share your idea with friends, family and anyone it would help." delay={1}>
              <div className="space-y-2">
                {[
                  ["TikTok travel map", true],
                  ["Last-minute room filler for B&Bs", false],
                  ["Takeaway hygiene league table", false],
                ].map(([t, v], n) => (
                  <div key={String(t)} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                    <div className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">{t}</div>
                    <div
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[11px] font-semibold ${
                        v ? "bg-blue text-white" : "border border-line text-ink"
                      }`}
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                        <path d="m6 15 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="sr-only">{n === 0 ? "voted" : "vote"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </StepTile>
            <StepTile n={3} title="We build it." text="Voting closes on Sunday at 8pm. We design, build and launch the winner, free." delay={2}>
              <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-1 bg-[#f6f6f8] px-3 py-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff5f57]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#febc2e]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="bg-gradient-to-br from-[#0a84ff] to-[#5e5ce6] px-4 py-5 text-white">
                  <div className="text-[15px] font-bold tracking-[-0.02em]">Mystery Walks</div>
                  <div className="mt-1 text-[11px] opacity-85">Surprise routes from your door</div>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-[12px] text-mute">yourname.co.uk</span>
                  <span className="rounded-full bg-green-soft px-2 py-0.5 text-[11px] font-semibold text-green">Live</span>
                </div>
              </div>
            </StepTile>
          </div>
          <div className="reveal mt-10 text-center">
            <More href="/how-it-works">How it works, in detail</More>
          </div>
        </div>
      </section>

      {/* What we build */}
      <section className="bg-cloud px-5 py-20 md:py-28" aria-labelledby="what">
        <div className="mx-auto max-w-[1080px]">
          <div className="reveal max-w-[720px]">
            <h2 id="what" className="headline">
              If it runs in a browser, we can build it.
            </h2>
            <p className="mt-5 text-[19px] leading-snug text-mute">
              Everything we make works beautifully on phones, tablets and computers. No app store, no downloads.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Bento
              className="sm:col-span-2 lg:row-span-2"
              icon={<Globe />}
              grad="from-[#0a84ff] to-[#5e5ce6]"
              title="Websites"
              text="For a business, a club, a cause or a side project. Clear, fast and easy to find."
              big
            />
            <Bento icon={<LayoutDashboard />} grad="from-[#bf5af2] to-[#ff375f]" title="Web apps" text="Sign-ins, dashboards, reminders. The genuinely useful stuff." />
            <Bento icon={<Calculator />} grad="from-[#ff9f0a] to-[#ff375f]" title="Tools and calculators" text="The handy little things people search for every day." />
            <Bento icon={<CalendarCheck />} grad="from-[#30d158] to-[#0a84ff]" title="Booking and enquiries" text="Let people book, ask or order without picking up the phone." />
            <Bento icon={<MapPinned />} grad="from-[#64d2ff] to-[#0a84ff]" title="Directories and maps" text="The best of anything, near you, in one place." />
            <Bento icon={<ShoppingBag />} grad="from-[#ff375f] to-[#ff9f0a]" title="Shops" text="Sell a handful of products simply, without a complicated platform." />
          </div>
        </div>
      </section>

      {/* Paid: instant website */}
      <section className="overflow-hidden bg-black px-5 py-20 text-white md:py-28" aria-labelledby="now">
        <div className="mx-auto grid max-w-[1080px] items-center gap-14 lg:grid-cols-[1fr_380px]">
          <div className="reveal">
            <p className="eyebrow bg-gradient-to-r from-[#2997ff] via-[#a78bfa] to-[#ff6b9a] bg-clip-text text-transparent">Can’t wait for Sunday?</p>
            <h2 id="now" className="display mt-3">
              See your website
              <br />
              in seconds.
            </h2>
            <p className="mt-6 max-w-[520px] text-[19px] leading-snug text-[#a1a1a6]">
              Describe your business in plain English. We design a preview straight away, on a name you can actually own. Love it? We make it
              live from £12 a month.
            </p>
            <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
              <Link href="/start" className="btn btn-primary btn-lg">
                Build my free preview
              </Link>
              <More href="/pricing" light>
                See pricing
              </More>
            </div>
            <ul className="mt-12 grid gap-4 text-[15px] text-[#d2d2d7] sm:grid-cols-3">
              {["Free preview, no card", "Your own .com or .co.uk", "Cancel any time"].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-[#30d158]" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                    <path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal reveal-delay-2 mx-auto w-full max-w-[320px]">
            <PhoneSample />
          </div>
        </div>
      </section>

      {/* Built */}
      <section className="px-5 py-20 md:py-28" aria-labelledby="built">
        <div className="mx-auto max-w-[1080px]">
          <div className="reveal flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <h2 id="built" className="headline">
              Built by the community.
            </h2>
            {winners.length > 0 && <More href="/built">See everything we’ve built</More>}
          </div>
          {winners.length > 0 ? (
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {winners.slice(0, 3).map((w) => (
                <Link key={w.id} href={`/ideas/${w.slug}`} className="reveal tile block p-7 transition-transform duration-300 hover:scale-[1.01]">
                  <p className="text-[13px] font-semibold text-orange">Round {roundNumber(w.round_end)} winner</p>
                  <h3 className="title mt-2">{w.title}</h3>
                  <p className="mt-3 line-clamp-3 text-[15px] text-mute">{w.built_summary || w.description}</p>
                  <p className="mt-5 text-[13px] font-semibold text-ink">
                    {w.status === "built" ? "Live now" : "Being built now"}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="reveal tile mt-10 grid items-center gap-8 p-8 md:grid-cols-[1fr_auto] md:p-12">
              <div>
                <p className="title">The first build is days away.</p>
                <p className="mt-3 max-w-[560px] text-[17px] text-mute">
                  Round {round} closes on {closes} at 8pm. The winning idea will be built and shown right here, along with every winner after it.
                </p>
              </div>
              <Link href="/ideas/submit" className="btn btn-primary">
                Make it yours
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-cloud px-5 py-20 md:py-28" aria-labelledby="faq">
        <div className="mx-auto max-w-[880px]">
          <h2 id="faq" className="headline reveal">
            Questions? Answers.
          </h2>
          <div className="reveal mt-10">
            <Faq items={HOME_FAQS} />
          </div>
        </div>
      </section>

      {/* Final call */}
      <section className="relative overflow-hidden px-5 py-24 text-center md:py-32">
        <div className="hero-glow top-[20%] !opacity-[0.16]" aria-hidden="true" />
        <div className="reveal relative mx-auto max-w-[760px]">
          <h2 className="display">What would you build?</h2>
          <p className="lede mx-auto mt-5 max-w-[560px]">Round {round} closes on {closes}. Your idea could be the next one we launch.</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link href="/ideas/submit" className="btn btn-primary btn-lg">
              Submit your idea
            </Link>
            <More href="/start">Or get your own website now</More>
          </div>
        </div>
      </section>
    </>
  );
}

function StepTile({ n, title, text, children, delay }: { n: number; title: string; text: string; children: React.ReactNode; delay: number }) {
  return (
    <div className={`reveal reveal-delay-${delay + 1} tile flex flex-col overflow-hidden p-7`}>
      <p className="text-[15px] font-semibold text-mute">Step {n}</p>
      <h3 className="title mt-1">{title}</h3>
      <p className="mt-3 text-[17px] leading-snug text-mute">{text}</p>
      <div className="mt-8 flex-1 rounded-[22px] bg-gradient-to-b from-[#ececf0] to-[#e4e4ea] p-4">{children}</div>
    </div>
  );
}

function Bento({ icon, title, text, grad, className = "", big = false }: { icon: React.ReactNode; title: string; text: string; grad: string; className?: string; big?: boolean }) {
  return (
    <div className={`reveal relative overflow-hidden rounded-[28px] bg-white p-7 ${big ? "md:p-10" : ""} ${className}`}>
      <div className={`grid h-12 w-12 place-items-center rounded-[14px] bg-gradient-to-br ${grad} text-white [&_svg]:h-6 [&_svg]:w-6`}>{icon}</div>
      <h3 className={`mt-6 font-bold tracking-[-0.03em] text-ink ${big ? "text-[34px] leading-[1.05] md:text-[44px]" : "text-[22px]"}`}>{title}</h3>
      <p className={`mt-2 text-mute ${big ? "max-w-[420px] text-[19px] leading-snug" : "text-[15px] leading-relaxed"}`}>{text}</p>
      {big && (
        <div className="pointer-events-none mt-8 hidden select-none gap-3 md:flex" aria-hidden="true">
          {[
            ["from-[#0e7c86] to-[#30b0c7]", "B&B in Keswick"],
            ["from-[#0071e3] to-[#5e5ce6]", "Electrician in Bristol"],
            ["from-[#d1195f] to-[#bf5af2]", "Hair salon in Harrogate"],
          ].map(([g, t]) => (
            <div key={t} className="flex-1 overflow-hidden rounded-2xl bg-cloud">
              <div className={`h-20 bg-gradient-to-br ${g}`} />
              <div className="p-3">
                <div className="text-[12px] font-bold tracking-[-0.02em] text-ink">{t}</div>
                <div className="mt-1.5 h-1.5 w-4/5 rounded-full bg-black/10" />
                <div className="mt-1 h-1.5 w-3/5 rounded-full bg-black/10" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
