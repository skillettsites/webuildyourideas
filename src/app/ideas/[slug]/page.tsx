import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { Countdown } from "@/components/Countdown";
import { IdeaRow, StatusPill } from "@/components/IdeaRow";
import { NewIdeaBanner, ShareBar } from "@/components/ShareBar";
import { VoteButton } from "@/components/VoteButton";
import { LIMITS, SITE_URL, categoryLabel } from "@/lib/config";
import { getIdeaBySlug, getRoundIdeas, rankIn } from "@/lib/ideas";
import { formatRoundClose, formatShortDate, roundNumber } from "@/lib/rounds";

export const revalidate = 30;

type Props = { params: Promise<{ slug: string }> };

// Pages are rendered on first visit, then cached and refreshed in the background.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const idea = await getIdeaBySlug(slug);
  if (!idea) return { title: "Idea not found", robots: { index: false } };
  const indexable = idea.vote_count >= LIMITS.indexVotes || idea.status !== "open";
  const desc = idea.description.replace(/\s+/g, " ").slice(0, 155);
  return {
    title: `${idea.title}: vote for this idea`,
    description: desc,
    alternates: { canonical: `/ideas/${idea.slug}` },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { title: idea.title, description: desc, url: `${SITE_URL}/ideas/${idea.slug}`, type: "article" },
    twitter: { card: "summary_large_image", title: idea.title, description: desc },
  };
}

export default async function IdeaPage({ params }: Props) {
  const { slug } = await params;
  const idea = await getIdeaBySlug(slug);
  if (!idea) notFound();

  const end = new Date(idea.round_end);
  const roundIdeas = await getRoundIdeas(end);
  const open = idea.status === "open" && end.getTime() > Date.now();
  const rank = rankIn(roundIdeas, idea.id);
  const others = roundIdeas.filter((i) => i.id !== idea.id).slice(0, 4);
  const round = roundNumber(end);
  const url = `${SITE_URL}/ideas/${idea.slug}`;

  const ld = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: idea.title,
    description: idea.description,
    url,
    dateCreated: idea.created_at,
    genre: categoryLabel(idea.category),
    ...(idea.author_name ? { author: { "@type": "Person", name: idea.author_name } } : {}),
    interactionStatistic: { "@type": "InteractionCounter", interactionType: "https://schema.org/LikeAction", userInteractionCount: idea.vote_count },
    isPartOf: { "@type": "WebSite", name: "We Build Your Ideas", url: SITE_URL },
  };

  return (
    <div className="bg-cloud">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="px-5 pb-20 pt-10 md:pt-14">
        <div className="mx-auto max-w-[880px]">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-1.5 text-[13px] text-mute">
            <Link href="/ideas" className="hover:text-ink hover:underline">
              Ideas
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={`/ideas/round/${round}`} className="hover:text-ink hover:underline">
              Round {round}
            </Link>
          </nav>

          <NewIdeaBanner />

          <article className="rounded-[28px] bg-white p-6 sm:p-10">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-[13px] text-mute">
                  <span className="font-semibold text-ink-2">{categoryLabel(idea.category)}</span>
                  {open && rank > 0 && (
                    <>
                      <span>·</span>
                      <span>
                        #{rank} of {roundIdeas.length} this week
                      </span>
                    </>
                  )}
                  <StatusPill status={idea.status} />
                </div>
                <h1 className="mt-3 text-[34px] font-bold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[48px]">{idea.title}</h1>
              </div>
              <div className="shrink-0">
                <VoteButton ideaId={idea.id} count={idea.vote_count} closed={!open} size="lg" title={idea.title} />
              </div>
            </div>

            <p className="mt-6 whitespace-pre-line text-[19px] leading-relaxed tracking-[-0.012em] text-ink-2">{idea.description}</p>

            <p className="mt-8 border-t hairline pt-5 text-[14px] text-mute">
              Shared by <span className="font-medium text-ink-2">{idea.author_name || "someone who prefers to stay anonymous"}</span> on{" "}
              {formatShortDate(idea.created_at)}
            </p>

            {idea.status === "built" && idea.built_url && (
              <div className="mt-8 rounded-[22px] bg-green-soft p-6">
                <p className="text-[17px] font-semibold text-ink">We built it.</p>
                {idea.built_summary && <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{idea.built_summary}</p>}
                <a href={idea.built_url} target="_blank" rel="noopener" className="btn btn-primary mt-5">
                  Visit the site <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            )}
            {(idea.status === "winner" || idea.status === "building") && (
              <div className="mt-8 rounded-[22px] bg-[#fff4e5] p-6">
                <p className="text-[17px] font-semibold text-ink">This idea won Round {round}.</p>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
                  {idea.status === "building"
                    ? "We’re building it now. It will appear on the Built page when it launches."
                    : "We’re planning the build with the person who shared it. Watch this space."}
                </p>
              </div>
            )}
          </article>

          {open && (
            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1.3fr]">
              <div className="rounded-[28px] bg-white p-6">
                <p className="text-[13px] font-medium text-mute">Voting closes in</p>
                <p className="mt-1 text-[26px] font-semibold tracking-[-0.03em] text-ink">
                  <Countdown to={end.toISOString()} />
                </p>
                <p className="mt-1 text-[14px] text-mute">{formatRoundClose(end)} at 8pm UK time</p>
              </div>
              <div className="rounded-[28px] bg-white p-6">
                <p className="mb-3 text-[17px] font-semibold tracking-[-0.02em] text-ink">Help it win. Share it.</p>
                <ShareBar url={url} title={idea.title} />
              </div>
            </div>
          )}

          {others.length > 0 && (
            <section className="mt-14" aria-labelledby="more">
              <div className="mb-4 flex items-end justify-between">
                <h2 id="more" className="title">
                  More ideas from Round {round}
                </h2>
                <Link href={open ? "/ideas" : `/ideas/round/${round}`} className="link-more !text-[15px]">
                  See all <ChevronRight strokeWidth={2.4} />
                </Link>
              </div>
              <div className="space-y-3">
                {others.map((o) => (
                  <IdeaRow key={o.id} idea={o} closed={!open} />
                ))}
              </div>
            </section>
          )}

          <div className="mt-14 rounded-[28px] bg-white p-8 text-center">
            <p className="title">Got an idea of your own?</p>
            <p className="mx-auto mt-2 max-w-md text-[17px] text-mute">Share it free. The top idea each week gets built.</p>
            <Link href="/ideas/submit" className="btn btn-primary mt-6">
              Submit an idea
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
