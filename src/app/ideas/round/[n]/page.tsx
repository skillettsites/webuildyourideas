import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { IdeaRow } from "@/components/IdeaRow";
import { getRoundIdeas } from "@/lib/ideas";
import { formatShortDate, roundEndFor, roundEndFromNumber, roundNumber } from "@/lib/rounds";

export const revalidate = 300;

type Props = { params: Promise<{ n: string }> };

// Pages are rendered on first visit, then cached and refreshed in the background.
export async function generateStaticParams() {
  return [];
}

function parse(n: string): number | null {
  const v = Number(n);
  return Number.isInteger(v) && v >= 1 && v <= 5000 ? v : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const n = parse((await params).n);
  if (!n) return { title: "Round not found", robots: { index: false } };
  return {
    title: `Round ${n} results`,
    description: `Every idea shared in Round ${n} of We Build Your Ideas, ranked by votes, and the idea that won.`,
    alternates: { canonical: `/ideas/round/${n}` },
  };
}

export default async function RoundPage({ params }: Props) {
  const n = parse((await params).n);
  if (!n) notFound();
  const current = roundNumber(roundEndFor());
  if (n === current) redirect("/ideas");
  if (n > current) notFound();
  const end = roundEndFromNumber(n);
  const ideas = await getRoundIdeas(end, 300);
  const winner = ideas.find((i) => i.status !== "open");

  return (
    <div className="bg-cloud px-5 pb-24 pt-14 md:pt-20">
      <div className="mx-auto max-w-[880px]">
        <nav aria-label="Breadcrumb" className="mb-6 text-[13px] text-mute">
          <Link href="/ideas/past" className="hover:text-ink hover:underline">
            Past rounds
          </Link>
        </nav>
        <h1 className="display rise">Round {n}.</h1>
        <p className="lede rise rise-1 mt-5">
          Closed {formatShortDate(end)}. {ideas.length} {ideas.length === 1 ? "idea" : "ideas"}
          {winner ? `, and ${winner.title} won.` : "."}
        </p>
        <div className="rise rise-2 mt-10 space-y-3">
          {ideas.length === 0 && <p className="rounded-[22px] bg-white p-6 text-mute">No ideas were shared in this round.</p>}
          {ideas.map((idea, i) => (
            <IdeaRow key={idea.id} idea={idea} rank={i + 1} closed />
          ))}
        </div>
      </div>
    </div>
  );
}
