import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { getClosedRounds, getWinners } from "@/lib/ideas";
import { formatShortDate, roundNumber } from "@/lib/rounds";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Past rounds",
  description: "Every weekly round so far: how many ideas were shared, how many votes were cast, and which idea won.",
  alternates: { canonical: "/ideas/past" },
};

export default async function PastRoundsPage() {
  const [rounds, winners] = await Promise.all([getClosedRounds(), getWinners()]);
  const byId = new Map(winners.map((w) => [w.id, w]));
  return (
    <div className="bg-cloud px-5 pb-24 pt-14 md:pt-20">
      <div className="mx-auto max-w-[880px]">
        <h1 className="display rise">Past rounds.</h1>
        <p className="lede rise rise-1 mt-5 max-w-[600px]">Every week, one winner. Here’s the full history.</p>
        <div className="rise rise-2 mt-10 space-y-3">
          {rounds.length === 0 && (
            <div className="rounded-[28px] bg-white px-6 py-14 text-center">
              <p className="title">Round 1 is still open.</p>
              <p className="mx-auto mt-3 max-w-md text-[17px] text-mute">Once it closes, the results will appear here.</p>
              <Link href="/ideas" className="btn btn-primary mt-7">
                Vote in Round 1
              </Link>
            </div>
          )}
          {rounds.map((r) => {
            const n = roundNumber(r.round_end);
            const w = r.winner_idea_id ? byId.get(r.winner_idea_id) : undefined;
            return (
              <Link key={r.round_end} href={`/ideas/round/${n}`} className="flex items-center gap-5 rounded-[22px] bg-white p-5 transition-shadow hover:shadow-[0_10px_30px_-14px_rgba(0,0,0,0.22)]">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-cloud text-[20px] font-bold tracking-[-0.03em] text-ink">{n}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-mute">Closed {formatShortDate(r.round_end)} · {r.idea_count} ideas · {r.vote_count} votes</p>
                  <p className="mt-1 truncate text-[17px] font-semibold tracking-[-0.02em] text-ink">{w ? `Winner: ${w.title}` : "No winner this round"}</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-mute" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
