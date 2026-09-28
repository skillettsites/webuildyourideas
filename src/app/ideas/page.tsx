import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { Countdown } from "@/components/Countdown";
import { IdeaBoard } from "@/components/IdeaBoard";
import { getCurrentRoundIdeas, getWinners } from "@/lib/ideas";
import { formatRoundClose, roundNumber } from "@/lib/rounds";

export const revalidate = 20;

export const metadata: Metadata = {
  title: "This week’s ideas: vote for the one we build",
  description:
    "Every idea shared this week, ranked by votes. Vote for the ones you want to exist. When voting closes on Sunday at 8pm, the top idea gets built for free.",
  alternates: { canonical: "/ideas" },
};

export default async function IdeasPage() {
  const [{ end, ideas }, winners] = await Promise.all([getCurrentRoundIdeas(20), getWinners()]);
  const round = roundNumber(end);
  const votes = ideas.reduce((n, i) => n + i.vote_count, 0);
  const last = winners[0];

  return (
    <div className="bg-cloud">
      <section className="px-5 pb-10 pt-14 md:pt-20">
        <div className="mx-auto max-w-[880px]">
          <p className="eyebrow rise flex items-center gap-2 text-ink">
            <span className="live-dot" aria-hidden="true" /> Round {round} · open now
          </p>
          <h1 className="display rise rise-1 mt-3">This week’s ideas.</h1>
          <p className="lede rise rise-2 mt-5 max-w-[640px]">
            Vote for the ideas you want to exist. When voting closes on {formatRoundClose(end)} at 8pm, the idea with the most votes gets
            built, free.
          </p>
          <div className="rise rise-3 mt-8 flex flex-col gap-6 rounded-[28px] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-[13px] font-medium text-mute">Voting closes in</p>
              <p className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-ink">
                <Countdown to={end.toISOString()} />
              </p>
              <p className="mt-1 text-[14px] text-mute">
                {ideas.length} {ideas.length === 1 ? "idea" : "ideas"} · {votes} {votes === 1 ? "vote" : "votes"}
              </p>
            </div>
            <Link href="/ideas/submit" className="btn btn-primary">
              Submit an idea
            </Link>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:pb-28" aria-label="Ideas in this round">
        <div className="mx-auto max-w-[880px]">
          <IdeaBoard ideas={ideas} />

          {last && (
            <Link href={`/ideas/${last.slug}`} className="mt-12 flex items-center justify-between gap-4 rounded-[22px] bg-white p-5 transition-shadow hover:shadow-[0_10px_30px_-14px_rgba(0,0,0,0.22)]">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-orange">Round {roundNumber(last.round_end)} winner</p>
                <p className="mt-1 truncate text-[17px] font-semibold tracking-[-0.02em] text-ink">{last.title}</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-mute" />
            </Link>
          )}

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[22px] bg-white p-6">
              <h2 className="text-[19px] font-semibold tracking-[-0.02em]">How voting works</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-mute">
                One vote per idea, as many ideas as you like. Tap again to take a vote back. We check for fake votes and remove them.
              </p>
              <Link href="/rules" className="link-more mt-3 !text-[15px]">
                Read the rules <ChevronRight strokeWidth={2.4} />
              </Link>
            </div>
            <div className="rounded-[22px] bg-white p-6">
              <h2 className="text-[19px] font-semibold tracking-[-0.02em]">Earlier rounds</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-mute">See every past round, its winner, and what we built.</p>
              <Link href="/ideas/past" className="link-more mt-3 !text-[15px]">
                Past rounds <ChevronRight strokeWidth={2.4} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
