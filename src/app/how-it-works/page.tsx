import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Two ways to get your idea built. Share it free and let the community vote for the weekly build, or see your own website in seconds and go live from £12 a month.",
  alternates: { canonical: "/how-it-works" },
};

const VOTE_STEPS = [
  ["Share your idea", "Give it a short title and a few sentences: what it does, who it’s for and why it matters. Sharing is free and your email stays private."],
  ["Collect votes", "Your idea goes straight onto this week’s board. Anyone can vote, once per idea. Share your link with the people your idea would help."],
  ["Or comment on TikTok", "Prefer TikTok? Comment your idea on one of our videos. The most-liked comments join the board, and every like counts as a vote."],
  ["Voting closes Sunday, 8pm", "The idea with the most votes wins, as long as it’s legal, safe and buildable. We email the winner that evening."],
  ["We plan it together", "We talk to the winner about who it’s for and the one thing it must do well, then agree a focused first version."],
  ["We build and launch it", "We design, build and launch it on the web, with the domain and hosting covered for the first year. Then it’s yours, and any profits are split 50% to you, 25% to us and 25% to charity."],
];

const SITE_STEPS = [
  ["Describe your business", "Type or speak a few sentences. We turn them into a real website preview in seconds."],
  ["Make it yours", "Try five layouts and seven colours for free. Tweak the words, and check which .com or .co.uk names are free."],
  ["Choose a plan", "From £12 a month. A real person checks your preview and confirms the details with you."],
  ["We go live", "We register your name, set up hosting and security, finish the site and launch it. Changes are just an email away."],
];

export default function HowItWorksPage() {
  return (
    <div>
      <section className="px-5 pb-16 pt-14 text-center md:pt-20">
        <div className="mx-auto max-w-[860px]">
          <h1 className="display rise">Two ways to get it built.</h1>
          <p className="lede rise rise-1 mx-auto mt-5 max-w-[640px]">Free, if the community picks your idea. Or today, if you’d rather not wait.</p>
          <div className="rise rise-2 mt-8 flex flex-wrap justify-center gap-3">
            <a href="#vote" className="btn btn-secondary btn-sm">
              The weekly vote
            </a>
            <a href="#website" className="btn btn-secondary btn-sm">
              Your own website
            </a>
          </div>
        </div>
      </section>

      <section id="vote" className="scroll-mt-16 bg-cloud px-5 py-20 md:py-28">
        <div className="mx-auto max-w-[980px]">
          <p className="eyebrow text-orange">Free</p>
          <h2 className="headline mt-2">The weekly vote.</h2>
          <p className="mt-4 max-w-[600px] text-[19px] leading-snug text-mute">One idea a week, chosen by everyone, built by us.</p>
          <ol className="mt-12 space-y-3">
            {VOTE_STEPS.map(([t, d], i) => (
              <li key={t} className="reveal flex gap-5 rounded-[22px] bg-white p-6">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cloud text-[17px] font-bold text-ink">{i + 1}</span>
                <div>
                  <h3 className="text-[21px] font-semibold tracking-[-0.025em] text-ink">{t}</h3>
                  <p className="mt-1.5 text-[17px] leading-relaxed text-mute">{d}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link href="/ideas/submit" className="btn btn-primary">
              Submit an idea
            </Link>
            <Link href="/rules" className="link-more">
              Read the full rules <ChevronRight strokeWidth={2.4} />
            </Link>
          </div>
        </div>
      </section>

      <section id="website" className="scroll-mt-16 px-5 py-20 md:py-28">
        <div className="mx-auto max-w-[980px]">
          <p className="eyebrow text-blue">From £12 a month</p>
          <h2 className="headline mt-2">Your own website.</h2>
          <p className="mt-4 max-w-[600px] text-[19px] leading-snug text-mute">For your business, club or project, without the wait or the jargon.</p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {SITE_STEPS.map(([t, d], i) => (
              <div key={t} className="reveal tile p-7">
                <p className="text-[15px] font-semibold text-mute">Step {i + 1}</p>
                <h3 className="title mt-1">{t}</h3>
                <p className="mt-3 text-[17px] leading-relaxed text-mute">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link href="/start" className="btn btn-primary">
              Build my free preview
            </Link>
            <Link href="/pricing" className="link-more">
              See pricing <ChevronRight strokeWidth={2.4} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
