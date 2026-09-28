import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { categoryLabel } from "@/lib/config";
import { getWinners } from "@/lib/ideas";
import { formatRoundClose, roundEndFor, roundNumber } from "@/lib/rounds";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Built: every idea the community picked",
  description: "Every week the most-voted idea gets built for free. Here’s everything we’ve built so far, and what’s being built right now.",
  alternates: { canonical: "/built" },
};

export default async function BuiltPage() {
  const winners = await getWinners();
  const end = roundEndFor();
  return (
    <div>
      <section className="px-5 pb-12 pt-14 text-center md:pt-20">
        <div className="mx-auto max-w-[820px]">
          <h1 className="display-hero rise">
            <span className="gradient-text">Built.</span>
          </h1>
          <p className="lede rise rise-1 mx-auto mt-6 max-w-[620px]">
            Every idea here was shared by someone, voted to the top by everyone, and then built by us. Free.
          </p>
        </div>
      </section>
      <section className="px-5 pb-24">
        <div className="mx-auto max-w-[1080px]">
          {winners.length === 0 ? (
            <div className="rise rise-2 tile mx-auto max-w-[760px] px-8 py-16 text-center">
              <p className="title">Nothing here yet. That’s where you come in.</p>
              <p className="mx-auto mt-3 max-w-[520px] text-[17px] text-mute">
                Round {roundNumber(end)} closes on {formatRoundClose(end)} at 8pm. The winning idea becomes the first build on this page.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/ideas/submit" className="btn btn-primary">
                  Submit an idea
                </Link>
                <Link href="/ideas" className="btn btn-secondary">
                  Vote this week
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {winners.map((w) => (
                <article key={w.id} className="reveal tile flex flex-col p-8">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[13px] font-semibold text-orange">Round {roundNumber(w.round_end)} winner</p>
                    <span
                      className={`pill !py-1 !text-[12px] font-semibold ${
                        w.status === "built" ? "bg-green-soft text-green" : "bg-[#eef4ff] text-blue"
                      }`}
                    >
                      {w.status === "built" ? "Live" : w.status === "building" ? "Building now" : "Planning"}
                    </span>
                  </div>
                  <h2 className="title mt-3">{w.title}</h2>
                  <p className="mt-3 flex-1 text-[17px] leading-relaxed text-mute">{w.built_summary || w.description}</p>
                  <p className="mt-5 text-[13px] text-mute">
                    {categoryLabel(w.category)} · idea by {w.author_name || "an anonymous member"} · {w.vote_count} votes
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {w.status === "built" && w.built_url && (
                      <a href={w.built_url} target="_blank" rel="noopener" className="btn btn-primary btn-sm">
                        Visit the site <ArrowUpRight className="h-4 w-4" />
                      </a>
                    )}
                    <Link href={`/ideas/${w.slug}`} className="btn btn-secondary btn-sm">
                      The original idea
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
